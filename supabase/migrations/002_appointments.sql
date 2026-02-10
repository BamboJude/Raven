-- Appointments Table
-- Stores appointment bookings made through the chatbot

CREATE TABLE appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    conversation_id UUID REFERENCES conversations(id) ON DELETE SET NULL,

    -- Customer information
    customer_name TEXT NOT NULL,
    customer_email TEXT,
    customer_phone TEXT NOT NULL,

    -- Appointment details
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    duration_minutes INTEGER NOT NULL DEFAULT 60,
    service_type TEXT,
    notes TEXT,

    -- Status tracking
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed', 'no_show')),

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    confirmed_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ
);

-- Indexes for faster lookups
CREATE INDEX idx_appointments_business_id ON appointments(business_id);
CREATE INDEX idx_appointments_date ON appointments(appointment_date);
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_appointments_customer_phone ON appointments(customer_phone);

-- Auto-update updated_at timestamp
CREATE TRIGGER update_appointments_updated_at
    BEFORE UPDATE ON appointments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- BUSINESS AVAILABILITY TABLE
-- Stores business hours and availability settings
-- ============================================
CREATE TABLE business_availability (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL UNIQUE REFERENCES businesses(id) ON DELETE CASCADE,

    -- Working hours for each day (stored as JSON)
    -- Format: {"monday": {"enabled": true, "slots": [{"start": "09:00", "end": "17:00"}]}, ...}
    weekly_schedule JSONB NOT NULL DEFAULT '{
        "monday": {"enabled": true, "slots": [{"start": "09:00", "end": "17:00"}]},
        "tuesday": {"enabled": true, "slots": [{"start": "09:00", "end": "17:00"}]},
        "wednesday": {"enabled": true, "slots": [{"start": "09:00", "end": "17:00"}]},
        "thursday": {"enabled": true, "slots": [{"start": "09:00", "end": "17:00"}]},
        "friday": {"enabled": true, "slots": [{"start": "09:00", "end": "17:00"}]},
        "saturday": {"enabled": false, "slots": []},
        "sunday": {"enabled": false, "slots": []}
    }'::jsonb,

    -- Default appointment duration in minutes
    default_duration_minutes INTEGER NOT NULL DEFAULT 60,

    -- Buffer time between appointments in minutes
    buffer_minutes INTEGER NOT NULL DEFAULT 15,

    -- Timezone
    timezone TEXT NOT NULL DEFAULT 'Africa/Douala',

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER update_business_availability_updated_at
    BEFORE UPDATE ON business_availability
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

-- Enable RLS
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_availability ENABLE ROW LEVEL SECURITY;

-- Appointments: Business owners can view their appointments
CREATE POLICY "Business owners can view appointments"
    ON appointments FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM businesses
        WHERE businesses.id = appointments.business_id
        AND businesses.user_id = auth.uid()
    ));

-- Allow anyone to create appointments (for widget/WhatsApp)
CREATE POLICY "Anyone can create appointments"
    ON appointments FOR INSERT
    WITH CHECK (true);

-- Business owners can update their appointments
CREATE POLICY "Business owners can update appointments"
    ON appointments FOR UPDATE
    USING (EXISTS (
        SELECT 1 FROM businesses
        WHERE businesses.id = appointments.business_id
        AND businesses.user_id = auth.uid()
    ));

-- Business Availability: Through business ownership
CREATE POLICY "Users can view their business availability"
    ON business_availability FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM businesses
        WHERE businesses.id = business_availability.business_id
        AND businesses.user_id = auth.uid()
    ));

CREATE POLICY "Users can modify their business availability"
    ON business_availability FOR ALL
    USING (EXISTS (
        SELECT 1 FROM businesses
        WHERE businesses.id = business_availability.business_id
        AND businesses.user_id = auth.uid()
    ));
