import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const MONTH_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/;
const DAY_MS = 86_400_000;
const LIMIT = 1000;

type StayRow = {
  id: string;
  booking_reference: string;
  guest_name: string;
  guest_phone: string;
  check_in: string;
  check_out: string;
  status: string;
  payment_status: string;
  total_amount_ngn: number | string;
  source: string | null;
  created_at: string;
  checked_in_at: string | null;
  checked_out_at: string | null;
  room: { room_number: string } | { room_number: string }[] | null;
};

const STAY_SELECT = 'id, booking_reference, guest_name, guest_phone, check_in, check_out, status, payment_status, total_amount_ngn, source, created_at, checked_in_at, checked_out_at, room:rooms(room_number)';

function addDays(date: string, days: number) {
  return new Date(new Date(`${date}T00:00:00Z`).valueOf() + days * DAY_MS).toISOString().slice(0, 10);
}

/** Hotel-local (Lagos, UTC+1) day boundaries as timestamps. */
function dayRange(date: string) {
  return { from: `${date}T00:00:00+01:00`, to: `${addDays(date, 1)}T00:00:00+01:00` };
}

function mapStay(row: StayRow) {
  const room = Array.isArray(row.room) ? row.room[0] : row.room;
  return {
    id: row.id,
    reference: row.booking_reference,
    guest: row.guest_name,
    phone: row.guest_phone,
    room: room?.room_number ?? '—',
    checkIn: row.check_in,
    checkOut: row.check_out,
    status: row.status,
    paymentStatus: row.payment_status,
    amount: Number(row.total_amount_ngn),
    source: row.source ?? 'online',
    createdAt: row.created_at,
    checkedInAt: row.checked_in_at,
    checkedOutAt: row.checked_out_at,
  };
}

/**
 * ?month=YYYY-MM  -> per-day counts for the calendar grid
 * ?date=YYYY-MM-DD -> everything that happened on that day
 */
export async function GET(request: Request) {
  const admin = await requireAdmin();
  if (admin instanceof NextResponse) return admin;

  const { searchParams } = new URL(request.url);
  const month = searchParams.get('month');
  const date = searchParams.get('date');

  if (month && MONTH_PATTERN.test(month)) {
    const start = `${month}-01`;
    const nextMonth = new Date(Date.UTC(Number(month.slice(0, 4)), Number(month.slice(5, 7)), 1)).toISOString().slice(0, 10);

    const { data, error } = await admin.supabase
      .from('bookings')
      .select('check_in, check_out, status, created_at')
      .neq('status', 'cancelled')
      .lt('check_in', nextMonth)
      .gt('check_out', start)
      .limit(LIMIT);
    if (error) {
      console.error('Calendar month load failed:', error);
      return NextResponse.json({ error: 'The calendar is unavailable right now.' }, { status: 503 });
    }

    const days: Record<string, { arrivals: number; departures: number; inHouse: number }> = {};
    const bump = (day: string, key: 'arrivals' | 'departures' | 'inHouse') => {
      if (day < start || day >= nextMonth) return;
      days[day] ??= { arrivals: 0, departures: 0, inHouse: 0 };
      days[day][key] += 1;
    };
    for (const row of data) {
      bump(row.check_in, 'arrivals');
      bump(row.check_out, 'departures');
      // Nights stayed: check-in day up to, but not including, check-out day.
      for (let day = row.check_in; day < row.check_out; day = addDays(day, 1)) {
        if (day >= nextMonth) break;
        bump(day, 'inHouse');
      }
    }
    return NextResponse.json({ month, days });
  }

  if (date && DATE_PATTERN.test(date)) {
    const { from, to } = dayRange(date);
    const [arrivals, departures, inHouse, created, payments, messages, requests] = await Promise.all([
      admin.supabase.from('bookings').select(STAY_SELECT).eq('check_in', date).neq('status', 'cancelled').limit(LIMIT),
      admin.supabase.from('bookings').select(STAY_SELECT).eq('check_out', date).neq('status', 'cancelled').limit(LIMIT),
      admin.supabase.from('bookings').select(STAY_SELECT).lte('check_in', date).gt('check_out', date).neq('status', 'cancelled').limit(LIMIT),
      admin.supabase.from('bookings').select(STAY_SELECT).gte('created_at', from).lt('created_at', to).limit(LIMIT),
      admin.supabase
        .from('payments')
        .select('id, amount_ngn, channel, status, paid_at, booking:bookings(booking_reference, guest_name)')
        .eq('status', 'success')
        .gte('paid_at', from)
        .lt('paid_at', to)
        .limit(LIMIT),
      admin.supabase.from('contact_messages').select('id, kind, name, status, created_at').gte('created_at', from).lt('created_at', to).limit(LIMIT),
      admin.supabase
        .from('service_requests')
        .select('id, status, requested_time, created_at, service:services(name)')
        .gte('created_at', from)
        .lt('created_at', to)
        .limit(LIMIT),
    ]);

    const failed = [arrivals, departures, inHouse, created].find((result) => result.error);
    if (failed?.error) {
      console.error('Calendar day load failed:', failed.error);
      return NextResponse.json({ error: 'That day could not be loaded.' }, { status: 503 });
    }

    const one = <T,>(value: T | T[] | null) => (Array.isArray(value) ? value[0] ?? null : value);
    return NextResponse.json({
      date,
      arrivals: (arrivals.data as unknown as StayRow[]).map(mapStay),
      departures: (departures.data as unknown as StayRow[]).map(mapStay),
      inHouse: (inHouse.data as unknown as StayRow[]).map(mapStay),
      created: (created.data as unknown as StayRow[]).map(mapStay),
      payments: ((payments.data ?? []) as unknown as { id: string; amount_ngn: number | string; paid_at: string | null; channel: string | null; booking: { booking_reference: string; guest_name: string } | { booking_reference: string; guest_name: string }[] | null }[]).map((payment) => ({
        id: payment.id,
        paidAt: payment.paid_at,
        amount: Number(payment.amount_ngn),
        channel: payment.channel,
        reference: one(payment.booking)?.booking_reference ?? '',
        guest: one(payment.booking)?.guest_name ?? '',
      })),
      messages: (messages.data ?? []).map((message) => ({ id: message.id, kind: message.kind, name: message.name, status: message.status, createdAt: message.created_at })),
      serviceRequests: ((requests.data ?? []) as unknown as { id: string; status: string; requested_time: string; created_at: string; service: { name: string } | { name: string }[] | null }[]).map((request) => ({
        id: request.id,
        status: request.status,
        service: one(request.service)?.name ?? 'Service',
        time: request.requested_time,
        createdAt: request.created_at,
      })),
    });
  }

  return NextResponse.json({ error: 'Provide ?month=YYYY-MM or ?date=YYYY-MM-DD.' }, { status: 400 });
}
