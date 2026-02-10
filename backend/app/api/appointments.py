"""
Appointments API endpoints.
Handles appointment scheduling and availability management.
"""

from fastapi import APIRouter, HTTPException, Header
from typing import Optional
from datetime import datetime, timedelta, date, time as dt_time
import pytz

from app.models.schemas import (
    AppointmentCreate,
    AppointmentUpdate,
    AppointmentResponse,
    BusinessAvailabilityUpdate,
    BusinessAvailabilityResponse,
    AvailableSlot,
)
from app.services.database import db
from app.services.notifications import get_notification_service
from app.services.admin import is_platform_admin
from app.api.business import get_user_id_from_header

router = APIRouter()


@router.post("", response_model=AppointmentResponse)
async def create_appointment(appointment: AppointmentCreate):
    """
    Create a new appointment.
    This endpoint is public and can be called from the widget or WhatsApp.
    """
    # Verify business exists
    business = db.get_business(appointment.business_id)
    if not business:
        raise HTTPException(status_code=404, detail="Business not found")

    # Validate date format
    try:
        datetime.strptime(appointment.appointment_date, "%Y-%m-%d")
        datetime.strptime(appointment.appointment_time, "%H:%M")
    except ValueError:
        raise HTTPException(
            status_code=400,
            detail="Invalid date/time format. Use YYYY-MM-DD for date and HH:MM for time"
        )

    # Create the appointment
    result = db.create_appointment(
        business_id=appointment.business_id,
        customer_name=appointment.customer_name,
        customer_phone=appointment.customer_phone,
        customer_email=appointment.customer_email,
        appointment_date=appointment.appointment_date,
        appointment_time=appointment.appointment_time,
        duration_minutes=appointment.duration_minutes,
        service_type=appointment.service_type,
        notes=appointment.notes,
        conversation_id=appointment.conversation_id,
    )

    if not result:
        raise HTTPException(status_code=500, detail="Failed to create appointment")

    return result


@router.get("", response_model=list[AppointmentResponse])
async def list_appointments(
    business_id: str,
    status: Optional[str] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    authorization: Optional[str] = Header(None),
):
    """
    List appointments for a business.
    Requires authentication.
    """
    user_id = get_user_id_from_header(authorization)

    # Verify business ownership
    business = db.get_business(business_id)
    if not business:
        raise HTTPException(status_code=404, detail="Business not found")
    if business["user_id"] != user_id and not is_platform_admin(user_id):
        raise HTTPException(status_code=403, detail="Not authorized to access this business")

    return db.get_appointments_by_business(
        business_id=business_id,
        status=status,
        start_date=start_date,
        end_date=end_date,
    )


@router.get("/{appointment_id}", response_model=AppointmentResponse)
async def get_appointment(
    appointment_id: str,
    authorization: Optional[str] = Header(None),
):
    """Get an appointment by ID."""
    user_id = get_user_id_from_header(authorization)

    appointment = db.get_appointment(appointment_id)
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")

    # Verify business ownership
    business = db.get_business(appointment["business_id"])
    if not business or (business["user_id"] != user_id and not is_platform_admin(user_id)):
        raise HTTPException(status_code=403, detail="Not authorized to access this appointment")

    return appointment


