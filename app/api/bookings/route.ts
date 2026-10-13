import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { isSupabaseAdminConfigured } from '@/lib/env';
import { MOCK_ROOMS } from '@/lib/data/mock-data';
import { BOOKING_SELECT, mapBookingRow, type BookingRow } from '@/lib/bookings';
import { generateBookingReference, validateBookingInput } from '@/lib/validations/booking';

const BLOCKING_STATUSES = ['confirmed', 'checked-in'];
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Returns the signed-in guest's own bookings. RLS limits rows to auth.uid() = user_id. */
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Sign in to view your bookings.' }, { status: 401 });

    const { data, error } = await supabase
      .from('bookings')
      .select(BOOKING_SELECT)
      .eq('user_id', user.id)
      .order('check_in', { ascending: false })
      .limit(100);

    if (error) throw error;
    const bookings = (data as unknown as BookingRow[]).map(mapBookingRow);
    return NextResponse.json({ bookings, source: 'supabase' });
  } catch (error) {
    console.error('Failed to load bookings:', error);
    return NextResponse.json({ error: 'Bookings are unavailable right now.' }, { status: 503 });
  }
}

export async function POST(request: Request) {
  // Only guests with an account may book.
  let sessionUser: { id: string } | null = null;
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    sessionUser = user;
  } catch {
    sessionUser = null;
  }
  if (!sessionUser) return NextResponse.json({ error: 'Please sign in or create an account to book a room.' }, { status: 401 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid booking request.' }, { status: 400 });
  }

  const parsed = validateBookingInput(body);
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });
  const input = parsed.data;

  // Demo catalog rooms (non-UUID ids) are served while the database has no inventory.
  // They are never persisted; the response is labelled so callers can tell.
  if (!UUID_PATTERN.test(input.roomId)) {
    const demoRoom = MOCK_ROOMS.find((room) => room.id === input.roomId);
    if (!demoRoom) return NextResponse.json({ error: 'The requested room could not be found.' }, { status: 404 });
    if (input.guestsCount > demoRoom.capacity) {
      return NextResponse.json({ error: `This room accommodates up to ${demoRoom.capacity} guests.` }, { status: 400 });
    }
    return NextResponse.json({
      success: true,
      booking: {
        bookingReference: generateBookingReference(),
        checkIn: input.checkIn,
        checkOut: input.checkOut,
        totalAmount: demoRoom.pricePerNight * input.nights,
        status: 'pending',
        paymentStatus: 'pending',
      },
      source: 'demo',
    });
  }

  if (!isSupabaseAdminConfigured()) {
    return NextResponse.json({ error: 'Reservations are temporarily unavailable. Please try again later.' }, { status: 503 });
  }

  try {
    // Server-side writes use the service role: anonymous guests cannot insert or see
    // other bookings under RLS, which previously made the overlap check a no-op.
    const admin = createAdminClient();

    const { data: room, error: roomError } = await admin
      .from('rooms')
      .select('id, hotel_id, capacity, price_per_night_ngn, status')
      .eq('id', input.roomId)
      .maybeSingle();

    if (roomError) throw roomError;
    if (!room) return NextResponse.json({ error: 'The requested room could not be found.' }, { status: 404 });
    if (room.status === 'maintenance') {
      return NextResponse.json({ error: 'This room is currently unavailable. Please choose another room.' }, { status: 409 });
    }
    if (input.guestsCount > room.capacity) {
      return NextResponse.json({ error: `This room accommodates up to ${room.capacity} guests.` }, { status: 400 });
    }

    const { count, error: conflictError } = await admin
      .from('bookings')
      .select('id', { count: 'exact', head: true })
      .eq('room_id', input.roomId)
      .in('status', BLOCKING_STATUSES)
      .lt('check_in', input.checkOut)
      .gt('check_out', input.checkIn);

    if (conflictError) throw conflictError;
    if (count && count > 0) {
      return NextResponse.json(
        { error: 'This suite is already reserved for the selected dates. Please choose another date or room.' },
        { status: 409 }
      );
    }

    const userId = sessionUser.id;

    const { data: booking, error: insertError } = await admin
      .from('bookings')
      .insert({
        booking_reference: generateBookingReference(),
        user_id: userId,
        hotel_id: room.hotel_id,
        room_id: room.id,
        guest_name: input.guestName,
        guest_email: input.guestEmail,
        guest_phone: input.guestPhone,
        check_in: input.checkIn,
        check_out: input.checkOut,
        guests_count: input.guestsCount,
        // Always priced server-side; the client-sent amount is never trusted.
        total_amount_ngn: Number(room.price_per_night_ngn) * input.nights,
        status: 'pending',
        payment_status: 'pending',
        special_requests: input.specialRequests,
      })
      .select('id, booking_reference, check_in, check_out, total_amount_ngn, status, payment_status')
      .single();

    if (insertError) {
      // 23P01 = exclusion_violation from the no-overlap constraint (migration 003).
      if (insertError.code === '23P01') {
        return NextResponse.json({ error: 'This suite was just reserved for those dates. Please choose another date.' }, { status: 409 });
      }
      throw insertError;
    }

    return NextResponse.json({
      success: true,
      booking: {
        id: booking.id,
        bookingReference: booking.booking_reference,
        checkIn: booking.check_in,
        checkOut: booking.check_out,
        totalAmount: Number(booking.total_amount_ngn),
        status: booking.status,
        paymentStatus: booking.payment_status,
      },
      source: 'supabase',
    }, { status: 201 });
  } catch (error) {
    console.error('Booking creation failed:', error);
    return NextResponse.json({ error: 'We could not submit your booking. Please try again shortly.' }, { status: 500 });
  }
}
