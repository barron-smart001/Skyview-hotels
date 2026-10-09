import { createClient } from '@/lib/supabase/server';
import { HOTEL } from '@/lib/hotel-config';
import { MOCK_ROOMS } from '@/lib/data/mock-data';
import type { Room } from '@/types';

type RoomTypeRecord = {
  name?: string | null;
  slug?: string | null;
  size_sqft?: number | string | null;
  bed_type?: string | null;
  description?: string | null;
};

type RoomRecord = {
  id: string;
  room_number: string;
  price_per_night_ngn: number | string;
  capacity: number;
  status: string;
  is_featured: boolean | null;
  images: string[] | null;
  amenities: string[] | null;
  room_type: RoomTypeRecord | RoomTypeRecord[] | null;
};

const categories = ['Presidential', 'Executive', 'Deluxe', 'Suite', 'Standard'];

function mapRoomRecord(record: RoomRecord): Room {
  const roomType = Array.isArray(record.room_type) ? record.room_type[0] : record.room_type;
  const categorySource = `${roomType?.slug ?? ''} ${roomType?.name ?? ''}`.toLowerCase();
  const category = categories.find((value) => categorySource.includes(value.toLowerCase())) ?? 'Room';
  const size = roomType?.size_sqft == null ? undefined : Number(roomType.size_sqft);

  return {
    id: record.id,
    name: roomType?.name || `Room ${record.room_number}`,
    type: category,
    pricePerNight: Number(record.price_per_night_ngn),
    capacity: record.capacity,
    bedType: roomType?.bed_type || 'Not specified',
    sizeSqFt: size != null && Number.isFinite(size) ? size : undefined,
    description: roomType?.description || '',
    images: record.images ?? [],
    amenities: record.amenities ?? [],
    available: record.status === 'available',
    featured: Boolean(record.is_featured),
  };
}

export async function getRoomCatalog(): Promise<{ rooms: Room[]; source: 'supabase' | 'fallback' }> {
  try {
    const supabase = await createClient();
    const { data: hotel, error: hotelError } = await supabase
      .from('hotels')
      .select('id')
      .eq('slug', HOTEL.slug)
      .maybeSingle();

    if (hotelError || !hotel) return { rooms: MOCK_ROOMS, source: 'fallback' };

    const { data: inventory, error: inventoryError } = await supabase
      .from('rooms')
      .select('id, room_number, price_per_night_ngn, capacity, status, is_featured, images, amenities, room_type:room_types(name, slug, size_sqft, bed_type, description)')
      .eq('hotel_id', hotel.id)
      .order('price_per_night_ngn', { ascending: true });

    if (inventoryError || !inventory?.length) return { rooms: MOCK_ROOMS, source: 'fallback' };
    return { rooms: (inventory as unknown as RoomRecord[]).map(mapRoomRecord), source: 'supabase' };
  } catch {
    return { rooms: MOCK_ROOMS, source: 'fallback' };
  }
}

export async function getRoomById(id: string): Promise<Room | undefined> {
  const { rooms } = await getRoomCatalog();
  return rooms.find((room) => room.id === id);
}