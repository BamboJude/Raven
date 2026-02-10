-- Migration 006: Add welcome_message_en and widget_settings to business_configs
-- Run this in the Supabase SQL Editor

ALTER TABLE business_configs
ADD COLUMN IF NOT EXISTS welcome_message_en TEXT DEFAULT 'Hello! How can I help you?',
ADD COLUMN IF NOT EXISTS widget_settings JSONB DEFAULT '{
    "primary_color": "#0ea5e9",
    "position": "bottom-right",
    "welcome_message_language": "auto"
}'::jsonb;

COMMENT ON COLUMN business_configs.welcome_message_en IS 'English welcome message (used when language is auto or en)';
COMMENT ON COLUMN business_configs.widget_settings IS 'Widget appearance settings (color, position, language mode)';
