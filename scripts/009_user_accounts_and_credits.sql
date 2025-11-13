-- User Accounts, Credits, and Enhanced Bundling System
-- Migration: 009_user_accounts_and_credits.sql

-- Extend profiles table with additional user fields
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS date_of_birth DATE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS emergency_contact_name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS emergency_contact_phone TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS health_conditions TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS marketing_consent BOOLEAN DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS account_status TEXT DEFAULT 'active' CHECK (account_status IN ('active', 'suspended', 'inactive'));
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN DEFAULT false;

-- Create user preferences table
CREATE TABLE IF NOT EXISTS public.user_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    notification_email BOOLEAN DEFAULT true,
    notification_sms BOOLEAN DEFAULT false,
    notification_marketing BOOLEAN DEFAULT false,
    preferred_categories TEXT[] DEFAULT '{}',
    preferred_locations TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Create event credits system
CREATE TABLE IF NOT EXISTS public.event_credits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    credit_amount NUMERIC(10,2) NOT NULL CHECK (credit_amount > 0),
    used_amount NUMERIC(10,2) DEFAULT 0 CHECK (used_amount >= 0),
    reason TEXT NOT NULL, -- 'refund', 'cancellation', 'admin_credit', 'bundle_adjustment'
    reference_booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'used', 'expired', 'cancelled')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create booking change history for audit trail
CREATE TABLE IF NOT EXISTS public.booking_changes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
    change_type TEXT NOT NULL CHECK (change_type IN ('cancellation', 'refund', 'credit_issued', 'bundle_modification', 'event_swap', 'admin_adjustment')),
    old_status TEXT,
    new_status TEXT,
    old_amount NUMERIC(10,2),
    new_amount NUMERIC(10,2),
    credit_issued NUMERIC(10,2) DEFAULT 0,
    refund_amount NUMERIC(10,2) DEFAULT 0,
    admin_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    notes TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Extend bookings table for enhanced functionality
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS cancellation_deadline TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS refund_eligibility TEXT DEFAULT 'full' CHECK (refund_eligibility IN ('full', 'partial', 'credit_only', 'none'));
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS booking_reference TEXT UNIQUE; -- Human-readable booking ID
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS payment_intent_id TEXT;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS stripe_session_id TEXT;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS original_amount NUMERIC(10,2); -- For tracking discounts
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS cancellation_requested_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS refund_processed_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS refund_amount NUMERIC(10,2) DEFAULT 0;

-- Create bundle modifications table for tracking changes
CREATE TABLE IF NOT EXISTS public.bundle_modifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bundle_id UUID NOT NULL REFERENCES public.event_bundles(id) ON DELETE CASCADE,
    booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
    modification_type TEXT NOT NULL CHECK (modification_type IN ('event_removed', 'event_added', 'event_swapped', 'bundle_extended')),
    old_event_id UUID REFERENCES public.events(id),
    new_event_id UUID REFERENCES public.events(id),
    price_adjustment NUMERIC(10,2) DEFAULT 0,
    credit_adjustment NUMERIC(10,2) DEFAULT 0,
    admin_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create notification queue for async processing
CREATE TABLE IF NOT EXISTS public.notification_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    notification_type TEXT NOT NULL CHECK (notification_type IN ('booking_confirmation', 'payment_success', 'cancellation_confirmed', 'refund_processed', 'credit_issued', 'credit_expiring', 'bundle_modified', 'event_reminder')),
    email TEXT NOT NULL,
    subject TEXT NOT NULL,
    content TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'cancelled')),
    priority INTEGER DEFAULT 1 CHECK (priority >= 1 AND priority <= 5), -- 1=low, 5=critical
    scheduled_for TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    sent_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user sessions table for better session management
