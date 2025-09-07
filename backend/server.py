from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
from datetime import datetime
import asyncio
from typing import List, Optional

# Import our modules
from models import *
from database import db_manager
from ai_analyzer import ai_analyzer

# Import new user management modules
from auth_routes import router as auth_router
from user_routes import router as user_router
from chat_routes import router as chat_router
from roadmap_routes import router as roadmap_router
from payment_routes import router as payment_router
from oauth_routes import router as oauth_router
from google_oauth_routes import router as google_oauth_router
from enterprise_routes import router as enterprise_router

app = FastAPI(title="CareerPilot API - Athena AI Career Advisor", version="2.0.0")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_router)
app.include_router(user_router)
app.include_router(chat_router)
app.include_router(roadmap_router)
app.include_router(payment_router)
app.include_router(oauth_router)
app.include_router(google_oauth_router)

# Health check endpoint
@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy", 
        "timestamp": datetime.now().isoformat(),
        "service": "CareerPilot with Athena",
        "version": "2.0.0"
    }

# Welcome endpoint
@app.get("/api/")
async def root():
    return {
        "message": "CareerPilot API - Athena AI Career Advisor", 
        "version": "2.0.0",
        "features": [
            "User Registration & Authentication",
            "Profile Management",
            "Career Tracking",
            "Skills & Certifications",
            "Chat with Athena",
            "Personalized Roadmaps",
            "Progress Tracking",
            "Payment Processing"
        ]
    }

