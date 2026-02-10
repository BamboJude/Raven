-- Add media column to messages table
-- Stores array of media attachments as JSONB

ALTER TABLE messages
ADD COLUMN IF NOT EXISTS media JSONB DEFAULT NULL;

-- Index for querying messages with media
CREATE INDEX IF NOT EXISTS idx_messages_has_media ON messages ((media IS NOT NULL));

COMMENT ON COLUMN messages.media IS 'Array of media attachments: [{type, url, filename, content_type}]';
