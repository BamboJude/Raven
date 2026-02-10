-- Fix appointment field requirements
-- Make phone optional and email required (matches actual booking flow)

-- Change customer_phone from NOT NULL to nullable
ALTER TABLE appointments
ALTER COLUMN customer_phone DROP NOT NULL;

-- Change customer_email from nullable to NOT NULL
ALTER TABLE appointments
ALTER COLUMN customer_email SET NOT NULL;
