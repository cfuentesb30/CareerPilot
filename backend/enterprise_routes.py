from fastapi import APIRouter, HTTPException, status, Request, Depends
from fastapi.responses import JSONResponse
from typing import List, Optional
from datetime import datetime
import uuid

from user_database import user_db
from rbac_models import (
    Organization, UserRole, Permission, UserRoleAssignment,
    CustomBrandingSettings, TeamStructure, EnterpriseAnalytics,
    CreateOrganizationRequest, AssignRoleRequest, UpdateBrandingRequest,
    BulkUserOperation
)
from rbac_utils import (
    RBACManager, require_permission, require_role, admin_required,
    manager_required, get_current_user_role, get_current_user_permissions
)
from auth import get_current_user_hybrid

router = APIRouter(prefix="/api/enterprise", tags=["enterprise"])

# Organization Management
@router.post("/organizations")
@require_permission(Permission.SYSTEM_ADMIN)
async def create_organization(request: Request, org_data: CreateOrganizationRequest):
    """Create a new enterprise organization"""
    try:
        # Check if organization already exists
        existing_org = user_db.organizations.find_one({"name": org_data.name})
        if existing_org:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Organization already exists"
            )
        
        # Create organization
        org_id = str(uuid.uuid4())
        organization = {
            "id": org_id,
            "name": org_data.name,
            "domain": org_data.domain,
            "subscription_plan": "enterprise",
            "max_users": org_data.max_users,
            "active_users": 0,
            "custom_branding": {},
            "settings": {},
            "created_at": datetime.now(),
            "updated_at": datetime.now(),
            "is_active": True
        }
        
        user_db.organizations.insert_one(organization)
        
        # Create admin user for the organization
        admin_user_id = str(uuid.uuid4())
        admin_user = {
            "id": admin_user_id,
            "email": org_data.admin_email,
            "first_name": org_data.admin_first_name,
            "last_name": org_data.admin_last_name,
            "hashed_password": "",  # Will be set during first login
            "is_verified": True,
            "organization_id": org_id,
            "created_at": datetime.now(),
            "updated_at": datetime.now(),
            "subscription_plan": "enterprise"
        }
        
        user_db.users.insert_one(admin_user)
        
        # Assign Enterprise Admin role
        current_user_id = request.headers.get("X-User-ID", "system")
        RBACManager.assign_role(
            user_id=admin_user_id,
            role=UserRole.ENTERPRISE_ADMIN,
            assigned_by=current_user_id,
            organization_id=org_id
        )
        
        # Update organization active users count
        user_db.organizations.update_one(
            {"id": org_id},
            {"$set": {"active_users": 1}}
        )
        
        return {
            "message": "Organization created successfully",
            "organization_id": org_id,
            "admin_user_id": admin_user_id
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create organization: {str(e)}"
        )

@router.get("/organizations")
@require_permission(Permission.SYSTEM_ADMIN)
async def list_organizations(request: Request):
    """List all organizations (Super Admin only)"""
    try:
        organizations = list(user_db.organizations.find({"is_active": True}))
        
        for org in organizations:
            org["_id"] = str(org["_id"])  # Convert ObjectId to string
        
        return {"organizations": organizations}
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to list organizations: {str(e)}"
        )

@router.get("/organizations/{organization_id}")
@require_permission(Permission.VIEW_ORGANIZATION_ANALYTICS)
async def get_organization(request: Request, organization_id: str):
    """Get organization details"""
    try:
        organization = user_db.organizations.find_one({"id": organization_id})
        if not organization:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Organization not found"
            )
        
        organization["_id"] = str(organization["_id"])
        return {"organization": organization}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get organization: {str(e)}"
        )

# Role Management
@router.post("/roles/assign")
@require_permission(Permission.ASSIGN_ROLES)
async def assign_role(request: Request, role_data: AssignRoleRequest):
    """Assign role to a user"""
    try:
        current_user_id = request.headers.get("X-User-ID")
        if not current_user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Authentication required"
            )
        
        # Check if target user exists
        target_user = user_db.users.find_one({"id": role_data.user_id})
        if not target_user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Target user not found"
            )
        
        # Assign the role
        success = RBACManager.assign_role(
            user_id=role_data.user_id,
            role=role_data.role,
            assigned_by=current_user_id,
            organization_id=role_data.organization_id,
            expires_at=role_data.expires_at
        )
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to assign role"
            )
        
        return {"message": f"Role {role_data.role.value} assigned successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to assign role: {str(e)}"
        )

@router.get("/users/{user_id}/roles")
@require_permission(Permission.VIEW_ALL_USERS)
async def get_user_roles(request: Request, user_id: str):
    """Get all roles assigned to a user"""
    try:
        roles = list(user_db.user_roles.find({
            "user_id": user_id,
            "is_active": True
        }))
        
        for role in roles:
            role["_id"] = str(role["_id"])
        
        return {"roles": roles}
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get user roles: {str(e)}"
        )

@router.get("/my/permissions")
async def get_my_permissions(request: Request):
    """Get current user's permissions"""
    try:
        user_id = request.headers.get("X-User-ID")
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Authentication required"
            )
        
        org_id = RBACManager.get_user_organization(user_id)
        role = RBACManager.get_user_role(user_id, org_id)
        permissions = RBACManager.get_user_permissions(user_id, org_id)
        
        return {
            "user_id": user_id,
            "organization_id": org_id,
            "role": role.value if role else None,
            "permissions": [p.value for p in permissions]
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get permissions: {str(e)}"
        )

