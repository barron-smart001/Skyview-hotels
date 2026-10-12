import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const STAFF_ROLES = ['receptionist', 'manager', 'admin'] as const;

type StaffContext = {
  supabase: Awaited<ReturnType<typeof createClient>>;
  userId: string;
  role: (typeof STAFF_ROLES)[number];
};

/**
 * Resolves the signed-in staff member for a route handler, or returns the
 * error response to send back. Queries still run through RLS as that user.
 */
export async function requireStaff(): Promise<StaffContext | NextResponse> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Sign in required.' }, { status: 401 });

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle();
  if (!profile || !STAFF_ROLES.includes(profile.role)) {
    return NextResponse.json({ error: 'Staff access required.' }, { status: 403 });
  }

  return { supabase, userId: user.id, role: profile.role };
}
