-- Create admins table for admin users
-- Migration: 011_create_admins_table.sql

CREATE TABLE IF NOT EXISTS public.admins (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role TEXT DEFAULT 'admin' CHECK (role = 'admin'),
  phone TEXT,
  date_of_birth DATE,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  health_conditions TEXT,
  marketing_consent BOOLEAN DEFAULT false,
  account_status TEXT DEFAULT 'active' CHECK (account_status IN ('active', 'suspended', 'inactive')),
  email_verified BOOLEAN DEFAULT false,
  phone_verified BOOLEAN DEFAULT false,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on admins
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

-- Policies for admins (admin only access)
CREATE POLICY "admins_select_admin" ON public.admins FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "admins_insert_admin" ON public.admins FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "admins_update_admin" ON public.admins FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "admins_delete_admin" ON public.admins FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_admins_email ON public.admins(email);

-- Migrate existing admin profiles to the new admins table
INSERT INTO public.admins (id, first_name, last_name, email, role, phone, date_of_birth, emergency_contact_name, emergency_contact_phone, health_conditions, marketing_consent, account_status, email_verified, phone_verified, image_url, created_at, updated_at)
SELECT id, first_name, last_name, email, role, phone, date_of_birth, emergency_contact_name, emergency_contact_phone, health_conditions, marketing_consent, account_status, email_verified, phone_verified, image_url, created_at, updated_at
FROM public.profiles
WHERE role = 'admin'
ON CONFLICT (id) DO NOTHING;