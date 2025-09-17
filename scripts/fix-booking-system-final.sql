-- Fix the booking system by making user_id nullable and adding proper RLS policies

-- First, make user_id nullable to allow guest bookings
ALTER TABLE bookings ALTER COLUMN user_id DROP NOT NULL;

-- Drop existing RLS policies if they exist
DROP POLICY IF EXISTS "Allow public to insert bookings" ON bookings;
DROP POLICY IF EXISTS "Allow authenticated users to view their bookings" ON bookings;
DROP POLICY IF EXISTS "Allow authenticated users to update their bookings" ON bookings;

-- Create RLS policies for bookings
-- Allow anyone to insert bookings (for guest bookings)
CREATE POLICY "Allow public to insert bookings" ON bookings
    FOR INSERT 
    WITH CHECK (true);

-- Allow users to view their own bookings, or allow public to view guest bookings
CREATE POLICY "Allow users to view bookings" ON bookings
    FOR SELECT 
    USING (
        auth.uid() = user_id OR 
        user_id IS NULL OR 
        auth.role() = 'service_role'
    );

-- Allow users to update their own bookings
CREATE POLICY "Allow users to update their bookings" ON bookings
    FOR UPDATE 
    USING (auth.uid() = user_id OR auth.role() = 'service_role');

-- Ensure RLS is enabled
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Also create a better structure for guest bookings by adding customer info columns
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS customer_name text,
ADD COLUMN IF NOT EXISTS customer_email text,
ADD COLUMN IF NOT EXISTS customer_phone text;

-- Create an index for better performance
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_class_id ON bookings(class_id);
CREATE INDEX IF NOT EXISTS idx_bookings_customer_email ON bookings(customer_email);
