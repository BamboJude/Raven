"""
Business API endpoints.
Handles CRUD operations for businesses and their configurations.
"""

from fastapi import APIRouter, HTTPException, Header
from typing import Optional

from app.models.schemas import (
    BusinessCreate,
    BusinessUpdate,
    BusinessConfigUpdate,
    BusinessResponse,
    BusinessWithConfig,
    ConversationResponse,
)
from app.services.database import db
from app.services.admin import is_platform_admin

router = APIRouter()


def get_user_id_from_header(authorization: Optional[str] = Header(None)) -> str:
    """
    Extract user ID from authorization header.
    In production, this would validate a JWT token from Supabase Auth.
    For MVP, we'll accept a simple user ID header.
    """
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization header required")

    # For MVP: expect "Bearer <user_id>" format
    # In production: validate JWT and extract user_id
    parts = authorization.split(" ")
    if len(parts) != 2 or parts[0] != "Bearer":
        raise HTTPException(status_code=401, detail="Invalid authorization format")

    return parts[1]


@router.post("", response_model=BusinessResponse)
async def create_business(
    business: BusinessCreate,
    authorization: Optional[str] = Header(None),
):
    """Create a new business."""
    user_id = get_user_id_from_header(authorization)

    result = db.create_business(
        user_id=user_id,
        name=business.name,
        description=business.description,
        language=business.language.value,
    )

    if not result:
        raise HTTPException(status_code=500, detail="Failed to create business")

    return result


@router.get("", response_model=list[BusinessResponse])
async def list_businesses(authorization: Optional[str] = Header(None)):
    """List all businesses for the authenticated user. Admin sees all including system businesses."""
    user_id = get_user_id_from_header(authorization)

    if is_platform_admin(user_id):
        # Admin sees all businesses including system businesses
        return db.get_all_businesses()

    # Non-admin users only see their own businesses (no system businesses)
    return db.get_businesses_by_user(user_id)


@router.get("/{business_id}", response_model=BusinessWithConfig)
async def get_business(business_id: str, authorization: Optional[str] = Header(None)):
    """Get a business by ID with its configuration."""
    user_id = get_user_id_from_header(authorization)

    business = db.get_business(business_id)
    if not business:
        raise HTTPException(status_code=404, detail="Business not found")

    # Verify ownership (admin bypasses)
    if business["user_id"] != user_id and not is_platform_admin(user_id):
        raise HTTPException(status_code=403, detail="Not authorized to access this business")

    # Get config
    config = db.get_business_config(business_id)
    business["config"] = config

    return business


@router.patch("/{business_id}", response_model=BusinessResponse)
async def update_business(
    business_id: str,
    updates: BusinessUpdate,
    authorization: Optional[str] = Header(None),
):
    """Update a business."""
    user_id = get_user_id_from_header(authorization)

    # Verify ownership
    business = db.get_business(business_id)
    if not business:
        raise HTTPException(status_code=404, detail="Business not found")
    if business["user_id"] != user_id and not is_platform_admin(user_id):
        raise HTTPException(status_code=403, detail="Not authorized to update this business")

    # Protect system businesses from non-admin edits
    if business.get("is_system") and not is_platform_admin(user_id):
        raise HTTPException(status_code=403, detail="System businesses cannot be modified")

    # Build update dict, excluding None values
    update_data = {k: v for k, v in updates.model_dump().items() if v is not None}
    if "language" in update_data:
        update_data["language"] = update_data["language"].value

    if not update_data:
        return business

    result = db.update_business(business_id, update_data)
    return result


@router.delete("/{business_id}")
async def delete_business(
    business_id: str,
    authorization: Optional[str] = Header(None),
):
    """Delete a business and all its related data."""
    user_id = get_user_id_from_header(authorization)

    # Verify ownership
    business = db.get_business(business_id)
    if not business:
        raise HTTPException(status_code=404, detail="Business not found")
    if business["user_id"] != user_id and not is_platform_admin(user_id):
        raise HTTPException(status_code=403, detail="Not authorized to delete this business")

    # Protect system businesses from deletion
    if business.get("is_system"):
        raise HTTPException(status_code=403, detail="System businesses cannot be deleted")

    success = db.delete_business(business_id)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to delete business")

    return {"status": "success", "message": "Business deleted successfully"}


@router.put("/{business_id}/config")
async def update_business_config(
    business_id: str,
    config: BusinessConfigUpdate,
    authorization: Optional[str] = Header(None),
):
    """Update business chatbot configuration (FAQs, products, etc.)."""
    user_id = get_user_id_from_header(authorization)

    # Verify ownership
    business = db.get_business(business_id)
    if not business:
        raise HTTPException(status_code=404, detail="Business not found")
    if business["user_id"] != user_id and not is_platform_admin(user_id):
        raise HTTPException(status_code=403, detail="Not authorized to update this business")

    # Protect system businesses from non-admin config edits
    if business.get("is_system") and not is_platform_admin(user_id):
        raise HTTPException(status_code=403, detail="System businesses cannot be modified")

    # Build config dict, excluding None values
    config_data = {}
    if config.welcome_message is not None:
        config_data["welcome_message"] = config.welcome_message
    if config.faqs is not None:
        config_data["faqs"] = [faq.model_dump() for faq in config.faqs]
    if config.products is not None:
        config_data["products"] = [p.model_dump() for p in config.products]
    if config.custom_instructions is not None:
        config_data["custom_instructions"] = config.custom_instructions
    if config.welcome_message_en is not None:
        config_data["welcome_message_en"] = config.welcome_message_en
    if config.widget_settings is not None:
        config_data["widget_settings"] = config.widget_settings.model_dump()
    if config.lead_capture_config is not None:
        config_data["lead_capture_config"] = config.lead_capture_config.model_dump()
    if config.manual_away is not None:
        config_data["manual_away"] = config.manual_away
    if config.away_message is not None:
        config_data["away_message"] = config.away_message
    if config.away_message_en is not None:
        config_data["away_message_en"] = config.away_message_en

    result = db.upsert_business_config(business_id, config_data)
    return {"status": "success", "config": result}


@router.get("/{business_id}/conversations", response_model=list[ConversationResponse])
async def list_conversations(
    business_id: str,
    limit: int = 50,
    authorization: Optional[str] = Header(None),
):
    """List recent conversations for a business."""
    user_id = get_user_id_from_header(authorization)

    # Verify ownership
    business = db.get_business(business_id)
    if not business:
        raise HTTPException(status_code=404, detail="Business not found")
    if business["user_id"] != user_id and not is_platform_admin(user_id):
        raise HTTPException(status_code=403, detail="Not authorized to access this business")

    return db.get_conversations_by_business(business_id, limit)
