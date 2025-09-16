-- Insert sample events
INSERT INTO public.events (name, category, description, date_time, location, capacity, price, instructor_name, image_url, status) VALUES
('Morning Hatha Yoga', 'Yoga Classes', 'A gentle morning practice focusing on alignment and breath work', '2024-12-20 08:00:00+00', 'Studio A, Glasgow', 15, 25.00, 'Aulona', '/placeholder.svg?height=400&width=600', 'active'),
('Sound Bath Meditation', 'Sound Therapy', 'Deep relaxation through healing sound frequencies', '2024-12-21 19:00:00+00', 'Studio B, Glasgow', 12, 35.00, 'Aulona', '/placeholder.svg?height=400&width=600', 'active'),
('Vinyasa Flow', 'Yoga Classes', 'Dynamic flowing sequences linking breath and movement', '2024-12-22 10:00:00+00', 'Studio A, Glasgow', 20, 30.00, 'Aulona', '/placeholder.svg?height=400&width=600', 'active'),
('Wellness Workshop: Mindful Living', 'Wellness Events', 'Learn practical techniques for incorporating mindfulness into daily life', '2024-12-23 14:00:00+00', 'Community Hall, Glasgow', 25, 45.00, 'Aulona', '/placeholder.svg?height=400&width=600', 'active'),
('Corporate Yoga Session', 'Corporate & Private Bookings', 'Customized yoga session for workplace wellness', '2024-12-24 12:00:00+00', 'Client Office, Glasgow', 30, 80.00, 'Aulona', '/placeholder.svg?height=400&width=600', 'active'),
('Evening Restorative Yoga', 'Yoga Classes', 'Gentle poses with props to promote deep relaxation', '2024-12-25 18:30:00+00', 'Studio A, Glasgow', 12, 28.00, 'Aulona', '/placeholder.svg?height=400&width=600', 'active');

-- Insert sample bookings
INSERT INTO public.bookings (event_id, name, email, phone, notes, payment_status, booking_status, amount, payment_method) VALUES
((SELECT id FROM public.events WHERE name = 'Morning Hatha Yoga' LIMIT 1), 'Sarah Johnson', 'sarah.johnson@email.com', '+44 7700 900123', 'First time attending', 'paid', 'confirmed', 25.00, 'card'),
((SELECT id FROM public.events WHERE name = 'Sound Bath Meditation' LIMIT 1), 'Michael Brown', 'michael.brown@email.com', '+44 7700 900124', 'Looking forward to this', 'paid', 'confirmed', 35.00, 'card'),
((SELECT id FROM public.events WHERE name = 'Vinyasa Flow' LIMIT 1), 'Emma Wilson', 'emma.wilson@email.com', '+44 7700 900125', '', 'pending', 'confirmed', 30.00, 'bank_transfer'),
((SELECT id FROM public.events WHERE name = 'Morning Hatha Yoga' LIMIT 1), 'James Davis', 'james.davis@email.com', '+44 7700 900126', 'Regular attendee', 'paid', 'confirmed', 25.00, 'card'),
((SELECT id FROM public.events WHERE name = 'Wellness Workshop: Mindful Living' LIMIT 1), 'Lisa Thompson', 'lisa.thompson@email.com', '+44 7700 900127', 'Excited for the workshop', 'paid', 'confirmed', 45.00, 'card');

-- Insert corresponding payments
INSERT INTO public.payments (booking_id, amount, payment_method, status, transaction_id) VALUES
((SELECT id FROM public.bookings WHERE email = 'sarah.johnson@email.com' LIMIT 1), 25.00, 'card', 'completed', 'txn_001'),
((SELECT id FROM public.bookings WHERE email = 'michael.brown@email.com' LIMIT 1), 35.00, 'card', 'completed', 'txn_002'),
((SELECT id FROM public.bookings WHERE email = 'emma.wilson@email.com' LIMIT 1), 30.00, 'bank_transfer', 'pending', 'txn_003'),
((SELECT id FROM public.bookings WHERE email = 'james.davis@email.com' LIMIT 1), 25.00, 'card', 'completed', 'txn_004'),
((SELECT id FROM public.bookings WHERE email = 'lisa.thompson@email.com' LIMIT 1), 45.00, 'card', 'completed', 'txn_005');
