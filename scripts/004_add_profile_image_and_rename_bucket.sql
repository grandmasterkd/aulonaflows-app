-- Add image_url column to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Note: Renaming a bucket in Supabase requires manual steps in the Supabase dashboard
-- or creating a new bucket and migrating files. For now, we'll create a new 'uploads' bucket
-- and keep 'event-images' for backward compatibility.

-- Create new 'uploads' bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('uploads', 'uploads', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies for uploads bucket
CREATE POLICY "Allow authenticated users to upload files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'uploads');

CREATE POLICY "Allow public to view uploaded files"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'uploads');

CREATE POLICY "Allow authenticated users to update uploads"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'uploads');

CREATE POLICY "Allow authenticated users to delete uploads"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'uploads');

-- Create profiles folder structure (folders are virtual in Supabase Storage)
-- Files will be uploaded to 'uploads/profiles/' and 'uploads/events/'
