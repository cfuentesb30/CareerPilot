import os
from pymongo import MongoClient
from typing import List, Optional, Dict, Any
from user_models import *
from datetime import datetime, timedelta
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class UserDatabaseManager:
    def __init__(self):
        self.client = MongoClient(os.getenv("MONGO_URL"))
        # Use database name from environment variable, fallback to default
        db_name = os.getenv("DATABASE_NAME", "careerpilot")
        self.db = self.client[db_name]
        
        # Collections
        self.users = self.db.users
        self.profiles = self.db.profiles
        self.careers = self.db.careers
        self.certifications = self.db.certifications
        self.skills = self.db.skills
        self.user_skills = self.db.user_skills
        self.conversations = self.db.conversations
        self.messages = self.db.messages
        self.roadmap_items = self.db.roadmap_items
        self.user_progress = self.db.user_progress
        self.payment_transactions = self.db.payment_transactions
        self.sessions = self.db.sessions  # OAuth session storage
        
        # RBAC Collections
        self.organizations = self.db.organizations
        self.user_roles = self.db.user_roles
        self.teams = self.db.teams
        self.enterprise_analytics = self.db.enterprise_analytics
        
        # Initialize default skills
        self._initialize_default_skills()
        
        # Create indexes for better performance
        self._create_indexes()
    
    def _create_indexes(self):
        """Create database indexes for better performance."""
        self.users.create_index("email", unique=True)
        self.users.create_index("google_id")
        self.users.create_index("github_id")
        self.users.create_index("verification_token")
        self.users.create_index("reset_token")
        
        self.profiles.create_index("user_id", unique=True)
        self.careers.create_index("user_id")
        self.certifications.create_index("user_id")
        self.user_skills.create_index("user_id")
        self.conversations.create_index("user_id")
        self.messages.create_index(["conversation_id", "created_at"])
        self.roadmap_items.create_index("user_id")
        self.roadmap_items.create_index(["user_id", "order_index"])
        self.sessions.create_index("session_token", unique=True)
        self.sessions.create_index("user_id")
        self.sessions.create_index("expires_at")
        
        # RBAC Indexes
        self.organizations.create_index("id", unique=True)
        self.organizations.create_index("domain")
        self.user_roles.create_index(["user_id", "organization_id"])
        self.user_roles.create_index("organization_id")
        self.user_roles.create_index("expires_at")
        self.teams.create_index("organization_id")
        self.teams.create_index("manager_id")
        self.user_progress.create_index("user_id", unique=True)
    
    def _initialize_default_skills(self):
        """Initialize default skills if they don't exist."""
        if self.skills.count_documents({}) == 0:
            default_skills = [
                # Programming Languages
                {"name": "Python", "category": "programming", "is_predefined": True},
                {"name": "JavaScript", "category": "programming", "is_predefined": True},
                {"name": "Java", "category": "programming", "is_predefined": True},
                {"name": "C++", "category": "programming", "is_predefined": True},
                {"name": "C#", "category": "programming", "is_predefined": True},
                {"name": "TypeScript", "category": "programming", "is_predefined": True},
                {"name": "Go", "category": "programming", "is_predefined": True},
                {"name": "Rust", "category": "programming", "is_predefined": True},
                {"name": "PHP", "category": "programming", "is_predefined": True},
                {"name": "Ruby", "category": "programming", "is_predefined": True},
                
                # Web Technologies
                {"name": "React", "category": "web_development", "is_predefined": True},
                {"name": "Vue.js", "category": "web_development", "is_predefined": True},
                {"name": "Angular", "category": "web_development", "is_predefined": True},
                {"name": "Node.js", "category": "web_development", "is_predefined": True},
                {"name": "HTML/CSS", "category": "web_development", "is_predefined": True},
                {"name": "Express.js", "category": "web_development", "is_predefined": True},
                
                # Databases
                {"name": "SQL", "category": "database", "is_predefined": True},
                {"name": "MongoDB", "category": "database", "is_predefined": True},
                {"name": "PostgreSQL", "category": "database", "is_predefined": True},
                {"name": "MySQL", "category": "database", "is_predefined": True},
                {"name": "Redis", "category": "database", "is_predefined": True},
                
                # Cloud & DevOps
                {"name": "AWS", "category": "cloud", "is_predefined": True},
                {"name": "Google Cloud", "category": "cloud", "is_predefined": True},
                {"name": "Azure", "category": "cloud", "is_predefined": True},
                {"name": "Docker", "category": "devops", "is_predefined": True},
                {"name": "Kubernetes", "category": "devops", "is_predefined": True},
                {"name": "CI/CD", "category": "devops", "is_predefined": True},
                
                # Data Science & AI
                {"name": "Machine Learning", "category": "data_science", "is_predefined": True},
                {"name": "Deep Learning", "category": "data_science", "is_predefined": True},
                {"name": "Data Analysis", "category": "data_science", "is_predefined": True},
                {"name": "TensorFlow", "category": "data_science", "is_predefined": True},
                {"name": "PyTorch", "category": "data_science", "is_predefined": True},
                
                # Soft Skills
                {"name": "Leadership", "category": "soft_skills", "is_predefined": True},
                {"name": "Communication", "category": "soft_skills", "is_predefined": True},
                {"name": "Problem Solving", "category": "soft_skills", "is_predefined": True},
                {"name": "Project Management", "category": "soft_skills", "is_predefined": True},
                {"name": "Team Collaboration", "category": "soft_skills", "is_predefined": True},
                {"name": "Critical Thinking", "category": "soft_skills", "is_predefined": True},
                {"name": "Adaptability", "category": "soft_skills", "is_predefined": True},
                {"name": "Time Management", "category": "soft_skills", "is_predefined": True},
                
                # Design
                {"name": "UI/UX Design", "category": "design", "is_predefined": True},
                {"name": "Graphic Design", "category": "design", "is_predefined": True},
                {"name": "Adobe Creative Suite", "category": "design", "is_predefined": True},
                {"name": "Figma", "category": "design", "is_predefined": True},
                {"name": "Sketch", "category": "design", "is_predefined": True},
            ]
            
            # Add IDs and timestamps
            for skill in default_skills:
                skill["id"] = str(uuid.uuid4())
                skill["created_at"] = datetime.now()
            
            self.skills.insert_many(default_skills)
    
    # User Management Methods
    def create_user(self, user: User) -> str:
        """Create a new user."""
        user_dict = user.dict()
        user_dict["created_at"] = user.created_at
        user_dict["updated_at"] = user.updated_at
        
        result = self.users.insert_one(user_dict)
        
        # Create empty profile
        profile = UserProfile(user_id=user.id)
        self.profiles.insert_one(profile.dict())
        
        # Create progress tracking
        progress = UserProgress(user_id=user.id)
        self.user_progress.insert_one(progress.dict())
        
        return user.id
    
    def get_user_by_email(self, email: str) -> Optional[User]:
        """Get user by email."""
        user_data = self.users.find_one({"email": email}, {"_id": 0})
        if user_data:
            return User(**user_data)
        return None
    
    def get_user_by_id(self, user_id: str) -> Optional[User]:
        """Get user by ID."""
        user_data = self.users.find_one({"id": user_id}, {"_id": 0})
        if user_data:
            return User(**user_data)
        return None
    
    def update_user(self, user_id: str, updates: Dict[str, Any]):
        """Update user information."""
        updates["updated_at"] = datetime.now()
        self.users.update_one({"id": user_id}, {"$set": updates})
    
    def verify_user_email(self, verification_token: str) -> bool:
        """Verify user email with token."""
        result = self.users.update_one(
            {"verification_token": verification_token},
            {"$set": {"is_verified": True, "verification_token": None, "updated_at": datetime.now()}}
        )
        return result.modified_count > 0
    
    # Profile Methods
    def get_user_profile(self, user_id: str) -> Optional[UserProfile]:
        """Get user profile."""
        profile_data = self.profiles.find_one({"user_id": user_id}, {"_id": 0})
        if profile_data:
            return UserProfile(**profile_data)
        return None
    
    def update_user_profile(self, user_id: str, updates: Dict[str, Any]):
        """Update user profile."""
        updates["updated_at"] = datetime.now()
        self.profiles.update_one({"user_id": user_id}, {"$set": updates})
    
    # Career Methods
    def add_user_career(self, career: UserCareer) -> str:
        """Add a career entry for user."""
        career_dict = career.dict()
        career_dict["created_at"] = career.created_at
        self.careers.insert_one(career_dict)
        return career.id
    
    def get_user_careers(self, user_id: str) -> List[UserCareer]:
        """Get all careers for a user."""
        careers_data = list(self.careers.find({"user_id": user_id}, {"_id": 0}).sort("start_date", -1))
        return [UserCareer(**career) for career in careers_data]
    
    def update_user_career(self, career_id: str, updates: Dict[str, Any]):
        """Update a career entry."""
        self.careers.update_one({"id": career_id}, {"$set": updates})
    
    def delete_user_career(self, career_id: str, user_id: str):
        """Delete a career entry."""
        self.careers.delete_one({"id": career_id, "user_id": user_id})
    
    # Certification Methods
    def add_user_certification(self, certification: UserCertification) -> str:
        """Add a certification for user."""
        cert_dict = certification.dict()
        cert_dict["created_at"] = certification.created_at
        self.certifications.insert_one(cert_dict)
        return certification.id
    
    def get_user_certifications(self, user_id: str) -> List[UserCertification]:
        """Get all certifications for a user."""
        certs_data = list(self.certifications.find({"user_id": user_id}, {"_id": 0}).sort("issue_date", -1))
        return [UserCertification(**cert) for cert in certs_data]
    
    def update_user_certification(self, cert_id: str, updates: Dict[str, Any]):
        """Update a certification."""
        self.certifications.update_one({"id": cert_id}, {"$set": updates})
    
    def delete_user_certification(self, cert_id: str, user_id: str):
        """Delete a certification."""
        self.certifications.delete_one({"id": cert_id, "user_id": user_id})
    
    # Skills Methods
    def get_all_skills(self) -> List[Skill]:
        """Get all available skills."""
        skills_data = list(self.skills.find({}, {"_id": 0}).sort("name", 1))
        return [Skill(**skill) for skill in skills_data]
    
    def get_skills_by_category(self, category: str) -> List[Skill]:
        """Get skills by category."""
        skills_data = list(self.skills.find({"category": category}, {"_id": 0}).sort("name", 1))
        return [Skill(**skill) for skill in skills_data]
    
    def create_custom_skill(self, name: str, category: str) -> str:
        """Create a custom skill."""
        skill = Skill(name=name, category=category, is_predefined=False)
        skill_dict = skill.dict()
        skill_dict["created_at"] = skill.created_at
        self.skills.insert_one(skill_dict)
        return skill.id
    
    def add_user_skill(self, user_skill: UserSkill) -> str:
        """Add a skill to user."""
        # Check if skill already exists for user
        existing = self.user_skills.find_one({"user_id": user_skill.user_id, "skill_name": user_skill.skill_name})
        if existing:
            # Update existing skill
            self.user_skills.update_one(
                {"user_id": user_skill.user_id, "skill_name": user_skill.skill_name},
                {"$set": {"level": user_skill.level, "years_of_experience": user_skill.years_of_experience, "updated_at": datetime.now()}}
            )
            return existing["id"]
        else:
            # Create new skill
            skill_dict = user_skill.dict()
            skill_dict["created_at"] = user_skill.created_at
            skill_dict["updated_at"] = user_skill.updated_at
            self.user_skills.insert_one(skill_dict)
            return user_skill.id
    
    def get_user_skills(self, user_id: str) -> List[UserSkill]:
        """Get all skills for a user."""
        skills_data = list(self.user_skills.find({"user_id": user_id}, {"_id": 0}).sort("skill_name", 1))
        return [UserSkill(**skill) for skill in skills_data]
    
    def delete_user_skill(self, user_skill_id: str, user_id: str):
        """Delete a user skill."""
        self.user_skills.delete_one({"id": user_skill_id, "user_id": user_id})
    
    # Chat Methods
    def create_conversation(self, user_id: str, title: str) -> str:
        """Create a new conversation."""
        conversation = ChatConversation(user_id=user_id, title=title)
        conv_dict = conversation.dict()
        conv_dict["created_at"] = conversation.created_at
        conv_dict["last_message_at"] = conversation.last_message_at
        self.conversations.insert_one(conv_dict)
        return conversation.id
    
    def get_user_conversations(self, user_id: str, limit: int = 10) -> List[ChatConversation]:
        """Get user conversations."""
        convs_data = list(self.conversations.find(
            {"user_id": user_id, "is_active": True}, {"_id": 0}
        ).sort("last_message_at", -1).limit(limit))
        return [ChatConversation(**conv) for conv in convs_data]
    
    def add_chat_message(self, message: ChatMessage) -> str:
        """Add a message to conversation."""
        msg_dict = message.dict()
        msg_dict["created_at"] = message.created_at
        self.messages.insert_one(msg_dict)
        
        # Update conversation timestamp
        self.conversations.update_one(
            {"id": message.conversation_id},
            {"$set": {"last_message_at": datetime.now()}}
        )
        
        return message.id
    
    def get_conversation_messages(self, conversation_id: str, limit: int = 50) -> List[ChatMessage]:
        """Get messages from a conversation."""
        msgs_data = list(self.messages.find(
            {"conversation_id": conversation_id}, {"_id": 0}
        ).sort("created_at", 1).limit(limit))
        return [ChatMessage(**msg) for msg in msgs_data]
    
    # Roadmap Methods
    def add_roadmap_item(self, item: RoadmapItem) -> str:
        """Add a roadmap item."""
        # Get current max order_index for user
        max_order = self.roadmap_items.find_one(
            {"user_id": item.user_id}, 
            sort=[("order_index", -1)]
        )
        item.order_index = (max_order["order_index"] + 1) if max_order else 0
        
        item_dict = item.dict()
        item_dict["created_at"] = item.created_at
        item_dict["updated_at"] = item.updated_at
        self.roadmap_items.insert_one(item_dict)
        
        # Update user progress
        self._update_user_progress(item.user_id)
        
        return item.id
    
    def get_user_roadmap(self, user_id: str) -> List[RoadmapItem]:
        """Get user's roadmap items."""
        items_data = list(self.roadmap_items.find(
            {"user_id": user_id}, {"_id": 0}
        ).sort("order_index", 1))
        return [RoadmapItem(**item) for item in items_data]
    
    def update_roadmap_item(self, item_id: str, user_id: str, updates: Dict[str, Any]):
        """Update a roadmap item."""
        updates["updated_at"] = datetime.now()
        
        # If marking as completed, set completion date
        if updates.get("status") == RoadmapStatus.COMPLETED and "completion_date" not in updates:
            updates["completion_date"] = datetime.now()
        
        result = self.roadmap_items.update_one(
            {"id": item_id, "user_id": user_id}, 
            {"$set": updates}
        )
        
        if result.modified_count > 0:
            self._update_user_progress(user_id)
        
        return result.modified_count > 0
    
    def delete_roadmap_item(self, item_id: str, user_id: str):
        """Delete a roadmap item."""
        result = self.roadmap_items.delete_one({"id": item_id, "user_id": user_id})
        if result.deleted_count > 0:
            self._update_user_progress(user_id)
    
    def _update_user_progress(self, user_id: str):
        """Update user progress statistics."""
        total_items = self.roadmap_items.count_documents({"user_id": user_id})
        completed_items = self.roadmap_items.count_documents({
            "user_id": user_id, 
            "status": RoadmapStatus.COMPLETED
        })
        
        completion_percentage = (completed_items / total_items * 100) if total_items > 0 else 0
        
        # Calculate total time spent (placeholder - would need time tracking)
        total_time = self.roadmap_items.aggregate([
            {"$match": {"user_id": user_id, "status": RoadmapStatus.COMPLETED}},
            {"$group": {"_id": None, "total": {"$sum": "$estimated_time_hours"}}}
        ])
        total_time_hours = list(total_time)[0]["total"] if list(total_time) else 0
        
        # Update progress
        self.user_progress.update_one(
            {"user_id": user_id},
            {"$set": {
                "total_roadmap_items": total_items,
                "completed_roadmap_items": completed_items,
                "completion_percentage": completion_percentage,
                "total_time_spent_hours": total_time_hours or 0,
                "updated_at": datetime.now()
            }}
        )
    
    def get_user_progress(self, user_id: str) -> Optional[UserProgress]:
        """Get user progress."""
        progress_data = self.user_progress.find_one({"user_id": user_id}, {"_id": 0})
        if progress_data:
            return UserProgress(**progress_data)
        return None
    
    def calculate_profile_completion(self, user_id: str) -> float:
        """Calculate profile completion percentage."""
        user = self.get_user_by_id(user_id)
        profile = self.get_user_profile(user_id)
        careers = self.get_user_careers(user_id)
        certifications = self.get_user_certifications(user_id)
        skills = self.get_user_skills(user_id)
        
        total_fields = 15  # Total checkable fields
        completed_fields = 0
        
        # Basic user info (4 fields)
        if user and user.first_name: completed_fields += 1
        if user and user.last_name: completed_fields += 1
        if user and user.is_verified: completed_fields += 1
        if user and user.profile_picture: completed_fields += 1
        
        # Profile info (6 fields)
        if profile:
            if profile.bio: completed_fields += 1
            if profile.location: completed_fields += 1
            if profile.current_role: completed_fields += 1
            if profile.years_of_experience: completed_fields += 1
            if profile.career_goals: completed_fields += 1
            if profile.linkedin_url: completed_fields += 1
        
        # Experience data (5 fields)
        if len(careers) > 0: completed_fields += 2
        if len(certifications) > 0: completed_fields += 1
        if len(skills) >= 3: completed_fields += 2  # At least 3 skills
        
        return (completed_fields / total_fields) * 100

# Global database instance
user_db = UserDatabaseManager()