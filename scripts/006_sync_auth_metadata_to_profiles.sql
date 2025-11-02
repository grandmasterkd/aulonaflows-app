-- Sync user_metadata from auth.users to profiles table
-- This ensures profiles table is populated with data from authentication

-- First, let's update the handle_new_user function to properly sync user_metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    email, 
    first_name, 
    last_name, 
    phone,
    image_url,
    created_at,
    updated_at
  )
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'first_name', ''),
    COALESCE(new.raw_user_meta_data->>'last_name', ''),
    COALESCE(new.raw_user_meta_data->>'phone', new.phone, ''),
    COALESCE(new.raw_user_meta_data->>'image_url', NULL),
    now(),
    now()
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Now sync all existing auth users to profiles table
-- This will insert profiles for users that don't have one yet
INSERT INTO public.profiles (
  id,
  email,
  first_name,
  last_name,
  phone,
  image_url,
  created_at,
  updated_at
)
SELECT 
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'first_name', ''),
  COALESCE(au.raw_user_meta_data->>'last_name', ''),
  COALESCE(au.raw_user_meta_data->>'phone', au.phone, ''),
  COALESCE(au.raw_user_meta_data->>'image_url', NULL),
  au.created_at,
  now()
FROM auth.users au
WHERE NOT EXISTS (
  SELECT 1 FROM public.profiles p WHERE p.id = au.id
);

-- Update existing profiles with data from auth.users if they're missing data
UPDATE public.profiles p
SET 
  email = COALESCE(p.email, au.email),
  first_name = COALESCE(NULLIF(p.first_name, ''), au.raw_user_meta_data->>'first_name', ''),
  last_name = COALESCE(NULLIF(p.last_name, ''), au.raw_user_meta_data->>'last_name', ''),
  phone = COALESCE(NULLIF(p.phone, ''), au.raw_user_meta_data->>'phone', au.phone, ''),
  updated_at = now()
FROM auth.users au
WHERE p.id = au.id;

-- Grant necessary permissions
GRANT SELECT ON public.profiles TO authenticated;
GRANT UPDATE ON public.profiles TO authenticated;

-- Enable RLS if not already enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to read their own profile
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Create policy to allow users to update their own profile
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- Add a function to sync profile updates back to auth.users metadata
CREATE OR REPLACE FUNCTION public.sync_profile_to_auth()
RETURNS trigger AS $$
BEGIN
  -- Update the user_metadata in auth.users when profile is updated
  UPDATE auth.users
  SET raw_user_meta_data = raw_user_meta_data || 
    jsonb_build_object(
      'first_name', NEW.first_name,
      'last_name', NEW.last_name,
      'phone', NEW.phone,
      'image_url', NEW.image_url
    )
  WHERE id = NEW.id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to sync profile updates back to auth
DROP TRIGGER IF EXISTS sync_profile_to_auth_trigger ON public.profiles;
CREATE TRIGGER sync_profile_to_auth_trigger
  AFTER UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_profile_to_auth();