CREATE TABLE IF NOT EXISTS public.user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    session_token TEXT NOT NULL UNIQUE,
    device_info JSONB DEFAULT '{}',
    ip_address INET,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on new tables
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_changes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bundle_modifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_preferences
CREATE POLICY "user_preferences_select_own" ON public.user_preferences FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "user_preferences_insert_own" ON public.user_preferences FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "user_preferences_update_own" ON public.user_preferences FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for event_credits
CREATE POLICY "event_credits_select_own" ON public.event_credits FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "event_credits_admin_all" ON public.event_credits FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- RLS Policies for booking_changes
CREATE POLICY "booking_changes_select_own" ON public.booking_changes FOR SELECT USING (
    auth.uid() = user_id OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "booking_changes_admin_all" ON public.booking_changes FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- RLS Policies for bundle_modifications
CREATE POLICY "bundle_modifications_select_related" ON public.bundle_modifications FOR SELECT USING (
    auth.uid() = user_id OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "bundle_modifications_admin_all" ON public.bundle_modifications FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- RLS Policies for notification_queue (admin only for management)
CREATE POLICY "notification_queue_admin_all" ON public.notification_queue FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- RLS Policies for user_sessions
CREATE POLICY "user_sessions_select_own" ON public.user_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "user_sessions_admin_all" ON public.user_sessions FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_event_credits_user_id ON public.event_credits(user_id);
CREATE INDEX IF NOT EXISTS idx_event_credits_status ON public.event_credits(status);
CREATE INDEX IF NOT EXISTS idx_event_credits_expires_at ON public.event_credits(expires_at);
CREATE INDEX IF NOT EXISTS idx_booking_changes_booking_id ON public.booking_changes(booking_id);
CREATE INDEX IF NOT EXISTS idx_booking_changes_created_at ON public.booking_changes(created_at);
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON public.bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_booking_reference ON public.bookings(booking_reference);
CREATE INDEX IF NOT EXISTS idx_bundle_modifications_bundle_id ON public.bundle_modifications(bundle_id);
CREATE INDEX IF NOT EXISTS idx_bundle_modifications_booking_id ON public.bundle_modifications(booking_id);
CREATE INDEX IF NOT EXISTS idx_notification_queue_status ON public.notification_queue(status);
CREATE INDEX IF NOT EXISTS idx_notification_queue_scheduled_for ON public.notification_queue(scheduled_for);
CREATE INDEX IF NOT EXISTS idx_notification_queue_priority ON public.notification_queue(priority);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON public.user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires_at ON public.user_sessions(expires_at);

-- Create functions for credit management
CREATE OR REPLACE FUNCTION get_user_credit_balance(user_uuid UUID)
RETURNS NUMERIC(10,2)
LANGUAGE sql
SECURITY DEFINER
AS $$
    SELECT COALESCE(SUM(credit_amount - used_amount), 0)
    FROM public.event_credits
    WHERE user_id = user_uuid
    AND status = 'active'
    AND expires_at > NOW();
$$;

-- Create function to generate booking reference
CREATE OR REPLACE FUNCTION generate_booking_reference()
RETURNS TEXT
LANGUAGE sql
AS $$
    SELECT 'BK' || TO_CHAR(NOW(), 'YYYYMMDD') || LPAD(NEXTVAL('booking_ref_seq')::TEXT, 6, '0');
$$;

-- Create sequence for booking references
CREATE SEQUENCE IF NOT EXISTS booking_ref_seq START 1;

-- Create function to update booking cancellation deadline
CREATE OR REPLACE FUNCTION update_booking_cancellation_deadline()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    -- Set cancellation deadline to 24 hours before first event in bundle, or event date
    IF NEW.bundle_id IS NOT NULL THEN
        -- For bundles, use the earliest event date
        SELECT MIN(e.date_time) - INTERVAL '24 hours'
        INTO NEW.cancellation_deadline
        FROM public.bundle_events be
        JOIN public.events e ON be.event_id = e.id
        WHERE be.bundle_id = NEW.bundle_id;
    ELSE
        -- For single events, use event date minus 24 hours
        SELECT e.date_time - INTERVAL '24 hours'
        INTO NEW.cancellation_deadline
        FROM public.events e
        WHERE e.id = NEW.event_id;
    END IF;

    -- Set refund eligibility based on time until event
    IF NEW.cancellation_deadline > NOW() + INTERVAL '7 days' THEN
        NEW.refund_eligibility := 'full';
    ELSIF NEW.cancellation_deadline > NOW() + INTERVAL '3 days' THEN
        NEW.refund_eligibility := 'partial';
    ELSIF NEW.cancellation_deadline > NOW() + INTERVAL '24 hours' THEN
        NEW.refund_eligibility := 'credit_only';
    ELSE
        NEW.refund_eligibility := 'none';
    END IF;

    RETURN NEW;
END;
$$;

-- Create trigger for booking cancellation deadline
DROP TRIGGER IF EXISTS set_booking_cancellation_deadline ON public.bookings;
CREATE TRIGGER set_booking_cancellation_deadline
    BEFORE INSERT ON public.bookings
    FOR EACH ROW
    EXECUTE FUNCTION update_booking_cancellation_deadline();

-- Create function to handle credit expiry
CREATE OR REPLACE FUNCTION expire_old_credits()
RETURNS void
LANGUAGE sql
AS $$
    UPDATE public.event_credits
    SET status = 'expired', updated_at = NOW()
    WHERE status = 'active'
    AND expires_at < NOW();
$$;

-- Create function to clean up old notification queue items
CREATE OR REPLACE FUNCTION cleanup_old_notifications()
RETURNS void
LANGUAGE sql
AS $$
    DELETE FROM public.notification_queue
    WHERE status IN ('sent', 'failed')
    AND created_at < NOW() - INTERVAL '30 days';
$$;

-- Update existing profiles to have proper structure
UPDATE public.profiles
SET email_verified = true
WHERE email_verified IS NULL;

-- Create default preferences for existing users
INSERT INTO public.user_preferences (user_id)
SELECT id FROM public.profiles
WHERE id NOT IN (SELECT user_id FROM public.user_preferences)
ON CONFLICT (user_id) DO NOTHING;