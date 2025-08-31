from fastapi import APIRouter, HTTPException, status, Depends, BackgroundTasks
from fastapi.security import HTTPBearer
from user_models import *
from user_database import user_db
from auth import *
import uuid
from datetime import datetime, timedelta
import re

router = APIRouter(prefix="/api/auth", tags=["authentication"])
security = HTTPBearer()

def validate_password(password: str) -> bool:
    """Validate password strength."""
    if len(password) < 8:
        return False
    if not re.search(r"[A-Za-z]", password):
        return False
    if not re.search(r"\d", password):
        return False
    return True

def validate_email(email: str) -> bool:
    """Basic email validation."""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

async def send_verification_email(email: str, token: str):
    """Send verification email (placeholder - implement with your email service)."""
    # TODO: Implement actual email sending
    print(f"Verification email would be sent to {email} with token {token}")
    # Example verification URL: https://careerpilot.com/verify-email?token={token}

async def send_password_reset_email(email: str, token: str):
    """Send password reset email (placeholder)."""
    # TODO: Implement actual email sending  
    print(f"Password reset email would be sent to {email} with token {token}")
    # Example reset URL: https://careerpilot.com/reset-password?token={token}

@router.post("/register", response_model=dict)
async def register_user(user_data: UserRegistration, background_tasks: BackgroundTasks):
    """Register a new user with email verification."""
    try:
        # Validate email format
        if not validate_email(user_data.email):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid email format"
            )
        
        # Validate password strength
        if not validate_password(user_data.password):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Password must be at least 8 characters with letters and numbers"
            )
        
        # Check if user already exists
        existing_user = user_db.users.find_one({"email": user_data.email})
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="User with this email already exists"
            )
        
        # Hash password
        hashed_password = get_password_hash(user_data.password)
        
        # Generate verification token
        verification_token = str(uuid.uuid4())
        
        # Create user record
        user_id = str(uuid.uuid4())
        user_record = {
            "id": user_id,
            "email": user_data.email,
            "first_name": user_data.first_name,
            "last_name": user_data.last_name,
            "hashed_password": hashed_password,
            "is_verified": False,
            "verification_token": verification_token,
            "created_at": datetime.now(),
            "updated_at": datetime.now(),
            "subscription_plan": "free",
            "last_login": None
        }
        
        # Insert user into database
        user_db.users.insert_one(user_record)
        
        # Create default user profile
        profile_record = {
            "id": str(uuid.uuid4()),
            "user_id": user_id,
            "email": user_data.email,
            "first_name": user_data.first_name,
            "last_name": user_data.last_name,
            "current_role": "",
            "years_experience": 0,
            "location": "",
            "website": "",
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        }
        
        user_db.profiles.insert_one(profile_record)
        
        # Send verification email (background task)
        background_tasks.add_task(send_verification_email, user_data.email, verification_token)
        
        return {
            "message": "User registered successfully. Please check your email for verification.",
            "user_id": user_id,
            "email": user_data.email,
            "requires_verification": True
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Registration failed: {str(e)}"
        )

@router.post("/login", response_model=TokenResponse)
async def login_user(login_data: UserLogin):
    """Login placeholder. Disabled for now; will be implemented later."""
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Login is temporarily disabled. We will enable this soon."
    )

@router.post("/refresh", response_model=TokenResponse)
async def refresh_access_token(refresh_data: RefreshTokenRequest):
    """Refresh access token using refresh token."""
    try:
        # Verify refresh token
        user_id = verify_token(refresh_data.refresh_token)
        
        # Check if user still exists and is active
        user = user_db.get_user_by_id(user_id)
        if not user or not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid refresh token"
            )
        
        # Create new tokens
        access_token = create_access_token(data={"sub": user_id})
        new_refresh_token = create_refresh_token(data={"sub": user_id})
        
        return TokenResponse(
            access_token=access_token,
            refresh_token=new_refresh_token,
            expires_in=ACCESS_TOKEN_EXPIRE_MINUTES * 60
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token refresh failed"
        )

@router.post("/verify-email")
async def verify_email(verification_data: EmailVerification):
    """Verify user email with token."""
    try:
        success = user_db.verify_user_email(verification_data.token)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid or expired verification token"
            )
        
        return {"message": "Email verified successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Email verification failed: {str(e)}"
        )

