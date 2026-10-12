import { NextResponse } from 'next/server';
import { requireStaff } from '@/lib/auth';
import { BOOKING_SELECT, BOOKING_TRANSITIONS, mapBookingRow, type BookingRow } from '@/lib/bookings';

const PAGE_SIZE = 50;

/** Paginated booking list for reception. ?status=confirmed&page=0 */
export async function GET(request: Request) {
  const staff = await requireStaff();
  if (staff instanceof NextResponse) return staff;

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const page = Math.max(0, Number.parseInt(searchParams.get('page') ?? '0', 10) || 0);

  let query = staff.supabase
    .from('bookings')
    .select(BOOKING_SELECT, { count: 'exact' })
    .order('check_in', { ascending: false })
    .range(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE - 1);

  if (status && status in BOOKING_TRANSITIONS) query = query.eq('status', status);

  const { data, count, error } = await query;
  if (error) {
    console.error('Failed to load staff bookings:', error);
    return NextResponse.json({ error: 'Bookings are unavailable right now.' }, { status: 503 });
  }

  return NextResponse.json({
    bookings: (data as unknown as BookingRow[]).map(mapBookingRow),
    total: count ?? 0,
    page,
    pageSize: PAGE_SIZE,
  });
}
