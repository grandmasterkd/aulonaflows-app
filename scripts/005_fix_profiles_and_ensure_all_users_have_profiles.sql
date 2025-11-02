-- Ensure all existing auth users have profiles
INSERT INTO public.profiles (id, email, role, first_name, last_name)
SELECT 
  au.id,
  au.email,
  'admin',
  COALESCE(au.raw_user_meta_data ->> 'first_name', SPLIT_PART(au.email, '@', 1)),
  COALESCE(au.raw_user_meta_data ->> 'last_name', '')
FROM auth.users au
WHERE NOT EXISTS (
  SELECT 1 FROM public.profiles p WHERE p.id = au.id
);

-- Update the trigger to handle image_url properly
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name, email, role, image_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'first_name', SPLIT_PART(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data ->> 'last_name', ''),
    NEW.email,
    'admin',
    NULL
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;
