from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
import uuid

class CareerAssessmentQuestion(BaseModel):
    id: str
    question: str
    type: str  # multiple_choice, text, rating_scale
    options: Optional[List[str]] = None
    category: str  # skills, interests, experience, goals, personality

class AssessmentAnswer(BaseModel):
    question_id: str
    answer: str
    score: Optional[int] = None

class UserAssessment(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_email: Optional[str] = None
    answers: List[AssessmentAnswer]
    started_at: datetime = Field(default_factory=datetime.now)
    completed_at: Optional[datetime] = None
    status: str = "in_progress"  # in_progress, completed, analyzed

class CareerRecommendation(BaseModel):
    career_title: str
    match_percentage: int
    description: str
    key_skills: List[str]
    education_requirements: str
    salary_range: str
    job_outlook: str
    next_steps: List[str]

class SkillGapAnalysis(BaseModel):
    current_skills: List[str]
    required_skills: List[str]
    skill_gaps: List[str]
    development_recommendations: List[str]

class AssessmentResult(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    assessment_id: str
    user_email: Optional[str] = None
    career_recommendations: List[CareerRecommendation]
    skill_gap_analysis: SkillGapAnalysis
    personality_insights: Dict[str, Any]
    action_plan: List[str]
    generated_at: datetime = Field(default_factory=datetime.now)

# Request/Response Models
class StartAssessmentRequest(BaseModel):
    user_email: Optional[str] = None

class SubmitAnswerRequest(BaseModel):
    assessment_id: str
    question_id: str
    answer: str
    score: Optional[int] = None

class CompleteAssessmentRequest(BaseModel):
    assessment_id: str

class AssessmentResponse(BaseModel):
    assessment_id: str
    status: str
    next_question: Optional[CareerAssessmentQuestion] = None
    progress: Dict[str, int]  # {"current": 5, "total": 15}

class AnalysisResponse(BaseModel):
    assessment_id: str
    result_id: str
    status: str
    message: str