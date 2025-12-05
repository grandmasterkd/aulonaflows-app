-- Add bundle_id to payments table for bundle payments
-- Migration: 014_add_bundle_id_to_payments.sql

ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS bundle_id UUID REFERENCES public.event_bundles(id) ON DELETE SET NULL;

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_payments_bundle_id ON public.payments(bundle_id);