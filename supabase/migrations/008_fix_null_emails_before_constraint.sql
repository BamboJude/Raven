-- Migration 008: Fix NULL emails before adding NOT NULL constraint
-- This should be run BEFORE migration 007

-- Step 1: Update any appointments with NULL email to use a placeholder
-- This allows migration 007 to succeed
UPDATE appointments
SET customer_email = COALESCE(customer_email, 'no-email-provided@placeholder.local')
WHERE customer_email IS NULL;

-- Step 2: Now make phone optional and email required (same as migration 007)
-- Make customer_phone optional
ALTER TABLE appointments
ALTER COLUMN customer_phone DROP NOT NULL;

-- Make customer_email required (will now succeed since we filled NULLs)
ALTER TABLE appointments
ALTER COLUMN customer_email SET NOT NULL;
