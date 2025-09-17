-- Make user_id nullable to allow guest bookings
ALTER TABLE bookings ALTER COLUMN user_id DROP NOT NULL;

-- Update RLS policies to allow guest bookings
DROP POLICY IF EXISTS "Allow public booking creation" ON bookings;
DROP POLICY IF EXISTS "Users can view their own bookings" ON bookings;
DROP POLICY IF EXISTS "Users can update their own bookings" ON bookings;

-- Create new policies that handle both authenticated and guest users
CREATE POLICY "Allow booking creation for everyone" ON bookings
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view their own bookings or all if admin" ON bookings
    FOR SELECT USING (
        auth.uid() = user_id OR 
        user_id IS NULL OR
        auth.jwt() ->> 'role' = 'admin'
    );

CREATE POLICY "Users can update their own bookings or all if admin" ON bookings
    FOR UPDATE USING (
        auth.uid() = user_id OR 
        user_id IS NULL OR
        auth.jwt() ->> 'role' = 'admin'
    );
