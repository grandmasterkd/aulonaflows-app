-- Drop the existing foreign key constraint that references yoga_classes
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_class_id_fkey;

-- Add new foreign key constraint that references events table
ALTER TABLE bookings ADD CONSTRAINT bookings_class_id_fkey 
    FOREIGN KEY (class_id) REFERENCES events(id) ON DELETE CASCADE;

-- Update any existing bookings that might have invalid class_ids
-- (This is optional - only if there's existing data that needs cleanup)
UPDATE bookings SET class_id = NULL WHERE class_id NOT IN (SELECT id FROM events);
