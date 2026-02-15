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


def generate_secure_password(length: int = 16) -> str:
    """
    Generate a cryptographically secure random password.

    Password composition:
    - Minimum 16 characters (configurable)
    - Mix of uppercase, lowercase, digits, and special chars
    - Uses secrets module for cryptographic randomness

    Returns:
        A secure random password string
    """
    import secrets
    import string

    # Character sets
    alphabet = string.ascii_letters + string.digits + "!@#$%^&*-_=+"

    # Ensure at least one of each type
    password = [
        secrets.choice(string.ascii_lowercase),
        secrets.choice(string.ascii_uppercase),
        secrets.choice(string.digits),
        secrets.choice("!@#$%^&*-_=+"),
    ]

    # Fill the rest randomly
    password += [secrets.choice(alphabet) for _ in range(length - 4)]

    # Shuffle to avoid predictable patterns
    secrets.SystemRandom().shuffle(password)

    return ''.join(password)


def create_team_member_auth_user(email: str, password: str, full_name: str) -> dict:
    """
    Create a Supabase Auth user via Admin API.

    Args:
        email: User's email address
        password: Auto-generated secure password
        full_name: User's full name (stored in user_metadata)

    Returns:
        Supabase user object with 'id' field

    Raises:
        Exception: If user creation fails (duplicate email, API error, etc.)
    """
    client = get_supabase_client()

    try:
        response = client.auth.admin.create_user({
            "email": email,
            "password": password,
            "email_confirm": True,  # Auto-confirm email (no verification needed)
            "user_metadata": {
                "full_name": full_name,
                "created_by": "team_admin",  # Track that this was admin-created
            }
        })

        return response.user

    except Exception as e:
        # Re-raise with context
        raise Exception(f"Failed to create auth user for {email}: {str(e)}")
