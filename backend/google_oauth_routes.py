from fastapi import APIRouter, HTTPException, status, Request, Response, Query
from fastapi.responses import RedirectResponse
from user_database import user_db
from user_models import User, UserProfile
from datetime import datetime, timedelta
import uuid
import requests
import os
from typing import Optional
from urllib.parse import urlencode
import jwt

router = APIRouter(prefix="/api/auth/google", tags=["google-oauth"])

# Google OAuth Configuration
GOOGLE_CLIENT_ID = "1040524288328-0b86bje78ftvqo0a1iah6h321tavdhen.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET = "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"
GOOGLE_REDIRECT_URI = "https://career-advisor-3.preview.emergentagent.com/auth/google/callback"
GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth"
GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"
GOOGLE_USER_INFO_URL = "https://www.googleapis.com/oauth2/v2/userinfo"

# JWT Configuration (reusing from existing auth)
SECRET_KEY = "careerpilot-secret-key-change-in-production"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

def create_access_token(data: dict):
    """Create JWT access token for Google OAuth users."""
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

@router.get("/login")
async def google_oauth_login(request: Request):
    """Initiate Google OAuth login flow."""
    try:
        # Generate state parameter for security
        state = str(uuid.uuid4())
        
        # Store state in session or cache (for production, use proper session management)
        # For now, we'll validate it in the callback
        
        # Build Google OAuth authorization URL
        params = {
            "client_id": GOOGLE_CLIENT_ID,
            "redirect_uri": GOOGLE_REDIRECT_URI,
            "scope": "openid email profile",
            "response_type": "code",
            "access_type": "offline",
            "prompt": "consent",
            "state": state
        }
        
        auth_url = f"{GOOGLE_AUTH_URL}?{urlencode(params)}"
        
        return {"auth_url": auth_url, "state": state}
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to initiate Google OAuth: {str(e)}"
        )

@router.get("/callback")
async def google_oauth_callback(
    request: Request,
    response: Response,
    code: Optional[str] = Query(None),
    state: Optional[str] = Query(None),
    error: Optional[str] = Query(None)
):
    """Handle Google OAuth callback."""
    try:
        # Check for OAuth errors
        if error:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Google OAuth error: {error}"
            )
        
        if not code:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Authorization code not provided"
            )
        
        # Exchange authorization code for access token
        token_data = {
            "client_id": GOOGLE_CLIENT_ID,
            "client_secret": GOOGLE_CLIENT_SECRET,
            "code": code,
            "grant_type": "authorization_code",
            "redirect_uri": GOOGLE_REDIRECT_URI
        }
        
        token_response = requests.post(GOOGLE_TOKEN_URL, data=token_data, timeout=10)
        
        if token_response.status_code != 200:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to exchange authorization code for token"
            )
        
        token_info = token_response.json()
        access_token = token_info.get("access_token")
        
        if not access_token:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No access token received from Google"
            )
        
        # Get user information from Google
        headers = {"Authorization": f"Bearer {access_token}"}
        user_response = requests.get(GOOGLE_USER_INFO_URL, headers=headers, timeout=10)
        
        if user_response.status_code != 200:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to get user information from Google"
            )
        
        user_info = user_response.json()
        
        # Extract user data
        google_id = user_info.get("id")
        email = user_info.get("email")
        name = user_info.get("name", "")
        picture = user_info.get("picture")
        given_name = user_info.get("given_name", "")
        family_name = user_info.get("family_name", "")
        
        if not google_id or not email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Incomplete user information from Google"
            )
        
        # Check if user already exists (by email or google_id)
        existing_user = user_db.users.find_one({
            "$or": [
                {"email": email},
                {"google_id": google_id}
            ]
        })
        
        if existing_user:
            # User exists, update Google info and last login
            user_id = existing_user["id"]
            user_db.users.update_one(
                {"id": user_id},
                {
                    "$set": {
                        "google_id": google_id,
                        "profile_picture": picture,
                        "is_verified": True,  # Google users are automatically verified
                        "last_login": datetime.now(),
                        "updated_at": datetime.now()
                    }
                }
            )
        else:
            # Create new user
            user_id = str(uuid.uuid4())
            user_record = {
                "id": user_id,
                "email": email,
                "first_name": given_name or name.split()[0] if name else "",
                "last_name": family_name or (name.split()[1] if len(name.split()) > 1 else ""),
                "hashed_password": "",  # Google OAuth users don't have passwords
                "is_verified": True,  # Google users are automatically verified
                "verification_token": None,
                "google_id": google_id,
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
                "user_id": user_id,
                "email": email,
                "first_name": given_name or name.split()[0] if name else "",
                "last_name": family_name or (name.split()[1] if len(name.split()) > 1 else ""),
                "current_role": "",
                "years_experience": 0,
                "location": "",
                "website": "",
                "created_at": datetime.now(),
                "updated_at": datetime.now()
            }
            
            user_db.profiles.insert_one(profile_record)
        
        # Create JWT token for the user
        token_data = {"sub": user_id, "email": email}
        jwt_token = create_access_token(data=token_data)
        
        # Redirect to frontend with token
        frontend_url = f"https://career-advisor-3.preview.emergentagent.com/?token={jwt_token}&auth=google&name={name}"
        
        return RedirectResponse(url=frontend_url)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Google OAuth callback failed: {str(e)}"
        )

@router.get("/user")
async def get_google_user_info(access_token: str):
    """Get user info from Google (utility endpoint for testing)."""
    try:
        headers = {"Authorization": f"Bearer {access_token}"}
        response = requests.get(GOOGLE_USER_INFO_URL, headers=headers, timeout=10)
        
        if response.status_code != 200:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to get user info from Google"
            )
        
        return response.json()
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get Google user info: {str(e)}"
        )