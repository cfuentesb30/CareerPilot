from fastapi import APIRouter, HTTPException, status, Depends
from user_models import *
from user_database import user_db
from auth import get_current_user
from typing import List
import uuid


router = APIRouter(prefix="/api/user", tags=["user_management"])

@router.get("/dashboard", response_model=DashboardResponse)
async def get_user_dashboard(current_user_id: str = Depends(get_current_user)):
    """Get user dashboard data."""
    try:
        # Get user info
        user = user_db.get_user_by_id(current_user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Get profile completion
        profile_completion = user_db.calculate_profile_completion(current_user_id)
        
        # Get progress
        progress = user_db.get_user_progress(current_user_id)
        if not progress:
            progress = UserProgress(user_id=current_user_id)
        
        # Get recent conversations
        recent_conversations = user_db.get_user_conversations(current_user_id, limit=5)
        
        # Get upcoming roadmap items
        roadmap_items = user_db.get_user_roadmap(current_user_id)
        upcoming_items = [item for item in roadmap_items if item.status != RoadmapStatus.COMPLETED][:5]
        
        # Calculate stats
        total_careers = len(user_db.get_user_careers(current_user_id))
        total_certifications = len(user_db.get_user_certifications(current_user_id))
        total_skills = len(user_db.get_user_skills(current_user_id))
        
        stats = {
            "total_careers": total_careers,
            "total_certifications": total_certifications,
            "total_skills": total_skills,
            "profile_completion": profile_completion,
            "days_since_signup": (datetime.now() - user.created_at).days
        }
        
        user_response = UserResponse(
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
        
        return DashboardResponse(
            user=user_response,
            profile_completion=profile_completion,
            roadmap_progress=progress,
            recent_conversations=recent_conversations,
            upcoming_roadmap_items=upcoming_items,
            stats=stats
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get dashboard: {str(e)}"
        )

@router.get("/profile", response_model=UserProfile)
async def get_user_profile(current_user_id: str = Depends(get_current_user)):
    """Get user profile."""
    try:
        profile = user_db.get_user_profile(current_user_id)
        if not profile:
            # Create empty profile if doesn't exist
            profile = UserProfile(user_id=current_user_id)
            user_db.profiles.insert_one(profile.dict())
        
        return profile
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get profile: {str(e)}"
        )

@router.put("/profile")
async def update_user_profile(
    profile_data: UserProfileUpdate,
    current_user_id: str = Depends(get_current_user)
):
    """Update user profile."""
    try:
        # Update profile data
        updates = {k: v for k, v in profile_data.dict().items() if v is not None}
        
        if updates:
            user_db.update_user_profile(current_user_id, updates)
        
        # If updating basic user info, update user record too
        user_updates = {}
        if profile_data.first_name:
            user_updates["first_name"] = profile_data.first_name
        if profile_data.last_name:
            user_updates["last_name"] = profile_data.last_name
        
        if user_updates:
            user_db.update_user(current_user_id, user_updates)
        
        return {"message": "Profile updated successfully"}
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update profile: {str(e)}"
        )

# Career Management
@router.get("/careers", response_model=List[UserCareer])
async def get_user_careers(current_user_id: str = Depends(get_current_user)):
    """Get user careers."""
    try:
        return user_db.get_user_careers(current_user_id)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get careers: {str(e)}"
        )

@router.post("/careers")
async def add_user_career(
    career_data: CareerCreate,
    current_user_id: str = Depends(get_current_user)
):
    """Add a career entry."""
    try:
        career = UserCareer(
            user_id=current_user_id,
            **career_data.dict()
        )
        career_id = user_db.add_user_career(career)
        
        return {"message": "Career added successfully", "career_id": career_id}
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to add career: {str(e)}"
        )

@router.put("/careers/{career_id}")
async def update_user_career(
    career_id: str,
    career_data: CareerCreate,
    current_user_id: str = Depends(get_current_user)
):
    """Update a career entry."""
    try:
        updates = career_data.dict()
        user_db.update_user_career(career_id, updates)
        
        return {"message": "Career updated successfully"}
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update career: {str(e)}"
        )

