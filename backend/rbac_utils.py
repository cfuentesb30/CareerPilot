from functools import wraps
from fastapi import HTTPException, status, Depends, Request
from typing import List, Optional
from user_database import user_db
from rbac_models import UserRole, Permission, ROLE_PERMISSIONS, RolePermissionCheck
from auth import get_current_user
from datetime import datetime

class RBACManager:
    """Role-Based Access Control Manager"""
    
    @staticmethod
    def get_user_role(user_id: str, organization_id: Optional[str] = None) -> Optional[UserRole]:
        """Get user's role in the system or organization"""
        try:
            # First check for organization-specific role
            if organization_id:
                org_role = user_db.user_roles.find_one({
                    "user_id": user_id,
                    "organization_id": organization_id,
                    "is_active": True,
                    "$or": [
                        {"expires_at": {"$gt": datetime.now()}},
                        {"expires_at": None}
                    ]
                })
                if org_role:
                    return UserRole(org_role["role"])
            
            # Then check for global role
            global_role = user_db.user_roles.find_one({
                "user_id": user_id,
                "organization_id": None,
                "is_active": True,
                "$or": [
                    {"expires_at": {"$gt": datetime.now()}},
                    {"expires_at": None}
                ]
            })
            if global_role:
                return UserRole(global_role["role"])
            
            # Default role for all users
            return UserRole.STANDARD_USER
            
        except Exception:
            return UserRole.STANDARD_USER
    
    @staticmethod
    def get_user_permissions(user_id: str, organization_id: Optional[str] = None) -> List[Permission]:
        """Get all permissions for a user"""
        role = RBACManager.get_user_role(user_id, organization_id)
        return ROLE_PERMISSIONS.get(role, [])
    
    @staticmethod
    def has_permission(user_id: str, permission: Permission, organization_id: Optional[str] = None) -> bool:
        """Check if user has a specific permission"""
        user_permissions = RBACManager.get_user_permissions(user_id, organization_id)
        return permission in user_permissions
    
    @staticmethod
    def has_any_permission(user_id: str, permissions: List[Permission], organization_id: Optional[str] = None) -> bool:
        """Check if user has any of the specified permissions"""
        user_permissions = RBACManager.get_user_permissions(user_id, organization_id)
        return any(perm in user_permissions for perm in permissions)
    
    @staticmethod
    def has_all_permissions(user_id: str, permissions: List[Permission], organization_id: Optional[str] = None) -> bool:
        """Check if user has all of the specified permissions"""
        user_permissions = RBACManager.get_user_permissions(user_id, organization_id)
        return all(perm in user_permissions for perm in permissions)
    
    @staticmethod
    def is_admin(user_id: str, organization_id: Optional[str] = None) -> bool:
        """Check if user is an admin (Enterprise Admin or Super Admin)"""
        role = RBACManager.get_user_role(user_id, organization_id)
        return role in [UserRole.SUPER_ADMIN, UserRole.ENTERPRISE_ADMIN]
    
    @staticmethod
    def is_manager_or_above(user_id: str, organization_id: Optional[str] = None) -> bool:
        """Check if user is manager level or above"""
        role = RBACManager.get_user_role(user_id, organization_id)
        return role in [UserRole.SUPER_ADMIN, UserRole.ENTERPRISE_ADMIN, UserRole.MANAGER]
    
    @staticmethod
    def get_user_organization(user_id: str) -> Optional[str]:
        """Get user's primary organization"""
        try:
            role_assignment = user_db.user_roles.find_one({
                "user_id": user_id,
                "organization_id": {"$ne": None},
                "is_active": True
            })
            return role_assignment.get("organization_id") if role_assignment else None
        except Exception:
            return None
    
    @staticmethod
    def assign_role(user_id: str, role: UserRole, assigned_by: str, 
                   organization_id: Optional[str] = None, expires_at: Optional[datetime] = None) -> bool:
        """Assign a role to a user"""
        try:
            import uuid
            
            # Deactivate existing role assignments for this user/org combination
            user_db.user_roles.update_many(
                {
                    "user_id": user_id,
                    "organization_id": organization_id,
                    "is_active": True
                },
                {"$set": {"is_active": False, "updated_at": datetime.now()}}
            )
            
            # Create new role assignment
            role_assignment = {
                "id": str(uuid.uuid4()),
                "user_id": user_id,
                "organization_id": organization_id,
                "role": role.value,
                "assigned_by": assigned_by,
                "assigned_at": datetime.now(),
                "expires_at": expires_at,
                "is_active": True
            }
            
            user_db.user_roles.insert_one(role_assignment)
            return True
            
        except Exception:
            return False

