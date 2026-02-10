"""
Raven Support API - Main FastAPI Application

This is the entry point for the Raven Support backend API.
Run with: uvicorn app.main:app --reload
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path

from app.config import get_settings
from app.api import health, chat, business, whatsapp, analytics, export, team, uploads, appointments, notifications, live, dashboard
from app.services.scheduler import start_scheduler, stop_scheduler

settings = get_settings()


@asynccontextmanager
async def lifespan(_app: FastAPI):
    """Manage application lifecycle - start/stop background services."""
    # Startup
    start_scheduler()
    yield
    # Shutdown
    stop_scheduler()

# Create FastAPI app
app = FastAPI(
    title="Raven Support API",
    description="AI-powered chatbot platform for businesses in Cameroon",
    version="0.1.0",
    docs_url="/docs" if settings.debug else None,  # Disable docs in production
    redoc_url="/redoc" if settings.debug else None,
    lifespan=lifespan,
)

# Configure CORS to allow frontend and widget to make requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for widget embeds (public API)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(health.router, tags=["Health"])
app.include_router(business.router, prefix="/api/businesses", tags=["Businesses"])
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["Dashboard"])
app.include_router(chat.router, prefix="/api/chat", tags=["Chat"])
app.include_router(whatsapp.router, prefix="/api/whatsapp", tags=["WhatsApp"])
app.include_router(analytics.router, prefix="/api/analytics", tags=["Analytics"])
app.include_router(export.router, prefix="/api/export", tags=["Export"])
app.include_router(team.router, prefix="/api/team", tags=["Team"])
app.include_router(uploads.router, prefix="/api/uploads", tags=["Uploads"])
app.include_router(appointments.router, prefix="/api/appointments", tags=["Appointments"])
app.include_router(notifications.router, tags=["Notifications"])
app.include_router(live.router, prefix="/api/live", tags=["Live Conversations"])

# Serve static files (widget)
static_path = Path(__file__).parent.parent / "static"
if static_path.exists():
    app.mount("/static", StaticFiles(directory=str(static_path)), name="static")


@app.get("/")
async def root():
    """Root endpoint - basic info about the API."""
    return {
        "name": "Raven Support API",
        "version": "0.1.0",
        "status": "running",
        "docs": "/docs" if settings.debug else "disabled",
    }
