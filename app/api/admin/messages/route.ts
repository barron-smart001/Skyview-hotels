import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';

const PAGE_SIZE = 50;

/** Inbox for enquiries and problem reports, newest first. ?status=new&page=0 */
export async function GET(request: Request) {
  const admin = await requireAdmin();
  if (admin instanceof NextResponse) return admin;

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const page = Math.max(0, Number.parseInt(searchParams.get('page') ?? '0', 10) || 0);

  let query = admin.supabase
    .from('contact_messages')
    .select('id, kind, name, email, phone, booking_reference, message, status, created_at', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE - 1);
  if (status === 'new' || status === 'in-progress' || status === 'resolved') query = query.eq('status', status);

  const { data, count, error } = await query;
  if (error) {
    console.error('Failed to load messages:', error);
    return NextResponse.json({ error: 'Messages are unavailable right now.' }, { status: 503 });
  }
  return NextResponse.json({ messages: data, total: count ?? 0 });
}