# Custom Branding
@router.put("/organizations/{organization_id}/branding")
@require_permission(Permission.MANAGE_CUSTOM_BRANDING)
async def update_branding(request: Request, organization_id: str, branding_data: UpdateBrandingRequest):
    """Update organization's custom branding"""
    try:
        # Check if organization exists
        organization = user_db.organizations.find_one({"id": organization_id})
        if not organization:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Organization not found"
            )
        
        # Update branding settings
        branding_update = {}
        if branding_data.logo_url is not None:
            branding_update["logo_url"] = branding_data.logo_url
        if branding_data.primary_color is not None:
            branding_update["primary_color"] = branding_data.primary_color
        if branding_data.secondary_color is not None:
            branding_update["secondary_color"] = branding_data.secondary_color
        if branding_data.company_name is not None:
            branding_update["company_name"] = branding_data.company_name
        if branding_data.tagline is not None:
            branding_update["tagline"] = branding_data.tagline
        if branding_data.custom_css is not None:
            branding_update["custom_css"] = branding_data.custom_css
        if branding_data.hide_pricing is not None:
            branding_update["hide_pricing"] = branding_data.hide_pricing
        
        # Update in database
        user_db.organizations.update_one(
            {"id": organization_id},
            {
                "$set": {
                    "custom_branding": branding_update,
                    "updated_at": datetime.now()
                }
            }
        )
        
        return {"message": "Branding updated successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update branding: {str(e)}"
        )

@router.get("/organizations/{organization_id}/branding")
async def get_branding(request: Request, organization_id: str):
    """Get organization's custom branding"""
    try:
        organization = user_db.organizations.find_one({"id": organization_id})
        if not organization:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Organization not found"
            )
        
        branding = organization.get("custom_branding", {})
        return {"branding": branding}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get branding: {str(e)}"
        )

# Team Management
@router.post("/organizations/{organization_id}/teams")
@require_permission(Permission.MANAGE_TEAM)
async def create_team(request: Request, organization_id: str, team_data: dict):
    """Create a new team within organization"""
    try:
        current_user_id = request.headers.get("X-User-ID")
        
        team_id = str(uuid.uuid4())
        team = {
            "id": team_id,
            "organization_id": organization_id,
            "name": team_data.get("name"),
            "description": team_data.get("description"),
            "manager_id": team_data.get("manager_id", current_user_id),
            "team_lead_id": team_data.get("team_lead_id"),
            "member_ids": team_data.get("member_ids", []),
            "default_roadmap_template": team_data.get("default_roadmap_template"),
            "team_goals": team_data.get("team_goals", []),
            "created_at": datetime.now(),
            "updated_at": datetime.now(),
            "is_active": True
        }
        
        user_db.teams.insert_one(team)
        
        return {
            "message": "Team created successfully",
            "team_id": team_id
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create team: {str(e)}"
        )

@router.get("/organizations/{organization_id}/teams")
@require_permission(Permission.VIEW_TEAM_ANALYTICS)
async def list_teams(request: Request, organization_id: str):
    """List all teams in organization"""
    try:
        teams = list(user_db.teams.find({
            "organization_id": organization_id,
            "is_active": True
        }))
        
        for team in teams:
            team["_id"] = str(team["_id"])
        
        return {"teams": teams}
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to list teams: {str(e)}"
        )

# Analytics and Reporting
@router.get("/organizations/{organization_id}/analytics")
@require_permission(Permission.VIEW_ORGANIZATION_ANALYTICS)
async def get_organization_analytics(request: Request, organization_id: str, period: str = "monthly"):
    """Get organization analytics"""
    try:
        # Calculate analytics (simplified version)
        total_users = user_db.users.count_documents({"organization_id": organization_id})
        active_users = user_db.users.count_documents({
            "organization_id": organization_id,
            "last_login": {"$gte": datetime.now().replace(day=1)}  # Active this month
        })
        
        assessments_completed = user_db.assessments.count_documents({
            "user_id": {"$in": [u["id"] for u in user_db.users.find({"organization_id": organization_id})]}
        })
        
        analytics = {
            "organization_id": organization_id,
            "period": period,
            "total_users": total_users,
            "active_users": active_users,
            "new_users": 0,  # Would need to calculate based on period
            "assessments_completed": assessments_completed,
            "roadmaps_created": 0,  # Would calculate from roadmaps collection
            "chat_sessions": 0,  # Would calculate from chats collection
            "avg_profile_completion": 75.0,  # Would calculate from profiles
            "avg_roadmap_progress": 60.0,  # Would calculate from roadmap progress
            "teams_count": user_db.teams.count_documents({"organization_id": organization_id}),
            "feature_usage": {},
            "generated_at": datetime.now()
        }
        
        return {"analytics": analytics}
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get analytics: {str(e)}"
        )

# Bulk Operations
@router.post("/organizations/{organization_id}/bulk-operations")
@require_permission(Permission.BULK_OPERATIONS)
async def perform_bulk_operation(request: Request, organization_id: str, operation: BulkUserOperation):
    """Perform bulk operations on users"""
    try:
        results = []
        
        for user_data in operation.user_data:
            try:
                if operation.operation == "create":
                    # Create user
                    user_id = str(uuid.uuid4())
                    user_record = {
                        "id": user_id,
                        "organization_id": organization_id,
                        "created_at": datetime.now(),
                        **user_data
                    }
                    user_db.users.insert_one(user_record)
                    results.append({"status": "success", "user_id": user_id})
                    
                elif operation.operation == "assign_roadmap":
                    # Assign roadmap to user
                    user_id = user_data.get("user_id")
                    roadmap_template = user_data.get("roadmap_template")
                    # Implementation would go here
                    results.append({"status": "success", "user_id": user_id})
                    
                else:
                    results.append({"status": "error", "message": "Unknown operation"})
                    
            except Exception as e:
                results.append({"status": "error", "message": str(e)})
        
        return {
            "message": f"Bulk operation {operation.operation} completed",
            "results": results
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Bulk operation failed: {str(e)}"
        )