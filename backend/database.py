import os
from pymongo import MongoClient
from typing import List, Optional, Dict, Any
from models import UserAssessment, AssessmentResult, CareerAssessmentQuestion
import json
from datetime import datetime
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class DatabaseManager:
    def __init__(self):
        self.client = MongoClient(os.getenv("MONGO_URL"))
        # Use database name from environment variable, fallback to default
        db_name = os.getenv("DATABASE_NAME", "careerpilot")
        self.db = self.client[db_name]
        self.assessments = self.db.assessments
        self.results = self.db.results
        self.questions = self.db.questions
        
        # Initialize questions if not exists
        self._initialize_questions()
    
    def _initialize_questions(self):
        """Initialize career assessment questions if they don't exist"""
        if self.questions.count_documents({}) == 0:
            questions = [
                {
                    "id": "edu_level",
                    "question": "What is your highest level of education?",
                    "type": "multiple_choice",
                    "options": [
                        "High School Diploma/GED",
                        "Some College",
                        "Associate's Degree",
                        "Bachelor's Degree",
                        "Master's Degree",
                        "Doctoral Degree",
                        "Professional Certification"
                    ],
                    "category": "experience"
                },
                {
                    "id": "work_experience",
                    "question": "How many years of professional work experience do you have?",
                    "type": "multiple_choice",
                    "options": [
                        "No experience (Student/Recent Graduate)",
                        "0-6 months (Entry level)",
                        "6 months - 1 year",
                        "1-2 years",
                        "2-3 years",
                        "3-5 years",
                        "5-7 years", 
                        "7-10 years",
                        "10-15 years",
                        "15-20 years",
                        "20+ years (Senior/Executive level)"
                    ],
                    "category": "experience"
                },
                {
                    "id": "current_field",
                    "question": "What field/industry do you currently work in or have experience with?",
                    "type": "text",
                    "options": None,
                    "category": "experience"
                },
                {
                    "id": "technical_skills",
                    "question": "Which technical skills do you currently have?",
                    "type": "text",
                    "options": None,
                    "category": "skills"
                },
                {
                    "id": "soft_skills",
                    "question": "Rate your overall soft skills (communication, teamwork, leadership, problem-solving):",
                    "type": "rating_scale",
                    "options": ["1 - Beginner", "2 - Basic", "3 - Intermediate", "4 - Advanced", "5 - Expert"],
                    "category": "skills"
                },
                {
                    "id": "work_interests",
                    "question": "Which work activities interest you most?",
                    "type": "multiple_choice",
                    "options": [
                        "Analyzing data and solving complex problems",
                        "Leading teams and managing projects",
                        "Creating and designing new things",
                        "Helping and teaching others",
                        "Working with technology and systems",
                        "Building relationships and networking",
                        "Research and investigation",
                        "Hands-on technical work"
                    ],
                    "category": "interests"
                },
                {
                    "id": "work_environment",
                    "question": "What work environment do you prefer?",
                    "type": "multiple_choice",
                    "options": [
                        "Remote/Work from home",
                        "Traditional office setting",
                        "Hybrid (mix of remote and office)",
                        "Collaborative open workspace",
                        "Independent workspace",
                        "Field work/Travel required",
                        "Client-facing environment"
                    ],
                    "category": "interests"
                },
                {
                    "id": "career_goals",
                    "question": "What are your primary career goals?",
                    "type": "multiple_choice",
                    "options": [
                        "Maximize earning potential",
                        "Achieve work-life balance",
                        "Make a positive social impact",
                        "Become an industry leader/expert",
                        "Start my own business",
                        "Continuous learning and growth",
                        "Job security and stability",
                        "Creative expression and innovation"
                    ],
                    "category": "goals"
                },
                {
                    "id": "salary_expectations",
                    "question": "What salary range are you targeting?",
                    "type": "multiple_choice",
                    "options": [
                        "$30,000 - $50,000",
                        "$50,000 - $75,000",
                        "$75,000 - $100,000",
                        "$100,000 - $150,000",
                        "$150,000 - $200,000",
                        "$200,000+"
                    ],
                    "category": "goals"
                },
                {
                    "id": "personality_type",
                    "question": "Which description best matches your personality?",
                    "type": "multiple_choice",
                    "options": [
                        "Outgoing and energized by social interaction",
                        "Reserved and energized by solitude",
                        "Detail-oriented and methodical",
                        "Big-picture thinker and conceptual",
                        "Logical and analytical decision-maker",
                        "Values-based and empathetic decision-maker",
                        "Structured and organized",
                        "Flexible and adaptable"
                    ],
                    "category": "personality"
                },
                {
                    "id": "learning_style",
                    "question": "How do you prefer to learn new skills?",
                    "type": "multiple_choice",
                    "options": [
                        "Hands-on practice and experimentation",
                        "Reading books and documentation",
                        "Online courses and tutorials",
                        "Mentorship and one-on-one guidance",
                        "Group workshops and collaboration",
                        "Trial and error approach",
                        "Structured classroom learning"
                    ],
                    "category": "personality"
                },
                {
                    "id": "challenge_level",
                    "question": "What level of challenge do you prefer in your work?",
                    "type": "rating_scale",
                    "options": ["1 - Low stress, routine tasks", "2", "3", "4", "5 - High challenge, complex problems"],
                    "category": "personality"
                },
                {
                    "id": "industry_interest",
                    "question": "Which industries interest you most?",
                    "type": "text",
                    "options": None,
                    "category": "interests"
                },
                {
                    "id": "career_change",
                    "question": "Are you looking to change careers or advance in your current field?",
                    "type": "multiple_choice",
                    "options": [
                        "Complete career change to new field",
                        "Advance within current industry",
                        "Transition to related field",
                        "Explore entrepreneurship",
                        "Return to workforce after break",
                        "Just exploring options"
                    ],
                    "category": "goals"
                },
                {
                    "id": "timeline",
                    "question": "What is your timeline for making a career change or advancement?",
                    "type": "multiple_choice",
                    "options": [
                        "Immediately (0-3 months)",
                        "Short-term (3-6 months)",
                        "Medium-term (6-12 months)",
                        "Long-term (1-2 years)",
                        "Very long-term (2+ years)",
                        "Just exploring for now"
                    ],
                    "category": "goals"
                }
            ]
            
            self.questions.insert_many(questions)
    
    def get_assessment_questions(self) -> List[CareerAssessmentQuestion]:
        """Get all assessment questions"""
        questions_data = list(self.questions.find({}, {"_id": 0}))
        return [CareerAssessmentQuestion(**q) for q in questions_data]
    
    def get_question_by_id(self, question_id: str) -> Optional[CareerAssessmentQuestion]:
        """Get a specific question by ID"""
        question_data = self.questions.find_one({"id": question_id}, {"_id": 0})
        if question_data:
            return CareerAssessmentQuestion(**question_data)
        return None
    
    def create_assessment(self, user_email: Optional[str] = None) -> UserAssessment:
        """Create a new assessment"""
        assessment = UserAssessment(user_email=user_email, answers=[])
        assessment_dict = assessment.dict()
        assessment_dict["started_at"] = assessment.started_at
        self.assessments.insert_one(assessment_dict)
        return assessment
    
    def get_assessment(self, assessment_id: str) -> Optional[UserAssessment]:
        """Get assessment by ID"""
        assessment_data = self.assessments.find_one({"id": assessment_id}, {"_id": 0})
        if assessment_data:
            return UserAssessment(**assessment_data)
        return None
    
    def update_assessment(self, assessment_id: str, answers: List[Dict], status: str = None):
        """Update assessment with new answers"""
        update_data = {"answers": answers}
        if status:
            update_data["status"] = status
            if status == "completed":
                update_data["completed_at"] = datetime.now()
        
        self.assessments.update_one(
            {"id": assessment_id},
            {"$set": update_data}
        )
    
    def save_assessment_result(self, result: AssessmentResult):
        """Save assessment result"""
        result_dict = result.dict()
        result_dict["generated_at"] = result.generated_at
        self.results.insert_one(result_dict)
    
    def get_assessment_result(self, result_id: str) -> Optional[AssessmentResult]:
        """Get assessment result by ID"""
        result_data = self.results.find_one({"id": result_id}, {"_id": 0})
        if result_data:
            return AssessmentResult(**result_data)
        return None
    
    def get_results_by_assessment(self, assessment_id: str) -> Optional[AssessmentResult]:
        """Get result by assessment ID"""
        result_data = self.results.find_one({"assessment_id": assessment_id}, {"_id": 0})
        if result_data:
            return AssessmentResult(**result_data)
        return None

# Global database instance
db_manager = DatabaseManager()