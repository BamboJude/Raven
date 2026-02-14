"""
Pydantic models for request/response validation.
"""

from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional
from enum import Enum


# --- Enums ---

class Language(str, Enum):
    """Supported languages."""
    FRENCH = "fr"
    ENGLISH = "en"


class MessageRole(str, Enum):
    """Chat message roles."""
    USER = "user"
    ASSISTANT = "assistant"


class Channel(str, Enum):
    """Chat channels."""
    WIDGET = "widget"
    WHATSAPP = "whatsapp"


class AppointmentStatus(str, Enum):
    """Appointment status."""
    PENDING = "pending"
    CONFIRMED = "confirmed"
    CANCELLED = "cancelled"
    COMPLETED = "completed"
    NO_SHOW = "no_show"


# --- FAQ & Product Models ---

class FAQ(BaseModel):
    """A frequently asked question and its answer."""
    question: str = Field(..., min_length=1, max_length=500)
    answer: str = Field(..., min_length=1, max_length=2000)


class Product(BaseModel):
    """A product or service offered by the business."""
    name: str = Field(..., min_length=1, max_length=200)
    description: str = Field(..., max_length=1000)
    price: Optional[str] = Field(None, max_length=100)  # e.g., "5000 CFA" or "10000-20000 CFA"


# --- Business Models ---

class BusinessCreate(BaseModel):
    """Request model for creating a business."""
    name: str = Field(..., min_length=1, max_length=200)
    description: str = Field(..., min_length=1, max_length=2000)
    language: Language = Language.FRENCH


class BusinessUpdate(BaseModel):
    """Request model for updating a business."""
    name: Optional[str] = Field(None, max_length=200)
    description: Optional[str] = Field(None, max_length=2000)
    language: Optional[Language] = None


class WidgetSettings(BaseModel):
    """Widget appearance settings."""
    primary_color: str = Field(default="#0ea5e9", max_length=20)  # Hex color
    position: str = Field(default="bottom-right")  # bottom-right, bottom-left
    welcome_message_language: str = Field(default="auto")  # auto, fr, en


class LeadCaptureField(BaseModel):
    """A single field in the lead capture form."""
    name: str = Field(..., description="Field identifier: name, email, phone")
    label_fr: str = Field(default="")
    label_en: str = Field(default="")
    required: bool = Field(default=False)
    enabled: bool = Field(default=True)


class LeadCaptureConfig(BaseModel):
    """Lead capture form configuration."""
    enabled: bool = Field(default=False)
    fields: list[LeadCaptureField] = Field(default_factory=list)


class BusinessConfig(BaseModel):
    """Business chatbot configuration."""
    welcome_message: str = Field(
        default="Bonjour! Comment puis-je vous aider?",
        max_length=500
    )
    welcome_message_en: str = Field(
        default="Hello! How can I help you?",
        max_length=500
    )
    faqs: list[FAQ] = Field(default_factory=list)
    products: list[Product] = Field(default_factory=list)
    custom_instructions: Optional[str] = Field(None, max_length=2000)
    widget_settings: WidgetSettings = Field(default_factory=WidgetSettings)
    lead_capture_config: Optional[LeadCaptureConfig] = None
    manual_away: bool = Field(default=False)
    away_message: str = Field(default="Nous sommes actuellement indisponibles. Laissez-nous un message et nous vous recontacterons.")
    away_message_en: str = Field(default="We are currently unavailable. Leave us a message and we will get back to you.")


class BusinessConfigUpdate(BaseModel):
    """Request model for updating business config."""
    welcome_message: Optional[str] = Field(None, max_length=500)
    welcome_message_en: Optional[str] = Field(None, max_length=500)
    faqs: Optional[list[FAQ]] = None
    products: Optional[list[Product]] = None
    custom_instructions: Optional[str] = Field(None, max_length=2000)
    widget_settings: Optional[WidgetSettings] = None
    lead_capture_config: Optional[LeadCaptureConfig] = None
    manual_away: Optional[bool] = None
    away_message: Optional[str] = Field(None, max_length=500)
    away_message_en: Optional[str] = Field(None, max_length=500)


class BusinessResponse(BaseModel):
    """Response model for a business."""
    id: str
    user_id: str
    name: str
    description: str
    language: Language
    is_system: bool = False
    created_at: datetime
    updated_at: datetime


class BusinessWithConfig(BusinessResponse):
    """Business with its configuration."""
    config: Optional[BusinessConfig] = None


# --- Chat Models ---

class MediaAttachment(BaseModel):
    """Media attachment in a message."""
    type: str = Field(..., description="Type: image, file")
    url: str = Field(..., description="URL to access the media")
    filename: Optional[str] = Field(None, description="Original filename")
    content_type: Optional[str] = Field(None, description="MIME type")


class ChatMessage(BaseModel):
    """A single chat message."""
    role: MessageRole
    content: str
    media: Optional[list[MediaAttachment]] = Field(None, description="Attached media")


class ChatRequest(BaseModel):
    """Request to send a chat message."""
    business_id: str = Field(..., description="The business to chat with")
    visitor_id: str = Field(..., description="Anonymous visitor identifier")
    message: str = Field(..., min_length=1, max_length=4000)
    conversation_id: Optional[str] = Field(None, description="Existing conversation ID")
    media: Optional[list[MediaAttachment]] = Field(None, description="Attached media")
    visitor_name: Optional[str] = Field(None, max_length=200)
    visitor_email: Optional[str] = Field(None, max_length=200)
    visitor_phone: Optional[str] = Field(None, max_length=50)


