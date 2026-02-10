"""
Email Service - Resend integration for sending transactional emails.
Handles appointment confirmation, reminders, and cancellation emails.
"""

from typing import Optional
from datetime import datetime
import resend
from jinja2 import Environment, FileSystemLoader, select_autoescape
from pathlib import Path

from app.config import get_settings

# Get the templates directory
TEMPLATES_DIR = Path(__file__).parent.parent / "templates" / "emails"

# Initialize Jinja2 environment
jinja_env = Environment(
    loader=FileSystemLoader(str(TEMPLATES_DIR)),
    autoescape=select_autoescape(['html', 'xml'])
)


class EmailService:
    """Service for sending emails using Resend."""

    def __init__(self):
        """Initialize Resend API key from settings."""
        settings = get_settings()
        self.api_key = settings.resend_api_key
        self.from_email = settings.resend_from_email

        print(f"📧 EmailService init: API key present = {bool(self.api_key)}")
        print(f"📧 EmailService init: API key starts with = {self.api_key[:10] if self.api_key else 'None'}...")

        if self.api_key:
            resend.api_key = self.api_key

        self.enabled = bool(self.api_key)
        print(f"📧 EmailService init: enabled = {self.enabled}")

    def _render_template(self, template_name: str, context: dict) -> str:
        """Render an email template with context."""
        template = jinja_env.get_template(template_name)
        return template.render(**context)

    def _format_date(self, date_str: str, language: str = "fr") -> str:
        """Format date for display."""
        try:
            date = datetime.strptime(date_str, "%Y-%m-%d")
            if language == "fr":
                months_fr = [
                    "janvier", "février", "mars", "avril", "mai", "juin",
                    "juillet", "août", "septembre", "octobre", "novembre", "décembre"
                ]
                return f"{date.day} {months_fr[date.month - 1]} {date.year}"
            else:
                return date.strftime("%B %d, %Y")
        except:
            return date_str

    def send_confirmation_email(
        self,
        to_email: str,
        customer_name: str,
        business_name: str,
        appointment_date: str,
        appointment_time: str,
        duration_minutes: int,
        service_type: Optional[str] = None,
        notes: Optional[str] = None,
        language: str = "fr",
        from_name: Optional[str] = None,
        from_email: Optional[str] = None,
    ) -> dict:
        """
        Send appointment confirmation email.

        Returns:
            dict with 'success' (bool), 'message_id' (str), and 'error' (str) if failed
        """
        if not self.enabled:
            return {"success": False, "error": "Email service not enabled"}

        try:
            # Format date for display
            formatted_date = self._format_date(appointment_date, language)

            # Prepare template context
            context = {
                "customer_name": customer_name,
                "business_name": business_name,
                "appointment_date": formatted_date,
                "appointment_time": appointment_time,
                "duration_minutes": duration_minutes,
                "service_type": service_type,
                "notes": notes,
                "language": language,
            }

            # Render HTML template
            html_content = self._render_template("confirmation.html", context)

            # Subject line
            if language == "fr":
                subject = f"Confirmation de rendez-vous - {business_name}"
            else:
                subject = f"Appointment Confirmed - {business_name}"

            # Send email via Resend
            # Use configured from_email, fallback to settings.resend_from_email
            actual_from_email = from_email or self.from_email
            params = {
                "from": f"{from_name or business_name} <{actual_from_email}>",
                "to": [to_email],
                "subject": subject,
                "html": html_content,
            }
            print(f"📧 Sending email from: {from_name or business_name} <{actual_from_email}> to: {to_email}")

            response = resend.Emails.send(params)
            print(f"📧 Resend response: {response}")

            return {
                "success": True,
                "message_id": response.get("id"),
                "provider": "resend"
            }

        except Exception as e:
            print(f"📧 Email send error: {e}")
            return {
                "success": False,
                "error": str(e)
            }

    def send_reminder_email(
        self,
        to_email: str,
        customer_name: str,
        business_name: str,
        appointment_date: str,
        appointment_time: str,
        duration_minutes: int,
        service_type: Optional[str] = None,
        hours_before: int = 24,
        language: str = "fr",
        from_name: Optional[str] = None,
        from_email: Optional[str] = None,
    ) -> dict:
        """
        Send appointment reminder email.

        Args:
            hours_before: Hours before appointment (24 or 1)
        """
        if not self.enabled:
            return {"success": False, "error": "Email service not enabled"}

        try:
            formatted_date = self._format_date(appointment_date, language)

            context = {
                "customer_name": customer_name,
                "business_name": business_name,
                "appointment_date": formatted_date,
                "appointment_time": appointment_time,
                "duration_minutes": duration_minutes,
                "service_type": service_type,
                "hours_before": hours_before,
                "language": language,
            }

            html_content = self._render_template("reminder.html", context)

            if language == "fr":
                if hours_before == 24:
                    subject = f"Rappel : Rendez-vous demain - {business_name}"
                else:
                    subject = f"Rappel : Rendez-vous dans {hours_before}h - {business_name}"
            else:
                if hours_before == 24:
                    subject = f"Reminder: Appointment Tomorrow - {business_name}"
                else:
                    subject = f"Reminder: Appointment in {hours_before}h - {business_name}"

            actual_from_email = from_email or self.from_email
            params = {
                "from": f"{from_name or business_name} <{actual_from_email}>",
                "to": [to_email],
                "subject": subject,
                "html": html_content,
            }

            response = resend.Emails.send(params)

            return {
                "success": True,
                "message_id": response.get("id"),
                "provider": "resend"
            }

        except Exception as e:
            print(f"📧 Reminder email error: {e}")
            return {
                "success": False,
                "error": str(e)
            }

    def send_cancellation_email(
        self,
        to_email: str,
        customer_name: str,
        business_name: str,
        appointment_date: str,
        appointment_time: str,
        language: str = "fr",
        from_name: Optional[str] = None,
        from_email: Optional[str] = None,
    ) -> dict:
        """Send appointment cancellation email."""
        if not self.enabled:
            return {"success": False, "error": "Email service not enabled"}

        try:
            formatted_date = self._format_date(appointment_date, language)

            context = {
                "customer_name": customer_name,
                "business_name": business_name,
                "appointment_date": formatted_date,
                "appointment_time": appointment_time,
                "language": language,
            }

            html_content = self._render_template("cancellation.html", context)

            if language == "fr":
                subject = f"Rendez-vous annulé - {business_name}"
            else:
                subject = f"Appointment Cancelled - {business_name}"

            actual_from_email = from_email or self.from_email
            params = {
                "from": f"{from_name or business_name} <{actual_from_email}>",
                "to": [to_email],
                "subject": subject,
                "html": html_content,
            }

            response = resend.Emails.send(params)

            return {
                "success": True,
                "message_id": response.get("id"),
                "provider": "resend"
            }

        except Exception as e:
            print(f"📧 Cancellation email error: {e}")
            return {
                "success": False,
                "error": str(e)
            }

    def send_transcript_email(
        self,
        to_email: str,
        business_name: str,
        messages: list,
        language: str = "fr",
    ) -> dict:
        """Send a chat transcript email to the visitor."""
        if not self.enabled:
            return {"success": False, "error": "Email service not enabled"}

        try:
            context = {
                "business_name": business_name,
                "messages": messages,
                "language": language,
            }

            html_content = self._render_template("transcript.html", context)

            if language == "fr":
                subject = f"Votre conversation avec {business_name}"
            else:
                subject = f"Your conversation with {business_name}"

            params = {
                "from": f"{business_name} <{self.from_email}>",
                "to": [to_email],
                "subject": subject,
                "html": html_content,
            }

            response = resend.Emails.send(params)

            return {
                "success": True,
                "message_id": response.get("id"),
                "provider": "resend"
            }

        except Exception as e:
            print(f"📧 Transcript email error: {e}")
            return {
                "success": False,
                "error": str(e)
            }

    def send_update_email(
        self,
        to_email: str,
        customer_name: str,
        business_name: str,
        old_date: str,
        old_time: str,
        new_date: str,
        new_time: str,
        duration_minutes: int,
        language: str = "fr",
        from_name: Optional[str] = None,
        from_email: Optional[str] = None,
    ) -> dict:
        """Send appointment reschedule/update email."""
        if not self.enabled:
            return {"success": False, "error": "Email service not enabled"}

        try:
            formatted_old_date = self._format_date(old_date, language)
            formatted_new_date = self._format_date(new_date, language)

            context = {
                "customer_name": customer_name,
                "business_name": business_name,
                "old_date": formatted_old_date,
                "old_time": old_time,
                "new_date": formatted_new_date,
                "new_time": new_time,
                "duration_minutes": duration_minutes,
                "language": language,
            }

            html_content = self._render_template("update.html", context)

            if language == "fr":
                subject = f"Rendez-vous modifié - {business_name}"
            else:
                subject = f"Appointment Rescheduled - {business_name}"

            actual_from_email = from_email or self.from_email
            params = {
                "from": f"{from_name or business_name} <{actual_from_email}>",
                "to": [to_email],
                "subject": subject,
                "html": html_content,
            }

            response = resend.Emails.send(params)

            return {
                "success": True,
                "message_id": response.get("id"),
                "provider": "resend"
            }

        except Exception as e:
            print(f"📧 Update email error: {e}")
            return {
                "success": False,
                "error": str(e)
            }


# Singleton instance
_email_service = None

def get_email_service() -> EmailService:
    """Get or create the email service instance."""
    global _email_service
    if _email_service is None:
        _email_service = EmailService()
    return _email_service