@router.patch("/{appointment_id}", response_model=AppointmentResponse)
async def update_appointment(
    appointment_id: str,
    updates: AppointmentUpdate,
    authorization: Optional[str] = Header(None),
):
    """
    Update an appointment.
    Can be used to confirm, cancel, or reschedule appointments.
    """
    user_id = get_user_id_from_header(authorization)

    # Get and verify ownership
    appointment = db.get_appointment(appointment_id)
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")

    business = db.get_business(appointment["business_id"])
    if not business or (business["user_id"] != user_id and not is_platform_admin(user_id)):
        raise HTTPException(status_code=403, detail="Not authorized to update this appointment")

    # Build update dict
    update_data = {k: v for k, v in updates.model_dump().items() if v is not None}

    # Track what changed for notifications
    old_status = appointment.get("status")
    old_date = appointment.get("appointment_date")
    old_time = appointment.get("appointment_time")

    if "status" in update_data:
        update_data["status"] = update_data["status"].value

    if not update_data:
        return appointment

    result = db.update_appointment(appointment_id, update_data)

    # Send notifications based on what changed
    notification_service = get_notification_service()

    # Check if appointment was cancelled
    new_status = update_data.get("status")
    if new_status == "cancelled" and old_status != "cancelled":
        try:
            notification_service.send_appointment_cancellation(
                appointment_id=appointment_id,
                business_id=appointment["business_id"],
                customer_name=appointment["customer_name"],
                customer_email=appointment.get("customer_email"),
                customer_phone=appointment["customer_phone"],
                business_name=business["name"],
                appointment_date=appointment["appointment_date"],
                appointment_time=appointment["appointment_time"],
                language=business.get("language", "fr"),
            )
        except Exception as e:
            print(f"Failed to send cancellation notification: {e}")

    # Check if appointment was rescheduled (date or time changed)
    new_date = update_data.get("appointment_date")
    new_time = update_data.get("appointment_time")
    is_rescheduled = (new_date and new_date != old_date) or (new_time and new_time != old_time)

    if is_rescheduled and new_status != "cancelled":
        try:
            notification_service.send_appointment_update(
                appointment_id=appointment_id,
                business_id=appointment["business_id"],
                customer_name=appointment["customer_name"],
                customer_email=appointment.get("customer_email"),
                customer_phone=appointment["customer_phone"],
                business_name=business["name"],
                old_date=old_date,
                old_time=old_time,
                new_date=new_date or old_date,
                new_time=new_time or old_time,
                duration_minutes=result.get("duration_minutes", 60),
                language=business.get("language", "fr"),
            )
        except Exception as e:
            print(f"Failed to send update notification: {e}")

    return result


@router.delete("/{appointment_id}")
async def delete_appointment(
    appointment_id: str,
    authorization: Optional[str] = Header(None),
):
    """Delete an appointment."""
    user_id = get_user_id_from_header(authorization)

    # Get and verify ownership
    appointment = db.get_appointment(appointment_id)
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")

    business = db.get_business(appointment["business_id"])
    if not business or (business["user_id"] != user_id and not is_platform_admin(user_id)):
        raise HTTPException(status_code=403, detail="Not authorized to delete this appointment")

    success = db.delete_appointment(appointment_id)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to delete appointment")

    return {"status": "success", "message": "Appointment deleted"}


# --- Availability Endpoints ---

@router.get("/availability/{business_id}", response_model=BusinessAvailabilityResponse)
async def get_business_availability(business_id: str):
    """
    Get business availability settings.
    This is public so the widget can check availability.
    """
    business = db.get_business(business_id)
    if not business:
        raise HTTPException(status_code=404, detail="Business not found")

    availability = db.get_business_availability(business_id)
    if not availability:
        # Return default availability
        raise HTTPException(
            status_code=404,
            detail="Availability not configured for this business"
        )

    return availability


@router.put("/availability/{business_id}", response_model=BusinessAvailabilityResponse)
async def update_business_availability(
    business_id: str,
    availability: BusinessAvailabilityUpdate,
    authorization: Optional[str] = Header(None),
):
    """Update business availability settings."""
    user_id = get_user_id_from_header(authorization)

    # Verify business ownership
    business = db.get_business(business_id)
    if not business:
        raise HTTPException(status_code=404, detail="Business not found")
    if business["user_id"] != user_id and not is_platform_admin(user_id):
        raise HTTPException(status_code=403, detail="Not authorized to update this business")

    # Build availability dict
    availability_data = {}
    if availability.weekly_schedule is not None:
        availability_data["weekly_schedule"] = availability.weekly_schedule.model_dump()
    if availability.default_duration_minutes is not None:
        availability_data["default_duration_minutes"] = availability.default_duration_minutes
    if availability.buffer_minutes is not None:
        availability_data["buffer_minutes"] = availability.buffer_minutes
    if availability.timezone is not None:
        availability_data["timezone"] = availability.timezone

    result = db.upsert_business_availability(business_id, availability_data)
    return result


