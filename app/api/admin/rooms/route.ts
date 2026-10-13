import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { HOTEL } from '@/lib/hotel-config';
import type { AdminRoom } from '@/types';

type RoomTypeRow = { name: string | null; bed_type: string | null; size_sqft: number | null };

/** Full room inventory with live status, for staff screens (rooms + housekeeping). */
export async function GET() {
  const admin = await requireAdmin();
  if (admin instanceof NextResponse) return admin;

  const { data, error } = await admin.supabase
    .from('rooms')
    .select('id, room_number, floor, capacity, price_per_night_ngn, status, images, updated_at, hotel:hotels!inner(slug), room_type:room_types(name, bed_type, size_sqft)')
    .eq('hotel.slug', HOTEL.slug)
    .order('room_number', { ascending: true });

  if (error) {
    console.error('Failed to load rooms for staff:', error);
    return NextResponse.json({ error: 'Rooms are unavailable right now.' }, { status: 503 });
  }

  const rooms: AdminRoom[] = data.map((row) => {
    const roomType = (Array.isArray(row.room_type) ? row.room_type[0] : row.room_type) as RoomTypeRow | null;
    return {
      id: row.id,
      roomNumber: row.room_number,
      floor: row.floor,
      name: roomType?.name || `Room ${row.room_number}`,
      bedType: roomType?.bed_type || 'Not specified',
      sizeSqFt: roomType?.size_sqft ?? null,
      capacity: row.capacity,
      pricePerNight: Number(row.price_per_night_ngn),
      status: row.status,
      image: row.images?.[0] ?? null,
      updatedAt: row.updated_at,
    };
  });

  return NextResponse.json({ rooms });
}
