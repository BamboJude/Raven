"""
Chat API endpoints.
Handles chat interactions between customers and the AI chatbot.
"""

import re
from fastapi import APIRouter, HTTPException
from datetime import datetime, timezone, timedelta

from app.models.schemas import ChatRequest, ChatResponse, ConversationWithMessages, ConversationRating, TranscriptRequest
from app.services.database import db
from app.services.ai import get_ai_service
from app.services.notifications import get_notification_service
from app.services.email import get_email_service

router = APIRouter()


def get_available_slots_for_chat(business_id: str, days: int = 5) -> list[dict]:
    """
    Get available time slots for the next N days.
    Returns a simplified list of slots for the AI to present.
    """
    availability = db.get_business_availability(business_id)
    if not availability:
        return []

    start = datetime.now().date()
    end_date = start + timedelta(days=days)

    # Get existing appointments
    existing_appointments = db.get_appointments_by_business(
        business_id=business_id,
        start_date=start.strftime("%Y-%m-%d"),
        end_date=end_date.strftime("%Y-%m-%d"),
        status="pending",
    )
    confirmed = db.get_appointments_by_business(
        business_id=business_id,
        start_date=start.strftime("%Y-%m-%d"),
        end_date=end_date.strftime("%Y-%m-%d"),
        status="confirmed",
    )
    existing_appointments.extend(confirmed)

    # Build list of available slots
    available_slots = []
    weekly_schedule = availability["weekly_schedule"]
    duration = availability["default_duration_minutes"]
    buffer = availability["buffer_minutes"]

    for day_offset in range(days):
        current_date = start + timedelta(days=day_offset)
        day_name = current_date.strftime("%A").lower()

        if day_name not in weekly_schedule or not weekly_schedule[day_name]["enabled"]:
            continue

        day_slots = weekly_schedule[day_name].get("slots", [])
        for slot in day_slots:
            slot_start = datetime.strptime(slot["start"], "%H:%M").time()
            slot_end = datetime.strptime(slot["end"], "%H:%M").time()

            current_time = datetime.combine(current_date, slot_start)
            end_time = datetime.combine(current_date, slot_end)

            while current_time + timedelta(minutes=duration) <= end_time:
                time_str = current_time.strftime("%H:%M")

                # Check if slot is booked
                is_booked = False
                for appt in existing_appointments:
                    if appt["appointment_date"] == current_date.strftime("%Y-%m-%d"):
                        try:
                            appt_time = datetime.strptime(appt["appointment_time"], "%H:%M:%S").time()
                        except ValueError:
                            appt_time = datetime.strptime(appt["appointment_time"], "%H:%M").time()
                        appt_datetime = datetime.combine(current_date, appt_time)
                        appt_end = appt_datetime + timedelta(minutes=appt["duration_minutes"])

                        if current_time < appt_end and current_time + timedelta(minutes=duration) > appt_datetime:
                            is_booked = True
                            break

                if not is_booked:
                    available_slots.append({
                        "date": current_date.strftime("%Y-%m-%d"),
                        "time": time_str,
                        "duration_minutes": duration,
                        "display_date": current_date.strftime("%A %d %B"),  # e.g., "Monday 04 February"
                    })

                current_time += timedelta(minutes=duration + buffer)

    # Return only first 10 slots to keep response manageable
    return available_slots[:10]


