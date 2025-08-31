from fastapi import APIRouter, HTTPException, status, Request, Response, Header
from fastapi.responses import JSONResponse
from user_database import user_db
from user_models import User, UserProfile
from datetime import datetime, timedelta
import uuid
import requests
import os
from typing import Optional

router = APIRouter(prefix="/api/oauth", tags=["oauth"])

# Emergent Auth API configuration
EMERGENT_AUTH_URL = "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data"
SESSION_EXPIRY_DAYS = 7

def create_session_token():
    """Generate a unique session token."""
    return str(uuid.uuid4())

def get_session_expiry():
    """Get session expiry date (7 days from now)."""
    return datetime.now() + timedelta(days=SESSION_EXPIRY_DAYS)

async def validate_emergent_session(session_id: str) -> dict:
    """Validate session with Emergent Auth API."""
    try:
        headers = {"X-Session-ID": session_id}
        response = requests.get(EMERGENT_AUTH_URL, headers=headers, timeout=10)
        
        if response.status_code == 200:
            return response.json()
        else:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid session ID"
            )
    except requests.RequestException as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to validate session: {str(e)}"
        )

@router.post("/google/callback")
async def google_oauth_callback(request: Request, response: Response):
    """Handle OAuth callback from Emergent auth system."""
    try:
        # This endpoint is called by the frontend after parsing the fragment
        data = await request.json()
        session_id = data.get("session_id")
        
        if not session_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Session ID is required"
            )
        
        # Validate session with Emergent Auth API  
        auth_data = await validate_emergent_session(session_id)
        
        # Extract user data from auth response
        user_id = auth_data.get("id")
        email = auth_data.get("email")
        name = auth_data.get("name", "")
        picture = auth_data.get("picture")
        emergent_session_token = auth_data.get("session_token")
        
        if not user_id or not email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid user data from auth provider"
            )
        
        # Split name into first_name and last_name
        name_parts = name.split(" ", 1) if name else ["", ""]
        first_name = name_parts[0] if len(name_parts) > 0 else ""
        last_name = name_parts[1] if len(name_parts) > 1 else ""
        
        # Check if user already exists
        existing_user = user_db.users.find_one({"email": email})
        
        if existing_user:
            # User exists, update last login and OAuth info
            internal_user_id = existing_user["id"]
            user_db.users.update_one(
                {"id": internal_user_id},
                {
                    "$set": {
                        "last_login": datetime.now(),
                        "google_id": user_id,
                        "profile_picture": picture,
                        "is_verified": True,  # OAuth users are considered verified
                        "updated_at": datetime.now()
                    }
                }
            )
        else:
            # Create new user
            internal_user_id = str(uuid.uuid4())
            user_record = {
                "id": internal_user_id,
                "email": email,
                "first_name": first_name,
                "last_name": last_name,
                "hashed_password": "",  # OAuth users don't have passwords
                "is_verified": True,  # OAuth users are considered verified
                "verification_token": None,
                "google_id": user_id,
                "profile_picture": picture,
                "created_at": datetime.now(),
                "updated_at": datetime.now(),
                "last_login": datetime.now(),
                "subscription_plan": "free"
            }
            
            user_db.users.insert_one(user_record)
            
            # Create default user profile
            profile_record = {
                "id": str(uuid.uuid4()),
                "user_id": internal_user_id,
                "email": email,
                "first_name": first_name,
                "last_name": last_name,
                "current_role": "",
                "years_experience": 0,
                "location": "",
                "website": "",
                "created_at": datetime.now(),
                "updated_at": datetime.now()
            }
            
            user_db.profiles.insert_one(profile_record)
        
        # Create internal session token
        session_token = create_session_token()
        session_expiry = get_session_expiry()
        
        # Store session in database
        session_record = {
            "id": str(uuid.uuid4()),
            "session_token": session_token,
            "user_id": internal_user_id,
            "emergent_session_token": emergent_session_token,
            "created_at": datetime.now(),
            "expires_at": session_expiry,
            "is_active": True
        }
        
        user_db.sessions.insert_one(session_record)
        
        # Set secure session cookie
        response.set_cookie(
            key="session_token",
            value=session_token,
            httponly=True,
            secure=True,
            samesite="none",
            max_age=SESSION_EXPIRY_DAYS * 24 * 60 * 60,  # 7 days in seconds
            path="/"
        )
        
        return {
            "message": "OAuth login successful",
            "user_id": internal_user_id,
            "email": email,
            "name": name,
            "session_token": session_token  # Also return for frontend use
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"OAuth callback failed: {str(e)}"
        )

@router.get("/profile")
async def get_oauth_profile(
    request: Request,
    session_token: Optional[str] = Header(None, alias="X-Session-Token")
):
    """Get user profile for OAuth flow. Handles session token from cookie or header."""
    try:
        # Try to get session token from cookie first, then header
        if not session_token:
            session_token = request.cookies.get("session_token")
        
        if not session_token:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="No session token provided"
            )
        
        # Find active session
        session = user_db.sessions.find_one({
            "session_token": session_token,
            "is_active": True,
            "expires_at": {"$gt": datetime.now()}
        })
        
        if not session:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired session token"
            )
        
        # Get user data
        user = user_db.users.find_one({"id": session["user_id"]})
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Get user profile
        profile = user_db.profiles.find_one({"user_id": session["user_id"]})
        
        return {
            "user": {
                "id": user["id"],
                "email": user["email"],
                "first_name": user["first_name"],
                "last_name": user["last_name"],
                "profile_picture": user.get("profile_picture"),
                "is_verified": user.get("is_verified", False),
                "subscription_plan": user.get("subscription_plan", "free"),
                "created_at": user["created_at"],
                "last_login": user.get("last_login")
            },
            "profile": profile if profile else None,
            "session_valid": True
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get profile: {str(e)}"
        )

@router.post("/logout")
async def oauth_logout(request: Request, response: Response):
    """Logout from OAuth session."""
    try:
        session_token = request.cookies.get("session_token")
        
        if session_token:
            # Deactivate session in database
            user_db.sessions.update_one(
                {"session_token": session_token},
                {"$set": {"is_active": False, "updated_at": datetime.now()}}
            )
        
        # Clear session cookie
        response.delete_cookie(key="session_token", path="/")
        
        return {"message": "Logged out successfully"}
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Logout failed: {str(e)}"
        )

@router.get("/google/login-url")
async def get_google_login_url(request: Request):
    """Get Google OAuth login URL."""
    try:
        # Get the current origin from request headers
        origin = request.headers.get("origin", "")
        redirect_url = f"{origin}/profile"  # Redirect to profile page after auth
        
        # Construct Emergent auth URL with redirect parameter
        auth_url = f"https://auth.emergentagent.com/?redirect={redirect_url}"
        
        return {"auth_url": auth_url}
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate login URL: {str(e)}"
        )