"""
Dashboard API endpoints.
Provides overview statistics and metrics for the business dashboard.
"""

from fastapi import APIRouter, HTTPException, Header
from datetime import datetime, timezone, timedelta
from typing import Optional

from app.services.database import db
from app.services.admin import is_platform_admin

router = APIRouter()


def get_user_id_from_header(authorization: Optional[str] = Header(None)) -> str:
    """Extract user ID from authorization header."""
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization header required")

    parts = authorization.split(" ")
    if len(parts) != 2 or parts[0] != "Bearer":
        raise HTTPException(status_code=401, detail="Invalid authorization format")

    return parts[1]


@router.get("/businesses/{business_id}/dashboard/stats")
async def get_dashboard_stats(business_id: str, authorization: Optional[str] = Header(None)):
    """
    Get today's dashboard statistics for a business.
    Returns key metrics like conversation count, appointments, ratings, etc.
    """
    user_id = get_user_id_from_header(authorization)

    # Verify business ownership
    business = db.get_business(business_id)
    if not business:
        raise HTTPException(status_code=404, detail="Business not found")
    if business["user_id"] != user_id and not is_platform_admin(user_id):
        raise HTTPException(status_code=403, detail="Not authorized")

    today = datetime.now(timezone.utc).date()
    today_start = datetime.combine(today, datetime.min.time()).replace(tzinfo=timezone.utc)
    today_end = datetime.combine(today, datetime.max.time()).replace(tzinfo=timezone.utc)

    # Get today's conversations
    all_conversations = db.client.table("conversations")\
        .select("*")\
        .eq("business_id", business_id)\
        .gte("started_at", today_start.isoformat())\
        .lte("started_at", today_end.isoformat())\
        .execute()

    conversations_today = len(all_conversations.data) if all_conversations.data else 0

    # Get active conversations (last message within last hour)
    one_hour_ago = datetime.now(timezone.utc) - timedelta(hours=1)
    active_conversations = db.client.table("conversations")\
        .select("id")\
        .eq("business_id", business_id)\
        .gte("last_message_at", one_hour_ago.isoformat())\
        .execute()

    active_now = len(active_conversations.data) if active_conversations.data else 0

    # Get today's appointments
    appointments = db.client.table("appointments")\
        .select("id")\
        .eq("business_id", business_id)\
        .eq("appointment_date", today.isoformat())\
        .execute()

    appointments_today = len(appointments.data) if appointments.data else 0

    # Get average rating (last 30 days)
    thirty_days_ago = datetime.now(timezone.utc) - timedelta(days=30)
    rated_conversations = db.client.table("conversations")\
        .select("rating")\
        .eq("business_id", business_id)\
        .not_.is_("rating", "null")\
        .gte("rated_at", thirty_days_ago.isoformat())\
        .execute()

    avg_rating = None
    if rated_conversations.data:
        positive_count = sum(1 for c in rated_conversations.data if c["rating"] == "positive")
        total_ratings = len(rated_conversations.data)
        avg_rating = round((positive_count / total_ratings) * 100) if total_ratings > 0 else None

    # Get total conversations (all time)
    total_convos = db.client.table("conversations")\
        .select("id", count="exact")\
        .eq("business_id", business_id)\
        .execute()

    total_conversations = total_convos.count if total_convos.count else 0

    return {
        "conversations_today": conversations_today,
        "active_conversations": active_now,
        "appointments_today": appointments_today,
        "satisfaction_rate": avg_rating,
        "total_conversations": total_conversations,
    }


