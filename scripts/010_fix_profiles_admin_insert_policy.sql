-- Fix profiles table RLS policies to allow admins to create profiles for new users
-- Migration: 010_fix_profiles_admin_insert_policy.sql

-- Drop the existing insert policy that only allows own inserts
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;

-- Create new insert policy that allows users to insert their own profile OR admins to insert any profile
CREATE POLICY "profiles_insert_own_or_admin" ON public.profiles FOR INSERT WITH CHECK (
  auth.uid() = id OR
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);