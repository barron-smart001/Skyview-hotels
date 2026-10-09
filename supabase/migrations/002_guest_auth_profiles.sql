ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS address TEXT NOT NULL DEFAULT '';

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Guests can view their own profile" ON public.profiles;
CREATE POLICY "Guests can view their own profile"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Guests can update their own profile" ON public.profiles;
CREATE POLICY "Guests can update their own profile"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

REVOKE UPDATE ON public.profiles FROM anon, authenticated;
GRANT UPDATE (first_name, last_name, phone, address, avatar_url)
  ON public.profiles
  TO authenticated;

CREATE OR REPLACE FUNCTION public.handle_guest_auth_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name, email, phone, address, role)
  VALUES (
    NEW.id,
    COALESCE(
      NULLIF(BTRIM(NEW.raw_user_meta_data ->> 'first_name'), ''),
      NULLIF(SPLIT_PART(COALESCE(NEW.raw_user_meta_data ->> 'full_name', 'Guest'), ' ', 1), ''),
      'Guest'
    ),
    COALESCE(NULLIF(BTRIM(NEW.raw_user_meta_data ->> 'last_name'), ''), ''),
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data ->> 'phone', ''),
    '',
    'guest'
  )
  ON CONFLICT (id) DO UPDATE
    SET email = EXCLUDED.email,
        updated_at = NOW();

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_or_email_updated ON auth.users;
CREATE TRIGGER on_auth_user_created_or_email_updated
  AFTER INSERT OR UPDATE OF email ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_guest_auth_user();

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'guest-avatars',
  'guest-avatars',
  FALSE,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE
  SET public = FALSE,
      file_size_limit = EXCLUDED.file_size_limit,
      allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "Guests can view their own avatar" ON storage.objects;
CREATE POLICY "Guests can view their own avatar"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (bucket_id = 'guest-avatars' AND (storage.foldername(name))[1] = auth.uid()::TEXT);

DROP POLICY IF EXISTS "Guests can upload their own avatar" ON storage.objects;
CREATE POLICY "Guests can upload their own avatar"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'guest-avatars' AND (storage.foldername(name))[1] = auth.uid()::TEXT);

DROP POLICY IF EXISTS "Guests can update their own avatar" ON storage.objects;
CREATE POLICY "Guests can update their own avatar"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'guest-avatars' AND (storage.foldername(name))[1] = auth.uid()::TEXT)
  WITH CHECK (bucket_id = 'guest-avatars' AND (storage.foldername(name))[1] = auth.uid()::TEXT);

DROP POLICY IF EXISTS "Guests can delete their own avatar" ON storage.objects;
CREATE POLICY "Guests can delete their own avatar"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'guest-avatars' AND (storage.foldername(name))[1] = auth.uid()::TEXT);
