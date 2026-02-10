"""
Shared dependencies for API endpoints.
Handles authentication and authorization.
"""

from fastapi import Header, HTTPException
from typing import Optional


def get_current_user(authorization: Optional[str] = Header(None)) -> dict:
    """
    Extract user information from authorization header.
    In production, this would validate a JWT token from Supabase Auth.
    For MVP, we accept a simple user ID in Bearer token format.

    Returns:
        dict with 'id' key containing the user_id
    """
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization header required")

    # For MVP: expect "Bearer <user_id>" format
    # In production: validate JWT and extract user_id from Supabase token
    parts = authorization.split(" ")
    if len(parts) != 2 or parts[0] != "Bearer":
        raise HTTPException(status_code=401, detail="Invalid authorization format")

    user_id = parts[1]
    return {"id": user_id}