class SlotOption(BaseModel):
    """An available time slot for selection."""
    id: int = Field(..., description="Slot number (1-based)")
    date: str = Field(..., description="Date in YYYY-MM-DD format")
    time: str = Field(..., description="Time in HH:MM format")
    display: str = Field(..., description="Human-readable display text")


class ChatResponse(BaseModel):
    """Response from the chat endpoint."""
    conversation_id: str
    message: str
    created_at: datetime
    is_human_takeover: bool = Field(default=False, description="Whether a human agent has taken over")
    available_slots: Optional[list[SlotOption]] = Field(None, description="Available appointment slots for selection")
    should_close: bool = Field(default=False, description="Whether the chat should close (user said goodbye)")


# --- Conversation Models ---

class ConversationRating(BaseModel):
    """Request to rate a conversation."""
    rating: str = Field(..., description="'positive' or 'negative'")
    comment: Optional[str] = Field(None, max_length=1000)


class TranscriptRequest(BaseModel):
    """Request to email a chat transcript."""
    email: str = Field(..., max_length=200)


class ConversationResponse(BaseModel):
    """A conversation summary."""
    id: str
    business_id: str
    visitor_id: str
    channel: Channel
    started_at: datetime
    last_message_at: datetime
    message_count: Optional[int] = None
    visitor_name: Optional[str] = None
    visitor_email: Optional[str] = None
    visitor_phone: Optional[str] = None
    rating: Optional[str] = None
    rating_comment: Optional[str] = None
    rated_at: Optional[datetime] = None


class ConversationWithMessages(ConversationResponse):
    """A conversation with its messages."""
    messages: list[ChatMessage]


# --- Appointment Models ---

class TimeSlot(BaseModel):
    """Time slot for appointments."""
    start: str = Field(..., description="Start time in HH:MM format")
    end: str = Field(..., description="End time in HH:MM format")


class DaySchedule(BaseModel):
    """Schedule for a single day."""
    enabled: bool = Field(default=True)
    slots: list[TimeSlot] = Field(default_factory=list)


class WeeklySchedule(BaseModel):
    """Weekly schedule for business availability."""
    monday: DaySchedule = Field(default_factory=DaySchedule)
    tuesday: DaySchedule = Field(default_factory=DaySchedule)
    wednesday: DaySchedule = Field(default_factory=DaySchedule)
    thursday: DaySchedule = Field(default_factory=DaySchedule)
    friday: DaySchedule = Field(default_factory=DaySchedule)
    saturday: DaySchedule = Field(default_factory=lambda: DaySchedule(enabled=False, slots=[]))
    sunday: DaySchedule = Field(default_factory=lambda: DaySchedule(enabled=False, slots=[]))


class AppointmentCreate(BaseModel):
    """Request to create an appointment."""
    business_id: str = Field(..., description="Business ID")
    customer_name: str = Field(..., min_length=1, max_length=200)
    customer_email: str = Field(..., min_length=1, max_length=200, description="Customer email (required)")
    customer_phone: Optional[str] = Field(None, max_length=50, description="Customer phone (optional)")
    appointment_date: str = Field(..., description="Date in YYYY-MM-DD format")
    appointment_time: str = Field(..., description="Time in HH:MM format")
    duration_minutes: int = Field(default=60, ge=15, le=480)
    service_type: Optional[str] = Field(None, max_length=200)
    notes: Optional[str] = Field(None, max_length=1000)
    conversation_id: Optional[str] = Field(None, description="Related conversation ID")


class AppointmentUpdate(BaseModel):
    """Request to update an appointment."""
    status: Optional[AppointmentStatus] = None
    appointment_date: Optional[str] = Field(None, description="Date in YYYY-MM-DD format")
    appointment_time: Optional[str] = Field(None, description="Time in HH:MM format")
    notes: Optional[str] = Field(None, max_length=1000)


class AppointmentResponse(BaseModel):
    """Response model for an appointment."""
    id: str
    business_id: str
    conversation_id: Optional[str]
    customer_name: str
    customer_email: str  # Required after migration 008
    customer_phone: Optional[str]  # Optional after migration 008
    appointment_date: str
    appointment_time: str
    duration_minutes: int
    service_type: Optional[str]
    notes: Optional[str]
    status: AppointmentStatus
    created_at: datetime
    updated_at: datetime
    confirmed_at: Optional[datetime]
    cancelled_at: Optional[datetime]


class BusinessAvailabilityUpdate(BaseModel):
    """Request to update business availability."""
    weekly_schedule: Optional[WeeklySchedule] = None
    default_duration_minutes: Optional[int] = Field(None, ge=15, le=480)
    buffer_minutes: Optional[int] = Field(None, ge=0, le=120)
    timezone: Optional[str] = Field(None, max_length=100)


class BusinessAvailabilityResponse(BaseModel):
    """Response model for business availability."""
    id: str
    business_id: str
    weekly_schedule: dict
    default_duration_minutes: int
    buffer_minutes: int
    timezone: str
    created_at: datetime
    updated_at: datetime


class AvailableSlot(BaseModel):
    """An available time slot for booking."""
    date: str = Field(..., description="Date in YYYY-MM-DD format")
    time: str = Field(..., description="Time in HH:MM format")
    duration_minutes: int
