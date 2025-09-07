from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum

class UserRole(str, Enum):
    """User roles in the system"""
    SUPER_ADMIN = "super_admin"
    ENTERPRISE_ADMIN = "enterprise_admin"
    MANAGER = "manager"
    TEAM_LEAD = "team_lead"
    STANDARD_USER = "standard_user"
    GUEST_TRIAL = "guest_trial"

class Permission(str, Enum):
    """System permissions"""
    # User Management
    CREATE_USERS = "create_users"
    EDIT_USERS = "edit_users"
    DELETE_USERS = "delete_users"
    VIEW_ALL_USERS = "view_all_users"
    
    # Role Management
    ASSIGN_ROLES = "assign_roles"
    MANAGE_ROLES = "manage_roles"
    
    # Organization Management
    MANAGE_ORGANIZATION = "manage_organization"
    VIEW_ORGANIZATION_ANALYTICS = "view_organization_analytics"
    MANAGE_ORGANIZATION_SETTINGS = "manage_organization_settings"
    MANAGE_CUSTOM_BRANDING = "manage_custom_branding"
    
    # Team Management
    MANAGE_TEAM = "manage_team"
    VIEW_TEAM_ANALYTICS = "view_team_analytics"
    ASSIGN_ROADMAPS = "assign_roadmaps"
    
    # Billing & Subscriptions
    MANAGE_BILLING = "manage_billing"
    VIEW_BILLING = "view_billing"
    
    # API & Integrations
    API_ACCESS = "api_access"
    MANAGE_INTEGRATIONS = "manage_integrations"
    
    # System Administration
    SYSTEM_ADMIN = "system_admin"
    VIEW_SYSTEM_LOGS = "view_system_logs"
    
    # Enterprise Features
    BULK_OPERATIONS = "bulk_operations"
    ADVANCED_REPORTING = "advanced_reporting"
    CUSTOM_WORKFLOWS = "custom_workflows"

# Role-Permission Mapping
ROLE_PERMISSIONS = {
    UserRole.SUPER_ADMIN: [
        Permission.SYSTEM_ADMIN,
        Permission.VIEW_SYSTEM_LOGS,
        Permission.CREATE_USERS,
        Permission.EDIT_USERS,
        Permission.DELETE_USERS,
        Permission.VIEW_ALL_USERS,
        Permission.ASSIGN_ROLES,
        Permission.MANAGE_ROLES,
        Permission.MANAGE_ORGANIZATION,
        Permission.VIEW_ORGANIZATION_ANALYTICS,
        Permission.MANAGE_ORGANIZATION_SETTINGS,
        Permission.MANAGE_CUSTOM_BRANDING,
        Permission.MANAGE_BILLING,
        Permission.VIEW_BILLING,
        Permission.API_ACCESS,
        Permission.MANAGE_INTEGRATIONS,
        Permission.BULK_OPERATIONS,
        Permission.ADVANCED_REPORTING,
        Permission.CUSTOM_WORKFLOWS
    ],
    
    UserRole.ENTERPRISE_ADMIN: [
        Permission.CREATE_USERS,
        Permission.EDIT_USERS,
        Permission.DELETE_USERS,
        Permission.VIEW_ALL_USERS,
        Permission.ASSIGN_ROLES,
        Permission.MANAGE_ORGANIZATION,
        Permission.VIEW_ORGANIZATION_ANALYTICS,
        Permission.MANAGE_ORGANIZATION_SETTINGS,
        Permission.MANAGE_CUSTOM_BRANDING,
        Permission.MANAGE_TEAM,
        Permission.VIEW_TEAM_ANALYTICS,
        Permission.ASSIGN_ROADMAPS,
        Permission.MANAGE_BILLING,
        Permission.VIEW_BILLING,
        Permission.API_ACCESS,
        Permission.MANAGE_INTEGRATIONS,
        Permission.BULK_OPERATIONS,
        Permission.ADVANCED_REPORTING,
        Permission.CUSTOM_WORKFLOWS
    ],
    
    UserRole.MANAGER: [
        Permission.CREATE_USERS,
        Permission.EDIT_USERS,
        Permission.MANAGE_TEAM,
        Permission.VIEW_TEAM_ANALYTICS,
        Permission.ASSIGN_ROADMAPS,
        Permission.VIEW_BILLING,
        Permission.BULK_OPERATIONS,
        Permission.ADVANCED_REPORTING
    ],
    
    UserRole.TEAM_LEAD: [
        Permission.MANAGE_TEAM,
        Permission.VIEW_TEAM_ANALYTICS,
        Permission.ASSIGN_ROADMAPS
    ],
    
    UserRole.STANDARD_USER: [
        # Standard users have basic CareerPilot features (no special permissions needed)
    ],
    
    UserRole.GUEST_TRIAL: [
        # Very limited access for trial users
    ]
}

