-- Add rating and visitor info columns to conversations table
-- This allows users to rate their chat experience and capture lead information

ALTER TABLE conversations
  ADD COLUMN rating TEXT CHECK (rating IN ('positive', 'negative')),
  ADD COLUMN rating_comment TEXT,
  ADD COLUMN rated_at TIMESTAMPTZ,
  ADD COLUMN visitor_name TEXT,
  ADD COLUMN visitor_email TEXT,
  ADD COLUMN visitor_phone TEXT;

-- Create index for analytics queries
CREATE INDEX idx_conversations_rating ON conversations(rating) WHERE rating IS NOT NULL;
CREATE INDEX idx_conversations_rated_at ON conversations(rated_at DESC) WHERE rated_at IS NOT NULL;

-- Add comments
COMMENT ON COLUMN conversations.rating IS 'User rating for the conversation (positive/negative)';
COMMENT ON COLUMN conversations.rating_comment IS 'Optional comment from user about their experience';
COMMENT ON COLUMN conversations.rated_at IS 'Timestamp when the conversation was rated';
COMMENT ON COLUMN conversations.visitor_name IS 'Visitor name from lead capture form';
COMMENT ON COLUMN conversations.visitor_email IS 'Visitor email from lead capture form';
COMMENT ON COLUMN conversations.visitor_phone IS 'Visitor phone from lead capture form';
