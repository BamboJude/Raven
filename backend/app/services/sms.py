"""
SMS Service - Twilio integration for sending SMS notifications.
Handles appointment confirmation, reminders, and cancellation messages.
"""

import os
from typing import Optional
from datetime import datetime
from twilio.rest import Client
from twilio.base.exceptions import TwilioRestException


class SMSService:
    """Service for sending SMS using Twilio."""

    def __init__(self):
        """Initialize Twilio client from environment."""
        self.account_sid = os.getenv("TWILIO_ACCOUNT_SID")
        self.auth_token = os.getenv("TWILIO_AUTH_TOKEN")
        self.from_number = os.getenv("TWILIO_PHONE_NUMBER")

        self.enabled = bool(
            self.account_sid and
            self.auth_token and
            self.from_number and
            os.getenv("ENABLE_SMS_NOTIFICATIONS", "true").lower() == "true"
        )

        if self.enabled:
            self.client = Client(self.account_sid, self.auth_token)
        else:
            self.client = None

    def _format_date(self, date_str: str, language: str = "fr") -> str:
        """Format date for SMS display (short format)."""
        try:
            date = datetime.strptime(date_str, "%Y-%m-%d")
            if language == "fr":
                return date.strftime("%d/%m/%Y")
            else:
                return date.strftime("%m/%d/%Y")
        except:
            return date_str

    def send_confirmation_sms(
        self,
        to_phone: str,
        business_name: str,
        appointment_date: str,
        appointment_time: str,
        language: str = "fr",
        from_phone: Optional[str] = None,
    ) -> dict:
        """
        Send appointment confirmation SMS.

        Returns:
            dict with 'success' (bool), 'message_id' (str), and 'error' (str) if failed
        """
        if not self.enabled:
            return {"success": False, "error": "SMS service not enabled"}

        try:
            formatted_date = self._format_date(appointment_date, language)

            # Craft message (keep under 160 chars)
            if language == "fr":
                message = (
                    f"{business_name}: Rendez-vous confirmé le {formatted_date} "
                    f"à {appointment_time}. À bientôt!"
                )
            else:
                message = (
                    f"{business_name}: Appointment confirmed for {formatted_date} "
                    f"at {appointment_time}. See you then!"
                )

            # Send via Twilio
            twilio_message = self.client.messages.create(
                body=message,
                from_=from_phone or self.from_number,
                to=to_phone
            )

            return {
                "success": True,
                "message_id": twilio_message.sid,
                "provider": "twilio"
            }

        except TwilioRestException as e:
            return {
                "success": False,
                "error": f"Twilio error: {e.msg}"
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }

    def send_reminder_sms(
        self,
        to_phone: str,
        business_name: str,
        appointment_date: str,
        appointment_time: str,
        hours_before: int = 24,
        language: str = "fr",
        from_phone: Optional[str] = None,
    ) -> dict:
        """
        Send appointment reminder SMS.

        Args:
            hours_before: Hours before appointment (24 or 1)
        """
        if not self.enabled:
            return {"success": False, "error": "SMS service not enabled"}

        try:
            formatted_date = self._format_date(appointment_date, language)

            # Craft reminder message
            if language == "fr":
                if hours_before == 24:
                    message = (
                        f"Rappel: Rendez-vous demain à {appointment_time} "
                        f"chez {business_name}."
                    )
                else:
                    message = (
                        f"Rappel: Rendez-vous dans {hours_before}h "
                        f"chez {business_name}."
                    )
            else:
                if hours_before == 24:
                    message = (
                        f"Reminder: Appointment tomorrow at {appointment_time} "
                        f"with {business_name}."
                    )
                else:
                    message = (
                        f"Reminder: Appointment in {hours_before}h "
                        f"with {business_name}."
                    )

            twilio_message = self.client.messages.create(
                body=message,
                from_=from_phone or self.from_number,
                to=to_phone
            )

            return {
                "success": True,
                "message_id": twilio_message.sid,
                "provider": "twilio"
            }

        except TwilioRestException as e:
            return {
                "success": False,
                "error": f"Twilio error: {e.msg}"
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }

    def send_cancellation_sms(
        self,
        to_phone: str,
        business_name: str,
        appointment_date: str,
        appointment_time: str,
        language: str = "fr",
        from_phone: Optional[str] = None,
    ) -> dict:
        """Send appointment cancellation SMS."""
        if not self.enabled:
            return {"success": False, "error": "SMS service not enabled"}

        try:
            formatted_date = self._format_date(appointment_date, language)

            if language == "fr":
                message = (
                    f"{business_name}: Votre rendez-vous du {formatted_date} "
                    f"à {appointment_time} a été annulé."
                )
            else:
                message = (
                    f"{business_name}: Your appointment on {formatted_date} "
                    f"at {appointment_time} has been cancelled."
                )

            twilio_message = self.client.messages.create(
                body=message,
                from_=from_phone or self.from_number,
                to=to_phone
            )

            return {
                "success": True,
                "message_id": twilio_message.sid,
                "provider": "twilio"
            }

        except TwilioRestException as e:
            return {
                "success": False,
                "error": f"Twilio error: {e.msg}"
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }

    def send_update_sms(
        self,
        to_phone: str,
        business_name: str,
        new_date: str,
        new_time: str,
        language: str = "fr",
        from_phone: Optional[str] = None,
    ) -> dict:
        """Send appointment reschedule/update SMS."""
        if not self.enabled:
            return {"success": False, "error": "SMS service not enabled"}

        try:
            formatted_date = self._format_date(new_date, language)

            if language == "fr":
                message = (
                    f"{business_name}: Votre rendez-vous a été modifié. "
                    f"Nouveau créneau: {formatted_date} à {new_time}."
                )
            else:
                message = (
                    f"{business_name}: Your appointment has been rescheduled. "
                    f"New time: {formatted_date} at {new_time}."
                )

            twilio_message = self.client.messages.create(
                body=message,
                from_=from_phone or self.from_number,
                to=to_phone
            )

            return {
                "success": True,
                "message_id": twilio_message.sid,
                "provider": "twilio"
            }

        except TwilioRestException as e:
            return {
                "success": False,
                "error": f"Twilio error: {e.msg}"
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }


# Singleton instance
_sms_service = None

def get_sms_service() -> SMSService:
    """Get or create the SMS service instance."""
    global _sms_service
    if _sms_service is None:
        _sms_service = SMSService()
    return _sms_service
