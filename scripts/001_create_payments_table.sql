-- Create payments table to track all payment transactions
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  event TEXT NOT NULL,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  payment_method TEXT,
  payment_status TEXT NOT NULL DEFAULT 'pending',
  stripe_payment_intent_id TEXT,
  stripe_session_id TEXT,
  booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for payments table
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for payments
CREATE POLICY "payments_select_own" ON public.payments 
  FOR SELECT USING (true); -- Admin can view all payments

CREATE POLICY "payments_insert_own" ON public.payments 
  FOR INSERT WITH CHECK (true); -- Allow system to insert payments

CREATE POLICY "payments_update_own" ON public.payments 
  FOR UPDATE USING (true); -- Allow system to update payment status