@router.post("", response_model=ChatResponse)
async def send_message(request: ChatRequest):
    """
    Send a message to the chatbot and get a response.
    This endpoint is called by the chat widget.
    """
    # Get the business and its config
    business = db.get_business(request.business_id)
    if not business:
        raise HTTPException(status_code=404, detail="Business not found")

    config = db.get_business_config(request.business_id)
    business["config"] = config

    # Get or create conversation
    conversation_id = request.conversation_id
    if not conversation_id:
        # Create new conversation
        conversation = db.create_conversation(
            business_id=request.business_id,
            visitor_id=request.visitor_id,
            channel="widget",
        )
        if not conversation:
            raise HTTPException(status_code=500, detail="Failed to create conversation")
        conversation_id = conversation["id"]

        # Save visitor info from lead capture form if provided
        if any([request.visitor_name, request.visitor_email, request.visitor_phone]):
            db.update_conversation_visitor_info(
                conversation_id=conversation_id,
                visitor_name=request.visitor_name,
                visitor_email=request.visitor_email,
                visitor_phone=request.visitor_phone,
            )

        # Persist the welcome message that the widget already displayed locally.
        # Without this the AI has no prior context and repeats the greeting.
        lang = business.get("language", "fr")
        if lang == "en":
            welcome = config.get("welcome_message_en", "Hello! How can I help you?") if config else "Hello! How can I help you?"
        else:
            welcome = config.get("welcome_message", "Bonjour! Comment puis-je vous aider?") if config else "Bonjour! Comment puis-je vous aider?"
        db.create_message(conversation_id=conversation_id, role="assistant", content=welcome)
    else:
        # Verify conversation exists and belongs to this business
        conversation = db.get_conversation(conversation_id)
        if not conversation:
            raise HTTPException(status_code=404, detail="Conversation not found")
        if conversation["business_id"] != request.business_id:
            raise HTTPException(status_code=403, detail="Conversation doesn't belong to this business")

    # Save the user message with optional media
    media_data = None
    if request.media:
        media_data = [m.model_dump() for m in request.media]

    db.create_message(
        conversation_id=conversation_id,
        role="user",
        content=request.message,
        media=media_data,
    )

    # Check if conversation is in human takeover mode
    # If so, skip AI response - human agent will respond via dashboard
    if conversation and conversation.get("is_human_takeover"):
        print(f"🙋 Conversation {conversation_id} is in human takeover mode - skipping AI")
        db.update_conversation_timestamp(conversation_id)

        # Return acknowledgment that message was received
        lang = business.get("language", "fr")
        if lang == "fr":
            waiting_msg = "Message reçu. Un conseiller vous répondra sous peu."
        else:
            waiting_msg = "Message received. An agent will respond shortly."

        return ChatResponse(
            conversation_id=conversation_id,
            message=waiting_msg,
            created_at=datetime.now(timezone.utc),
            is_human_takeover=True,
        )

    # Check if business has appointment booking enabled
    availability = db.get_business_availability(request.business_id)
    has_appointments = availability is not None

    # Get conversation history for context with media support
    messages = db.get_conversation_messages(conversation_id)
    message_history = [
        {
            "role": m["role"],
            "content": m["content"],
            "media": m.get("media")  # Include media for vision processing
        }
        for m in messages
    ]

    # Check if user wants to end the conversation
    # Only match these as standalone responses, not as part of longer sentences
    closing_keywords_fr = ["non merci", "rien d'autre", "c'est tout", "au revoir", "merci c'est tout"]
    closing_keywords_en = ["no thanks", "no thank you", "nothing else", "that's all", "goodbye"]

    # Exact matches only (with optional punctuation)
    closing_exact_fr = ["non", "rien", "bye"]
    closing_exact_en = ["no", "nothing", "bye"]

    user_message_lower = request.message.lower().strip().rstrip('.,!?')

    # Check for phrase matches (substring)
    is_closing = any(keyword in user_message_lower for keyword in closing_keywords_fr + closing_keywords_en)

    # Check for exact matches only if message is very short (to avoid false positives)
    if not is_closing and len(user_message_lower.split()) <= 2:
        is_closing = user_message_lower in (closing_exact_fr + closing_exact_en)

    # Fetch available slots if appointments are enabled
    available_slots = []
    if has_appointments:
        available_slots = get_available_slots_for_chat(request.business_id, days=5)

    # Generate AI response (or closing message if user wants to end)
    try:
        if is_closing:
            # User wants to end conversation - send friendly closing message
            if business["language"] == "fr":
                ai_response = "Merci d'avoir contacté " + business["name"] + " ! N'hésitez pas à revenir si vous avez besoin d'aide. À bientôt ! 👋"
            else:
                ai_response = "Thank you for contacting " + business["name"] + "! Feel free to come back if you need help. See you soon! 👋"
        else:
            ai_response = get_ai_service().generate_response(
                messages=message_history,
                business_context=business,
                has_appointments=has_appointments,
                available_slots=available_slots,
            )
    except Exception as e:
        print(f"AI error: {e}")
        ai_response = "Désolé, je rencontre un problème technique. Veuillez réessayer ou contacter l'entreprise directement."

    # Check for appointment booking intent and auto-create if ready.
    # Trigger if the current message signals intent OR if recent messages in the
    # conversation already established a booking flow (user is now providing
    # name/email or selecting a slot).
    appointment_intent = False
    appointment_info = None
    appointment_created = False
    is_fresh_booking_request = False

    if has_appointments:
        # Check if the CURRENT message is a fresh booking request
        if get_ai_service().detect_appointment_intent(request.message, business["language"]):
            appointment_intent = True
            is_fresh_booking_request = True
            print(f"🔔 Appointment intent detected in current message: {request.message[:50]}...")
        else:
            # Check last 4 messages for prior booking intent (conversation context)
            for m in message_history[-4:]:
                if get_ai_service().detect_appointment_intent(m["content"], business["language"]):
                    appointment_intent = True
                    print(f"🔔 Appointment intent found in conversation history")
                    break

    if appointment_intent:
        print(f"📅 Processing appointment booking flow...")
        # Find the most recent fresh booking request to determine where to start extracting
        # This prevents "Hi Raven" from greetings being extracted as names
        booking_flow_start_index = 0
        if is_fresh_booking_request:
            # Current message is the fresh request - extract from messages AFTER this
            booking_flow_start_index = len(message_history)  # Start from next message (none yet)
        else:
            # Find the most recent message with appointment intent in last 4 messages
            # This marks the start of the current booking flow
            for i in range(len(message_history) - 1, max(0, len(message_history) - 5), -1):
                msg = message_history[i]
                if msg["role"] == "user" and get_ai_service().detect_appointment_intent(msg["content"], business["language"]):
                    booking_flow_start_index = i + 1  # Extract from messages AFTER the request
                    break

        # Extract only from messages in the current booking flow (after the request)
        booking_flow_messages = message_history[booking_flow_start_index:] if booking_flow_start_index < len(message_history) else []

        if booking_flow_messages:
            appointment_info = get_ai_service().extract_appointment_info(booking_flow_messages, available_slots)
            print(f"📋 Extracted appointment info: name={appointment_info.get('name')}, email={appointment_info.get('email')}, date={appointment_info.get('date')}, time={appointment_info.get('time')}")
        else:
            # No messages yet after the booking request - start empty
            appointment_info = {
                "name": None,
                "phone": None,
                "email": None,
                "date": None,
                "time": None,
                "service": None,
                "notes": None,
            }
            print(f"⏳ No booking flow messages yet - waiting for customer info")

        # Check if we have minimum required info (name, email, date, time) - phone is optional
        if all([appointment_info.get("name"), appointment_info.get("email"),
                appointment_info.get("date"), appointment_info.get("time")]):
            print(f"✅ All required info present - creating appointment...")
            try:
                # Create the appointment
                appointment = db.create_appointment(
                    business_id=request.business_id,
                    customer_name=appointment_info["name"],
                    customer_email=appointment_info["email"],  # Required field
                    appointment_date=appointment_info["date"],
                    appointment_time=appointment_info["time"],
                    customer_phone=appointment_info.get("phone"),  # Optional field
                    service_type=appointment_info.get("service"),
                    notes=appointment_info.get("notes"),
                    duration_minutes=availability.get("default_duration_minutes", 60) if availability else 60,
                    conversation_id=conversation_id,
                )

                if appointment:
                    appointment_created = True
                    print(f"🎉 Appointment created successfully! ID: {appointment['id']}")
                    # Send confirmation notifications (email/SMS)
                else:
                    print(f"❌ Appointment creation returned None - check database constraints")
                    try:
                        notification_service = get_notification_service()
                        notification_service.send_appointment_confirmation(
                            appointment_id=appointment["id"],
                            business_id=request.business_id,
                            customer_name=appointment_info["name"],
                            customer_email=appointment_info.get("email"),
                            customer_phone=appointment_info["phone"],
                            business_name=business["name"],
                            appointment_date=appointment_info["date"],
                            appointment_time=appointment_info["time"],
                            duration_minutes=appointment.get("duration_minutes", 60),
                            service_type=appointment_info.get("service"),
                            notes=appointment_info.get("notes"),
                            language=business.get("language", "fr"),
                        )
                    except Exception as e:
                        print(f"Failed to send notifications: {e}")
                        # Don't fail the appointment, just log it

                    # Append confirmation to AI response with follow-up question
                    if business["language"] == "fr":
                        ai_response += f"\n\n✅ Rendez-vous confirmé pour le {appointment_info['date']} à {appointment_info['time']}. Nous vous enverrons un rappel.\n\nY a-t-il autre chose avec laquelle je peux vous aider ?"
                    else:
                        ai_response += f"\n\n✅ Appointment confirmed for {appointment_info['date']} at {appointment_info['time']}. We'll send you a reminder.\n\nIs there anything else I can help you with?"
            except Exception as e:
                print(f"❌ APPOINTMENT CREATION ERROR: {type(e).__name__}: {e}")
                import traceback
                traceback.print_exc()
                # Don't fail the chat, just log it
        else:
            missing = []
            if not appointment_info.get("name"): missing.append("name")
            if not appointment_info.get("email"): missing.append("email")
            if not appointment_info.get("date"): missing.append("date")
            if not appointment_info.get("time"): missing.append("time")
            print(f"⚠️  Missing required info: {', '.join(missing)}")

    # Save the AI response
    db.create_message(
        conversation_id=conversation_id,
        role="assistant",
        content=ai_response,
    )

    # Update conversation timestamp
    db.update_conversation_timestamp(conversation_id)

    # Return slot buttons only when:
    # 1. Appointment intent is active
    # 2. We have available slots
    # 3. No slot has been selected yet AND no appointment has been created
    response_slots = None
    slot_selected = False

    # Check if a slot was selected by seeing if extracted date/time matches an available slot
    if appointment_intent and appointment_info and available_slots:
        extracted_date = appointment_info.get("date")
        extracted_time = appointment_info.get("time")
        if extracted_date and extracted_time:
            # Check if this matches any available slot
            for slot in available_slots:
                if slot["date"] == extracted_date and slot["time"] == extracted_time:
                    slot_selected = True
                    break

    # Show slot buttons only if no slot selected and no appointment created
    if appointment_intent and available_slots and not slot_selected and not appointment_created:
        response_slots = [
            {
                "id": i + 1,
                "date": slot["date"],
                "time": slot["time"],
                "display": f"{slot['display_date']} at {slot['time']}" if business["language"] == "en" else f"{slot['display_date']} à {slot['time']}"
            }
            for i, slot in enumerate(available_slots)
        ]

    # Detect goodbye phrases to close the chat
    # Only close if it's a simple goodbye (short message) or appointment was just confirmed
    goodbye_patterns = [
        r"\b(bye|goodbye|au revoir|à bientôt|a bientot|ciao|see you|ok bye|ok thanks)\b",
        r"^(merci|thank you|thanks|merci beaucoup|thanks a lot)[\s!.]*$",  # Only if "thanks" is the entire message
    ]
    should_close = False
    msg_lower = request.message.lower().strip()

    # Check if message is a simple goodbye (short and matches pattern)
    is_short_message = len(msg_lower) < 30  # Short messages are likely just goodbyes
    for pattern in goodbye_patterns:
        if re.search(pattern, msg_lower, re.IGNORECASE):
            # Only close if: (1) message is short/simple goodbye, OR (2) appointment was just created
            if is_short_message or appointment_created:
                should_close = True
                break

    return ChatResponse(
        conversation_id=conversation_id,
        message=ai_response,
        created_at=datetime.now(timezone.utc),
        available_slots=response_slots,
        should_close=should_close,
    )


