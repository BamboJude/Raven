-- Raven Database Schema
-- Run this in your Supabase SQL Editor to create all tables

-- Enable UUID extension (should already be enabled in Supabase)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- BUSINESSES TABLE
-- Stores business profiles
-- ============================================
CREATE TABLE businesses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    language TEXT NOT NULL DEFAULT 'fr' CHECK (language IN ('fr', 'en')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for faster lookups by user
CREATE INDEX idx_businesses_user_id ON businesses(user_id);

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_businesses_updated_at
    BEFORE UPDATE ON businesses
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- BUSINESS_CONFIGS TABLE
-- Stores chatbot configuration for each business
-- ============================================
CREATE TABLE business_configs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL UNIQUE REFERENCES businesses(id) ON DELETE CASCADE,
    welcome_message TEXT DEFAULT 'Bonjour! Comment puis-je vous aider?',
    faqs JSONB DEFAULT '[]'::jsonb,
    products JSONB DEFAULT '[]'::jsonb,
    custom_instructions TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER update_business_configs_updated_at
    BEFORE UPDATE ON business_configs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- CONVERSATIONS TABLE
-- Stores chat sessions
-- ============================================
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    visitor_id TEXT NOT NULL,
    channel TEXT NOT NULL DEFAULT 'widget' CHECK (channel IN ('widget', 'whatsapp')),
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_message_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for faster lookups
CREATE INDEX idx_conversations_business_id ON conversations(business_id);
CREATE INDEX idx_conversations_visitor_id ON conversations(visitor_id);
CREATE INDEX idx_conversations_last_message ON conversations(last_message_at DESC);

-- ============================================
-- MESSAGES TABLE
-- Stores individual chat messages
-- ============================================
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for faster message retrieval
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- Ensures users can only access their own data
-- ============================================

-- Enable RLS on all tables
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Businesses: Users can only see/modify their own businesses
CREATE POLICY "Users can view their own businesses"
    ON businesses FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own businesses"
    ON businesses FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own businesses"
    ON businesses FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own businesses"
    ON businesses FOR DELETE
    USING (auth.uid() = user_id);

-- Business Configs: Access through business ownership
CREATE POLICY "Users can view their business configs"
    ON business_configs FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM businesses
        WHERE businesses.id = business_configs.business_id
        AND businesses.user_id = auth.uid()
    ));

CREATE POLICY "Users can modify their business configs"
    ON business_configs FOR ALL
    USING (EXISTS (
        SELECT 1 FROM businesses
        WHERE businesses.id = business_configs.business_id
        AND businesses.user_id = auth.uid()
    ));

-- Conversations: Business owners can view their conversations
-- Also allow public inserts for widget (visitors starting chats)
CREATE POLICY "Business owners can view conversations"
    ON conversations FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM businesses
        WHERE businesses.id = conversations.business_id
        AND businesses.user_id = auth.uid()
    ));

-- Allow anyone to create conversations (for widget)
CREATE POLICY "Anyone can start a conversation"
    ON conversations FOR INSERT
    WITH CHECK (true);

-- Allow updates to conversation timestamps
CREATE POLICY "Allow conversation updates"
    ON conversations FOR UPDATE
    USING (true);

-- Messages: Business owners can view, anyone can insert
CREATE POLICY "Business owners can view messages"
    ON messages FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM conversations
        JOIN businesses ON businesses.id = conversations.business_id
        WHERE conversations.id = messages.conversation_id
        AND businesses.user_id = auth.uid()
    ));

-- Allow anyone to add messages (for widget chat)
CREATE POLICY "Anyone can send messages"
    ON messages FOR INSERT
    WITH CHECK (true);

-- ============================================
-- SERVICE ROLE BYPASS
-- The backend uses service_role key which bypasses RLS
-- This is needed for the chat API to work without user auth
-- ============================================

-- Note: When using the service_role key in your backend,
-- RLS is automatically bypassed. The policies above are
-- for direct client access (e.g., from the frontend).
