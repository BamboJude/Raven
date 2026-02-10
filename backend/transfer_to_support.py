#!/usr/bin/env python3
"""
Transfer business data from Raven to Raven Support.
Copies FAQs, products, and configuration settings.
"""

import sys
import os
from pathlib import Path

# Add backend to path
backend_path = Path(__file__).parent
sys.path.insert(0, str(backend_path))

from app.services.database import get_supabase_client
import json

def transfer_business_data():
    """Transfer data from Raven business to Raven Support."""
    client = get_supabase_client()

    # Find Raven Support business
    support_business = client.table('businesses').select('*').eq('name', 'Raven Support').execute()

    if not support_business.data:
        print("❌ Raven Support business not found!")
        return False

    support_id = support_business.data[0]['id']
    print(f"✅ Found Raven Support business: {support_id}")

    # Find other Raven businesses (not Raven Support)
    all_businesses = client.table('businesses').select('id, name, user_id').execute()

    source_business = None
    for biz in all_businesses.data:
        if biz['name'] != 'Raven Support' and 'Raven' in biz['name']:
            source_business = biz
            break

    if not source_business:
        print("\n⚠️  No source 'Raven' business found to copy from.")
        print("   Available businesses:")
        for biz in all_businesses.data:
            print(f"   - {biz['name']} ({biz['id']})")

        # Ask user to select
        print("\nEnter the business ID to copy from (or press Enter to skip):")
        source_id = input().strip()

        if not source_id:
            print("Skipping data transfer.")
            return True

        source_business = {'id': source_id, 'name': 'Selected Business'}

    source_id = source_business['id']
    print(f"✅ Source business: {source_business['name']} ({source_id})")

    # Get source business config
    source_config = client.table('business_configs').select('*').eq('business_id', source_id).execute()

    if not source_config.data:
        print("⚠️  No configuration found for source business")
        return False

    config = source_config.data[0]
    print(f"\n📋 Found configuration with:")
    print(f"   - {len(config.get('faqs', []))} FAQs")
    print(f"   - {len(config.get('products', []))} Products")
    print(f"   - Description: {config.get('description', 'N/A')[:50]}...")

    # Get current Raven Support config
    support_config = client.table('business_configs').select('*').eq('business_id', support_id).execute()

    # Prepare data to transfer (only columns that exist in business_configs)
    transfer_data = {
        'business_id': support_id,
        'welcome_message': config.get('welcome_message', 'Hi! 👋 Welcome to Raven Support. How can I help you today?'),
        'welcome_message_en': config.get('welcome_message_en', 'Hi! 👋 Welcome to Raven Support. How can I help you today?'),
        'faqs': config.get('faqs', []),
        'products': config.get('products', []),
        'custom_instructions': config.get('custom_instructions', ''),
        'widget_settings': config.get('widget_settings', {
            'position': 'bottom-right',
            'primary_color': '#74a7fe',
            'welcome_message_language': 'auto'
        }),
        'lead_capture_config': config.get('lead_capture_config', {}),
        'manual_away': config.get('manual_away', False),
        'away_message': config.get('away_message', ''),
        'away_message_en': config.get('away_message_en', '')
    }

    print(f"\n🔄 Transferring data to Raven Support...")

    if support_config.data:
        # Update existing config
        result = client.table('business_configs').update(transfer_data).eq('business_id', support_id).execute()
        print("✅ Updated Raven Support configuration")
    else:
        # Create new config
        result = client.table('business_configs').insert(transfer_data).execute()
        print("✅ Created Raven Support configuration")

    if result.data:
        print(f"\n✅ Transfer complete!")
        print(f"\n📊 Raven Support now has:")
        print(f"   - {len(transfer_data['faqs'])} FAQs")
        print(f"   - {len(transfer_data['products'])} Products")
        print(f"   - Welcome message: {transfer_data['welcome_message'][:50]}...")
        print(f"\n🔗 Business ID: {support_id}")
        return True
    else:
        print("❌ Transfer failed")
        return False

if __name__ == "__main__":
    print("=" * 60)
    print("  Transfer Data to Raven Support")
    print("=" * 60)
    print()

    success = transfer_business_data()

    if success:
        print(f"\n✅ Data transfer successful!")
    else:
        print(f"\n❌ Data transfer failed")
        sys.exit(1)
