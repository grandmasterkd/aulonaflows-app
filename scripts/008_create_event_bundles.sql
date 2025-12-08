-- Create event bundles feature
-- Migration: 008_create_event_bundles.sql

-- Create event_bundles table
CREATE TABLE IF NOT EXISTS public.event_bundles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    discount_percentage INTEGER NOT NULL CHECK (discount_percentage >= 0 AND discount_percentage <= 100),
    total_price NUMERIC(10,2) NOT NULL,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create bundle_events junction table
CREATE TABLE IF NOT EXISTS public.bundle_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bundle_id UUID NOT NULL REFERENCES public.event_bundles(id) ON DELETE CASCADE,
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(bundle_id, event_id)
);

-- Enable RLS on event_bundles
ALTER TABLE public.event_bundles ENABLE ROW LEVEL SECURITY;

-- Enable RLS on bundle_events
ALTER TABLE public.bundle_events ENABLE ROW LEVEL SECURITY;

-- Policies for event_bundles (admin only)
CREATE POLICY "event_bundles_select_admin" ON public.event_bundles FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "event_bundles_insert_admin" ON public.event_bundles FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "event_bundles_update_admin" ON public.event_bundles FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "event_bundles_delete_admin" ON public.event_bundles FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Policies for bundle_events (admin only)
CREATE POLICY "bundle_events_select_admin" ON public.bundle_events FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "bundle_events_insert_admin" ON public.bundle_events FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "bundle_events_update_admin" ON public.bundle_events FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "bundle_events_delete_admin" ON public.bundle_events FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_event_bundles_status ON public.event_bundles(status);
CREATE INDEX IF NOT EXISTS idx_bundle_events_bundle_id ON public.bundle_events(bundle_id);
CREATE INDEX IF NOT EXISTS idx_bundle_events_event_id ON public.bundle_events(event_id);

-- Add bundle_id to bookings table for bundle bookings
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS bundle_id UUID REFERENCES public.event_bundles(id) ON DELETE SET NULL;

-- Update RLS policy for bookings to allow bundle_id updates
DROP POLICY IF EXISTS "bookings_update_admin" ON public.bookings;
CREATE POLICY "bookings_update_admin" ON public.bookings FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);