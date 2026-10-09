-- 1. Create Default Hotel (Skyview Grand Uyo)
INSERT INTO public.hotels (id, name, slug, city, state, country, address, phone, email, currency)
VALUES (
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  'Skyview Grand Hotel & Suites',
  'skyview-uyo',
  'Uyo',
  'Akwa Ibom State',
  'Nigeria',
  'Uyo, Akwa Ibom State, Nigeria',
  '+234 803 000 0000',
  'reservations@skyviewhotels.ng',
  'NGN'
) ON CONFLICT (slug) DO NOTHING;

-- 2. Create Room Types
INSERT INTO public.room_types (id, hotel_id, name, slug, base_price_ngn, capacity, size_sqft, bed_type, description)
VALUES 
  ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380001', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Skyline Presidential Suite', 'presidential-suite', 280000.00, 4, 1100, 'Super King Bed + Guest Room', 'Panoramic top-floor skyline views, private jacuzzi, and VIP concierge.'),
  ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380002', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Executive Panorama Suite', 'executive-panorama', 165000.00, 2, 650, 'King Bed', 'Executive lounge, marble tub, and high speed work desk.'),
  ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380003', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Deluxe Garden View Room', 'deluxe-garden', 95000.00, 2, 450, 'Queen Bed', 'Lush tropical garden vistas with acoustic soundproofing.'),
  ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380004', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Standard City Comfort', 'standard-city', 65000.00, 2, 350, 'Double Bed', 'Cozy modern room with fast connectivity and smart climate control.')
ON CONFLICT DO NOTHING;

-- 3. Create Hotel Services
INSERT INTO public.services (hotel_id, name, category, price_ngn, duration, description, image_url, popular)
VALUES
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Deep Tissue Swedish Massage', 'Spa & Wellness', 35000.00, '75 mins', 'Calming aromatic therapeutic massage.', 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=800&q=80', true),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'VIP Airport Chauffeur Transfer', 'Concierge', 45000.00, 'One-way', 'Executive SUV transfer with refreshments.', 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=800&q=80', true),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Gourmet Champagne Breakfast', 'Room Service', 25000.00, 'Fresh on demand', 'Poached eggs, artisan brioche, and champagne.', 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?auto=format&fit=crop&w=800&q=80', true),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Ibom Heritage City Tour', 'Tours & Experiences', 45000.00, '3 hours', 'Guided Uyo landmarks, artisan stops, and local refreshments.', 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80', false)
ON CONFLICT DO NOTHING;
