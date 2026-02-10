#!/usr/bin/env python3
"""
Setup appointment availability for Raven Support business.
Creates a default Monday-Friday 9am-5pm schedule.
"""

from app.services.database import get_supabase_client

SUPPORT_BUSINESS_ID = "f2939e5f-9367-4110-9113-60748fc2cddb"

def setup_availability():
    """Create default availability schedule for Raven Support."""
    client = get_supabase_client()

    print("=" * 60)
    print("  Setup Raven Support Availability")
    print("=" * 60)
    print()

    # Check if already exists
    existing = client.table('business_availability').select('*').eq('business_id', SUPPORT_BUSINESS_ID).execute()

    if existing.data:
        print(f"⚠️  Availability already exists for Raven Support")
        print(f"   Deleting old configuration...")
        client.table('business_availability').delete().eq('business_id', SUPPORT_BUSINESS_ID).execute()

    # Default schedule: Monday-Friday, 9am-5pm
    default_schedule = {
        "monday": {
            "enabled": True,
            "slots": [{"start": "09:00", "end": "17:00"}]
        },
        "tuesday": {
            "enabled": True,
            "slots": [{"start": "09:00", "end": "17:00"}]
        },
        "wednesday": {
            "enabled": True,
            "slots": [{"start": "09:00", "end": "17:00"}]
        },
        "thursday": {
            "enabled": True,
            "slots": [{"start": "09:00", "end": "17:00"}]
        },
        "friday": {
            "enabled": True,
            "slots": [{"start": "09:00", "end": "17:00"}]
        },
        "saturday": {
            "enabled": False,
            "slots": []
        },
        "sunday": {
            "enabled": False,
            "slots": []
        }
    }

    availability_data = {
        "business_id": SUPPORT_BUSINESS_ID,
        "weekly_schedule": default_schedule,
        "default_duration_minutes": 60,  # 1 hour appointments
        "buffer_minutes": 0,  # No buffer between appointments
        "timezone": "Africa/Douala"  # Cameroon timezone
    }

    print(f"🔄 Creating availability schedule...")
    print(f"   📅 Schedule: Monday-Friday, 9am-5pm")
    print(f"   ⏱️  Duration: 60 minutes")
    print(f"   🌍 Timezone: Africa/Douala")
    print()

    result = client.table('business_availability').insert(availability_data).execute()

    if result.data:
        print(f"✅ Availability created successfully!")
        print()
        print(f"📊 Summary:")
        print(f"   Business: Raven Support")
        print(f"   ID: {SUPPORT_BUSINESS_ID}")
        print(f"   Working Days: Monday - Friday")
        print(f"   Hours: 9:00 AM - 5:00 PM")
        print(f"   Slot Duration: 60 minutes")
        print()
        print(f"✨ Appointment slots will now appear in the chat widget!")
        return True
    else:
        print(f"❌ Failed to create availability")
        return False

if __name__ == "__main__":
    setup_availability()
