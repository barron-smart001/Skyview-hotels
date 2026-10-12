-- 005: Guests may only attach their own booking to a service request.
-- Depends on 003 (policy names, public.is_staff()).

DROP POLICY IF EXISTS "Users can create own service requests" ON public.service_requests;
CREATE POLICY "Users can create own service requests" ON public.service_requests
  FOR INSERT TO authenticated
  WITH CHECK (
    (SELECT auth.uid()) = user_id
    AND status = 'Pending'
    AND (
      booking_id IS NULL
      OR EXISTS (
        SELECT 1 FROM public.bookings b
        WHERE b.id = booking_id AND b.user_id = (SELECT auth.uid())
      )
    )
  );

ALTER TABLE public.service_requests
  DROP CONSTRAINT IF EXISTS service_requests_requested_time_length;
ALTER TABLE public.service_requests
  ADD CONSTRAINT service_requests_requested_time_length CHECK (char_length(requested_time) BETWEEN 1 AND 120);