@router.get("/businesses/{business_id}/dashboard/activity")
async def get_activity_feed(business_id: str, limit: int = 10, authorization: Optional[str] = Header(None)):
    """
    Get recent activity feed (last N events).
    Returns a list of recent events like new conversations, appointments, ratings.
    """
    user_id = get_user_id_from_header(authorization)

    # Verify business ownership
    business = db.get_business(business_id)
    if not business:
        raise HTTPException(status_code=404, detail="Business not found")
    if business["user_id"] != user_id and not is_platform_admin(user_id):
        raise HTTPException(status_code=403, detail="Not authorized")

    activities = []

    # Get recent conversations (last 24 hours)
    yesterday = datetime.now(timezone.utc) - timedelta(days=1)
    recent_conversations = db.client.table("conversations")\
        .select("id, visitor_name, started_at, channel")\
        .eq("business_id", business_id)\
        .gte("started_at", yesterday.isoformat())\
        .order("started_at", desc=True)\
        .limit(5)\
        .execute()

    for conv in (recent_conversations.data or []):
        activities.append({
            "type": "conversation",
            "message": f"New conversation from {conv.get('visitor_name') or 'Anonymous'}",
            "timestamp": conv["started_at"],
            "channel": conv.get("channel", "widget"),
        })

    # Get recent appointments
    recent_appointments = db.client.table("appointments")\
        .select("id, customer_name, appointment_date, appointment_time, created_at")\
        .eq("business_id", business_id)\
        .gte("created_at", yesterday.isoformat())\
        .order("created_at", desc=True)\
        .limit(5)\
        .execute()

    for appt in (recent_appointments.data or []):
        activities.append({
            "type": "appointment",
            "message": f"Appointment booked by {appt['customer_name']} for {appt['appointment_date']} at {appt['appointment_time']}",
            "timestamp": appt["created_at"],
        })

    # Get recent ratings
    recent_ratings = db.client.table("conversations")\
        .select("id, visitor_name, rating, rated_at")\
        .eq("business_id", business_id)\
        .not_.is_("rating", "null")\
        .gte("rated_at", yesterday.isoformat())\
        .order("rated_at", desc=True)\
        .limit(5)\
        .execute()

    for rating in (recent_ratings.data or []):
        rating_emoji = "👍" if rating["rating"] == "positive" else "👎"
        activities.append({
            "type": "rating",
            "message": f"{rating_emoji} Rating from {rating.get('visitor_name') or 'Anonymous'}",
            "timestamp": rating["rated_at"],
            "rating": rating["rating"],
        })

    # Sort all activities by timestamp and return top N
    activities.sort(key=lambda x: x["timestamp"], reverse=True)
    return activities[:limit]


@router.get("/businesses/{business_id}/dashboard/chart-data")
async def get_chart_data(business_id: str, days: int = 7, authorization: Optional[str] = Header(None)):
    """
    Get conversation data for the last N days for charting.
    Returns daily conversation counts.
    """
    user_id = get_user_id_from_header(authorization)

    # Verify business ownership
    business = db.get_business(business_id)
    if not business:
        raise HTTPException(status_code=404, detail="Business not found")
    if business["user_id"] != user_id and not is_platform_admin(user_id):
        raise HTTPException(status_code=403, detail="Not authorized")

    # Get conversations from last N days
    start_date = datetime.now(timezone.utc).date() - timedelta(days=days - 1)
    end_date = datetime.now(timezone.utc).date()

    conversations = db.client.table("conversations")\
        .select("started_at")\
        .eq("business_id", business_id)\
        .gte("started_at", datetime.combine(start_date, datetime.min.time()).replace(tzinfo=timezone.utc).isoformat())\
        .lte("started_at", datetime.combine(end_date, datetime.max.time()).replace(tzinfo=timezone.utc).isoformat())\
        .execute()

    # Group by date
    daily_counts = {}
    for i in range(days):
        date = start_date + timedelta(days=i)
        daily_counts[date.isoformat()] = 0

    for conv in (conversations.data or []):
        conv_date = datetime.fromisoformat(conv["started_at"].replace('Z', '+00:00')).date()
        date_key = conv_date.isoformat()
        if date_key in daily_counts:
            daily_counts[date_key] += 1

    # Convert to list format for frontend
    chart_data = [
        {
            "date": date,
            "count": count,
            "label": datetime.fromisoformat(date).strftime("%a %d")  # e.g., "Mon 10"
        }
        for date, count in sorted(daily_counts.items())
    ]

    return chart_data


@router.get("/businesses/{business_id}/dashboard/upcoming-appointments")
async def get_upcoming_appointments(business_id: str, days: int = 3, authorization: Optional[str] = Header(None)):
    """
    Get upcoming appointments for the next N days.
    """
    user_id = get_user_id_from_header(authorization)

    # Verify business ownership
    business = db.get_business(business_id)
    if not business:
        raise HTTPException(status_code=404, detail="Business not found")
    if business["user_id"] != user_id and not is_platform_admin(user_id):
        raise HTTPException(status_code=403, detail="Not authorized")

    today = datetime.now(timezone.utc).date()
    end_date = today + timedelta(days=days)

    appointments = db.client.table("appointments")\
        .select("*")\
        .eq("business_id", business_id)\
        .gte("appointment_date", today.isoformat())\
        .lte("appointment_date", end_date.isoformat())\
        .in_("status", ["pending", "confirmed"])\
        .order("appointment_date")\
        .order("appointment_time")\
        .limit(10)\
        .execute()

    return appointments.data or []
