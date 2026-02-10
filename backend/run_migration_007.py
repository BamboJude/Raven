#!/usr/bin/env python3
"""
Run migration 007: Fix appointment field requirements
"""

from app.services.database import get_supabase_client

def run_migration():
    client = get_supabase_client()

    print("=" * 60)
    print("  Migration 007: Fix Appointment Field Requirements")
    print("=" * 60)
    print()

    # Read the migration SQL
    with open("../supabase/migrations/007_fix_appointment_fields.sql", "r") as f:
        sql = f.read()

    print("📝 Running migration SQL...")
    print(sql)
    print()

    try:
        # Split by semicolon and run each statement
        statements = [s.strip() for s in sql.split(';') if s.strip() and not s.strip().startswith('--')]

        for statement in statements:
            if statement:
                print(f"🔄 Executing: {statement[:60]}...")
                # Use RPC to execute raw SQL
                result = client.rpc('exec_sql', {'sql': statement}).execute()
                print(f"✅ Success")

        print()
        print("✅ Migration completed successfully!")
        print()
        print("Changes made:")
        print("  - customer_phone: NOT NULL → NULL (optional)")
        print("  - customer_email: NULL → NOT NULL (required)")
        print()
        print("Now appointments can be created with email but without phone.")

    except Exception as e:
        print(f"❌ Migration failed: {e}")
        print()
        print("ℹ️  Please run this SQL manually in Supabase SQL Editor:")
        print()
        print(sql)
        return False

    return True

if __name__ == "__main__":
    run_migration()
