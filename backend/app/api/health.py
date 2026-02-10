"""
Health check endpoint.
Use this to verify the API is running.
"""

from fastapi import APIRouter

router = APIRouter()


@router.get("/health")
async def health_check():
    """Check if the API is healthy and running."""
    return {
        "status": "healthy",
        "service": "raven-api",
    }
