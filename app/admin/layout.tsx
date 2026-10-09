import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

/** Server-side guard for all operational pages. */
export default async function AdminRouteLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/sign-in?next=/admin');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || !['admin', 'manager', 'receptionist'].includes(profile.role)) {
    redirect('/');
  }

  return children;
}
