"""
Notification Settings API endpoints.
Handles retrieval and updates of email/SMS notification settings.
"""

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
from typing import Optional

from app.services.database import db
from app.dependencies import get_current_user
from app.services.admin import is_platform_admin

router = APIRouter(prefix="/api/notifications", tags=["notifications"])


class NotificationSettingsUpdate(BaseModel):
    """Schema for updating notification settings."""
    email_enabled: Optional[bool] = None
    email_from_name: Optional[str] = None
    email_from_address: Optional[str] = None
    sms_enabled: Optional[bool] = None
    twilio_account_sid: Optional[str] = None
    twilio_auth_token: Optional[str] = None
    twilio_phone_number: Optional[str] = None
    send_confirmation: Optional[bool] = None
    send_reminder_24h: Optional[bool] = None
    send_reminder_1h: Optional[bool] = None
    send_cancellation: Optional[bool] = None
    send_update: Optional[bool] = None


class NotificationSettingsResponse(BaseModel):
    """Schema for notification settings response."""
    id: str
    business_id: str
    user_id: str
    email_enabled: bool
    email_from_name: Optional[str] = None
    email_from_address: Optional[str] = None
    sms_enabled: bool
    twilio_account_sid: Optional[str] = None
    twilio_auth_token: Optional[str] = None
    twilio_phone_number: Optional[str] = None
    send_confirmation: bool
    send_reminder_24h: bool
    send_reminder_1h: bool
    send_cancellation: bool
    send_update: bool
    created_at: str
    updated_at: str


@router.get("/{business_id}")
async def get_notification_settings(
    business_id: str,
    current_user: dict = Depends(get_current_user),
) -> dict:
    """
    Get notification settings for a business.
    Returns default settings if none exist.
    """
    # Verify user owns this business
    business = db.get_business(business_id)
    if not business:
        raise HTTPException(status_code=404, detail="Business not found")
    if business["user_id"] != current_user["id"] and not is_platform_admin(current_user["id"]):
        raise HTTPException(status_code=403, detail="Not authorized to access this business")

    # Get settings
    settings = db.get_notification_settings(business_id)

    # If no settings exist, return defaults
    if not settings:
        return {
            "business_id": business_id,
            "email_enabled": True,
            "email_from_name": None,
            "email_from_address": None,
            "sms_enabled": False,
            "twilio_account_sid": None,
            "twilio_auth_token": None,
            "twilio_phone_number": None,
            "send_confirmation": True,
            "send_reminder_24h": True,
            "send_reminder_1h": False,
            "send_cancellation": True,
            "send_update": True,
        }

    return settings


@router.put("/{business_id}")
async def update_notification_settings(
    business_id: str,
    settings_update: NotificationSettingsUpdate,
    current_user: dict = Depends(get_current_user),
) -> dict:
    """
    Update notification settings for a business.
    Creates new settings if none exist.
    """
    # Verify user owns this business
    business = db.get_business(business_id)
    if not business:
        raise HTTPException(status_code=404, detail="Business not found")
    if business["user_id"] != current_user["id"] and not is_platform_admin(current_user["id"]):
        raise HTTPException(status_code=403, detail="Not authorized to modify this business")

    # Prepare settings data (only include provided fields)
    settings_data = settings_update.model_dump(exclude_unset=True)

    # Upsert settings
    result = db.upsert_notification_settings(
        business_id=business_id,
        user_id=current_user["id"],
        settings=settings_data,
    )

    if not result:
        raise HTTPException(status_code=500, detail="Failed to update notification settings")

    return result


@router.get("/{business_id}/logs")
async def get_notification_logs(
    business_id: str,
    appointment_id: Optional[str] = None,
    limit: int = 100,
    current_user: dict = Depends(get_current_user),
) -> dict:
    """
    Get notification logs for a business.
    Optionally filter by appointment_id.
    """
    # Verify user owns this business
    business = db.get_business(business_id)
    if not business:
        raise HTTPException(status_code=404, detail="Business not found")
    if business["user_id"] != current_user["id"] and not is_platform_admin(current_user["id"]):
        raise HTTPException(status_code=403, detail="Not authorized to access this business")

    # Get logs
    logs = db.get_notification_logs(
        business_id=business_id,
        appointment_id=appointment_id,
        limit=limit,
    )

    return {
        "logs": logs,
        "count": len(logs),
    }
