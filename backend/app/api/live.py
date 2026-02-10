"""
Live Conversations API - Real-time conversation monitoring and human takeover.
Allows business owners to view active conversations and take over from AI.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timezone

from app.services.database import db
from app.services.admin import is_platform_admin

router = APIRouter()


class TakeoverRequest(BaseModel):
    """Request to take over or release a conversation."""
    user_id: str  # The business owner/agent taking over


class AgentMessageRequest(BaseModel):
    """Request for agent to send a message."""
    user_id: str  # The agent sending the message
    content: str


class ConversationResponse(BaseModel):
    """Response for a conversation with messages."""
    id: str
    business_id: str
    visitor_id: str
    channel: str
    is_human_takeover: bool = False
    taken_over_by: Optional[str] = None
    taken_over_at: Optional[datetime] = None
    last_message_at: Optional[datetime] = None
    created_at: datetime
    messages: list = []


@router.get("/{business_id}/conversations")
async def get_live_conversations(business_id: str, user_id: str):
    """
    Get all active conversations for a business (last 24 hours).
    Used for the live monitoring dashboard.
    """
    # Verify business ownership
    business = db.get_business(business_id)
    if not business:
        raise HTTPException(status_code=404, detail="Business not found")
    if business["user_id"] != user_id and not is_platform_admin(user_id):
        raise HTTPException(status_code=403, detail="Not authorized")

    conversations = db.get_active_conversations(business_id)

    # Add last message preview to each conversation
    for conv in conversations:
        messages = db.get_conversation_messages(conv["id"], limit=1)
        if messages:
            conv["last_message"] = messages[-1]["content"][:100]
            conv["last_message_role"] = messages[-1]["role"]
        else:
            conv["last_message"] = None
            conv["last_message_role"] = None

        # Get message count
        all_messages = db.get_conversation_messages(conv["id"], limit=100)
        conv["message_count"] = len(all_messages)

    return conversations


@router.get("/{business_id}/conversation/{conversation_id}")
async def get_conversation_detail(business_id: str, conversation_id: str, user_id: str):
    """
    Get a single conversation with all its messages.
    Used for viewing conversation details in live mode.
    """
    # Verify business ownership
    business = db.get_business(business_id)
    if not business:
        raise HTTPException(status_code=404, detail="Business not found")
    if business["user_id"] != user_id and not is_platform_admin(user_id):
        raise HTTPException(status_code=403, detail="Not authorized")

    conversation = db.get_conversation_with_messages(conversation_id)
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    if conversation["business_id"] != business_id:
        raise HTTPException(status_code=403, detail="Conversation doesn't belong to this business")

    return conversation


@router.post("/{business_id}/conversation/{conversation_id}/takeover")
async def takeover_conversation(
    business_id: str,
    conversation_id: str,
    request: TakeoverRequest,
):
    """
    Take over a conversation from AI.
    When taken over, AI responses are disabled and agent can respond manually.
    """
    # Verify business ownership
    business = db.get_business(business_id)
    if not business:
        raise HTTPException(status_code=404, detail="Business not found")
    if business["user_id"] != request.user_id and not is_platform_admin(request.user_id):
        raise HTTPException(status_code=403, detail="Not authorized")

    # Verify conversation belongs to business
    conversation = db.get_conversation(conversation_id)
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    if conversation["business_id"] != business_id:
        raise HTTPException(status_code=403, detail="Conversation doesn't belong to this business")

    # Take over the conversation
    updated = db.set_conversation_takeover(
        conversation_id=conversation_id,
        is_taken_over=True,
        taken_over_by=request.user_id,
    )

    if not updated:
        raise HTTPException(status_code=500, detail="Failed to take over conversation")

    # Add system message to notify customer
    lang = business.get("language", "fr")
    if lang == "fr":
        system_msg = "🙋 Un conseiller a rejoint la conversation. Comment puis-je vous aider?"
    else:
        system_msg = "🙋 A support agent has joined the conversation. How can I help you?"

    db.create_message(
        conversation_id=conversation_id,
        role="assistant",
        content=system_msg,
    )
    db.update_conversation_timestamp(conversation_id)

    return {"success": True, "message": "Conversation taken over", "conversation": updated}


@router.post("/{business_id}/conversation/{conversation_id}/release")
async def release_conversation(
    business_id: str,
    conversation_id: str,
    request: TakeoverRequest,
):
    """
    Release a conversation back to AI.
    """
    # Verify business ownership
    business = db.get_business(business_id)
    if not business:
        raise HTTPException(status_code=404, detail="Business not found")
    if business["user_id"] != request.user_id and not is_platform_admin(request.user_id):
        raise HTTPException(status_code=403, detail="Not authorized")

    # Verify conversation
    conversation = db.get_conversation(conversation_id)
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    if conversation["business_id"] != business_id:
        raise HTTPException(status_code=403, detail="Conversation doesn't belong to this business")

    # Release the conversation
    updated = db.set_conversation_takeover(
        conversation_id=conversation_id,
        is_taken_over=False,
    )

    if not updated:
        raise HTTPException(status_code=500, detail="Failed to release conversation")

    # Add system message
    lang = business.get("language", "fr")
    if lang == "fr":
        system_msg = "🤖 Notre assistant virtuel reprend la conversation. N'hésitez pas à poser vos questions!"
    else:
        system_msg = "🤖 Our virtual assistant is back. Feel free to ask any questions!"

    db.create_message(
        conversation_id=conversation_id,
        role="assistant",
        content=system_msg,
    )
    db.update_conversation_timestamp(conversation_id)

    return {"success": True, "message": "Conversation released to AI", "conversation": updated}


@router.post("/{business_id}/conversation/{conversation_id}/message")
async def send_agent_message(
    business_id: str,
    conversation_id: str,
    request: AgentMessageRequest,
):
    """
    Send a message as the human agent.
    Only works when conversation is in takeover mode.
    """
    # Verify business ownership
    business = db.get_business(business_id)
    if not business:
        raise HTTPException(status_code=404, detail="Business not found")
    if business["user_id"] != request.user_id and not is_platform_admin(request.user_id):
        raise HTTPException(status_code=403, detail="Not authorized")

    # Verify conversation
    conversation = db.get_conversation(conversation_id)
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    if conversation["business_id"] != business_id:
        raise HTTPException(status_code=403, detail="Conversation doesn't belong to this business")

    # Check if conversation is in takeover mode
    if not conversation.get("is_human_takeover"):
        raise HTTPException(
            status_code=400,
            detail="Conversation is not in takeover mode. Take over first."
        )

    # Send the message as assistant (from business perspective)
    message = db.create_message(
        conversation_id=conversation_id,
        role="assistant",
        content=request.content,
    )
    db.update_conversation_timestamp(conversation_id)

    return {
        "success": True,
        "message": message,
        "created_at": datetime.now(timezone.utc),
    }
