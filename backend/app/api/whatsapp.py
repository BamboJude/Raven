"""
WhatsApp webhook API endpoints.
Handles incoming messages from Twilio WhatsApp.
"""

from fastapi import APIRouter, Request, Form, HTTPException
from fastapi.responses import Response
from typing import Optional

from app.services.whatsapp import whatsapp_service
from app.services.database import db
from app.services.ai import get_ai_service

router = APIRouter()


@router.post("/webhook")
async def whatsapp_webhook(
    request: Request,
    From: str = Form(...),
    To: str = Form(...),
    Body: str = Form(...),
    MessageSid: str = Form(...),
    ProfileName: Optional[str] = Form(None),
):
    """
    Webhook endpoint for incoming WhatsApp messages from Twilio.

    Twilio sends POST requests with form data when messages arrive.
    """
    # Extract phone number (remove 'whatsapp:' prefix)
    visitor_phone = From.replace("whatsapp:", "")
    business_phone = To.replace("whatsapp:", "")

    # Find the business linked to this WhatsApp number
    # For MVP, we'll use a default business or look up by phone
    business = db.get_business_by_whatsapp(business_phone)

    if not business:
        # If no business found, try to get the first business (for testing)
        businesses = db.get_all_businesses()
        if businesses:
            business = businesses[0]
        else:
            # No business configured, send error message
            if whatsapp_service.is_configured():
                whatsapp_service.send_message(
                    From,
                    "Sorry, this service is not yet configured. Please try again later."
                )
            return Response(content="", media_type="text/xml")

    business_id = business["id"]

    # Get or create conversation
    conversation = db.get_or_create_whatsapp_conversation(
        business_id=business_id,
        visitor_id=visitor_phone,
    )

    # Save the incoming message
    db.add_message(
        conversation_id=conversation["id"],
        role="user",
        content=Body
    )

    # Update timestamp
    db.update_conversation_timestamp(conversation["id"])

    # If conversation is in human takeover mode, skip AI — agent replies via dashboard
    if conversation.get("is_human_takeover"):
        print(f"🙋 WhatsApp conversation {conversation['id']} is in human takeover mode - skipping AI")
        return Response(content="", media_type="text/xml")

    # Get conversation history
    messages = db.get_conversation_messages(conversation["id"])

    # Get business config for AI context
    config = db.get_business_config(business_id)

    # Build context for AI
    business_context = {
        "name": business["name"],
        "description": business["description"],
        "language": business.get("language", "en"),
        "welcome_message": config.get("welcome_message", "") if config else "",
        "faqs": config.get("faqs", []) if config else [],
        "products": config.get("products", []) if config else [],
        "custom_instructions": config.get("custom_instructions", "") if config else "",
    }

    # Generate AI response
    chat_history = [{"role": m["role"], "content": m["content"]} for m in messages]
    ai_response = get_ai_service().generate_response(chat_history, business_context)

    # Save AI response
    db.add_message(
        conversation_id=conversation["id"],
        role="assistant",
        content=ai_response
    )

    # Update conversation timestamp
    db.update_conversation_timestamp(conversation["id"])

    # Send response via WhatsApp
    if whatsapp_service.is_configured():
        whatsapp_service.send_message(From, ai_response)

    # Return empty TwiML response (we send via API instead)
    return Response(content="", media_type="text/xml")


@router.get("/status")
async def whatsapp_status():
    """Check if WhatsApp integration is configured."""
    return {
        "configured": whatsapp_service.is_configured(),
        "number": whatsapp_service.from_number if whatsapp_service.is_configured() else None
    }
