-- Migration: Add human takeover support to conversations
-- Run this in Supabase SQL Editor

-- Add takeover fields to conversations table
ALTER TABLE conversations
ADD COLUMN IF NOT EXISTS is_human_takeover BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS taken_over_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS taken_over_at TIMESTAMPTZ;

-- Create index for finding active takeover conversations
CREATE INDEX IF NOT EXISTS idx_conversations_takeover
ON conversations(business_id, is_human_takeover)
WHERE is_human_takeover = TRUE;

-- Create index for last_message_at (for live conversation queries)
CREATE INDEX IF NOT EXISTS idx_conversations_last_message
ON conversations(business_id, last_message_at DESC);

COMMENT ON COLUMN conversations.is_human_takeover IS 'Whether a human agent has taken over this conversation';
COMMENT ON COLUMN conversations.taken_over_by IS 'User ID of the agent who took over';
COMMENT ON COLUMN conversations.taken_over_at IS 'When the takeover started';
