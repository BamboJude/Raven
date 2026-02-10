-- Migration 007: Add is_system flag to businesses table
-- This allows marking system businesses (e.g., Raven Support) that are visible to all users.

ALTER TABLE businesses ADD COLUMN IF NOT EXISTS is_system boolean DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_businesses_is_system ON businesses (is_system) WHERE is_system = true;
