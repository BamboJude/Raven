#!/usr/bin/env python3
"""
Setup script for creating the Raven Support business.
This creates a system business for providing support via the widget.
"""

import sys
import os
from pathlib import Path

# Add backend to path
backend_path = Path(__file__).parent
sys.path.insert(0, str(backend_path))

from app.services.database import get_supabase_client
from app.config import get_settings
import json

def create_support_business():
    """Create the Raven Support system business."""
    client = get_supabase_client()
    settings = get_settings()

    # Check if support business already exists
    existing = client.table('businesses').select('*').eq('name', 'Raven Support').execute()

    if existing.data:
        print(f"✅ Raven Support business already exists!")
        print(f"   Business ID: {existing.data[0]['id']}")
        print(f"   Owner: {existing.data[0]['owner_id']}")
        return existing.data[0]['id']

    # Get platform admin user ID
    admin_email = settings.platform_admin_email
    print(f"Looking for admin user: {admin_email}")

    # Try to get admin user from auth
    try:
        # List users (requires service role key)
        users_response = client.auth.admin.list_users()
        admin_user = None

        for user in users_response:
            if hasattr(user, 'email') and user.email == admin_email:
                admin_user = user
                break

        if not admin_user:
            print(f"❌ Admin user not found: {admin_email}")
            print("   Please create an account first or update platform_admin_email in config")
            return None

        owner_id = admin_user.id
        print(f"✅ Found admin user: {owner_id}")

    except Exception as e:
        print(f"⚠️  Could not fetch admin user: {e}")
        print("   You'll need to provide the owner_id manually")
        owner_id = input("Enter your user ID (from Supabase Auth): ").strip()
        if not owner_id:
            return None

    # Create the business
    business_data = {
        "name": "Raven Support",
        "owner_id": owner_id,
        "is_system": True,
    }

    result = client.table('businesses').insert(business_data).execute()

    if not result.data:
        print(f"❌ Failed to create business")
        return None

    business_id = result.data[0]['id']
    print(f"\n✅ Created Raven Support business!")
    print(f"   Business ID: {business_id}")

    # Create business config
    config_data = {
        "business_id": business_id,
        "description": "Get help with using Raven Support - your AI chatbot platform for businesses in Cameroon.",
        "language": "en",
        "welcome_message": "Hi! 👋 Welcome to Raven Support. How can I help you today?",
        "welcome_message_en": "Hi! 👋 Welcome to Raven Support. How can I help you today?",
        "faqs": [
            {
                "question": "What is Raven Support?",
                "answer": "Raven Support is an AI-powered chatbot platform that helps businesses in Cameroon automate customer conversations on their website and WhatsApp."
            },
            {
                "question": "How much does it cost?",
                "answer": "Pricing starts at 10,000 CFA per month. Visit our website to see all plans and features."
            },
            {
                "question": "How do I get started?",
                "answer": "Simply create a free account, set up your business profile, add your FAQs and products, then copy the widget code to your website. It takes less than 10 minutes!"
            },
            {
                "question": "What languages do you support?",
                "answer": "Raven Support works in both French and English, allowing you to serve all your customers in their preferred language."
            }
        ],
        "products": [
            {
                "name": "Basic Plan",
                "price": "10,000 CFA/month",
                "description": "Perfect for small businesses. Includes AI chatbot, basic analytics, and email support."
            },
            {
                "name": "Professional Plan",
                "price": "25,000 CFA/month",
                "description": "For growing businesses. Includes WhatsApp integration, advanced analytics, team members, and priority support."
            }
        ],
        "custom_instructions": "You are a helpful support agent for Raven Support. Be friendly, professional, and helpful. If asked about features not mentioned in the FAQs or products, politely say you'll have our team reach out with more details."
    }

    config_result = client.table('business_configs').insert(config_data).execute()

    if config_result.data:
        print(f"✅ Created business configuration")

    print(f"\n📋 Next steps:")
    print(f"   1. Update SUPPORT_BUSINESS_ID in frontend/src/components/RavenWidget.tsx")
    print(f"   2. Replace: const SUPPORT_BUSINESS_ID = \"...\"")
    print(f"   3. With: const SUPPORT_BUSINESS_ID = \"{business_id}\"")
    print(f"\n   Then restart your frontend: npm run dev")

    return business_id

if __name__ == "__main__":
    print("=" * 60)
    print("  Raven Support Business Setup")
    print("=" * 60)
    print()

    business_id = create_support_business()

    if business_id:
        print(f"\n✅ Setup complete! Business ID: {business_id}")
    else:
        print(f"\n❌ Setup failed")
        sys.exit(1)
