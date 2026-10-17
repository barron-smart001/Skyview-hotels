-- 009: Reception can record bookings made off the website (walk-ins, phone calls).
ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS source TEXT NOT NULL DEFAULT 'online'
    CHECK (source IN ('online', 'walk-in', 'phone')),
  ADD COLUMN IF NOT EXISTS payment_method TEXT
    CHECK (payment_method IS NULL OR payment_method IN ('cash', 'transfer', 'pos', 'card')),
  ADD COLUMN IF NOT EXISTS recorded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS bookings_source_created_idx ON public.bookings (source, created_at DESC);
