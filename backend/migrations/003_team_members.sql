-- Team Members Table
-- Allows multiple team members to access a business

CREATE TABLE IF NOT EXISTS team_members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'member',  -- owner, admin, member
    status TEXT NOT NULL DEFAULT 'pending',  -- pending, active
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(business_id, email)
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_team_members_business ON team_members(business_id);
CREATE INDEX IF NOT EXISTS idx_team_members_email ON team_members(email);
CREATE INDEX IF NOT EXISTS idx_team_members_user ON team_members(user_id);

-- RLS Policies
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

-- Business owners can manage team members
CREATE POLICY "Business owners can manage team members"
ON team_members FOR ALL
USING (
    business_id IN (
        SELECT id FROM businesses WHERE user_id = auth.uid()
    )
);

-- Team members can view their own membership
CREATE POLICY "Team members can view own membership"
ON team_members FOR SELECT
USING (email = auth.email() OR user_id = auth.uid());

-- Update timestamp trigger
CREATE TRIGGER update_team_members_updated_at
    BEFORE UPDATE ON team_members
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
