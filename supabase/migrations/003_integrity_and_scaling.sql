-- 003: Data integrity, security and indexing for production traffic.

-- ---------------------------------------------------------------------------
-- 1. Prevent double bookings at the database level.
--    An application-side "check then insert" races under concurrent requests;
--    an exclusion constraint makes overlapping confirmed stays impossible.
-- ---------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS btree_gist;

ALTER TABLE public.bookings
  DROP CONSTRAINT IF EXISTS bookings_no_overlapping_stays;
ALTER TABLE public.bookings
  ADD CONSTRAINT bookings_no_overlapping_stays
  EXCLUDE USING gist (room_id WITH =, daterange(check_in, check_out, '[)') WITH &&)
  WHERE (status IN ('confirmed', 'checked-in'));

-- New bookings must start unpaid; the old defaults marked every insert as paid.
ALTER TABLE public.bookings ALTER COLUMN status SET DEFAULT 'pending';
ALTER TABLE public.bookings ALTER COLUMN payment_status SET DEFAULT 'pending';

ALTER TABLE public.bookings
  DROP CONSTRAINT IF EXISTS bookings_guests_count_positive;
ALTER TABLE public.bookings
  ADD CONSTRAINT bookings_guests_count_positive CHECK (guests_count > 0);

-- Room numbers are unique within a hotel (also lets seeds upsert safely).
ALTER TABLE public.rooms
  DROP CONSTRAINT IF EXISTS rooms_hotel_room_number_key;
ALTER TABLE public.rooms
  ADD CONSTRAINT rooms_hotel_room_number_key UNIQUE (hotel_id, room_number);

ALTER TABLE public.room_types
  DROP CONSTRAINT IF EXISTS room_types_hotel_slug_key;
ALTER TABLE public.room_types
  ADD CONSTRAINT room_types_hotel_slug_key UNIQUE (hotel_id, slug);

-- ---------------------------------------------------------------------------
-- 2. Indexes for the queries the app runs on every request.
--    Postgres does not index foreign keys automatically.
-- ---------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS bookings_user_id_check_in_idx ON public.bookings (user_id, check_in DESC);
CREATE INDEX IF NOT EXISTS bookings_room_id_idx ON public.bookings (room_id);
CREATE INDEX IF NOT EXISTS bookings_hotel_id_created_at_idx ON public.bookings (hotel_id, created_at DESC);
CREATE INDEX IF NOT EXISTS rooms_hotel_id_price_idx ON public.rooms (hotel_id, price_per_night_ngn);
CREATE INDEX IF NOT EXISTS rooms_room_type_id_idx ON public.rooms (room_type_id);
CREATE INDEX IF NOT EXISTS room_types_hotel_id_idx ON public.room_types (hotel_id);
CREATE INDEX IF NOT EXISTS payments_booking_id_idx ON public.payments (booking_id);
CREATE INDEX IF NOT EXISTS payments_user_id_idx ON public.payments (user_id);
CREATE INDEX IF NOT EXISTS services_hotel_id_idx ON public.services (hotel_id);
CREATE INDEX IF NOT EXISTS service_requests_user_id_idx ON public.service_requests (user_id);
CREATE INDEX IF NOT EXISTS service_requests_booking_id_idx ON public.service_requests (booking_id);

-- ---------------------------------------------------------------------------
-- 3. Row Level Security fixes.
-- ---------------------------------------------------------------------------

-- hotels and room_types had RLS disabled, so anyone with the public anon key
-- could insert, update or delete them. Make them read-only to the public.
ALTER TABLE public.hotels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_types ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view hotels" ON public.hotels;
CREATE POLICY "Public can view hotels" ON public.hotels FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can view room types" ON public.room_types;
CREATE POLICY "Public can view room types" ON public.room_types FOR SELECT USING (true);

-- Staff check evaluated once per query (not once per row) via a cached function.
CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('receptionist', 'manager', 'admin')
  );
$$;

REVOKE ALL ON FUNCTION public.is_staff() FROM public;
GRANT EXECUTE ON FUNCTION public.is_staff() TO authenticated;

-- Guests previously could INSERT/UPDATE their own bookings directly from the
-- browser, including setting payment_status = 'paid'. Bookings are now written
-- only by the server (service role) after validation and payment checks.
DROP POLICY IF EXISTS "Users can insert own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Users can update own bookings" ON public.bookings;

DROP POLICY IF EXISTS "Users can view own bookings" ON public.bookings;
CREATE POLICY "Users can view own bookings" ON public.bookings
  FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Staff can view all bookings" ON public.bookings;
CREATE POLICY "Staff can manage all bookings" ON public.bookings
  FOR ALL TO authenticated
  USING ((SELECT public.is_staff()))
  WITH CHECK ((SELECT public.is_staff()));

-- payments had RLS enabled with no policies at all.
DROP POLICY IF EXISTS "Users can view own payments" ON public.payments;
CREATE POLICY "Users can view own payments" ON public.payments
  FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = user_id OR (SELECT public.is_staff()));

-- service_requests had RLS enabled with no policies at all.
DROP POLICY IF EXISTS "Users can view own service requests" ON public.service_requests;
CREATE POLICY "Users can view own service requests" ON public.service_requests
  FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = user_id OR (SELECT public.is_staff()));

DROP POLICY IF EXISTS "Users can create own service requests" ON public.service_requests;
CREATE POLICY "Users can create own service requests" ON public.service_requests
  FOR INSERT TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id AND status = 'Pending');

DROP POLICY IF EXISTS "Staff can manage service requests" ON public.service_requests;
CREATE POLICY "Staff can manage service requests" ON public.service_requests
  FOR UPDATE TO authenticated
  USING ((SELECT public.is_staff()))
  WITH CHECK ((SELECT public.is_staff()));

-- Staff can read guest profiles (admin dashboards).
DROP POLICY IF EXISTS "Staff can view profiles" ON public.profiles;
CREATE POLICY "Staff can view profiles" ON public.profiles
  FOR SELECT TO authenticated
  USING ((SELECT public.is_staff()));
