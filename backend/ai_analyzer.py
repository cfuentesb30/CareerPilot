import os
import json
import asyncio
from typing import List, Dict, Any
from emergentintegrations.llm.chat import LlmChat, UserMessage
from models import UserAssessment, AssessmentResult, CareerRecommendation, SkillGapAnalysis
import uuid
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class CareerAIAnalyzer:
    def __init__(self):
        self.api_key = os.getenv("OPENAI_API_KEY")
        if not self.api_key:
            print("Warning: OpenAI API key not found. AI analysis will use fallback mode.")
            self.api_key = None
    
    def _create_chat_session(self, session_id: str) -> LlmChat:
        """Create a new chat session with GPT-4"""
        system_message = """You are an expert career counselor and AI analyst with extensive knowledge of:
- Career paths across all industries and job markets
- Skills assessment and gap analysis
- Personality-to-career matching
- Current job market trends and salary data
- Educational and certification requirements
- Career development strategies

Your task is to analyze career assessment data and provide personalized, actionable career recommendations.

Always respond in valid JSON format with detailed, practical insights based on the assessment data provided.
Focus on being helpful, accurate, and providing specific next steps for career development."""

        chat = LlmChat(
            api_key=self.api_key,
            session_id=session_id,
            system_message=system_message
        ).with_model("openai", "gpt-4o").with_max_tokens(4096)
        
        return chat
    
    def _build_assessment_prompt(self, assessment: UserAssessment) -> str:
        """Build a comprehensive prompt from assessment data"""
        answers_dict = {}
        for answer in assessment.answers:
            answers_dict[answer.question_id] = answer.answer
        
        prompt = f"""
Please analyze the following career assessment data and provide comprehensive career recommendations:

ASSESSMENT DATA:
{json.dumps(answers_dict, indent=2)}

ANALYSIS REQUIREMENTS:
1. **Career Recommendations** (Top 3-5 careers):
   - Career title
   - Match percentage (0-100)
   - Detailed description
   - Key skills required
   - Education requirements
   - Salary range (current market data)
   - Job outlook and growth potential
   - Specific next steps

2. **Skill Gap Analysis**:
   - Current skills based on assessment
   - Required skills for recommended careers
   - Specific skill gaps to address
   - Development recommendations with resources

3. **Personality Insights**:
   - Personality type analysis
   - Work style preferences
   - Strengths and potential challenges
   - Ideal work environment

4. **Action Plan** (5-7 concrete steps):
   - Immediate actions (0-3 months)
   - Short-term goals (3-6 months)
   - Long-term development (6+ months)

Please respond with a JSON object in this exact format:
{{
  "career_recommendations": [
    {{
      "career_title": "Software Engineer",
      "match_percentage": 85,
      "description": "Detailed career description...",
      "key_skills": ["Python", "Problem Solving", "System Design"],
      "education_requirements": "Bachelor's in Computer Science or equivalent experience",
      "salary_range": "$75,000 - $150,000",
      "job_outlook": "Excellent growth, 25% increase expected by 2032",
      "next_steps": ["Learn Python", "Build portfolio projects", "Apply to bootcamps"]
    }}
  ],
  "skill_gap_analysis": {{
    "current_skills": ["Communication", "Leadership"],
    "required_skills": ["Technical Skills", "Data Analysis"],
    "skill_gaps": ["Programming", "Statistical Analysis"],
    "development_recommendations": ["Take online courses", "Practice coding"]
  }},
  "personality_insights": {{
    "type": "Analytical Problem-Solver",
    "work_style": "Independent with collaborative elements",
    "strengths": ["Logical thinking", "Attention to detail"],
    "challenges": ["May need to develop communication skills"],
    "ideal_environment": "Tech company with growth opportunities"
  }},
  "action_plan": [
    "Complete online Python course within 2 months",
    "Build 3 portfolio projects showcasing skills",
    "Network with professionals in target field",
    "Apply for entry-level positions or internships",
    "Consider relevant certifications"
  ]
}}
"""
        return prompt
    
    async def analyze_assessment(self, assessment: UserAssessment) -> AssessmentResult:
        """Analyze assessment using GPT-4 and return structured results"""
        # If no API key, use fallback immediately
        if not self.api_key:
            return self._create_fallback_result(assessment)
        
        try:
            # Create unique session ID for this analysis
            session_id = f"career_analysis_{assessment.id}_{uuid.uuid4().hex[:8]}"
            
            # Create chat session
            chat = self._create_chat_session(session_id)
            
            # Build assessment prompt
            prompt = self._build_assessment_prompt(assessment)
            
            # Send analysis request to GPT-4
            user_message = UserMessage(text=prompt)
            response = await chat.send_message(user_message)
            
            # Parse JSON response
            try:
                analysis_data = json.loads(response)
            except json.JSONDecodeError:
                # If JSON parsing fails, try to extract JSON from the response
                import re
                json_match = re.search(r'\{.*\}', response, re.DOTALL)
                if json_match:
                    analysis_data = json.loads(json_match.group())
                else:
                    raise ValueError("Could not parse AI response as JSON")
            
            # Build career recommendations
            career_recommendations = []
            for rec_data in analysis_data.get("career_recommendations", []):
                career_rec = CareerRecommendation(
                    career_title=rec_data.get("career_title", ""),
                    match_percentage=rec_data.get("match_percentage", 0),
                    description=rec_data.get("description", ""),
                    key_skills=rec_data.get("key_skills", []),
                    education_requirements=rec_data.get("education_requirements", ""),
                    salary_range=rec_data.get("salary_range", ""),
                    job_outlook=rec_data.get("job_outlook", ""),
                    next_steps=rec_data.get("next_steps", [])
                )
                career_recommendations.append(career_rec)
            
            # Build skill gap analysis
            skill_data = analysis_data.get("skill_gap_analysis", {})
            skill_gap_analysis = SkillGapAnalysis(
                current_skills=skill_data.get("current_skills", []),
                required_skills=skill_data.get("required_skills", []),
                skill_gaps=skill_data.get("skill_gaps", []),
                development_recommendations=skill_data.get("development_recommendations", [])
            )
            
            # Create assessment result
            result = AssessmentResult(
                assessment_id=assessment.id,
                user_email=assessment.user_email,
                career_recommendations=career_recommendations,
                skill_gap_analysis=skill_gap_analysis,
                personality_insights=analysis_data.get("personality_insights", {}),
                action_plan=analysis_data.get("action_plan", [])
            )
            
            return result
            
        except Exception as e:
            # Create fallback result if AI analysis fails
            print(f"AI analysis failed for assessment {assessment.id}: {str(e)}")
            return self._create_fallback_result(assessment)
    
    def _create_fallback_result(self, assessment: UserAssessment) -> AssessmentResult:
        """Create a basic fallback result if AI analysis fails"""
        # Basic analysis based on common patterns
        fallback_careers = [
            CareerRecommendation(
                career_title="Business Analyst",
                match_percentage=75,
                description="Analyze business processes and recommend improvements",
                key_skills=["Analysis", "Communication", "Problem Solving"],
                education_requirements="Bachelor's degree preferred",
                salary_range="$60,000 - $100,000",
                job_outlook="Growing field with good opportunities",
                next_steps=["Develop analytical skills", "Learn business tools", "Network with professionals"]
            ),
            CareerRecommendation(
                career_title="Project Manager",
                match_percentage=70,
                description="Lead and coordinate projects across teams",
                key_skills=["Leadership", "Organization", "Communication"],
                education_requirements="Bachelor's degree, PMP certification helpful",
                salary_range="$70,000 - $120,000",
                job_outlook="Strong demand across industries",
                next_steps=["Get PMP certification", "Practice leadership", "Join project management groups"]
            )
        ]
        
        skill_gap = SkillGapAnalysis(
            current_skills=["General knowledge", "Communication"],
            required_skills=["Specialized technical skills", "Industry knowledge"],
            skill_gaps=["Technical expertise", "Industry-specific knowledge"],
            development_recommendations=["Take relevant courses", "Gain practical experience", "Find mentorship"]
        )
        
        return AssessmentResult(
            assessment_id=assessment.id,
            user_email=assessment.user_email,
            career_recommendations=fallback_careers,
            skill_gap_analysis=skill_gap,
            personality_insights={
                "type": "Versatile Professional",
                "strengths": ["Adaptable", "Eager to learn"],
                "recommendations": ["Explore different fields", "Focus on skill development"]
            },
            action_plan=[
                "Complete career assessment with more specific answers",
                "Research industries of interest",
                "Develop key skills through online courses",
                "Network with professionals in target fields",
                "Consider informational interviews"
            ]
        )

# Global AI analyzer instance
ai_analyzer = CareerAIAnalyzer()