"""
WhatsApp service using Twilio API.
Handles sending and receiving WhatsApp messages.
"""

from twilio.rest import Client
from twilio.request_validator import RequestValidator
from app.config import get_settings

settings = get_settings()


class WhatsAppService:
    """Service for WhatsApp messaging via Twilio."""

    def __init__(self):
        if settings.twilio_account_sid and settings.twilio_auth_token:
            self.client = Client(settings.twilio_account_sid, settings.twilio_auth_token)
            self.validator = RequestValidator(settings.twilio_auth_token)
        else:
            self.client = None
            self.validator = None
        self.from_number = settings.twilio_whatsapp_number

    def is_configured(self) -> bool:
        """Check if Twilio is configured."""
        return self.client is not None and bool(self.from_number)

    def send_message(self, to: str, body: str) -> dict:
        """
        Send a WhatsApp message.

        Args:
            to: Recipient phone number (e.g., "whatsapp:+237xxxxxxxxx")
            body: Message text

        Returns:
            Message SID and status
        """
        if not self.is_configured():
            raise RuntimeError("Twilio WhatsApp is not configured")

        # Ensure proper WhatsApp format
        if not to.startswith("whatsapp:"):
            to = f"whatsapp:{to}"

        message = self.client.messages.create(
            body=body,
            from_=self.from_number,
            to=to
        )

        return {
            "sid": message.sid,
            "status": message.status
        }

    def validate_request(self, url: str, params: dict, signature: str) -> bool:
        """
        Validate that a request came from Twilio.

        Args:
            url: The full URL of the request
            params: The POST parameters
            signature: The X-Twilio-Signature header

        Returns:
            True if valid, False otherwise
        """
        if not self.validator:
            return False
        return self.validator.validate(url, params, signature)


# Singleton instance
whatsapp_service = WhatsAppService()
