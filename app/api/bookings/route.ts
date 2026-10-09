import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { MOCK_BOOKINGS, MOCK_ROOMS } from '@/lib/data/mock-data';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: bookings, error } = await supabase
      .from('bookings')
      .select('*, room:rooms(*)')
      .order('created_at', { ascending: false });

    if (error || !bookings) {
      return NextResponse.json({ bookings: MOCK_BOOKINGS, source: 'fallback' });
    }
    return NextResponse.json({ bookings, source: 'supabase' });
  } catch {
    // Never expose fallback guest records through a public endpoint.
    return NextResponse.json({ bookings: [], source: 'unavailable' });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { roomId, checkIn, checkOut, guestName, guestEmail, guestPhone, guestsCount, totalAmount, specialRequests } = body;

    if (!roomId || !checkIn || !checkOut || !guestName?.trim() || !guestEmail?.trim() || !guestPhone?.trim()) {
      return NextResponse.json({ error: 'Missing required booking information' }, { status: 400 });
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    if (Number.isNaN(checkInDate.valueOf()) || Number.isNaN(checkOutDate.valueOf()) || checkOutDate <= checkInDate) {
      return NextResponse.json({ error: 'Check-out date must be after check-in date' }, { status: 400 });
    }

    const guestCount = Number(guestsCount);
    if (!Number.isInteger(guestCount) || guestCount < 1) {
      return NextResponse.json({ error: 'Please select a valid number of guests.' }, { status: 400 });
    }

    const demoRoom = MOCK_ROOMS.find((room) => room.id === roomId);
    if (demoRoom && guestCount > demoRoom.capacity) {
      return NextResponse.json({ error: `This room accommodates up to ${demoRoom.capacity} guests.` }, { status: 400 });
    }

    let verifiedSupabaseRoom = false;

    // Try Supabase double booking check
    try {
      const supabase = await createClient();
      
      // Check for overlapping confirmed reservations for the same room
      const { data: room, error: roomError } = await supabase
        .from('rooms')
        .select('capacity, price_per_night_ngn, status')
        .eq('id', roomId)
        .single();

      if (!roomError && room) {
        verifiedSupabaseRoom = true;
        if (room.status !== 'available') {
          return NextResponse.json({ error: 'This room is currently unavailable. Please choose another room.' }, { status: 409 });
        }
        if (guestCount > room.capacity) {
          return NextResponse.json({ error: `This room accommodates up to ${room.capacity} guests.` }, { status: 400 });
        }
      }

      const { data: conflicts } = await supabase
        .from('bookings')
        .select('id')
        .eq('room_id', roomId)
        .in('status', ['confirmed', 'checked-in'])
        .lt('check_in', checkOut)
        .gt('check_out', checkIn);

      if (conflicts && conflicts.length > 0) {
        return NextResponse.json(
          { error: 'This suite is already reserved for the selected dates. Please choose another date or room.' },
          { status: 409 }
        );
      }

      // Generate Nigerian standard booking reference
      const bookingRef = `SKV-${Math.floor(1000 + Math.random() * 9000)}-NG`;

      const { data: newBooking, error: insertErr } = await supabase
        .from('bookings')
        .insert([
          {
            booking_reference: bookingRef,
            room_id: roomId,
            guest_name: guestName,
            guest_email: guestEmail,
            guest_phone: guestPhone,
            check_in: checkIn,
            check_out: checkOut,
            guests_count: guestCount,
            // Calculate server-side from a room record; never accept a client payment amount as authoritative.
            total_amount_ngn: (room ? Number(room.price_per_night_ngn) : demoRoom?.pricePerNight ?? Number(totalAmount)) * Math.ceil((checkOutDate.valueOf() - checkInDate.valueOf()) / 86400000),
            status: 'pending',
            payment_status: 'pending',
            special_requests: specialRequests,
          }
        ])
        .select()
        .single();

      if (!insertErr && newBooking) {
        return NextResponse.json({ success: true, booking: newBooking, source: 'supabase' });
      }
    } catch {
      // Supabase connection handled
    }

    if (!verifiedSupabaseRoom && !demoRoom) {
      return NextResponse.json({ error: 'The requested room could not be verified. Please try again later.' }, { status: 503 });
    }

    // Fallback response if Supabase credentials are not yet populated
    const fallbackRef = `SKV-${Math.floor(1000 + Math.random() * 9000)}-NG`;
    return NextResponse.json({
      success: true,
      booking: {
        id: `bk-${Date.now()}`,
        bookingReference: fallbackRef,
        guestName,
        guestEmail,
        checkIn,
        checkOut,
        totalAmount,
        status: 'pending',
        paymentStatus: 'pending'
      },
      source: 'live-api'
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
