from fastapi import APIRouter, HTTPException, status, Depends, BackgroundTasks
from user_models import *
from user_database import user_db
from auth import get_current_user
from ai_analyzer import ai_analyzer
from typing import List
import asyncio

router = APIRouter(prefix="/api/roadmap", tags=["roadmap_management"])

async def generate_roadmap_from_assessment(user_id: str, assessment_id: str) -> List[RoadmapItem]:
    """Generate roadmap items from assessment results using Athena."""
    try:
        # Get assessment results
        from database import db_manager
        results = db_manager.get_results_by_assessment(assessment_id)
        
        if not results:
            return []
        
        # Get user context
        user = user_db.get_user_by_id(user_id)
        profile = user_db.get_user_profile(user_id)
        
        # Create prompt for roadmap generation
        prompt = f"""Based on the career assessment results below, create a detailed step-by-step roadmap for {user.first_name}'s career development.

Assessment Results:
- Career Recommendations: {[rec.career_title for rec in results.career_recommendations]}
- Skill Gaps: {results.skill_gap_analysis.skill_gaps}
- Action Plan: {results.action_plan}

User Context:
- Current Role: {profile.current_role if profile and profile.current_role else 'Entry level/Career starter'}
- Years of Experience: {profile.years_of_experience if profile and profile.years_of_experience else 0}
- Career Goals: {profile.career_goals if profile and profile.career_goals else 'Career advancement'}

Create a comprehensive roadmap with 8-12 specific, actionable items. Each item should include:
1. Title (specific action to take)
2. Description (detailed explanation)
3. Category (skill_development, education, networking, job_search, portfolio, certification)
4. Priority (1-5, where 1 is highest priority)
5. Estimated time in hours
6. Resources (specific courses, books, websites, etc.)

Format as JSON array:
[
  {
    "title": "Complete Python Programming Course",
    "description": "Master Python fundamentals and advanced concepts to strengthen programming foundation",
    "category": "skill_development",
    "priority": 1,
    "estimated_time_hours": 40,
    "resources": ["Python.org tutorial", "Codecademy Python course", "Python Crash Course book"]
  }
]

Focus on practical, achievable steps that build towards the recommended career paths. Prioritize high-impact activities first."""

        # Generate roadmap using AI
        session_id = f"roadmap_gen_{user_id}_{assessment_id}"
        chat = ai_analyzer._create_chat_session(session_id)
        
        from emergentintegrations.llm.chat import UserMessage
        user_message = UserMessage(text=prompt)
        response = await chat.send_message(user_message)
        
        # Parse JSON response
        import json
        import re
        
        try:
            # Try to parse as JSON directly
            roadmap_data = json.loads(response)
        except json.JSONDecodeError:
            # Extract JSON from response if wrapped in text
            json_match = re.search(r'\[.*\]', response, re.DOTALL)
            if json_match:
                roadmap_data = json.loads(json_match.group())
            else:
                # Fallback roadmap if parsing fails
                roadmap_data = [
                    {
                        "title": "Update Professional Profile",
                        "description": "Complete your CareerPilot profile with current experience and skills",
                        "category": "portfolio",
                        "priority": 1,
                        "estimated_time_hours": 2,
                        "resources": ["CareerPilot Profile Guide"]
                    },
                    {
                        "title": "Skill Assessment and Gap Analysis",
                        "description": "Identify key skills needed for your target career path",
                        "category": "skill_development",
                        "priority": 1,
                        "estimated_time_hours": 4,
                        "resources": ["Industry skill requirements", "Job posting analysis"]
                    }
                ]
        
        # Convert to RoadmapItem objects
        roadmap_items = []
        for i, item_data in enumerate(roadmap_data):
            roadmap_item = RoadmapItem(
                user_id=user_id,
                assessment_id=assessment_id,
                title=item_data.get("title", f"Career Development Step {i+1}"),
                description=item_data.get("description", "Work on career development"),
                category=item_data.get("category", "skill_development"),
                priority=item_data.get("priority", 3),
                estimated_time_hours=item_data.get("estimated_time_hours", 5),
                resources=item_data.get("resources", []),
                order_index=i
            )
            roadmap_items.append(roadmap_item)
        
        return roadmap_items
        
    except Exception as e:
        print(f"Error generating roadmap: {str(e)}")
        # Return basic fallback roadmap
        return [
            RoadmapItem(
                user_id=user_id,
                assessment_id=assessment_id,
                title="Complete Your Profile",
                description="Add your career history, skills, and certifications to get better recommendations",
                category="portfolio",
                priority=1,
                estimated_time_hours=2,
                resources=["CareerPilot Profile Editor"],
                order_index=0
            ),
            RoadmapItem(
                user_id=user_id,
                assessment_id=assessment_id,
                title="Identify Target Roles",
                description="Research specific job titles and companies that align with your career goals",
                category="job_search",
                priority=2,
                estimated_time_hours=6,
                resources=["LinkedIn Jobs", "Indeed", "Company websites"],
                order_index=1
            )
        ]