# Legacy assessment endpoints (keep for backward compatibility)
@app.post("/api/assessment/start", response_model=AssessmentResponse)
async def start_assessment(request: StartAssessmentRequest):
    """Start a new career assessment"""
    try:
        # Create new assessment
        assessment = db_manager.create_assessment(request.user_email)
        
        # Get all questions
        questions = db_manager.get_assessment_questions()
        
        if not questions:
            raise HTTPException(status_code=500, detail="No assessment questions found")
        
        # Return first question
        next_question = questions[0]
        
        return AssessmentResponse(
            assessment_id=assessment.id,
            status="started",
            next_question=next_question,
            progress={"current": 0, "total": len(questions)}
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to start assessment: {str(e)}")

@app.get("/api/assessment/questions")
async def get_all_questions():
    """Get all assessment questions"""
    try:
        questions = db_manager.get_assessment_questions()
        return {"questions": questions}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get questions: {str(e)}")

@app.post("/api/assessment/answer", response_model=AssessmentResponse)
async def submit_answer(request: SubmitAnswerRequest):
    """Submit an answer to assessment question"""
    try:
        # Get current assessment
        assessment = db_manager.get_assessment(request.assessment_id)
        if not assessment:
            raise HTTPException(status_code=404, detail="Assessment not found")
        
        # Add new answer
        new_answer = AssessmentAnswer(
            question_id=request.question_id,
            answer=request.answer,
            score=request.score
        )
        
        # Update assessment with new answer
        assessment.answers.append(new_answer)
        answers_dict = [answer.dict() for answer in assessment.answers]
        db_manager.update_assessment(request.assessment_id, answers_dict)
        
        # Get all questions to determine progress
        all_questions = db_manager.get_assessment_questions()
        current_progress = len(assessment.answers)
        total_questions = len(all_questions)
        
        # Determine next question
        next_question = None
        if current_progress < total_questions:
            next_question = all_questions[current_progress]
        
        # Determine status
        status = "in_progress" if next_question else "ready_to_complete"
        
        return AssessmentResponse(
            assessment_id=request.assessment_id,
            status=status,
            next_question=next_question,
            progress={"current": current_progress, "total": total_questions}
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to submit answer: {str(e)}")

@app.get("/api/assessment/{assessment_id}/status")
async def get_assessment_status(assessment_id: str):
    """Get current assessment status and progress"""
    try:
        assessment = db_manager.get_assessment(assessment_id)
        if not assessment:
            raise HTTPException(status_code=404, detail="Assessment not found")
        
        all_questions = db_manager.get_assessment_questions()
        current_progress = len(assessment.answers)
        total_questions = len(all_questions)
        
        # Check if there's already a result
        existing_result = db_manager.get_results_by_assessment(assessment_id)
        
        return {
            "assessment_id": assessment_id,
            "status": assessment.status,
            "progress": {"current": current_progress, "total": total_questions},
            "has_result": existing_result is not None,
            "result_id": existing_result.id if existing_result else None
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get assessment status: {str(e)}")

async def process_assessment_analysis(assessment_id: str):
    """Background task to analyze assessment with AI"""
    try:
        # Get assessment
        assessment = db_manager.get_assessment(assessment_id)
        if not assessment:
            return
        
        # Mark assessment as completed
        answers_dict = [answer.dict() for answer in assessment.answers]
        db_manager.update_assessment(assessment_id, answers_dict, "analyzing")
        
        # Analyze with AI
        result = await ai_analyzer.analyze_assessment(assessment)
        
        # Save result
        db_manager.save_assessment_result(result)
        
        # Update assessment status
        db_manager.update_assessment(assessment_id, answers_dict, "completed")
        
        # If user is logged in, generate roadmap
        if assessment.user_email:
            from user_database import user_db  
            user = user_db.get_user_by_email(assessment.user_email)
            if user:
                from roadmap_routes import generate_roadmap_from_assessment
                await generate_roadmap_from_assessment(user.id, assessment_id)
        
    except Exception as e:
        # Mark assessment as failed
        assessment = db_manager.get_assessment(assessment_id)
        if assessment:
            answers_dict = [answer.dict() for answer in assessment.answers]
            db_manager.update_assessment(assessment_id, answers_dict, "failed")
        print(f"Analysis failed for assessment {assessment_id}: {str(e)}")

@app.post("/api/assessment/complete", response_model=AnalysisResponse)
async def complete_assessment(request: CompleteAssessmentRequest, background_tasks: BackgroundTasks):
    """Complete assessment and start AI analysis"""
    try:
        # Get assessment
        assessment = db_manager.get_assessment(request.assessment_id)
        if not assessment:
            raise HTTPException(status_code=404, detail="Assessment not found")
        
        # Validate that all questions are answered
        all_questions = db_manager.get_assessment_questions()
        if len(assessment.answers) < len(all_questions):
            raise HTTPException(status_code=400, detail="Assessment is not complete. Please answer all questions.")
        
        # Check if analysis already exists
        existing_result = db_manager.get_results_by_assessment(request.assessment_id)
        if existing_result:
            return AnalysisResponse(
                assessment_id=request.assessment_id,
                result_id=existing_result.id,
                status="completed",
                message="Analysis already completed. Results are ready."
            )
        
        # Start background analysis
        background_tasks.add_task(process_assessment_analysis, request.assessment_id)
        
        return AnalysisResponse(
            assessment_id=request.assessment_id,
            result_id="",
            status="analyzing",
            message="Assessment submitted successfully. Athena is analyzing your responses. Please check back in a few moments."
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to complete assessment: {str(e)}")

@app.get("/api/results/{assessment_id}")
async def get_assessment_results(assessment_id: str):
    """Get analysis results for an assessment"""
    try:
        # Check assessment exists
        assessment = db_manager.get_assessment(assessment_id)
        if not assessment:
            raise HTTPException(status_code=404, detail="Assessment not found")
        
        # Get results
        result = db_manager.get_results_by_assessment(assessment_id)
        if not result:
            return {
                "assessment_id": assessment_id,
                "status": assessment.status,
                "message": "Athena is still analyzing your assessment. Please try again in a few moments."
            }
        
        return {
            "assessment_id": assessment_id,
            "result_id": result.id,
            "status": "completed",
            "results": {
                "career_recommendations": [rec.dict() for rec in result.career_recommendations],
                "skill_gap_analysis": result.skill_gap_analysis.dict(),
                "personality_insights": result.personality_insights,
                "action_plan": result.action_plan,
                "generated_at": result.generated_at.isoformat()
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get results: {str(e)}")

@app.get("/api/results/detailed/{result_id}")
async def get_detailed_results(result_id: str):
    """Get detailed results by result ID"""
    try:
        result = db_manager.get_assessment_result(result_id)
        if not result:
            raise HTTPException(status_code=404, detail="Results not found")
        
        return {
            "result_id": result.id,
            "assessment_id": result.assessment_id,
            "user_email": result.user_email,
            "career_recommendations": [rec.dict() for rec in result.career_recommendations],
            "skill_gap_analysis": result.skill_gap_analysis.dict(),
            "personality_insights": result.personality_insights,
            "action_plan": result.action_plan,
            "generated_at": result.generated_at.isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get detailed results: {str(e)}")

# Demo/Testing endpoints
@app.post("/api/demo/quick-analysis")
async def quick_demo_analysis():
    """Create a demo analysis for testing purposes"""
    try:
        # Create sample assessment data
        sample_assessment = UserAssessment(
            user_email="demo@careerpilot.com",
            answers=[
                AssessmentAnswer(question_id="edu_level", answer="Bachelor's Degree"),
                AssessmentAnswer(question_id="work_experience", answer="2-5 years"),
                AssessmentAnswer(question_id="technical_skills", answer="Python, JavaScript, SQL"),
                AssessmentAnswer(question_id="work_interests", answer="Analyzing data and solving complex problems"),
                AssessmentAnswer(question_id="career_goals", answer="Continuous learning and growth")
            ]
        )
        
        # Perform AI analysis
        result = await ai_analyzer.analyze_assessment(sample_assessment)
        
        return {
            "status": "success",
            "message": "Demo analysis completed by Athena",
            "results": {
                "career_recommendations": [rec.dict() for rec in result.career_recommendations],
                "skill_gap_analysis": result.skill_gap_analysis.dict(),
                "personality_insights": result.personality_insights,
                "action_plan": result.action_plan
            }
        }
        
    except Exception as e:
        return {
            "status": "error",
            "message": f"Demo analysis failed: {str(e)}",
            "fallback_available": True
        }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)

# Demo/Testing endpoints
@app.post("/api/demo/quick-analysis")
async def quick_demo_analysis():
    """Create a demo analysis for testing purposes"""
    try:
        # Create sample assessment data
        sample_assessment = UserAssessment(
            user_email="demo@example.com",
            answers=[
                AssessmentAnswer(question_id="edu_level", answer="Bachelor's Degree"),
                AssessmentAnswer(question_id="work_experience", answer="2-5 years"),
                AssessmentAnswer(question_id="technical_skills", answer="Python, JavaScript, SQL"),
                AssessmentAnswer(question_id="work_interests", answer="Analyzing data and solving complex problems"),
                AssessmentAnswer(question_id="career_goals", answer="Continuous learning and growth")
            ]
        )
        
        # Perform AI analysis
        result = await ai_analyzer.analyze_assessment(sample_assessment)
        
        return {
            "status": "success",
            "message": "Demo analysis completed",
            "results": {
                "career_recommendations": [rec.dict() for rec in result.career_recommendations],
                "skill_gap_analysis": result.skill_gap_analysis.dict(),
                "personality_insights": result.personality_insights,
                "action_plan": result.action_plan
            }
        }
        
    except Exception as e:
        return {
            "status": "error",
            "message": f"Demo analysis failed: {str(e)}",
            "fallback_available": True
        }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)