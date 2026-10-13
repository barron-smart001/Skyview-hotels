-- 006: Only administrators (profiles.role = 'admin') get hotel-wide access.
-- Replaces the receptionist/manager/admin "staff" checks from 003 and 004.

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

REVOKE ALL ON FUNCTION public.is_admin() FROM public;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

-- Bookings
DROP POLICY IF EXISTS "Staff can manage all bookings" ON public.bookings;
DROP POLICY IF EXISTS "Admins can manage all bookings" ON public.bookings;
CREATE POLICY "Admins can manage all bookings" ON public.bookings
  FOR ALL TO authenticated
  USING ((SELECT public.is_admin()))
  WITH CHECK ((SELECT public.is_admin()));

-- Payments
DROP POLICY IF EXISTS "Users can view own payments" ON public.payments;
CREATE POLICY "Users can view own payments" ON public.payments
  FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = user_id OR (SELECT public.is_admin()));

-- Service requests
DROP POLICY IF EXISTS "Users can view own service requests" ON public.service_requests;
CREATE POLICY "Users can view own service requests" ON public.service_requests
  FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = user_id OR (SELECT public.is_admin()));

DROP POLICY IF EXISTS "Staff can manage service requests" ON public.service_requests;
DROP POLICY IF EXISTS "Admins can manage service requests" ON public.service_requests;
CREATE POLICY "Admins can manage service requests" ON public.service_requests
  FOR UPDATE TO authenticated
  USING ((SELECT public.is_admin()))
  WITH CHECK ((SELECT public.is_admin()));

-- Profiles (guest directory)
DROP POLICY IF EXISTS "Staff can view profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view profiles" ON public.profiles;
CREATE POLICY "Admins can view profiles" ON public.profiles
  FOR SELECT TO authenticated
  USING ((SELECT public.is_admin()));

-- Rooms
DROP POLICY IF EXISTS "Staff can update rooms" ON public.rooms;
DROP POLICY IF EXISTS "Admins can update rooms" ON public.rooms;
CREATE POLICY "Admins can update rooms" ON public.rooms
  FOR UPDATE TO authenticated
  USING ((SELECT public.is_admin()))
  WITH CHECK ((SELECT public.is_admin()));

DROP FUNCTION IF EXISTS public.is_staff();

-- Admin directory and payment screens.
CREATE INDEX IF NOT EXISTS profiles_role_created_at_idx ON public.profiles (role, created_at DESC);
CREATE INDEX IF NOT EXISTS payments_paid_at_idx ON public.payments (paid_at DESC);
CREATE INDEX IF NOT EXISTS bookings_user_id_idx ON public.bookings (user_id);
