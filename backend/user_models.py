from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Dict, Any
from datetime import datetime
import uuid
from enum import Enum

# Enums
class UserRole(str, Enum):
    USER = "user"
    ADMIN = "admin"
    PREMIUM = "premium"

class SkillLevel(str, Enum):
    BEGINNER = "beginner"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"
    EXPERT = "expert"

class ChatMessageType(str, Enum):
    USER = "user"
    ATHENA = "athena"
    SYSTEM = "system"

class RoadmapStatus(str, Enum):
    NOT_STARTED = "not_started"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    SKIPPED = "skipped"

# User Models
class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    password_hash: str
    first_name: str
    last_name: str
    role: UserRole = UserRole.USER
    is_active: bool = True
    is_verified: bool = False
    verification_token: Optional[str] = None
    reset_token: Optional[str] = None
    reset_token_expires: Optional[datetime] = None
    profile_picture: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)
    last_login: Optional[datetime] = None
    
    # OAuth fields
    google_id: Optional[str] = None
    github_id: Optional[str] = None

class UserProfile(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    bio: Optional[str] = None
    location: Optional[str] = None
    phone: Optional[str] = None
    website: Optional[str] = None
    linkedin_url: Optional[str] = None
    github_url: Optional[str] = None
    current_role: Optional[str] = None
    years_of_experience: Optional[int] = None
    career_goals: Optional[str] = None
    preferred_work_environment: Optional[str] = None
    salary_expectations: Optional[str] = None
    availability: Optional[str] = None
    updated_at: datetime = Field(default_factory=datetime.now)

class UserCareer(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    company_name: str
    job_title: str
    industry: Optional[str] = None
    start_date: datetime
    end_date: Optional[datetime] = None
    is_current: bool = False
    description: Optional[str] = None
    achievements: Optional[List[str]] = []
    technologies_used: Optional[List[str]] = []
    created_at: datetime = Field(default_factory=datetime.now)

class UserCertification(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    name: str
    issuing_organization: str
    issue_date: datetime
    expiration_date: Optional[datetime] = None
    credential_id: Optional[str] = None
    credential_url: Optional[str] = None
    description: Optional[str] = None
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.now)

class Skill(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    category: str  # e.g., "programming", "design", "management", "soft_skills"
    is_predefined: bool = True
    created_at: datetime = Field(default_factory=datetime.now)

class UserSkill(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    skill_id: str
    skill_name: str  # Denormalized for easier queries
    level: SkillLevel
    years_of_experience: Optional[int] = None
    is_verified: bool = False
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)

class ChatMessage(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    conversation_id: str
    message_type: ChatMessageType
    content: str
    metadata: Optional[Dict[str, Any]] = {}  # For storing additional context
    created_at: datetime = Field(default_factory=datetime.now)

class ChatConversation(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    title: str
    last_message_at: datetime = Field(default_factory=datetime.now)
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.now)

class RoadmapItem(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    assessment_id: Optional[str] = None  # Link to original assessment
    title: str
    description: str
    category: str  # e.g., "skill_development", "education", "networking", "job_search"
    priority: int = 1  # 1-5, 1 being highest priority
    estimated_time_hours: Optional[int] = None
    status: RoadmapStatus = RoadmapStatus.NOT_STARTED
    due_date: Optional[datetime] = None
    completion_date: Optional[datetime] = None
    notes: Optional[str] = None
    resources: Optional[List[str]] = []  # URLs, book names, course names, etc.
    order_index: int = 0
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)

class UserProgress(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    total_roadmap_items: int = 0
    completed_roadmap_items: int = 0
    completion_percentage: float = 0.0
    total_time_spent_hours: float = 0.0
    streak_days: int = 0
    last_activity_date: Optional[datetime] = None
    milestones_achieved: List[str] = []
    updated_at: datetime = Field(default_factory=datetime.now)

# Request/Response Models
class UserRegistration(BaseModel):
    email: EmailStr
    password: str
    first_name: str
    last_name: str
    confirm_password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int = 1800  # 30 minutes

class RefreshTokenRequest(BaseModel):
    refresh_token: str

class PasswordResetRequest(BaseModel):
    email: EmailStr

class PasswordReset(BaseModel):
    token: str
    new_password: str
    confirm_password: str

class EmailVerification(BaseModel):
    token: str

class UserProfileUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    bio: Optional[str] = None
    location: Optional[str] = None
    phone: Optional[str] = None
    website: Optional[str] = None
    linkedin_url: Optional[str] = None
    github_url: Optional[str] = None
    current_role: Optional[str] = None
    years_of_experience: Optional[int] = None
    career_goals: Optional[str] = None
    preferred_work_environment: Optional[str] = None
    salary_expectations: Optional[str] = None
    availability: Optional[str] = None

class CareerCreate(BaseModel):
    company_name: str
    job_title: str
    industry: Optional[str] = None
    start_date: datetime
    end_date: Optional[datetime] = None
    is_current: bool = False
    description: Optional[str] = None
    achievements: Optional[List[str]] = []
    technologies_used: Optional[List[str]] = []

class CertificationCreate(BaseModel):
    name: str
    issuing_organization: str
    issue_date: datetime
    expiration_date: Optional[datetime] = None
    credential_id: Optional[str] = None
    credential_url: Optional[str] = None
    description: Optional[str] = None

class UserSkillCreate(BaseModel):
    skill_name: str
    level: SkillLevel
    years_of_experience: Optional[int] = None

class ChatMessageCreate(BaseModel):
    conversation_id: Optional[str] = None
    content: str

class RoadmapItemCreate(BaseModel):
    title: str
    description: str
    category: str
    priority: int = 1
    estimated_time_hours: Optional[int] = None
    due_date: Optional[datetime] = None
    resources: Optional[List[str]] = []

class RoadmapItemUpdate(BaseModel):
    status: Optional[RoadmapStatus] = None
    notes: Optional[str] = None
    completion_date: Optional[datetime] = None

# Response Models
class UserResponse(BaseModel):
    id: str
    email: str
    first_name: str
    last_name: str
    role: UserRole
    is_active: bool
    is_verified: bool
    profile_picture: Optional[str]
    created_at: datetime
    last_login: Optional[datetime]

class DashboardResponse(BaseModel):
    user: UserResponse
    profile_completion: float
    roadmap_progress: UserProgress
    recent_conversations: List[ChatConversation]
    upcoming_roadmap_items: List[RoadmapItem]
    stats: Dict[str, Any]