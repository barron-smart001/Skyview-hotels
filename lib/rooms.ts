import { cache } from 'react';
import { unstable_cache } from 'next/cache';
import { createPublicClient } from '@/lib/supabase/admin';
import { isSupabaseConfigured } from '@/lib/env';
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

type RoomCatalog = { rooms: Room[]; source: 'supabase' | 'fallback' };

export const ROOMS_CACHE_TAG = 'rooms';

async function loadRoomCatalog(): Promise<RoomCatalog> {
  if (!isSupabaseConfigured()) return { rooms: MOCK_ROOMS, source: 'fallback' };

  try {
    // A single query with an inner join replaces the previous hotel lookup + rooms lookup round trips.
    const { data: inventory, error } = await createPublicClient()
      .from('rooms')
      .select('id, room_number, price_per_night_ngn, capacity, status, is_featured, images, amenities, hotel:hotels!inner(slug), room_type:room_types(name, slug, size_sqft, bed_type, description)')
      .eq('hotel.slug', HOTEL.slug)
      .order('price_per_night_ngn', { ascending: true });

    if (error || !inventory?.length) return { rooms: MOCK_ROOMS, source: 'fallback' };
    return { rooms: (inventory as unknown as RoomRecord[]).map(mapRoomRecord), source: 'supabase' };
  } catch {
    return { rooms: MOCK_ROOMS, source: 'fallback' };
  }
}

/**
 * Room inventory changes rarely, so it is cached across requests and refreshed
 * every 5 minutes (or immediately via revalidateTag(ROOMS_CACHE_TAG)).
 * React's cache() additionally dedupes calls within a single render.
 */
export const getRoomCatalog = cache(
  unstable_cache(loadRoomCatalog, ['room-catalog', HOTEL.slug], { revalidate: 300, tags: [ROOMS_CACHE_TAG] })
);

export async function getRoomById(id: string): Promise<Room | undefined> {
  const { rooms } = await getRoomCatalog();
  return rooms.find((room) => room.id === id);
}
