import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { AdminIdentity } from '@/types';

type AdminContext = {
  supabase: Awaited<ReturnType<typeof createClient>>;
  userId: string;
};

/**
 * Only profiles with role = 'admin' may use the admin portal and its APIs.
 * Database policies enforce the same rule (migration 006), so this is the
 * friendly error path rather than the only line of defence.
 */
export async function getAdminIdentity(): Promise<{ userId: string; identity: AdminIdentity } | 'signed-out' | 'forbidden'> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return 'signed-out';

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, first_name, last_name, email')
    .eq('id', user.id)
    .maybeSingle();

  if (profile?.role !== 'admin') return 'forbidden';

  const name = `${profile.first_name ?? ''} ${profile.last_name ?? ''}`.trim() || 'Administrator';
  return { userId: user.id, identity: { name, email: profile.email ?? user.email ?? '' } };
}

/** Route-handler guard: the admin's RLS-scoped client, or the error response to return. */
export async function requireAdmin(): Promise<AdminContext | NextResponse> {
  const result = await getAdminIdentity();
  if (result === 'signed-out') return NextResponse.json({ error: 'Sign in required.' }, { status: 401 });
  if (result === 'forbidden') return NextResponse.json({ error: 'Administrator access required.' }, { status: 403 });
  return { supabase: await createClient(), userId: result.userId };
}
