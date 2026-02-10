"""
Team API endpoints.
Handles team member management for businesses.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

from app.services.database import db

router = APIRouter()


class TeamMemberInvite(BaseModel):
    email: EmailStr
    role: str = "member"  # owner, admin, member


class TeamMemberUpdate(BaseModel):
    role: Optional[str] = None


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


@router.patch("/{business_id}/members/{member_id}")
async def update_team_member(business_id: str, member_id: str, update: TeamMemberUpdate):
    """
    Update a team member's role.
    """
    member = db.update_team_member(member_id, role=update.role)
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
