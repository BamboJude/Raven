"""
Notification Service - Main orchestrator for email and SMS notifications.
Coordinates email and SMS services, manages settings, and logs notifications.
"""

from typing import Optional, Literal
from datetime import datetime

from app.services.email import get_email_service
from app.services.sms import get_sms_service
from app.services.database import db


NotificationType = Literal["confirmation", "reminder_24h", "reminder_1h", "cancellation", "update"]
NotificationChannel = Literal["email", "sms"]


class NotificationService:
    """
    Main notification service that coordinates email and SMS notifications.
    Handles settings retrieval, notification sending, and logging.
    """

    def __init__(self):
        self.email_service = get_email_service()
        self.sms_service = get_sms_service()

    def send_appointment_confirmation(
        self,
        appointment_id: str,
        business_id: str,
        customer_name: str,
        customer_email: Optional[str],
        customer_phone: str,
        business_name: str,
        appointment_date: str,
        appointment_time: str,
        duration_minutes: int,
        service_type: Optional[str] = None,
        notes: Optional[str] = None,
        language: str = "fr",
    ) -> dict:
        """
        Send appointment confirmation via email and/or SMS.

        Returns:
            dict with 'email' and 'sms' keys containing send results
        """
        print(f"📧 Starting confirmation notification for appointment {appointment_id}")
        print(f"📧 Customer email: {customer_email}, phone: {customer_phone}")

        results = {"email": None, "sms": None}

        # Get notification settings for this business
        settings = db.get_notification_settings(business_id)
        print(f"📧 Notification settings: {settings}")

        # If no settings, use defaults (email enabled, SMS disabled)
        if not settings:
            print("📧 No settings found, using defaults")
            settings = {
                "email_enabled": True,
                "sms_enabled": False,
                "send_confirmation": True,
            }

        # Check if we should send confirmation
        if not settings.get("send_confirmation", True):
            print("📧 send_confirmation is disabled, skipping")
            return results

        # Send email if enabled and customer has email
        print(f"📧 Email enabled: {settings.get('email_enabled', True)}, has email: {bool(customer_email)}")
        if settings.get("email_enabled", True) and customer_email:
            print(f"📧 Sending confirmation email to {customer_email}")
            email_result = self.email_service.send_confirmation_email(
                to_email=customer_email,
                customer_name=customer_name,
                business_name=business_name,
                appointment_date=appointment_date,
                appointment_time=appointment_time,
                duration_minutes=duration_minutes,
                service_type=service_type,
                notes=notes,
                language=language,
                from_name=settings.get("email_from_name"),
                from_email=settings.get("email_from_address"),
            )
            print(f"📧 Email result: {email_result}")

            results["email"] = email_result

            # Log to database
            self._log_notification(
                appointment_id=appointment_id,
                business_id=business_id,
                notification_type="confirmation",
                channel="email",
                recipient=customer_email,
                status="sent" if email_result.get("success") else "failed",
                error_message=email_result.get("error"),
                provider_id=email_result.get("message_id"),
            )

        # Send SMS if enabled
        if settings.get("sms_enabled", False):
            sms_result = self.sms_service.send_confirmation_sms(
                to_phone=customer_phone,
                business_name=business_name,
                appointment_date=appointment_date,
                appointment_time=appointment_time,
                language=language,
                from_phone=settings.get("twilio_phone_number"),
            )

            results["sms"] = sms_result

            # Log to database
            self._log_notification(
                appointment_id=appointment_id,
                business_id=business_id,
                notification_type="confirmation",
                channel="sms",
                recipient=customer_phone,
                status="sent" if sms_result.get("success") else "failed",
                error_message=sms_result.get("error"),
                provider_id=sms_result.get("message_id"),
            )

        return results

    def send_appointment_reminder(
        self,
        appointment_id: str,
        business_id: str,
        customer_name: str,
        customer_email: Optional[str],
        customer_phone: str,
        business_name: str,
        appointment_date: str,
        appointment_time: str,
        duration_minutes: int,
        service_type: Optional[str] = None,
        hours_before: int = 24,
        language: str = "fr",
    ) -> dict:
        """Send appointment reminder via email and/or SMS."""
        results = {"email": None, "sms": None}

        settings = db.get_notification_settings(business_id)
        if not settings:
            return results

        # Check if we should send this reminder
        if hours_before == 24 and not settings.get("send_reminder_24h", True):
            return results
        if hours_before == 1 and not settings.get("send_reminder_1h", False):
            return results

        notification_type = f"reminder_{hours_before}h"

        # Send email reminder
        if settings.get("email_enabled") and customer_email:
            email_result = self.email_service.send_reminder_email(
                to_email=customer_email,
                customer_name=customer_name,
                business_name=business_name,
                appointment_date=appointment_date,
                appointment_time=appointment_time,
                duration_minutes=duration_minutes,
                service_type=service_type,
                hours_before=hours_before,
                language=language,
                from_name=settings.get("email_from_name"),
                from_email=settings.get("email_from_address"),
            )

            results["email"] = email_result

            self._log_notification(
                appointment_id=appointment_id,
                business_id=business_id,
                notification_type=notification_type,
                channel="email",
                recipient=customer_email,
                status="sent" if email_result.get("success") else "failed",
                error_message=email_result.get("error"),
                provider_id=email_result.get("message_id"),
            )

        # Send SMS reminder
        if settings.get("sms_enabled"):
            sms_result = self.sms_service.send_reminder_sms(
                to_phone=customer_phone,
                business_name=business_name,
                appointment_date=appointment_date,
                appointment_time=appointment_time,
                hours_before=hours_before,
                language=language,
                from_phone=settings.get("twilio_phone_number"),
            )

            results["sms"] = sms_result

            self._log_notification(
                appointment_id=appointment_id,
                business_id=business_id,
                notification_type=notification_type,
                channel="sms",
                recipient=customer_phone,
                status="sent" if sms_result.get("success") else "failed",
                error_message=sms_result.get("error"),
                provider_id=sms_result.get("message_id"),
            )

        return results

    def send_appointment_cancellation(
        self,
        appointment_id: str,
        business_id: str,
        customer_name: str,
        customer_email: Optional[str],
        customer_phone: str,
        business_name: str,
        appointment_date: str,
        appointment_time: str,
        language: str = "fr",
    ) -> dict:
        """Send appointment cancellation notification via email and/or SMS."""
        results = {"email": None, "sms": None}

        settings = db.get_notification_settings(business_id)
        if not settings or not settings.get("send_cancellation", True):
            return results

        # Send cancellation email
        if settings.get("email_enabled") and customer_email:
            email_result = self.email_service.send_cancellation_email(
                to_email=customer_email,
                customer_name=customer_name,
                business_name=business_name,
                appointment_date=appointment_date,
                appointment_time=appointment_time,
                language=language,
                from_name=settings.get("email_from_name"),
                from_email=settings.get("email_from_address"),
            )

            results["email"] = email_result

            self._log_notification(
                appointment_id=appointment_id,
                business_id=business_id,
                notification_type="cancellation",
                channel="email",
                recipient=customer_email,
                status="sent" if email_result.get("success") else "failed",
                error_message=email_result.get("error"),
                provider_id=email_result.get("message_id"),
            )

        # Send cancellation SMS
        if settings.get("sms_enabled"):
            sms_result = self.sms_service.send_cancellation_sms(
                to_phone=customer_phone,
                business_name=business_name,
                appointment_date=appointment_date,
                appointment_time=appointment_time,
                language=language,
                from_phone=settings.get("twilio_phone_number"),
            )

            results["sms"] = sms_result

            self._log_notification(
                appointment_id=appointment_id,
                business_id=business_id,
                notification_type="cancellation",
                channel="sms",
                recipient=customer_phone,
                status="sent" if sms_result.get("success") else "failed",
                error_message=sms_result.get("error"),
                provider_id=sms_result.get("message_id"),
            )

        return results

    def send_appointment_update(
        self,
        appointment_id: str,
        business_id: str,
        customer_name: str,
        customer_email: Optional[str],
        customer_phone: str,
        business_name: str,
        old_date: str,
        old_time: str,
        new_date: str,
        new_time: str,
        duration_minutes: int,
        language: str = "fr",
    ) -> dict:
        """Send appointment update/reschedule notification via email and/or SMS."""
        results = {"email": None, "sms": None}

        settings = db.get_notification_settings(business_id)
        if not settings or not settings.get("send_update", True):
            return results

        # Send update email
        if settings.get("email_enabled") and customer_email:
            email_result = self.email_service.send_update_email(
                to_email=customer_email,
                customer_name=customer_name,
                business_name=business_name,
                old_date=old_date,
                old_time=old_time,
                new_date=new_date,
                new_time=new_time,
                duration_minutes=duration_minutes,
                language=language,
                from_name=settings.get("email_from_name"),
                from_email=settings.get("email_from_address"),
            )

            results["email"] = email_result

            self._log_notification(
                appointment_id=appointment_id,
                business_id=business_id,
                notification_type="update",
                channel="email",
                recipient=customer_email,
                status="sent" if email_result.get("success") else "failed",
                error_message=email_result.get("error"),
                provider_id=email_result.get("message_id"),
            )

        # Send update SMS
        if settings.get("sms_enabled"):
            sms_result = self.sms_service.send_update_sms(
                to_phone=customer_phone,
                business_name=business_name,
                new_date=new_date,
                new_time=new_time,
                language=language,
                from_phone=settings.get("twilio_phone_number"),
            )

            results["sms"] = sms_result

            self._log_notification(
                appointment_id=appointment_id,
                business_id=business_id,
                notification_type="update",
                channel="sms",
                recipient=customer_phone,
                status="sent" if sms_result.get("success") else "failed",
                error_message=sms_result.get("error"),
                provider_id=sms_result.get("message_id"),
            )

        return results

    def _log_notification(
        self,
        appointment_id: str,
        business_id: str,
        notification_type: NotificationType,
        channel: NotificationChannel,
        recipient: str,
        status: str,
        error_message: Optional[str] = None,
        provider_id: Optional[str] = None,
    ) -> None:
        """Log notification to database."""
        try:
            db.log_notification(
                appointment_id=appointment_id,
                business_id=business_id,
                notification_type=notification_type,
                channel=channel,
                recipient=recipient,
                status=status,
                error_message=error_message,
                provider_id=provider_id,
            )
        except Exception as e:
            print(f"Failed to log notification: {e}")


# Singleton instance
_notification_service = None

def get_notification_service() -> NotificationService:
    """Get or create the notification service instance."""
    global _notification_service
    if _notification_service is None:
        _notification_service = NotificationService()
    return _notification_service
