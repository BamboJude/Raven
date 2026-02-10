-- Migration 008: Add lead capture support
-- Adds visitor info columns to conversations and lead_capture_config to business_configs
-- Run this in the Supabase SQL Editor

ALTER TABLE conversations
ADD COLUMN IF NOT EXISTS visitor_name TEXT,
ADD COLUMN IF NOT EXISTS visitor_email TEXT,
ADD COLUMN IF NOT EXISTS visitor_phone TEXT;

ALTER TABLE business_configs
ADD COLUMN IF NOT EXISTS lead_capture_config JSONB DEFAULT '{"enabled": false, "fields": [
  {"name": "name", "label_fr": "Nom", "label_en": "Name", "required": true, "enabled": true},
  {"name": "email", "label_fr": "Email", "label_en": "Email", "required": true, "enabled": true},
  {"name": "phone", "label_fr": "Téléphone", "label_en": "Phone", "required": false, "enabled": false}
]}'::jsonb;

CREATE INDEX IF NOT EXISTS idx_conversations_visitor_email ON conversations(visitor_email) WHERE visitor_email IS NOT NULL;
