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
    # Can be overridden with CORS_ORIGINS env var (comma-separated)
    cors_origins: list[str] = [
        "http://localhost:3000",  # Next.js dev server
        "http://127.0.0.1:3000",
        "https://raven-production-980b.up.railway.app",  # Production backend (for local dev access)
    ]

    @property
    def all_cors_origins(self) -> list[str]:
        """Get all CORS origins including environment variable overrides."""
        import os
        env_origins = os.getenv("CORS_ORIGINS", "")
        if env_origins:
            additional = [o.strip() for o in env_origins.split(",") if o.strip()]
            return self.cors_origins + additional
        return self.cors_origins

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


@lru_cache
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()
