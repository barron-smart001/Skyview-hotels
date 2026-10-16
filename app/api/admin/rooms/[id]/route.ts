import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { requireAdmin } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { isSupabaseAdminConfigured } from '@/lib/env';
import { ROOMS_CACHE_TAG } from '@/lib/rooms';

const ROOM_STATUSES = ['available', 'occupied', 'cleaning', 'maintenance'] as const;

/** Housekeeping / availability updates. Requires migration 004 (staff room update policy). */
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (admin instanceof NextResponse) return admin;

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };

  if (body?.status !== undefined) {
    const status = body.status;
    if (!ROOM_STATUSES.includes(status)) {
      return NextResponse.json({ error: 'Invalid room status.' }, { status: 400 });
    }
    const rawNote = typeof body.note === 'string' ? body.note.trim().slice(0, 200) : '';
    updates.status = status;
    // The reason only applies while a room is out of service.
    updates.status_note = status === 'available' || !rawNote ? null : rawNote;
  }

  if (body?.pricePerNight !== undefined) {
    const price = Number(body.pricePerNight);
    if (!Number.isFinite(price) || price <= 0 || price > 100_000_000) {
      return NextResponse.json({ error: 'Enter a valid price greater than zero.' }, { status: 400 });
    }
    updates.price_per_night_ngn = Math.round(price);
  }

  if (Object.keys(updates).length === 1) {
    return NextResponse.json({ error: 'Nothing to update.' }, { status: 400 });
  }

  // The caller is already verified as an administrator, so write with the server client.
  const db = isSupabaseAdminConfigured() ? createAdminClient() : admin.supabase;
  const { data, error } = await db
    .from('rooms')
    .update(updates)
    .eq('id', id)
    .select('id, status, status_note, price_per_night_ngn, updated_at')
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
