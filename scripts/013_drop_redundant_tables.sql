-- Drop redundant tables for unified auth system
-- Migration: 013_drop_redundant_tables.sql

-- First, ensure any remaining admin data is migrated to profiles (if not already done)
INSERT INTO public.profiles (id, first_name, last_name, email, role, phone, image_url, created_at, updated_at)
SELECT id, first_name, last_name, email, 'admin', phone, image_url, created_at, updated_at
FROM public.admins
WHERE NOT EXISTS (
  SELECT 1 FROM public.profiles p WHERE p.id = admins.id
)
ON CONFLICT (id) DO NOTHING;

-- Drop the admins table
DROP TABLE IF EXISTS public.admins;

-- Drop the admin_invites table
DROP TABLE IF EXISTS public.admin_invites;