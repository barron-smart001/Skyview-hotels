import { revalidateTag } from 'next/cache';
import { createAdminClient } from '@/lib/supabase/admin';
import { isSupabaseAdminConfigured } from '@/lib/env';
import { ROOMS_CACHE_TAG } from '@/lib/rooms';
import type { Booking } from '@/types';

/**
 * Keeps rooms.status in step with the stay: a checked-in guest makes the room
 * occupied, and checking out sends it to housekeeping. Rooms an admin has blocked
 * (maintenance) are never touched, and admins can still override a status by hand.
 */
export async function syncRoomWithBooking(roomId: string, bookingStatus: Booking['status'], previousStatus?: Booking['status']) {
  if (!isSupabaseAdminConfigured()) return;

  let next: 'occupied' | 'cleaning' | null = null;
  if (bookingStatus === 'checked-in') next = 'occupied';
  else if (bookingStatus === 'completed' || (bookingStatus === 'cancelled' && previousStatus === 'checked-in')) next = 'cleaning';
  if (!next) return;

  try {
    const { data, error } = await createAdminClient()
      .from('rooms')
      .update({ status: next, status_note: null, updated_at: new Date().toISOString() })
      .eq('id', roomId)
      .neq('status', 'maintenance')
      .select('id');
    if (error) throw error;
    if (data?.length) revalidateTag(ROOMS_CACHE_TAG, { expire: 0 });
  } catch (error) {
    // The booking itself is already saved; a failed room sync must not fail the request.
    console.error('Room status sync failed:', error);
  }
}
