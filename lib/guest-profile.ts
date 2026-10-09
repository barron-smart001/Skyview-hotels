'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export type GuestProfile = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
};

export const EMPTY_GUEST_PROFILE: GuestProfile = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  address: '',
};

const PROFILE_CHANGE_EVENT = 'skyview-guest-profile-change';

export async function saveGuestProfile(profile: GuestProfile) {
  const supabase = createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError) throw authError;
  if (!user) throw new Error('Sign in to save your profile.');

  const { error } = await supabase
    .from('profiles')
    .update({
      first_name: profile.firstName.trim(),
      last_name: profile.lastName.trim(),
      phone: profile.phone.trim(),
      address: profile.address.trim(),
    })
    .eq('id', user.id);

  if (error) throw error;
  window.dispatchEvent(new Event(PROFILE_CHANGE_EVENT));
}

export async function saveGuestAvatar(image: Blob) {
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(image.type)) {
    throw new Error('Choose a JPEG, PNG, or WebP image.');
  }
  if (image.size > 5 * 1024 * 1024) {
    throw new Error('Profile photos must be smaller than 5 MB.');
  }

  const supabase = createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError) throw authError;
  if (!user) throw new Error('Sign in to update your profile photo.');

  const path = `${user.id}/avatar`;
  const { error: uploadError } = await supabase.storage
    .from('guest-avatars')
    .upload(path, image, { contentType: image.type, upsert: true });
  if (uploadError) throw uploadError;

  const { error: updateError } = await supabase
    .from('profiles')
    .update({ avatar_url: path })
    .eq('id', user.id);
  if (updateError) throw updateError;

  const { data, error: urlError } = await supabase.storage
    .from('guest-avatars')
    .createSignedUrl(path, 60 * 60);
  if (urlError) throw urlError;

  window.dispatchEvent(new Event(PROFILE_CHANGE_EVENT));
  return data.signedUrl;
}

export function useGuestProfile() {
  const [profile, setProfile] = useState<GuestProfile>(EMPTY_GUEST_PROFILE);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    let supabase: ReturnType<typeof createClient>;
    try {
      supabase = createClient();
    } catch (clientError) {
      window.setTimeout(() => {
        if (!active) return;
        setError(clientError instanceof Error ? clientError.message : 'Guest authentication is not configured.');
        setReady(true);
      }, 0);
      return () => {
        active = false;
      };
    }

    const refreshProfile = async () => {
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError) throw authError;

        if (!user) {
          if (!active) return;
          setAuthenticated(false);
          setProfile(EMPTY_GUEST_PROFILE);
          setAvatarUrl(null);
          setError(null);
          return;
        }

        if (active) setAuthenticated(true);
        const { data, error: profileError } = await supabase
          .from('profiles')
          .select('first_name, last_name, email, phone, address, avatar_url, role')
          .eq('id', user.id)
          .maybeSingle();
        if (profileError) throw profileError;
        if (!data || data.role !== 'guest') {
          throw new Error('A guest profile could not be found for this account.');
        }

        if (!active) return;
        setAuthenticated(true);
        setProfile({
          firstName: data.first_name,
          lastName: data.last_name,
          email: user.email ?? data.email,
          phone: data.phone ?? '',
          address: data.address ?? '',
        });
        if (data.avatar_url) {
          const { data: signedAvatar, error: avatarError } = await supabase.storage
            .from('guest-avatars')
            .createSignedUrl(data.avatar_url, 60 * 60);
          if (avatarError) throw avatarError;
          setAvatarUrl(signedAvatar.signedUrl);
        } else {
          setAvatarUrl(null);
        }
        setError(null);
      } catch (readError) {
        if (!active) return;
        setError(readError instanceof Error ? readError.message : 'Unable to load your guest profile.');
      } finally {
        if (active) setReady(true);
      }
    };

    void refreshProfile();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      window.setTimeout(() => void refreshProfile(), 0);
    });
    window.addEventListener(PROFILE_CHANGE_EVENT, refreshProfile);
    window.addEventListener('storage', refreshProfile);

    return () => {
      active = false;
      subscription.unsubscribe();
      window.removeEventListener(PROFILE_CHANGE_EVENT, refreshProfile);
      window.removeEventListener('storage', refreshProfile);
    };
  }, []);

  return { profile, avatarUrl, ready, authenticated, error };
}
