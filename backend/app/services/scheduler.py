"""
Scheduler Service - Background job scheduler for appointment reminders.
Uses APScheduler to run periodic checks and send reminders.
"""

import os
from datetime import datetime, timedelta
from typing import Optional
import pytz

from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.interval import IntervalTrigger

from app.services.database import db
from app.services.notifications import get_notification_service


class ReminderScheduler:
    """
    Background scheduler for sending appointment reminders.
    Runs every 15 minutes to check for appointments needing reminders.
    """

    def __init__(self):
        self.scheduler = BackgroundScheduler()
        self.notification_service = get_notification_service()
        self.enabled = os.getenv("ENABLE_REMINDER_SCHEDULER", "true").lower() == "true"

    def start(self):
        """Start the scheduler."""
        if not self.enabled:
            print("Reminder scheduler is disabled")
            return

        # Run reminder check every 15 minutes
        self.scheduler.add_job(
            self._check_and_send_reminders,
            trigger=IntervalTrigger(minutes=15),
            id="reminder_check",
            name="Check and send appointment reminders",
            replace_existing=True,
        )

        self.scheduler.start()
        print("Reminder scheduler started - checking every 15 minutes")

    def stop(self):
        """Stop the scheduler."""
        if self.scheduler.running:
            self.scheduler.shutdown()
            print("Reminder scheduler stopped")

    def _check_and_send_reminders(self):
        """
        Check for appointments that need reminders and send them.
        Called every 15 minutes by the scheduler.
        """
        try:
            now = datetime.now(pytz.UTC)

            # Get all businesses
            businesses = db.get_all_businesses()

            for business in businesses:
                business_id = business["id"]
                business_name = business["name"]
                language = business.get("language", "fr")

                # Get notification settings
                settings = db.get_notification_settings(business_id)
                if not settings:
                    continue

                # Check 24-hour reminders
                if settings.get("send_reminder_24h", True):
                    self._send_24h_reminders(
                        business_id=business_id,
                        business_name=business_name,
                        language=language,
                        now=now,
                    )

                # Check 1-hour reminders
                if settings.get("send_reminder_1h", False):
                    self._send_1h_reminders(
                        business_id=business_id,
                        business_name=business_name,
                        language=language,
                        now=now,
                    )

        except Exception as e:
            print(f"Error in reminder check: {e}")

    def _send_24h_reminders(
        self,
        business_id: str,
        business_name: str,
        language: str,
        now: datetime,
    ):
        """Send 24-hour reminders for appointments tomorrow."""
        try:
            # Calculate tomorrow's date range (23-25 hours from now)
            tomorrow_start = now + timedelta(hours=23)
            tomorrow_end = now + timedelta(hours=25)

            # Get appointments for tomorrow
            start_date = tomorrow_start.strftime("%Y-%m-%d")
            end_date = tomorrow_end.strftime("%Y-%m-%d")

            appointments = db.get_appointments_by_business(
                business_id=business_id,
                start_date=start_date,
                end_date=end_date,
            )

            for appt in appointments:
                # Skip if already cancelled or completed
                if appt.get("status") in ["cancelled", "completed", "no_show"]:
                    continue

                # Check if we already sent a 24h reminder for this appointment
                logs = db.get_notification_logs(business_id, appt["id"])
                already_sent = any(
                    log.get("type") == "reminder_24h" and log.get("status") == "sent"
                    for log in logs
                )

                if already_sent:
                    continue

                # Check if appointment is actually ~24 hours away
                appt_datetime = self._parse_appointment_datetime(
                    appt["appointment_date"],
                    appt["appointment_time"],
                )
                if not appt_datetime:
                    continue

                hours_until = (appt_datetime - now).total_seconds() / 3600
                if not (23 <= hours_until <= 25):
                    continue

                # Send reminder
                try:
                    self.notification_service.send_appointment_reminder(
                        appointment_id=appt["id"],
                        business_id=business_id,
                        customer_name=appt["customer_name"],
                        customer_email=appt.get("customer_email"),
                        customer_phone=appt["customer_phone"],
                        business_name=business_name,
                        appointment_date=appt["appointment_date"],
                        appointment_time=appt["appointment_time"],
                        duration_minutes=appt.get("duration_minutes", 60),
                        service_type=appt.get("service_type"),
                        hours_before=24,
                        language=language,
                    )
                    print(f"Sent 24h reminder for appointment {appt['id']}")
                except Exception as e:
                    print(f"Failed to send 24h reminder for {appt['id']}: {e}")

        except Exception as e:
            print(f"Error sending 24h reminders for business {business_id}: {e}")

    def _send_1h_reminders(
        self,
        business_id: str,
        business_name: str,
        language: str,
        now: datetime,
    ):
        """Send 1-hour reminders for appointments soon."""
        try:
            # Calculate 1-hour window (45 min to 75 min from now)
            soon_start = now + timedelta(minutes=45)
            soon_end = now + timedelta(minutes=75)

            # Get today's appointments
            today = now.strftime("%Y-%m-%d")
            appointments = db.get_appointments_by_business(
                business_id=business_id,
                start_date=today,
                end_date=today,
            )

            for appt in appointments:
                # Skip if already cancelled or completed
                if appt.get("status") in ["cancelled", "completed", "no_show"]:
                    continue

                # Check if we already sent a 1h reminder
                logs = db.get_notification_logs(business_id, appt["id"])
                already_sent = any(
                    log.get("type") == "reminder_1h" and log.get("status") == "sent"
                    for log in logs
                )

                if already_sent:
                    continue

                # Check if appointment is actually ~1 hour away
                appt_datetime = self._parse_appointment_datetime(
                    appt["appointment_date"],
                    appt["appointment_time"],
                )
                if not appt_datetime:
                    continue

                minutes_until = (appt_datetime - now).total_seconds() / 60
                if not (45 <= minutes_until <= 75):
                    continue

                # Send reminder
                try:
                    self.notification_service.send_appointment_reminder(
                        appointment_id=appt["id"],
                        business_id=business_id,
                        customer_name=appt["customer_name"],
                        customer_email=appt.get("customer_email"),
                        customer_phone=appt["customer_phone"],
                        business_name=business_name,
                        appointment_date=appt["appointment_date"],
                        appointment_time=appt["appointment_time"],
                        duration_minutes=appt.get("duration_minutes", 60),
                        service_type=appt.get("service_type"),
                        hours_before=1,
                        language=language,
                    )
                    print(f"Sent 1h reminder for appointment {appt['id']}")
                except Exception as e:
                    print(f"Failed to send 1h reminder for {appt['id']}: {e}")

        except Exception as e:
            print(f"Error sending 1h reminders for business {business_id}: {e}")

    def _parse_appointment_datetime(
        self,
        date_str: str,
        time_str: str,
    ) -> Optional[datetime]:
        """Parse appointment date and time into a datetime object."""
        try:
            # Handle time format with or without seconds
            if len(time_str) == 5:  # HH:MM
                time_str = f"{time_str}:00"

            dt_str = f"{date_str} {time_str}"
            dt = datetime.strptime(dt_str, "%Y-%m-%d %H:%M:%S")
            return pytz.UTC.localize(dt)
        except Exception:
            return None


# Singleton instance
_scheduler = None


def get_scheduler() -> ReminderScheduler:
    """Get or create the scheduler instance."""
    global _scheduler
    if _scheduler is None:
        _scheduler = ReminderScheduler()
    return _scheduler


def start_scheduler():
    """Start the reminder scheduler."""
    scheduler = get_scheduler()
    scheduler.start()


def stop_scheduler():
    """Stop the reminder scheduler."""
    global _scheduler
    if _scheduler:
        _scheduler.stop()
