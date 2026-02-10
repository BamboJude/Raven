"""
Application configuration.
Loads environment variables and provides typed config access.
"""

from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # Supabase
    supabase_url: str = ""
    supabase_key: str = ""

    # Groq (Free AI - Llama 3)
    groq_api_key: str = ""

    # Resend (Email)
    resend_api_key: str = ""
    resend_from_email: str = "onboarding@resend.dev"

    # Twilio (WhatsApp/SMS)
    twilio_account_sid: str = ""
    twilio_auth_token: str = ""
    twilio_whatsapp_number: str = ""  # e.g., "whatsapp:+14155238886" for sandbox

    # App settings
    app_name: str = "Raven Support"
    debug: bool = False

    # Platform admin
    platform_admin_email: str = "bambojude@gmail.com"

    # CORS - allowed origins for the frontend and widget
    cors_origins: list[str] = [
        "http://localhost:3000",  # Next.js dev server
        "http://127.0.0.1:3000",
    ]

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


@lru_cache
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()
