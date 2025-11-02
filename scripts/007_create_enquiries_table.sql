-- Create enquiries table to store customer enquiries
CREATE TABLE IF NOT EXISTS enquiries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  country TEXT NOT NULL,
  state TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'responded', 'closed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_enquiries_email ON enquiries(email);

-- Create index on status for filtering
CREATE INDEX IF NOT EXISTS idx_enquiries_status ON enquiries(status);

-- Create index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_enquiries_created_at ON enquiries(created_at DESC);

-- Enable Row Level Security
ALTER TABLE enquiries ENABLE ROW LEVEL SECURITY;

-- Create policy to allow authenticated users to read enquiries (for admin)
CREATE POLICY "Allow authenticated users to read enquiries" ON enquiries
  FOR SELECT USING (auth.role() = 'authenticated');

-- Create policy to allow anyone to insert enquiries (public form submission)
CREATE POLICY "Allow public to insert enquiries" ON enquiries
  FOR INSERT WITH CHECK (true);

-- Create policy to allow authenticated users to update enquiries (for admin)
CREATE POLICY "Allow authenticated users to update enquiries" ON enquiries
  FOR UPDATE USING (auth.role() = 'authenticated');