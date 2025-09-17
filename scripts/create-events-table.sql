-- Create events table for the events management system
CREATE TABLE IF NOT EXISTS public.events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT,
    date_time TIMESTAMP WITH TIME ZONE NOT NULL,
    location TEXT,
    capacity INTEGER,
    price NUMERIC(10,2),
    instructor_name TEXT,
    image_url TEXT,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create an index on date_time for better query performance
CREATE INDEX IF NOT EXISTS idx_events_date_time ON public.events(date_time);

-- Create an index on status for filtering
CREATE INDEX IF NOT EXISTS idx_events_status ON public.events(status);

-- Enable Row Level Security (RLS)
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations for authenticated users (you can modify this based on your needs)
CREATE POLICY "Allow all operations for authenticated users" ON public.events
    FOR ALL USING (auth.role() = 'authenticated');

-- Create policy to allow read access for anonymous users (optional, for public events)
CREATE POLICY "Allow read access for anonymous users" ON public.events
    FOR SELECT USING (true);