# Permission decorators for FastAPI endpoints
def require_permission(permission: Permission, organization_id_param: Optional[str] = None):
    """Decorator to require specific permission"""
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Extract user_id from the authenticated user
            request = kwargs.get('request') or (args[0] if args and hasattr(args[0], 'headers') else None)
            if not request:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Request object not found"
                )
            
            # Get current user (assumes JWT auth)
            try:
                from fastapi.security import HTTPBearer
                from fastapi import Depends
                
                # This is a simplified version - in practice, you'd get the user_id from JWT token
                user_id = request.headers.get("X-User-ID")  # Temporary for testing
                if not user_id:
                    raise HTTPException(
                        status_code=status.HTTP_401_UNAUTHORIZED,
                        detail="Authentication required"
                    )
                
                # Get organization_id from params if specified
                org_id = kwargs.get(organization_id_param) if organization_id_param else None
                
                # Check permission
                if not RBACManager.has_permission(user_id, permission, org_id):
                    raise HTTPException(
                        status_code=status.HTTP_403_FORBIDDEN,
                        detail=f"Permission denied. Required permission: {permission.value}"
                    )
                
                return await func(*args, **kwargs)
                
            except HTTPException:
                raise
            except Exception as e:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Permission check failed"
                )
        
        return wrapper
    return decorator

def require_role(required_roles: List[UserRole], organization_id_param: Optional[str] = None):
    """Decorator to require specific role(s)"""
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Similar implementation to require_permission but checks roles
            request = kwargs.get('request') or (args[0] if args and hasattr(args[0], 'headers') else None)
            if not request:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Request object not found"
                )
            
            try:
                user_id = request.headers.get("X-User-ID")
                if not user_id:
                    raise HTTPException(
                        status_code=status.HTTP_401_UNAUTHORIZED,
                        detail="Authentication required"
                    )
                
                org_id = kwargs.get(organization_id_param) if organization_id_param else None
                user_role = RBACManager.get_user_role(user_id, org_id)
                
                if user_role not in required_roles:
                    raise HTTPException(
                        status_code=status.HTTP_403_FORBIDDEN,
                        detail=f"Access denied. Required role: {[r.value for r in required_roles]}"
                    )
                
                return await func(*args, **kwargs)
                
            except HTTPException:
                raise
            except Exception:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Role check failed"
                )
        
        return wrapper
    return decorator

def admin_required(organization_id_param: Optional[str] = None):
    """Decorator to require admin access"""
    return require_role([UserRole.SUPER_ADMIN, UserRole.ENTERPRISE_ADMIN], organization_id_param)

def manager_required(organization_id_param: Optional[str] = None):
    """Decorator to require manager level access or above"""
    return require_role([UserRole.SUPER_ADMIN, UserRole.ENTERPRISE_ADMIN, UserRole.MANAGER], organization_id_param)

# Utility functions for getting current user context
async def get_current_user_role(request: Request, organization_id: Optional[str] = None) -> UserRole:
    """Get current user's role"""
    user_id = request.headers.get("X-User-ID")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required"
        )
    
    return RBACManager.get_user_role(user_id, organization_id)

async def get_current_user_permissions(request: Request, organization_id: Optional[str] = None) -> List[Permission]:
    """Get current user's permissions"""
    user_id = request.headers.get("X-User-ID")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required"
        )
    
    return RBACManager.get_user_permissions(user_id, organization_id)

def check_permission_sync(user_id: str, permission: Permission, organization_id: Optional[str] = None) -> bool:
    """Synchronous permission check for use in other modules"""
    return RBACManager.has_permission(user_id, permission, organization_id)