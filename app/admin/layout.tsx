import { redirect } from 'next/navigation';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { getAdminIdentity } from '@/lib/auth';

/** Server-side guard for the whole admin portal: administrators only. */
export default async function AdminRouteLayout({ children }: { children: React.ReactNode }) {
  const result = await getAdminIdentity();

  if (result === 'signed-out') redirect('/sign-in?next=/admin');
  if (result === 'forbidden') redirect('/');

  return <AdminLayout admin={result.identity}>{children}</AdminLayout>;
}