class Organization(BaseModel):
    """Organization model for enterprise clients"""
    id: str = Field(..., description="Unique organization identifier")
    name: str = Field(..., description="Organization name")
    domain: Optional[str] = Field(None, description="Organization domain (e.g., company.com)")
    subscription_plan: str = Field("enterprise", description="Subscription plan")
    max_users: int = Field(100, description="Maximum number of users allowed")
    active_users: int = Field(0, description="Current number of active users")
    
    # Custom Branding
    custom_branding: Optional[Dict[str, Any]] = Field(None, description="Custom branding settings")
    logo_url: Optional[str] = Field(None, description="Custom logo URL")
    primary_color: Optional[str] = Field(None, description="Primary brand color")
    secondary_color: Optional[str] = Field(None, description="Secondary brand color")
    
    # Organization settings
    settings: Dict[str, Any] = Field(default_factory=dict, description="Organization-specific settings")
    
    # Timestamps
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)
    
    # Status
    is_active: bool = Field(True, description="Organization active status")

class UserRoleAssignment(BaseModel):
    """User role assignment model"""
    id: str = Field(..., description="Assignment ID")
    user_id: str = Field(..., description="User ID")
    organization_id: Optional[str] = Field(None, description="Organization ID (null for individual users)")
    role: UserRole = Field(..., description="Assigned role")
    assigned_by: str = Field(..., description="ID of user who assigned this role")
    assigned_at: datetime = Field(default_factory=datetime.now)
    expires_at: Optional[datetime] = Field(None, description="Role expiration date")
    is_active: bool = Field(True, description="Assignment active status")

class RolePermissionCheck(BaseModel):
    """Model for checking role permissions"""
    user_id: str
    organization_id: Optional[str] = None
    required_permission: Permission

class CustomBrandingSettings(BaseModel):
    """Custom branding settings for enterprise clients"""
    organization_id: str
    
    # Visual Branding
    logo_url: Optional[str] = None
    favicon_url: Optional[str] = None
    primary_color: str = "#17a2b8"  # Default turquoise
    secondary_color: str = "#20c997"  # Default teal
    accent_color: Optional[str] = None
    
    # Text Branding
    company_name: Optional[str] = None
    tagline: Optional[str] = None
    welcome_message: Optional[str] = None
    
    # UI Customization
    show_powered_by: bool = True
    custom_domain: Optional[str] = None
    custom_css: Optional[str] = None
    
    # Email Branding
    email_header_logo: Optional[str] = None
    email_footer_text: Optional[str] = None
    
    # Features
    hide_pricing: bool = False
    custom_feature_names: Dict[str, str] = Field(default_factory=dict)
    
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)

class TeamStructure(BaseModel):
    """Team structure for enterprise organizations"""
    id: str
    organization_id: str
    name: str
    description: Optional[str] = None
    manager_id: str  # User ID of team manager
    team_lead_id: Optional[str] = None  # User ID of team lead
    member_ids: List[str] = Field(default_factory=list)  # List of team member user IDs
    
    # Team settings
    default_roadmap_template: Optional[str] = None
    team_goals: List[str] = Field(default_factory=list)
    
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)
    is_active: bool = True

class EnterpriseAnalytics(BaseModel):
    """Enterprise analytics and reporting"""
    organization_id: str
    period: str  # daily, weekly, monthly, quarterly
    
    # User Metrics
    total_users: int = 0
    active_users: int = 0
    new_users: int = 0
    
    # Usage Metrics
    assessments_completed: int = 0
    roadmaps_created: int = 0
    chat_sessions: int = 0
    
    # Progress Metrics
    avg_profile_completion: float = 0.0
    avg_roadmap_progress: float = 0.0
    
    # Team Metrics (if applicable)
    teams_count: int = 0
    avg_team_size: float = 0.0
    
    # Feature Usage
    feature_usage: Dict[str, int] = Field(default_factory=dict)
    
    # Dates
    period_start: datetime
    period_end: datetime
    generated_at: datetime = Field(default_factory=datetime.now)

# API Request/Response Models
class CreateOrganizationRequest(BaseModel):
    name: str
    domain: Optional[str] = None
    max_users: int = 100
    admin_email: str
    admin_first_name: str
    admin_last_name: str

class AssignRoleRequest(BaseModel):
    user_id: str
    role: UserRole
    organization_id: Optional[str] = None
    expires_at: Optional[datetime] = None

class UpdateBrandingRequest(BaseModel):
    logo_url: Optional[str] = None
    primary_color: Optional[str] = None
    secondary_color: Optional[str] = None
    company_name: Optional[str] = None
    tagline: Optional[str] = None
    custom_css: Optional[str] = None
    hide_pricing: Optional[bool] = None

class BulkUserOperation(BaseModel):
    operation: str  # "create", "update", "delete", "assign_roadmap"
    user_data: List[Dict[str, Any]]
    organization_id: str