-- Enable RLS on bookings table (if not already enabled)
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert bookings (for public booking system)
CREATE POLICY "Allow public booking creation" ON bookings
FOR INSERT 
TO public
WITH CHECK (true);

-- Allow users to view their own bookings (if user_id matches)
CREATE POLICY "Users can view own bookings" ON bookings
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

-- Allow authenticated users to view all bookings (for admin purposes)
CREATE POLICY "Authenticated users can view all bookings" ON bookings
FOR SELECT 
TO authenticated
USING (true);

-- Allow authenticated users to update bookings
CREATE POLICY "Authenticated users can update bookings" ON bookings
FOR UPDATE 
TO authenticated
USING (true);
