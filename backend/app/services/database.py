"""
Supabase database service.
Handles all database operations through the Supabase client.
"""

from datetime import datetime, timedelta, timezone
from functools import lru_cache
from typing import Optional
from supabase import create_client, Client
from app.config import get_settings

settings = get_settings()


@lru_cache
def get_supabase_client() -> Client:
    """Get a cached Supabase client instance."""
    if not settings.supabase_url or not settings.supabase_key:
        raise ValueError(
            "SUPABASE_URL and SUPABASE_KEY must be set in environment variables"
        )
    return create_client(settings.supabase_url, settings.supabase_key)


class DatabaseService:
    """Service for database operations."""

    def __init__(self):
        self.client = get_supabase_client()

    # --- Business Operations ---

    def create_business(self, user_id: str, name: str, description: str, language: str) -> dict:
        """Create a new business."""
        result = self.client.table("businesses").insert({
            "user_id": user_id,
            "name": name,
            "description": description,
            "language": language,
        }).execute()
        return result.data[0] if result.data else None

    def get_business(self, business_id: str) -> Optional[dict]:
        """Get a business by ID."""
        result = self.client.table("businesses").select("*").eq("id", business_id).execute()
        return result.data[0] if result.data else None

    def get_businesses_by_user(self, user_id: str) -> list[dict]:
        """Get all businesses for a user."""
        result = self.client.table("businesses").select("*").eq("user_id", user_id).execute()
        return result.data or []

    def update_business(self, business_id: str, updates: dict) -> Optional[dict]:
        """Update a business."""
        result = self.client.table("businesses").update(updates).eq("id", business_id).execute()
        return result.data[0] if result.data else None

    def delete_business(self, business_id: str) -> bool:
        """Delete a business and all related data (cascades via FK)."""
        result = (
            self.client.table("businesses")
            .delete()
            .eq("id", business_id)
            .execute()
        )
        return len(result.data) > 0 if result.data else False

    # --- Business Config Operations ---

    def get_business_config(self, business_id: str) -> Optional[dict]:
        """Get business configuration."""
        result = self.client.table("business_configs").select("*").eq("business_id", business_id).execute()
        return result.data[0] if result.data else None

    def upsert_business_config(self, business_id: str, config: dict) -> dict:
        """Create or update business configuration."""
        data = {"business_id": business_id, **config}
        result = self.client.table("business_configs").upsert(data, on_conflict="business_id").execute()
        return result.data[0] if result.data else None

    # --- Conversation Operations ---

    def create_conversation(self, business_id: str, visitor_id: str, channel: str = "widget") -> dict:
        """Create a new conversation."""
        result = self.client.table("conversations").insert({
            "business_id": business_id,
            "visitor_id": visitor_id,
            "channel": channel,
        }).execute()
        return result.data[0] if result.data else None

    def get_conversation(self, conversation_id: str) -> Optional[dict]:
        """Get a conversation by ID."""
        result = self.client.table("conversations").select("*").eq("id", conversation_id).execute()
        return result.data[0] if result.data else None

    def get_conversations_by_business(self, business_id: str, limit: int = 50) -> list[dict]:
        """Get recent conversations for a business."""
        result = (
            self.client.table("conversations")
            .select("*")
            .eq("business_id", business_id)
            .order("last_message_at", desc=True)
            .limit(limit)
            .execute()
        )
        return result.data or []

    def update_conversation_timestamp(self, conversation_id: str) -> None:
        """Update the last_message_at timestamp."""
        self.client.table("conversations").update({
            "last_message_at": "now()"
        }).eq("id", conversation_id).execute()

    def set_conversation_takeover(
        self,
        conversation_id: str,
        is_taken_over: bool,
        taken_over_by: str = None,
    ) -> Optional[dict]:
        """Set or unset human takeover mode for a conversation."""
        updates = {
            "is_human_takeover": is_taken_over,
            "taken_over_by": taken_over_by if is_taken_over else None,
            "taken_over_at": "now()" if is_taken_over else None,
        }
        result = (
            self.client.table("conversations")
            .update(updates)
            .eq("id", conversation_id)
            .execute()
        )
        return result.data[0] if result.data else None

    def get_active_conversations(self, business_id: str, limit: int = 50) -> list[dict]:
        """Get active conversations (with recent messages) for live monitoring."""
        cutoff = (datetime.now(timezone.utc) - timedelta(hours=24)).isoformat()
        result = (
            self.client.table("conversations")
            .select("*, team_member:team_members!taken_over_by(email, avatar_url)")
            .eq("business_id", business_id)
            .gte("last_message_at", cutoff)
            .order("last_message_at", desc=True)
            .limit(limit)
            .execute()
        )
        return result.data or []

    def get_conversation_with_messages(self, conversation_id: str) -> Optional[dict]:
        """Get a conversation with its messages for live view."""
        result = (
            self.client.table("conversations")
            .select("*, team_member:team_members!taken_over_by(email, avatar_url)")
            .eq("id", conversation_id)
            .execute()
        )
        if not result.data:
            return None

        conversation = result.data[0]
        messages = self.get_conversation_messages(conversation_id, limit=100)
        conversation["messages"] = messages
        return conversation

    # --- Message Operations ---

    def create_message(self, conversation_id: str, role: str, content: str, media: list = None) -> dict:
        """Create a new message with optional media attachments."""
        data = {
            "conversation_id": conversation_id,
            "role": role,
            "content": content,
        }
        if media:
            data["media"] = media
        result = self.client.table("messages").insert(data).execute()
        return result.data[0] if result.data else None

    def get_conversation_messages(self, conversation_id: str, limit: int = 50) -> list[dict]:
        """Get messages for a conversation."""
        result = (
            self.client.table("messages")
            .select("*")
            .eq("conversation_id", conversation_id)
            .order("created_at", desc=False)
            .limit(limit)
            .execute()
        )
        return result.data or []

    # Alias for create_message
    def add_message(self, conversation_id: str, role: str, content: str) -> dict:
        """Add a message to a conversation (alias for create_message)."""
        return self.create_message(conversation_id, role, content)

    # --- WhatsApp-specific Operations ---

    def get_all_businesses(self) -> list[dict]:
        """Get all businesses (for admin/fallback purposes)."""
        result = self.client.table("businesses").select("*").execute()
        return result.data or []

    def get_system_businesses(self) -> list[dict]:
        """Get all system businesses (e.g., Raven Support)."""
        result = (
            self.client.table("businesses")
            .select("*")
            .eq("is_system", True)
            .execute()
        )
        return result.data or []

    def get_businesses_for_user_with_system(self, user_id: str) -> list[dict]:
        """Get user's own businesses plus all system businesses."""
        own = self.get_businesses_by_user(user_id)
        system = self.get_system_businesses()
        own_ids = {b["id"] for b in own}
        for sb in system:
            if sb["id"] not in own_ids:
                own.append(sb)
        return own

    def get_business_by_whatsapp(self, whatsapp_number: str) -> Optional[dict]:
        """
        Get a business by its WhatsApp number.
        For MVP, returns None as we haven't added whatsapp_number field yet.
        """
        # TODO: Add whatsapp_number field to businesses table
        # For now, return None and let the webhook use the first business
        return None

    def get_or_create_whatsapp_conversation(self, business_id: str, visitor_id: str) -> dict:
        """
        Get existing WhatsApp conversation or create a new one.
        Uses visitor_id (phone number) to find existing conversation.
        """
        # Try to find existing conversation
        result = (
            self.client.table("conversations")
            .select("*")
            .eq("business_id", business_id)
            .eq("visitor_id", visitor_id)
            .eq("channel", "whatsapp")
            .order("last_message_at", desc=True)
            .limit(1)
            .execute()
        )

        if result.data:
            return result.data[0]

        # Create new conversation
        return self.create_conversation(business_id, visitor_id, channel="whatsapp")

    # --- Team Member Operations ---

    def get_team_members(self, business_id: str) -> list[dict]:
        """Get all team members for a business."""
        result = (
            self.client.table("team_members")
            .select("*")
            .eq("business_id", business_id)
            .order("created_at", desc=False)
            .execute()
        )
        return result.data or []

    def get_team_member_by_email(self, business_id: str, email: str) -> Optional[dict]:
        """Get a team member by email for a specific business."""
        result = (
            self.client.table("team_members")
            .select("*")
            .eq("business_id", business_id)
            .eq("email", email)
            .execute()
        )
        return result.data[0] if result.data else None

    def create_team_member(
        self,
        business_id: str,
        email: str,
        role: str = "member",
        user_id: str = None,
        full_name: str = None,
        phone: str = None,
        job_title: str = None,
        status: str = "pending",
    ) -> Optional[dict]:
        """Create a new team member (supports both invite and direct creation)."""
        insert_data = {
            "business_id": business_id,
            "email": email,
            "role": role,
            "status": status,
        }

        # Add optional fields if provided
        if user_id:
            insert_data["user_id"] = user_id
        if full_name:
            insert_data["full_name"] = full_name
        if phone:
            insert_data["phone"] = phone
        if job_title:
            insert_data["job_title"] = job_title

        result = self.client.table("team_members").insert(insert_data).execute()
        return result.data[0] if result.data else None

    def update_team_member(
        self,
        member_id: str,
        role: str = None,
        avatar_url: str = None,
        full_name: str = None,
        phone: str = None,
        job_title: str = None,
    ) -> Optional[dict]:
        """Update a team member's profile fields."""
        updates = {}
        if role:
            updates["role"] = role
        if avatar_url is not None:  # Allow empty string to clear avatar
            updates["avatar_url"] = avatar_url
        if full_name is not None:
            updates["full_name"] = full_name
        if phone is not None:
            updates["phone"] = phone
        if job_title is not None:
            updates["job_title"] = job_title

        if not updates:
            return None

        result = (
            self.client.table("team_members")
            .update(updates)
            .eq("id", member_id)
            .execute()
        )
        return result.data[0] if result.data else None

    def delete_team_member(self, member_id: str) -> bool:
        """Delete a team member."""
        result = (
            self.client.table("team_members")
            .delete()
            .eq("id", member_id)
            .execute()
        )
        return len(result.data) > 0 if result.data else False

    def update_conversation_visitor_info(
        self,
        conversation_id: str,
        visitor_name: str = None,
        visitor_email: str = None,
        visitor_phone: str = None,
    ) -> Optional[dict]:
        """Update visitor info on a conversation (from lead capture)."""
        updates = {}
        if visitor_name:
            updates["visitor_name"] = visitor_name
        if visitor_email:
            updates["visitor_email"] = visitor_email
        if visitor_phone:
            updates["visitor_phone"] = visitor_phone
        if not updates:
            return None
        result = (
            self.client.table("conversations")
            .update(updates)
            .eq("id", conversation_id)
            .execute()
        )
        return result.data[0] if result.data else None

    def rate_conversation(
        self,
        conversation_id: str,
        rating: str,
        comment: str = None,
    ) -> Optional[dict]:
        """Rate a conversation (positive/negative)."""
        updates = {
            "rating": rating,
            "rated_at": "now()",
        }
        if comment:
            updates["rating_comment"] = comment
        result = (
            self.client.table("conversations")
            .update(updates)
            .eq("id", conversation_id)
            .execute()
        )
        return result.data[0] if result.data else None

    # Alias for analytics
    def get_business_conversations(self, business_id: str) -> list[dict]:
        """Get all conversations for a business (alias for get_conversations_by_business)."""
        return self.get_conversations_by_business(business_id, limit=1000)

    # --- Appointment Operations ---

    def create_appointment(
        self,
        business_id: str,
        customer_name: str,
        customer_email: str,
        appointment_date: str,
        appointment_time: str,
        customer_phone: str = None,
        duration_minutes: int = 60,
        service_type: str = None,
        notes: str = None,
        conversation_id: str = None,
    ) -> Optional[dict]:
        """Create a new appointment.

        Args:
            business_id: UUID of the business
            customer_name: Customer's full name (required)
            customer_email: Customer's email address (required)
            appointment_date: Date in YYYY-MM-DD format (required)
            appointment_time: Time in HH:MM format (required)
            customer_phone: Customer's phone number (optional)
            duration_minutes: Duration of appointment in minutes
            service_type: Type of service/appointment
            notes: Additional notes
            conversation_id: Associated conversation UUID
        """
        data = {
            "business_id": business_id,
            "customer_name": customer_name,
            "customer_email": customer_email,  # Always include (NOT NULL in DB)
            "customer_phone": customer_phone,  # Can be None (nullable in DB after migration 007)
            "appointment_date": appointment_date,
            "appointment_time": appointment_time,
            "duration_minutes": duration_minutes,
        }
        if service_type:
            data["service_type"] = service_type
        if notes:
            data["notes"] = notes
        if conversation_id:
            data["conversation_id"] = conversation_id

        result = self.client.table("appointments").insert(data).execute()
        return result.data[0] if result.data else None

    def get_appointment(self, appointment_id: str) -> Optional[dict]:
        """Get an appointment by ID."""
        result = (
            self.client.table("appointments")
            .select("*")
            .eq("id", appointment_id)
            .execute()
        )
        return result.data[0] if result.data else None

    def get_appointments_by_business(
        self,
        business_id: str,
        status: str = None,
        start_date: str = None,
        end_date: str = None,
        limit: int = 100,
    ) -> list[dict]:
        """Get appointments for a business with optional filters."""
        query = (
            self.client.table("appointments")
            .select("*")
            .eq("business_id", business_id)
        )

        if status:
            query = query.eq("status", status)
        if start_date:
            query = query.gte("appointment_date", start_date)
        if end_date:
            query = query.lte("appointment_date", end_date)

        result = query.order("appointment_date", desc=False).order("appointment_time", desc=False).limit(limit).execute()
        return result.data or []

    def get_appointments_by_phone(self, business_id: str, phone: str) -> list[dict]:
        """Get appointments for a customer by phone number."""
        result = (
            self.client.table("appointments")
            .select("*")
            .eq("business_id", business_id)
            .eq("customer_phone", phone)
            .order("appointment_date", desc=False)
            .execute()
        )
        return result.data or []

    def update_appointment(self, appointment_id: str, updates: dict) -> Optional[dict]:
        """Update an appointment."""
        # Handle status change timestamps
        if "status" in updates:
            if updates["status"] == "confirmed" and "confirmed_at" not in updates:
                updates["confirmed_at"] = "now()"
            elif updates["status"] == "cancelled" and "cancelled_at" not in updates:
                updates["cancelled_at"] = "now()"

        result = (
            self.client.table("appointments")
            .update(updates)
            .eq("id", appointment_id)
            .execute()
        )
        return result.data[0] if result.data else None

    def delete_appointment(self, appointment_id: str) -> bool:
        """Delete an appointment."""
        result = (
            self.client.table("appointments")
            .delete()
            .eq("id", appointment_id)
            .execute()
        )
        return len(result.data) > 0 if result.data else False

    # --- Business Availability Operations ---

    def get_business_availability(self, business_id: str) -> Optional[dict]:
        """Get business availability settings."""
        result = (
            self.client.table("business_availability")
            .select("*")
            .eq("business_id", business_id)
            .execute()
        )
        return result.data[0] if result.data else None

    def upsert_business_availability(self, business_id: str, availability: dict) -> Optional[dict]:
        """Create or update business availability settings."""
        data = {"business_id": business_id, **availability}
        result = (
            self.client.table("business_availability")
            .upsert(data, on_conflict="business_id")
            .execute()
        )
        return result.data[0] if result.data else None

    # --- Notification Operations ---

    def get_notification_settings(self, business_id: str) -> Optional[dict]:
        """Get notification settings for a business."""
        result = (
            self.client.table("notification_settings")
            .select("*")
            .eq("business_id", business_id)
            .execute()
        )
        return result.data[0] if result.data else None

    def upsert_notification_settings(
        self,
        business_id: str,
        user_id: str,
        settings: dict,
    ) -> Optional[dict]:
        """Create or update notification settings for a business."""
        data = {
            "business_id": business_id,
            "user_id": user_id,
            **settings,
        }
        result = (
            self.client.table("notification_settings")
            .upsert(data, on_conflict="business_id")
            .execute()
        )
        return result.data[0] if result.data else None

    def log_notification(
        self,
        appointment_id: str,
        business_id: str,
        notification_type: str,
        channel: str,
        recipient: str,
        status: str,
        error_message: Optional[str] = None,
        provider_id: Optional[str] = None,
    ) -> Optional[dict]:
        """Log a sent notification to the database."""
        data = {
            "appointment_id": appointment_id,
            "business_id": business_id,
            "type": notification_type,
            "channel": channel,
            "recipient": recipient,
            "status": status,
        }
        if error_message:
            data["error_message"] = error_message
        if provider_id:
            data["provider_id"] = provider_id
        if status == "sent":
            data["sent_at"] = "now()"

        result = self.client.table("notification_log").insert(data).execute()
        return result.data[0] if result.data else None

    def get_notification_logs(
        self,
        business_id: str,
        appointment_id: Optional[str] = None,
        limit: int = 100,
    ) -> list[dict]:
        """Get notification logs for a business."""
        query = (
            self.client.table("notification_log")
            .select("*")
            .eq("business_id", business_id)
        )

        if appointment_id:
            query = query.eq("appointment_id", appointment_id)

        result = query.order("created_at", desc=True).limit(limit).execute()
        return result.data or []


# Singleton instance
db = DatabaseService()