@router.delete("/careers/{career_id}")
async def delete_user_career(
    career_id: str,
    current_user_id: str = Depends(get_current_user)
):
    """Delete a career entry."""
    try:
        user_db.delete_user_career(career_id, current_user_id)
        return {"message": "Career deleted successfully"}
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete career: {str(e)}"
        )

# Certification Management
@router.get("/certifications", response_model=List[UserCertification])
async def get_user_certifications(current_user_id: str = Depends(get_current_user)):
    """Get user certifications."""
    try:
        return user_db.get_user_certifications(current_user_id)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get certifications: {str(e)}"
        )

@router.post("/certifications")
async def add_user_certification(
    cert_data: CertificationCreate,
    current_user_id: str = Depends(get_current_user)
):
    """Add a certification."""
    try:
        certification = UserCertification(
            user_id=current_user_id,
            **cert_data.dict()
        )
        cert_id = user_db.add_user_certification(certification)
        
        return {"message": "Certification added successfully", "certification_id": cert_id}
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to add certification: {str(e)}"
        )

@router.put("/certifications/{cert_id}")
async def update_user_certification(
    cert_id: str,
    cert_data: CertificationCreate,
    current_user_id: str = Depends(get_current_user)
):
    """Update a certification."""
    try:
        updates = cert_data.dict()
        user_db.update_user_certification(cert_id, updates)
        
        return {"message": "Certification updated successfully"}
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update certification: {str(e)}"
        )

@router.delete("/certifications/{cert_id}")
async def delete_user_certification(
    cert_id: str,
    current_user_id: str = Depends(get_current_user)
):
    """Delete a certification."""
    try:
        user_db.delete_user_certification(cert_id, current_user_id)
        return {"message": "Certification deleted successfully"}
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete certification: {str(e)}"
        )

# Skills Management
@router.get("/skills", response_model=List[UserSkill])
async def get_user_skills(current_user_id: str = Depends(get_current_user)):
    """Get user skills."""
    try:
        return user_db.get_user_skills(current_user_id)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get skills: {str(e)}"
        )

@router.get("/skills/available", response_model=List[Skill])
async def get_available_skills():
    """Get all available skills."""
    try:
        return user_db.get_all_skills()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get available skills: {str(e)}"
        )

@router.get("/skills/categories/{category}", response_model=List[Skill])
async def get_skills_by_category(category: str):
    """Get skills by category."""
    try:
        return user_db.get_skills_by_category(category)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get skills by category: {str(e)}"
        )

@router.post("/skills")
async def add_user_skill(
    skill_data: UserSkillCreate,
    current_user_id: str = Depends(get_current_user)
):
    """Add a skill to user."""
    try:
        # Check if skill exists, if not create it as custom skill
        existing_skills = user_db.get_all_skills()
        skill_exists = any(skill.name.lower() == skill_data.skill_name.lower() for skill in existing_skills)
        
        skill_id = None
        if not skill_exists:
            # Create custom skill - default to "other" category
            skill_id = user_db.create_custom_skill(skill_data.skill_name, "other")
        
        # Add skill to user
        user_skill = UserSkill(
            user_id=current_user_id,
            skill_id=skill_id or str(uuid.uuid4()),
            skill_name=skill_data.skill_name,
            level=skill_data.level,
            years_of_experience=skill_data.years_of_experience
        )
        
        skill_id = user_db.add_user_skill(user_skill)
        
        return {"message": "Skill added successfully", "skill_id": skill_id}
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to add skill: {str(e)}"
        )

@router.delete("/skills/{skill_id}")
async def delete_user_skill(
    skill_id: str,
    current_user_id: str = Depends(get_current_user)
):
    """Delete a user skill."""
    try:
        user_db.delete_user_skill(skill_id, current_user_id)
        return {"message": "Skill deleted successfully"}
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete skill: {str(e)}"
        )