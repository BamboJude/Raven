"""
Team API endpoints.
Handles team member management for businesses.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime

from app.services.database import db
from app.services.admin import generate_secure_password, create_team_member_auth_user

router = APIRouter()


class TeamMemberInvite(BaseModel):
    email: EmailStr
    role: str = "member"  # owner, admin, member


class TeamMemberUpdate(BaseModel):
    role: Optional[str] = None
    avatar_url: Optional[str] = None
    full_name: Optional[str] = Field(None, max_length=200)
    phone: Optional[str] = Field(None, max_length=50)
    job_title: Optional[str] = Field(None, max_length=200)


class TeamMemberCreateAccount(BaseModel):
    """Request to create a team member account directly with credentials."""
    email: EmailStr
    full_name: str = Field(..., min_length=1, max_length=200)
    phone: Optional[str] = Field(None, max_length=50)
    job_title: Optional[str] = Field(None, max_length=200)
    role: str = Field(default="member", pattern="^(admin|member)$")


class TeamMemberCredentials(BaseModel):
    """One-time display of created account credentials."""
    email: str
    password: str
    member: dict
    message: str = "Account created successfully. Save these credentials - they won't be shown again."


@router.get("/{business_id}/members")
async def list_team_members(business_id: str):
    """
    List all team members for a business.
    """
    business = db.get_business(business_id)
    if not business:
        raise HTTPException(status_code=404, detail="Business not found")

    members = db.get_team_members(business_id)
    return {"members": members}


@router.post("/{business_id}/members")
async def invite_team_member(business_id: str, invite: TeamMemberInvite):
    """
    Invite a new team member to a business.
    """
    business = db.get_business(business_id)
    if not business:
        raise HTTPException(status_code=404, detail="Business not found")

    # Check if already a member
    existing = db.get_team_member_by_email(business_id, invite.email)
    if existing:
        raise HTTPException(status_code=400, detail="User is already a team member")

    # Create team member invite
    member = db.create_team_member(
        business_id=business_id,
        email=invite.email,
        role=invite.role
    )

    if not member:
        raise HTTPException(status_code=500, detail="Failed to create team member")

    return {"message": "Team member invited successfully", "member": member}


@router.post("/{business_id}/members/create-account")
async def create_team_member_account(business_id: str, data: TeamMemberCreateAccount):
    """
    Create a team member account directly with auto-generated credentials.

    This endpoint:
    1. Validates business exists
    2. Checks for duplicate team member
    3. Generates secure password
    4. Creates Supabase Auth user via Admin API
    5. Creates team_members DB record with user_id link
    6. Returns credentials (shown once)

    Security:
    - Only business owners/admins can call this (enforce via middleware)
    - Password is cryptographically secure (16+ chars)
    - Credentials returned only once (not stored in logs)
    """
    # Verify business exists
    business = db.get_business(business_id)
    if not business:
        raise HTTPException(status_code=404, detail="Business not found")

    # Check if already a team member
    existing = db.get_team_member_by_email(business_id, data.email)
    if existing:
        raise HTTPException(
            status_code=400,
            detail="A team member with this email already exists for this business"
        )

    # Generate secure password
    password = generate_secure_password(length=16)

    try:
        # Create Supabase Auth user
        auth_user = create_team_member_auth_user(
            email=data.email,
            password=password,
            full_name=data.full_name
        )

        # Create team member record linked to auth user
        member = db.create_team_member(
            business_id=business_id,
            email=data.email,
            role=data.role,
            user_id=auth_user.id,  # Link immediately
            full_name=data.full_name,
            phone=data.phone,
            job_title=data.job_title,
            status="active",  # Active immediately (no pending invite)
        )

        if not member:
            # Rollback: Delete the auth user if DB insert failed
            # Note: Supabase doesn't support transactions across Auth + DB
            # In production, consider a cleanup job for orphaned auth users
            raise HTTPException(
                status_code=500,
                detail="Failed to create team member record after auth user creation"
            )

        # Return credentials (ONE TIME ONLY)
        return TeamMemberCredentials(
            email=data.email,
            password=password,
            member=member,
            message="Account created successfully. Save these credentials - they won't be shown again."
        )

    except HTTPException:
        raise  # Re-raise HTTP exceptions as-is
    except Exception as e:
        # Catch auth user creation errors
        error_msg = str(e).lower()
        if "already registered" in error_msg or "duplicate" in error_msg:
            raise HTTPException(
                status_code=400,
                detail="This email is already registered in the system"
            )
        raise HTTPException(
            status_code=500,
            detail=f"Failed to create team member account: {str(e)}"
        )


@router.patch("/{business_id}/members/{member_id}")
async def update_team_member(business_id: str, member_id: str, update: TeamMemberUpdate):
    """
    Update a team member's role, avatar, and profile information.
    """
    member = db.update_team_member(
        member_id,
        role=update.role,
        avatar_url=update.avatar_url,
        full_name=update.full_name,
        phone=update.phone,
        job_title=update.job_title,
    )
    if not member:
        raise HTTPException(status_code=404, detail="Team member not found")

    return {"message": "Team member updated", "member": member}


@router.delete("/{business_id}/members/{member_id}")
async def remove_team_member(business_id: str, member_id: str):
    """
    Remove a team member from a business.
    """
    success = db.delete_team_member(member_id)
    if not success:
        raise HTTPException(status_code=404, detail="Team member not found")

    return {"message": "Team member removed successfully"}
