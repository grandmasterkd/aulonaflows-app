-- Add booking_count field to events table
ALTER TABLE events ADD COLUMN IF NOT EXISTS booking_count INTEGER DEFAULT 0;

-- Update existing events to have correct booking counts
UPDATE events 
SET booking_count = (
  SELECT COUNT(*) 
  FROM bookings 
  WHERE bookings.class_id = events.id 
  AND bookings.status = 'confirmed'
);
