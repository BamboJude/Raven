-- Migration: Add notification system tables
-- Description: Email/SMS notifications for appointments

-- Notification Settings Table
CREATE TABLE IF NOT EXISTS notification_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Email settings
  email_enabled BOOLEAN DEFAULT true,
  email_from_name TEXT,
  email_from_address TEXT,

  -- SMS settings
  sms_enabled BOOLEAN DEFAULT false,
  twilio_account_sid TEXT,
  twilio_auth_token TEXT,
  twilio_phone_number TEXT,

  -- Notification preferences
  send_confirmation BOOLEAN DEFAULT true,
  send_reminder_24h BOOLEAN DEFAULT true,
  send_reminder_1h BOOLEAN DEFAULT false,
  send_cancellation BOOLEAN DEFAULT true,
  send_update BOOLEAN DEFAULT true,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(business_id)
);

-- Notification Log Table
CREATE TABLE IF NOT EXISTS notification_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  appointment_id UUID REFERENCES appointments(id) ON DELETE CASCADE,
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,

  -- Notification details
  type TEXT NOT NULL CHECK (type IN ('confirmation', 'reminder_24h', 'reminder_1h', 'cancellation', 'update')),
  channel TEXT NOT NULL CHECK (channel IN ('email', 'sms')),

  -- Recipient
  recipient TEXT NOT NULL,

  -- Status
  status TEXT NOT NULL CHECK (status IN ('pending', 'sent', 'failed')) DEFAULT 'pending',
  error_message TEXT,

  -- Provider response
  provider_id TEXT, -- Resend email ID or Twilio message SID
  provider_response JSONB,

  -- Timestamps
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_notification_settings_business ON notification_settings(business_id);
CREATE INDEX IF NOT EXISTS idx_notification_log_appointment ON notification_log(appointment_id);
CREATE INDEX IF NOT EXISTS idx_notification_log_business ON notification_log(business_id);
CREATE INDEX IF NOT EXISTS idx_notification_log_created ON notification_log(created_at);
CREATE INDEX IF NOT EXISTS idx_notification_log_status ON notification_log(status);
CREATE INDEX IF NOT EXISTS idx_notification_log_type ON notification_log(type);

-- Row Level Security (RLS)
ALTER TABLE notification_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies for notification_settings
CREATE POLICY "Users can view their own notification settings"
  ON notification_settings
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notification settings"
  ON notification_settings
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own notification settings"
  ON notification_settings
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for notification_log
CREATE POLICY "Users can view their business notification logs"
  ON notification_log
  FOR SELECT
  USING (
    business_id IN (
      SELECT id FROM businesses WHERE user_id = auth.uid()
    )
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_notification_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updated_at
CREATE TRIGGER notification_settings_updated_at
  BEFORE UPDATE ON notification_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_notification_settings_updated_at();

-- Comments
COMMENT ON TABLE notification_settings IS 'Email and SMS notification settings per business';
COMMENT ON TABLE notification_log IS 'Log of all sent notifications for tracking and debugging';
COMMENT ON COLUMN notification_settings.email_enabled IS 'Whether email notifications are enabled for this business';
COMMENT ON COLUMN notification_settings.sms_enabled IS 'Whether SMS notifications are enabled for this business';
COMMENT ON COLUMN notification_log.provider_id IS 'External provider ID (Resend email ID or Twilio message SID)';
COMMENT ON COLUMN notification_log.status IS 'Notification delivery status';
