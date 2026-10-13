import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';

const STATUSES = ['new', 'in-progress', 'resolved'];

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (admin instanceof NextResponse) return admin;

  const { id } = await params;
  const body = await request.json().catch(() => null);
  if (!body || !STATUSES.includes(body.status)) {
    return NextResponse.json({ error: 'Invalid status.' }, { status: 400 });
  }

  const { data, error } = await admin.supabase
    .from('contact_messages')
    .update({ status: body.status })
    .eq('id', id)
    .select('id, status')
    .maybeSingle();

  if (error) {
    console.error('Failed to update message:', error);
    return NextResponse.json({ error: 'The message could not be updated.' }, { status: 500 });
  }
  if (!data) return NextResponse.json({ error: 'Message not found.' }, { status: 404 });
  return NextResponse.json({ message: data });
}
