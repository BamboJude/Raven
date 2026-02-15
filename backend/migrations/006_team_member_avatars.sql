-- Add avatar support to team members
-- This allows team members to have profile pictures

ALTER TABLE team_members
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Add comment for documentation
COMMENT ON COLUMN team_members.avatar_url IS 'URL to team member profile picture/avatar';