@router.post("/request-password-reset")
async def request_password_reset(reset_request: PasswordResetRequest, background_tasks: BackgroundTasks):
    """Request password reset."""
    try:
        user = user_db.get_user_by_email(reset_request.email)
        if not user:
            # Don't reveal if email exists or not
            return {"message": "If the email exists, a password reset link has been sent"}
        
        # Generate reset token
        reset_token = generate_reset_token()
        reset_expires = datetime.now() + timedelta(hours=1)  # Token expires in 1 hour
        
        # Update user with reset token
        user_db.update_user(user.id, {
            "reset_token": reset_token,
            "reset_token_expires": reset_expires
        })
        
        # Send reset email
        background_tasks.add_task(send_password_reset_email, reset_request.email, reset_token)
        
        return {"message": "If the email exists, a password reset link has been sent"}
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Password reset request failed: {str(e)}"
        )

@router.post("/reset-password")
async def reset_password(reset_data: PasswordReset):
    """Reset password with token."""
    try:
        if reset_data.new_password != reset_data.confirm_password:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Passwords do not match"
            )
        
        if not validate_password(reset_data.new_password):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Password must be at least 8 characters long with letters and numbers"
            )
        
        # Find user with reset token
        user_data = user_db.users.find_one({
            "reset_token": reset_data.token,
            "reset_token_expires": {"$gt": datetime.now()}
        })
        
        if not user_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid or expired reset token"
            )
        
        # Update password and clear reset token
        user_db.update_user(user_data["id"], {
            "password_hash": get_password_hash(reset_data.new_password),
            "reset_token": None,
            "reset_token_expires": None
        })
        
        return {"message": "Password reset successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Password reset failed: {str(e)}"
        )

@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user_id: str = Depends(get_current_user)):
    """Get current user information."""
    try:
        user = user_db.get_user_by_id(current_user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        return UserResponse(
            id=user.id,
            email=user.email,
            first_name=user.first_name,
            last_name=user.last_name,
            role=user.role,
            is_active=user.is_active,
            is_verified=user.is_verified,
            profile_picture=user.profile_picture,
            created_at=user.created_at,
            last_login=user.last_login
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get user info: {str(e)}"
        )

@router.post("/logout")
async def logout_user(current_user_id: str = Depends(get_current_user)):
    """Logout user (placeholder - in a real app, you'd invalidate the token)."""
    # In a production app, you'd add the token to a blacklist
    # For now, we'll just return a success message
    return {"message": "Logged out successfully"}

@router.post("/dev-token", response_model=TokenResponse)
async def get_dev_token():
    """DEV ONLY: Issue a temporary token for testing protected APIs.
    Creates a dev user if it doesn't exist. Do NOT enable in production."""
    try:
        # Find or create a dev user
        dev_email = "dev@careerpilot.com"
        user = user_db.get_user_by_email(dev_email)
        if not user:
            user = User(
                email=dev_email,
                password_hash=get_password_hash("dev"),
                first_name="Dev",
                last_name="User",
                is_verified=True
            )
            user_db.create_user(user)
        # Create tokens
        access_token = create_access_token(data={"sub": user.id})
        refresh_token = create_refresh_token(data={"sub": user.id})
        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            expires_in=ACCESS_TOKEN_EXPIRE_MINUTES * 60
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to issue dev token: {str(e)}")

# OAuth endpoints (structure for future implementation)
@router.get("/google")
async def google_oauth_login():
    """Initiate Google OAuth login."""
    # TODO: Implement Google OAuth
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Google OAuth not yet implemented. Please add your Google OAuth credentials."
    )

@router.get("/google/callback")
async def google_oauth_callback():
    """Handle Google OAuth callback."""
    # TODO: Implement Google OAuth callback
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Google OAuth callback not yet implemented."
    )

@router.get("/github")
async def github_oauth_login():
    """Initiate GitHub OAuth login."""
    # TODO: Implement GitHub OAuth
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="GitHub OAuth not yet implemented. Please add your GitHub OAuth credentials."
    )

@router.get("/github/callback")
async def github_oauth_callback():
    """Handle GitHub OAuth callback."""
    # TODO: Implement GitHub OAuth callback
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="GitHub OAuth callback not yet implemented."
    )