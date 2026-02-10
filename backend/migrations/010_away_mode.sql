-- Migration 010: Add away mode support
-- Run this in the Supabase SQL Editor

ALTER TABLE business_configs
ADD COLUMN IF NOT EXISTS manual_away BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS away_message TEXT DEFAULT 'Nous sommes actuellement indisponibles. Laissez-nous un message et nous vous recontacterons.',
ADD COLUMN IF NOT EXISTS away_message_en TEXT DEFAULT 'We are currently unavailable. Leave us a message and we will get back to you.';
