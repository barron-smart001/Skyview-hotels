-- 004: Let staff update room status (housekeeping, blocking rooms for maintenance).
-- Depends on public.is_staff() from 003.

DROP POLICY IF EXISTS "Staff can update rooms" ON public.rooms;
CREATE POLICY "Staff can update rooms" ON public.rooms
  FOR UPDATE TO authenticated
  USING ((SELECT public.is_staff()))
  WITH CHECK ((SELECT public.is_staff()));

-- Staff dashboard filters.
CREATE INDEX IF NOT EXISTS bookings_status_check_in_idx ON public.bookings (status, check_in DESC);
CREATE INDEX IF NOT EXISTS service_requests_status_idx ON public.service_requests (status, created_at DESC);
