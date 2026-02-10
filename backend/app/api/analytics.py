"""
Analytics API endpoints.
Provides metrics and statistics for business dashboards.
"""

from fastapi import APIRouter, HTTPException
from datetime import datetime, timedelta
from app.services.database import db

router = APIRouter()


@router.get("/{business_id}")
async def get_analytics(business_id: str, days: int = 30):
    """
    Get analytics data for a business.
    Returns conversation counts, message stats, and channel breakdown.
    """
    # Verify business exists
    business = db.get_business(business_id)
    if not business:
        raise HTTPException(status_code=404, detail="Business not found")

    # Get all conversations for this business
    conversations = db.get_business_conversations(business_id)

    # Calculate date range
    now = datetime.utcnow()
    start_date = now - timedelta(days=days)

    # Filter conversations within date range
    recent_conversations = []
    for conv in conversations:
        conv_date = conv.get("started_at")
        if conv_date:
            if isinstance(conv_date, str):
                conv_date = datetime.fromisoformat(conv_date.replace("Z", "+00:00"))
            if conv_date.replace(tzinfo=None) >= start_date:
                recent_conversations.append(conv)

    # Calculate metrics
    total_conversations = len(conversations)
    recent_count = len(recent_conversations)

    # Channel breakdown
    widget_count = sum(1 for c in conversations if c.get("channel") == "widget")
    whatsapp_count = sum(1 for c in conversations if c.get("channel") == "whatsapp")

    # Recent channel breakdown
    recent_widget = sum(1 for c in recent_conversations if c.get("channel") == "widget")
    recent_whatsapp = sum(1 for c in recent_conversations if c.get("channel") == "whatsapp")

    # Get message counts
    total_messages = 0
    user_messages = 0
    assistant_messages = 0

    for conv in conversations:
        messages = db.get_conversation_messages(conv["id"])
        total_messages += len(messages)
        user_messages += sum(1 for m in messages if m.get("role") == "user")
        assistant_messages += sum(1 for m in messages if m.get("role") == "assistant")

    # Calculate conversations per day for the chart
    daily_counts = {}
    for i in range(days):
        date = (now - timedelta(days=i)).strftime("%Y-%m-%d")
        daily_counts[date] = {"widget": 0, "whatsapp": 0}

    for conv in recent_conversations:
        conv_date = conv.get("started_at")
        if conv_date:
            if isinstance(conv_date, str):
                conv_date = datetime.fromisoformat(conv_date.replace("Z", "+00:00"))
            date_str = conv_date.strftime("%Y-%m-%d")
            if date_str in daily_counts:
                channel = conv.get("channel", "widget")
                daily_counts[date_str][channel] += 1

    # Convert to sorted list for chart
    chart_data = [
        {"date": date, "widget": counts["widget"], "whatsapp": counts["whatsapp"]}
        for date, counts in sorted(daily_counts.items())
    ]

    # Get recent conversations for activity feed
    recent_activity = []
    for conv in sorted(recent_conversations, key=lambda x: x.get("last_message_at", ""), reverse=True)[:10]:
        messages = db.get_conversation_messages(conv["id"])
        last_message = messages[-1] if messages else None
        recent_activity.append({
            "id": conv["id"],
            "channel": conv.get("channel", "widget"),
            "visitor_id": conv.get("visitor_id", "Unknown"),
            "started_at": conv.get("started_at"),
            "last_message_at": conv.get("last_message_at"),
            "message_count": len(messages),
            "last_message_preview": (last_message.get("content", "")[:50] + "...") if last_message and len(last_message.get("content", "")) > 50 else (last_message.get("content", "") if last_message else ""),
        })

    # Satisfaction stats
    rated_conversations = [c for c in conversations if c.get("rating")]
    total_rated = len(rated_conversations)
    positive_count = sum(1 for c in rated_conversations if c.get("rating") == "positive")
    negative_count = sum(1 for c in rated_conversations if c.get("rating") == "negative")
    satisfaction_percent = round((positive_count / total_rated) * 100) if total_rated > 0 else None

    return {
        "period_days": days,
        "summary": {
            "total_conversations": total_conversations,
            "recent_conversations": recent_count,
            "total_messages": total_messages,
            "user_messages": user_messages,
            "assistant_messages": assistant_messages,
            "avg_messages_per_conversation": round(total_messages / total_conversations, 1) if total_conversations > 0 else 0,
        },
        "satisfaction": {
            "total_rated": total_rated,
            "positive": positive_count,
            "negative": negative_count,
            "satisfaction_percent": satisfaction_percent,
        },
        "channels": {
            "total": {
                "widget": widget_count,
                "whatsapp": whatsapp_count,
            },
            "recent": {
                "widget": recent_widget,
                "whatsapp": recent_whatsapp,
            },
        },
        "chart_data": chart_data,
        "recent_activity": recent_activity,
    }