@router.get("/conversation/{conversation_id}", response_model=ConversationWithMessages)
async def get_conversation(conversation_id: str):
    """
    Get a conversation with all its messages.
    Used by the dashboard to view conversation history.
    """
    conversation = db.get_conversation(conversation_id)
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")

    messages = db.get_conversation_messages(conversation_id)
    conversation["messages"] = [
        {
            "role": m["role"],
            "content": m["content"],
            "media": m.get("media"),
        }
        for m in messages
    ]

    return conversation


@router.get("/business/{business_id}/public")
async def get_business_public_info(business_id: str):
    """
    Get public business info for the widget.
    Returns only what's needed to initialize the chat widget.
    """
    business = db.get_business(business_id)
    if not business:
        raise HTTPException(status_code=404, detail="Business not found")

    config = db.get_business_config(business_id)

    # Default widget settings
    default_widget_settings = {
        "primary_color": "#0ea5e9",
        "position": "bottom-right",
        "welcome_message_language": "auto"
    }

    widget_settings = config.get("widget_settings", default_widget_settings) if config else default_widget_settings

    # Compute online status
    is_online = True
    away_message = ""
    away_message_en = ""

    if config:
        # Check manual away first
        if config.get("manual_away", False):
            is_online = False
        away_message = config.get("away_message", "Nous sommes actuellement indisponibles. Laissez-nous un message et nous vous recontacterons.")
        away_message_en = config.get("away_message_en", "We are currently unavailable. Leave us a message and we will get back to you.")

    if is_online:
        # Check business availability schedule
        availability = db.get_business_availability(business_id)
        if availability:
            try:
                from zoneinfo import ZoneInfo
            except ImportError:
                from backports.zoneinfo import ZoneInfo
            tz_name = availability.get("timezone", "Africa/Douala")
            try:
                tz = ZoneInfo(tz_name)
            except Exception:
                tz = ZoneInfo("Africa/Douala")
            now = datetime.now(tz)
            day_name = now.strftime("%A").lower()
            schedule = availability.get("weekly_schedule", {})
            day_schedule = schedule.get(day_name, {})
            if not day_schedule.get("enabled", True):
                is_online = False
            else:
                # Check if current time is within any slot
                current_time = now.strftime("%H:%M")
                slots = day_schedule.get("slots", [])
                if slots:
                    in_slot = False
                    for slot in slots:
                        if slot.get("start", "00:00") <= current_time <= slot.get("end", "23:59"):
                            in_slot = True
                            break
                    if not in_slot:
                        is_online = False

    # Lead capture config
    lead_capture_config = None
    if config and config.get("lead_capture_config"):
        lead_capture_config = config["lead_capture_config"]

    return {
        "business_id": business["id"],
        "name": business["name"],
        "welcome_message": config.get("welcome_message", "Bonjour! Comment puis-je vous aider?") if config else "Bonjour! Comment puis-je vous aider?",
        "welcome_message_en": config.get("welcome_message_en", "Hello! How can I help you?") if config else "Hello! How can I help you?",
        "language": business["language"],
        "widget_settings": widget_settings,
        "is_online": is_online,
        "away_message": away_message,
        "away_message_en": away_message_en,
        "lead_capture_config": lead_capture_config,
    }


