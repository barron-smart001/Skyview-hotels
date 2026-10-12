import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

/** Lets a signed-in guest cancel their own upcoming booking. */
export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Sign in to manage your bookings.' }, { status: 401 });

    // RLS only returns the row if it belongs to this guest.
    const { data: booking, error } = await supabase
      .from('bookings')
      .select('id, status, check_in')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    if (!booking) return NextResponse.json({ error: 'Booking not found.' }, { status: 404 });
    if (booking.status !== 'pending' && booking.status !== 'confirmed') {
      return NextResponse.json({ error: 'This booking can no longer be cancelled online.' }, { status: 409 });
    }

    // Guests have no UPDATE policy on bookings, so the write goes through the service role,
    // scoped to the row and status we just verified.
    const { data: updated, error: updateError } = await createAdminClient()
      .from('bookings')
      .update({ status: 'cancelled', updated_at: new Date().toISOString() })
      .eq('id', booking.id)
      .eq('user_id', user.id)
      .in('status', ['pending', 'confirmed'])
      .select('id, status')
      .maybeSingle();

    if (updateError) throw updateError;
    if (!updated) return NextResponse.json({ error: 'This booking was already updated.' }, { status: 409 });

    return NextResponse.json({ success: true, booking: updated });
  } catch (error) {
    console.error('Booking cancellation failed:', error);
    return NextResponse.json({ error: 'We could not cancel this booking. Please contact reservations.' }, { status: 500 });
  }
}
