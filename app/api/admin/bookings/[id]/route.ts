import { NextResponse } from 'next/server';
import { requireStaff } from '@/lib/auth';
import { BOOKING_TRANSITIONS } from '@/lib/bookings';
import type { Booking } from '@/types';

/** Reception status changes: confirm, check in, check out, cancel. */
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const staff = await requireStaff();
  if (staff instanceof NextResponse) return staff;

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const nextStatus = body?.status as Booking['status'] | undefined;

  if (!nextStatus || !(nextStatus in BOOKING_TRANSITIONS)) {
    return NextResponse.json({ error: 'Invalid status.' }, { status: 400 });
  }

  const { data: booking, error } = await staff.supabase
    .from('bookings')
    .select('id, status')
    .eq('id', id)
    .maybeSingle();

  if (error) return NextResponse.json({ error: 'Booking lookup failed.' }, { status: 503 });
  if (!booking) return NextResponse.json({ error: 'Booking not found.' }, { status: 404 });

  const current = booking.status as Booking['status'];
  if (!BOOKING_TRANSITIONS[current].includes(nextStatus)) {
    return NextResponse.json({ error: `A ${current} booking cannot be marked ${nextStatus}.` }, { status: 409 });
  }

  // Matching on the current status prevents two receptionists overwriting each other.
  const { data: updated, error: updateError } = await staff.supabase
    .from('bookings')
    .update({ status: nextStatus, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('status', current)
    .select('id, status')
    .maybeSingle();

  if (updateError) {
    if (updateError.code === '23P01') {
      return NextResponse.json({ error: 'Another confirmed stay already overlaps these dates for this room.' }, { status: 409 });
    }
    console.error('Booking status update failed:', updateError);
    return NextResponse.json({ error: 'Could not update the booking.' }, { status: 500 });
  }
  if (!updated) return NextResponse.json({ error: 'This booking was changed by someone else. Refresh and try again.' }, { status: 409 });

  return NextResponse.json({ booking: updated });
}