@router.post("/conversation/{conversation_id}/rate")
async def rate_conversation(conversation_id: str, rating_data: ConversationRating):
    """Rate a conversation (thumbs up/down). Called by the widget."""
    conversation = db.get_conversation(conversation_id)
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")

    if rating_data.rating not in ("positive", "negative"):
        raise HTTPException(status_code=400, detail="Rating must be 'positive' or 'negative'")

    result = db.rate_conversation(
        conversation_id=conversation_id,
        rating=rating_data.rating,
        comment=rating_data.comment,
    )

    if not result:
        raise HTTPException(status_code=500, detail="Failed to rate conversation")

    return {"status": "success", "rating": rating_data.rating}


@router.post("/conversation/{conversation_id}/transcript")
async def email_transcript(conversation_id: str, request: TranscriptRequest):
    """Email a chat transcript to the visitor. Called by the widget."""
    conversation = db.get_conversation(conversation_id)
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")

    # Get business info
    business = db.get_business(conversation["business_id"])
    if not business:
        raise HTTPException(status_code=404, detail="Business not found")

    # Get messages
    messages = db.get_conversation_messages(conversation_id, limit=200)

    # Send transcript email
    email_service = get_email_service()
    result = email_service.send_transcript_email(
        to_email=request.email,
        business_name=business["name"],
        messages=messages,
        language=business.get("language", "fr"),
    )

    if not result.get("success"):
        raise HTTPException(status_code=500, detail=result.get("error", "Failed to send email"))

    return {"status": "success", "message_id": result.get("message_id")}
