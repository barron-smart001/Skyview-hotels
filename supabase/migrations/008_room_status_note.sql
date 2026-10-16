-- 008: Optional reason shown to staff when a room is marked unavailable.
ALTER TABLE public.rooms
  ADD COLUMN IF NOT EXISTS status_note TEXT CHECK (status_note IS NULL OR char_length(status_note) <= 200);