@router.get("/", response_model=List[RoadmapItem])
async def get_user_roadmap(current_user_id: str = Depends(get_current_user)):
    """Get user's career roadmap."""
    try:
        return user_db.get_user_roadmap(current_user_id)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get roadmap: {str(e)}"
        )

@router.post("/")
async def add_roadmap_item(
    item_data: RoadmapItemCreate,
    current_user_id: str = Depends(get_current_user)
):
    """Add a new roadmap item."""
    try:
        roadmap_item = RoadmapItem(
            user_id=current_user_id,
            **item_data.dict()
        )
        
        item_id = user_db.add_roadmap_item(roadmap_item)
        
        return {
            "message": "Roadmap item added successfully",
            "item_id": item_id
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to add roadmap item: {str(e)}"
        )

@router.put("/{item_id}")
async def update_roadmap_item(
    item_id: str,
    updates: RoadmapItemUpdate,
    current_user_id: str = Depends(get_current_user)
):
    """Update a roadmap item."""
    try:
        update_data = {k: v for k, v in updates.dict().items() if v is not None}
        
        success = user_db.update_roadmap_item(item_id, current_user_id, update_data)
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Roadmap item not found"
            )
        
        return {"message": "Roadmap item updated successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update roadmap item: {str(e)}"
        )

@router.delete("/{item_id}")
async def delete_roadmap_item(
    item_id: str,
    current_user_id: str = Depends(get_current_user)
):
    """Delete a roadmap item."""
    try:
        user_db.delete_roadmap_item(item_id, current_user_id)
        return {"message": "Roadmap item deleted successfully"}
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete roadmap item: {str(e)}"
        )

@router.post("/generate-from-assessment/{assessment_id}")
async def generate_roadmap_from_assessment_endpoint(
    assessment_id: str,
    background_tasks: BackgroundTasks,
    current_user_id: str = Depends(get_current_user)
):
    """Generate roadmap items from assessment results."""
    try:
        # Generate roadmap items
        roadmap_items = await generate_roadmap_from_assessment(current_user_id, assessment_id)
        
        # Add items to database
        added_items = []
        for item in roadmap_items:
            item_id = user_db.add_roadmap_item(item)
            added_items.append(item_id)
        
        return {
            "message": f"Generated {len(added_items)} roadmap items from assessment",
            "roadmap_items": len(added_items),
            "item_ids": added_items
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate roadmap: {str(e)}"
        )

@router.get("/progress", response_model=UserProgress)
async def get_roadmap_progress(current_user_id: str = Depends(get_current_user)):
    """Get user's roadmap progress."""
    try:
        progress = user_db.get_user_progress(current_user_id)
        if not progress:
            # Create initial progress if doesn't exist
            progress = UserProgress(user_id=current_user_id)
            user_db.user_progress.insert_one(progress.dict())
        
        return progress
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get progress: {str(e)}"
        )

@router.post("/{item_id}/complete")
async def mark_item_complete(
    item_id: str,
    notes: str = "",
    current_user_id: str = Depends(get_current_user)
):
    """Mark a roadmap item as complete."""
    try:
        updates = {
            "status": RoadmapStatus.COMPLETED,
            "completion_date": datetime.now(),
            "notes": notes
        }
        
        success = user_db.update_roadmap_item(item_id, current_user_id, updates)
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Roadmap item not found"
            )
        
        # Check for milestones/achievements
        progress = user_db.get_user_progress(current_user_id)
        milestones = []
        
        if progress:
            if progress.completed_roadmap_items == 1:
                milestones.append("First Step Complete! 🎉")
            elif progress.completed_roadmap_items == 5:
                milestones.append("5 Steps Complete! You're on fire! 🔥")
            elif progress.completed_roadmap_items == 10:
                milestones.append("10 Steps Complete! Career momentum building! 🚀")
            elif progress.completion_percentage >= 50:
                milestones.append("Halfway There! Keep going! 💪")
            elif progress.completion_percentage >= 75:
                milestones.append("Almost Done! You're so close! 🎯")
            elif progress.completion_percentage >= 100:
                milestones.append("Roadmap Complete! Time for the next level! 🏆")
            
            # Update milestones
            if milestones:
                existing_milestones = progress.milestones_achieved or []
                new_milestones = existing_milestones + milestones
                user_db.user_progress.update_one(
                    {"user_id": current_user_id},
                    {"$set": {"milestones_achieved": new_milestones}}
                )
        
        return {
            "message": "Roadmap item marked as complete",
            "milestones": milestones
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to mark item complete: {str(e)}"
        )

@router.post("/reorder")
async def reorder_roadmap_items(
    item_orders: List[dict],  # [{"item_id": "123", "order_index": 0}, ...]
    current_user_id: str = Depends(get_current_user)
):
    """Reorder roadmap items."""
    try:
        for item_order in item_orders:
            user_db.roadmap_items.update_one(
                {"id": item_order["item_id"], "user_id": current_user_id},
                {"$set": {"order_index": item_order["order_index"]}}
            )
        
        return {"message": "Roadmap items reordered successfully"}
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to reorder roadmap items: {str(e)}"
        )