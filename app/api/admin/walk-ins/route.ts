import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { isSupabaseAdminConfigured } from '@/lib/env';
import { BOOKING_SELECT, mapBookingRow, type BookingRow } from '@/lib/bookings';
import { generateBookingReference } from '@/lib/validations/booking';
import { syncRoomWithBooking } from '@/lib/room-status';

const SOURCES = ['walk-in', 'phone'] as const;
const METHODS = ['cash', 'transfer', 'pos', 'card'] as const;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const DAY_MS = 86_400_000;
const MAX_NIGHTS = 365;
const PAGE_SIZE = 100;

type WalkInRow = BookingRow & { source: string; payment_method: string | null };

function text(value: unknown, max: number) {
  return typeof value === 'string' ? value.trim().slice(0, max) : '';
}

function parseDate(value: string) {
  if (!DATE_PATTERN.test(value)) return null;
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isNaN(date.valueOf()) || date.toISOString().slice(0, 10) !== value ? null : date;
}

/** Bookings the receptionist recorded by hand (walk-ins and phone calls). */
export async function GET() {
  const admin = await requireAdmin();
  if (admin instanceof NextResponse) return admin;

  const { data, error } = await admin.supabase
    .from('bookings')
    .select(`${BOOKING_SELECT}, source, payment_method`)
    .neq('source', 'online')
    .order('created_at', { ascending: false })
    .limit(PAGE_SIZE);

  if (error) {
    console.error('Failed to load walk-in records:', error);
    return NextResponse.json({ error: 'Records are unavailable right now. Make sure migration 009 has been run.' }, { status: 503 });
  }

  const records = (data as unknown as WalkInRow[]).map((row) => ({
    ...mapBookingRow(row),
    source: row.source,
    paymentMethod: row.payment_method,
  }));
  return NextResponse.json({ records });
}

/** Records a booking made off the website. Past dates are allowed so older stays can be logged. */
export async function POST(request: Request) {
  const admin = await requireAdmin();
  if (admin instanceof NextResponse) return admin;
  if (!isSupabaseAdminConfigured()) {
    return NextResponse.json({ error: 'Server is missing SUPABASE_SERVICE_ROLE_KEY.' }, { status: 503 });
  }

  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });

  const roomId = text(body.roomId, 64);
  const guestName = text(body.guestName, 120);
  const guestPhone = text(body.guestPhone, 32);
  const guestEmail = text(body.guestEmail, 254).toLowerCase();
  const notes = text(body.notes, 1000) || null;
  const source = SOURCES.find((value) => value === body.source) ?? 'walk-in';
  const paymentMethod = METHODS.find((value) => value === body.paymentMethod) ?? null;
  const paid = body.paymentStatus === 'paid';
  const checkInNow = body.checkInNow === true;
  // Hotel-local date, so a stay that has already started is recorded as in-house.
  const todayLocal = new Date().toLocaleDateString('en-CA', { timeZone: 'Africa/Lagos' });
  const guestsCount = Number(body.guestsCount);

  if (!roomId || !guestName || !guestPhone) {
    return NextResponse.json({ error: 'Room, guest name and phone number are required.' }, { status: 400 });
  }
  if (guestEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestEmail)) {
    return NextResponse.json({ error: 'That email address is not valid.' }, { status: 400 });
  }
  if (!Number.isInteger(guestsCount) || guestsCount < 1) {
    return NextResponse.json({ error: 'Enter a valid number of guests.' }, { status: 400 });
  }

  const checkIn = text(body.checkIn, 10);
  const checkOut = text(body.checkOut, 10);
  const start = parseDate(checkIn);
  const end = parseDate(checkOut);
  if (!start || !end || end <= start) {
    return NextResponse.json({ error: 'Check-out must be after check-in.' }, { status: 400 });
  }
  const nights = Math.round((end.valueOf() - start.valueOf()) / DAY_MS);
  if (nights > MAX_NIGHTS) {
    return NextResponse.json({ error: `A single record cannot exceed ${MAX_NIGHTS} nights.` }, { status: 400 });
  }

  const db = createAdminClient();
  const { data: room, error: roomError } = await db
    .from('rooms')
    .select('id, hotel_id, capacity, price_per_night_ngn')
    .eq('id', roomId)
    .maybeSingle();
  if (roomError) return NextResponse.json({ error: 'Could not look up the room.' }, { status: 503 });
  if (!room) return NextResponse.json({ error: 'Room not found.' }, { status: 404 });
  if (guestsCount > room.capacity) {
    return NextResponse.json({ error: `This room accommodates up to ${room.capacity} guests.` }, { status: 400 });
  }

  // Receptionists may agree a different rate, so an explicit amount overrides the room price.
  const customTotal = body.totalAmount === undefined || body.totalAmount === '' ? null : Number(body.totalAmount);
  if (customTotal !== null && (!Number.isFinite(customTotal) || customTotal < 0)) {
    return NextResponse.json({ error: 'Enter a valid amount.' }, { status: 400 });
  }
  const total = customTotal ?? Number(room.price_per_night_ngn) * nights;

  // Started and not yet ended => guest is in the room; fully past => already completed.
  const stayStatus = checkOut <= todayLocal ? 'completed' : checkInNow || checkIn <= todayLocal ? 'checked-in' : 'confirmed';

  const { data: booking, error } = await db
    .from('bookings')
    .insert({
      booking_reference: generateBookingReference(),
      user_id: null,
      hotel_id: room.hotel_id,
      room_id: room.id,
      guest_name: guestName,
      guest_email: guestEmail,
      guest_phone: guestPhone,
      check_in: checkIn,
      check_out: checkOut,
      guests_count: guestsCount,
      total_amount_ngn: total,
      status: stayStatus,
      payment_status: paid ? 'paid' : 'pending',
      payment_method: paid ? paymentMethod : null,
      special_requests: notes,
      source,
      recorded_by: admin.userId,
    })
    .select('id, booking_reference, total_amount_ngn')
    .single();

  if (error) {
    if (error.code === '23P01') {
      return NextResponse.json({ error: 'This room already has a booking overlapping those dates.' }, { status: 409 });
    }
    console.error('Walk-in record failed:', error);
    return NextResponse.json({ error: 'Could not save the record. Make sure migration 009 has been run.' }, { status: 500 });
  }

  // Recording a guest who is already in the room marks it occupied; the admin can still override it.
  if (stayStatus === 'checked-in') await syncRoomWithBooking(room.id, 'checked-in');

  return NextResponse.json({ booking, roomStatus: stayStatus === 'checked-in' ? 'occupied' : null }, { status: 201 });
}
