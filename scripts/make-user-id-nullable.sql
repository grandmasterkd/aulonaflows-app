-- Make user_id nullable to allow guest bookings
ALTER TABLE bookings ALTER COLUMN user_id DROP NOT NULL;

-- Add RLS policy to allow public booking creation
DROP POLICY IF EXISTS "Allow public booking creation" ON bookings;
CREATE POLICY "Allow public booking creation" ON bookings
  FOR INSERT 
  WITH CHECK (true);

-- Add RLS policy to allow users to view their own bookings
DROP POLICY IF EXISTS "Users can view own bookings" ON bookings;
CREATE POLICY "Users can view own bookings" ON bookings
  FOR SELECT 
  USING (auth.uid() = user_id OR user_id IS NULL);
