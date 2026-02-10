"""
Platform admin utilities.
Provides admin checking with caching to avoid repeated Supabase API calls.
"""

from typing import Optional

from app.config import get_settings
from app.services.database import get_supabase_client

# Cache mapping user_id -> email
_user_email_cache: dict = {}


def get_user_email(user_id: str) -> Optional[str]:
    """Look up a user's email from Supabase Auth by their user_id."""
    if user_id in _user_email_cache:
        return _user_email_cache[user_id]

    try:
        client = get_supabase_client()
        response = client.auth.admin.get_user_by_id(user_id)
        email = response.user.email
        if email:
            _user_email_cache[user_id] = email
        return email
    except Exception:
        return None


def is_platform_admin(user_id: str) -> bool:
    """Check if the given user_id belongs to the platform admin."""
    settings = get_settings()
    if not settings.platform_admin_email:
        return False
    email = get_user_email(user_id)
    return email is not None and email.lower() == settings.platform_admin_email.lower()
