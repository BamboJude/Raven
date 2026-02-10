-- Migration 009: Add conversation rating support
-- Run this in the Supabase SQL Editor

ALTER TABLE conversations
ADD COLUMN IF NOT EXISTS rating TEXT CHECK (rating IN ('positive', 'negative')),
ADD COLUMN IF NOT EXISTS rating_comment TEXT,
ADD COLUMN IF NOT EXISTS rated_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_conversations_rating ON conversations(business_id, rating) WHERE rating IS NOT NULL;
