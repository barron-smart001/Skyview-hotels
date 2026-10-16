import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { requireAdmin } from '@/lib/auth';
import { ROOMS_CACHE_TAG } from '@/lib/rooms';

const ROOM_STATUSES = ['available', 'occupied', 'cleaning', 'maintenance'] as const;

/** Housekeeping / availability updates. Requires migration 004 (staff room update policy). */
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (admin instanceof NextResponse) return admin;

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const status = body?.status;
  const rawNote = typeof body?.note === 'string' ? body.note.trim().slice(0, 200) : '';
  // The reason only applies while a room is out of service.
  const statusNote = status === 'available' || !rawNote ? null : rawNote;

  if (!ROOM_STATUSES.includes(status)) {
    return NextResponse.json({ error: 'Invalid room status.' }, { status: 400 });
  }

  const { data, error } = await admin.supabase
    .from('rooms')
    .update({ status, status_note: statusNote, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select('id, status, status_note, updated_at')
    .maybeSingle();

  if (error) {
    console.error('Room status update failed:', error);
    return NextResponse.json({ error: 'Could not update the room.' }, { status: 500 });
  }
  if (!data) return NextResponse.json({ error: 'Room not found or not editable.' }, { status: 404 });

  // Public catalog shows availability, so drop the cached copy right away.
  revalidateTag(ROOMS_CACHE_TAG, { expire: 0 });

  return NextResponse.json({ room: data });
}
