-- Add decline_reason field to bookings table for cancel participation feature
-- Migration: 015_add_decline_reason_to_bookings.sql

ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS decline_reason TEXT;