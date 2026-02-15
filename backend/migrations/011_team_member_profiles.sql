-- Add profile fields to team members
-- Migration 011: Team member profile expansion for direct account creation

ALTER TABLE team_members
ADD COLUMN IF NOT EXISTS full_name TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS job_title TEXT;

-- Add comments for documentation
COMMENT ON COLUMN team_members.full_name IS 'Full display name of the team member';
COMMENT ON COLUMN team_members.phone IS 'Contact phone number (optional)';
COMMENT ON COLUMN team_members.job_title IS 'Job title or role description (optional)';

-- Index on full_name for faster searches
CREATE INDEX IF NOT EXISTS idx_team_members_full_name ON team_members(full_name);