@router.get("/availability/{business_id}/slots", response_model=list[AvailableSlot])
async def get_available_slots(
    business_id: str,
    start_date: str,
    days: int = 7,
):
    """
    Get available time slots for booking.
    Returns available slots for the next N days starting from start_date.
    """
    business = db.get_business(business_id)
    if not business:
        raise HTTPException(status_code=404, detail="Business not found")

    availability = db.get_business_availability(business_id)
    if not availability:
        raise HTTPException(
            status_code=404,
            detail="Availability not configured for this business"
        )

    # Parse start date
    try:
        start = datetime.strptime(start_date, "%Y-%m-%d").date()
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")

    # Get existing appointments
    end_date_str = (start + timedelta(days=days)).strftime("%Y-%m-%d")
    existing_appointments = db.get_appointments_by_business(
        business_id=business_id,
        start_date=start_date,
        end_date=end_date_str,
        status="pending",  # Only check pending and confirmed
    )
    confirmed_appointments = db.get_appointments_by_business(
        business_id=business_id,
        start_date=start_date,
        end_date=end_date_str,
        status="confirmed",
    )
    existing_appointments.extend(confirmed_appointments)

    # Build list of available slots
    available_slots = []
    weekly_schedule = availability["weekly_schedule"]
    duration = availability["default_duration_minutes"]
    buffer = availability["buffer_minutes"]

    for day_offset in range(days):
        current_date = start + timedelta(days=day_offset)
        day_name = current_date.strftime("%A").lower()

        # Check if this day is enabled
        if day_name not in weekly_schedule or not weekly_schedule[day_name]["enabled"]:
            continue

        day_slots = weekly_schedule[day_name].get("slots", [])
        for slot in day_slots:
            slot_start = datetime.strptime(slot["start"], "%H:%M").time()
            slot_end = datetime.strptime(slot["end"], "%H:%M").time()

            # Generate time slots within this range
            current_time = datetime.combine(current_date, slot_start)
            end_time = datetime.combine(current_date, slot_end)

            while current_time + timedelta(minutes=duration) <= end_time:
                time_str = current_time.strftime("%H:%M")

                # Check if this slot is already booked
                is_booked = False
                for appt in existing_appointments:
                    if appt["appointment_date"] == current_date.strftime("%Y-%m-%d"):
                        appt_time = datetime.strptime(appt["appointment_time"], "%H:%M:%S").time()
                        appt_datetime = datetime.combine(current_date, appt_time)
                        appt_end = appt_datetime + timedelta(minutes=appt["duration_minutes"])

                        # Check for overlap
                        if current_time < appt_end and current_time + timedelta(minutes=duration) > appt_datetime:
                            is_booked = True
                            break

                if not is_booked:
                    available_slots.append(
                        AvailableSlot(
                            date=current_date.strftime("%Y-%m-%d"),
                            time=time_str,
                            duration_minutes=duration,
                        )
                    )

                # Move to next slot (duration + buffer)
                current_time += timedelta(minutes=duration + buffer)

    return available_slots


@router.get("/customer/{business_id}/phone/{phone}", response_model=list[AppointmentResponse])
async def get_customer_appointments(business_id: str, phone: str):
    """
    Get appointments for a customer by phone number.
    This is public so customers can check their appointments from the widget.
    """
    business = db.get_business(business_id)
    if not business:
        raise HTTPException(status_code=404, detail="Business not found")

    return db.get_appointments_by_phone(business_id, phone)
