import type { Booking, Room } from '@/types';

/** Columns needed to render a booking; shared by guest and staff endpoints. */
export const BOOKING_SELECT =
  'id, booking_reference, guest_name, guest_email, guest_phone, check_in, check_out, guests_count, total_amount_ngn, status, payment_status, special_requests, created_at, room:rooms(id, room_number, capacity, price_per_night_ngn, status, images, amenities, room_type:room_types(name, bed_type))';

type RoomTypeRow = { name: string | null; bed_type: string | null };
type RoomRow = {
  id: string;
  room_number: string;
  capacity: number;
  price_per_night_ngn: number | string;
  status: string;
  images: string[] | null;
  amenities: string[] | null;
  room_type: RoomTypeRow | RoomTypeRow[] | null;
};

export type BookingRow = {
  id: string;
  booking_reference: string;
  guest_name: string;
  guest_email: string;
  guest_phone: string;
  check_in: string;
  check_out: string;
  guests_count: number;
  total_amount_ngn: number | string;
  status: Booking['status'];
  payment_status: Booking['paymentStatus'];
  special_requests: string | null;
  created_at: string;
  room: RoomRow | RoomRow[] | null;
};

function one<T>(value: T | T[] | null): T | null {
  return Array.isArray(value) ? value[0] ?? null : value;
}

export function mapBookingRow(row: BookingRow): Booking {
  const room = one(row.room);
  const roomType = room ? one(room.room_type) : null;

  const mappedRoom: Room = {
    id: room?.id ?? '',
    name: roomType?.name || (room ? `Room ${room.room_number}` : 'Room unavailable'),
    type: roomType?.name ?? 'Room',
    pricePerNight: Number(room?.price_per_night_ngn ?? 0),
    capacity: room?.capacity ?? 0,
    bedType: roomType?.bed_type || 'Not specified',
    description: '',
    images: room?.images ?? [],
    amenities: room?.amenities ?? [],
    available: room?.status === 'available',
  };

  return {
    id: row.id,
    bookingReference: row.booking_reference,
    room: mappedRoom,
    guestName: row.guest_name,
    guestEmail: row.guest_email,
    guestPhone: row.guest_phone,
    checkIn: row.check_in,
    checkOut: row.check_out,
    guestsCount: row.guests_count,
    totalAmount: Number(row.total_amount_ngn),
    status: row.status,
    paymentStatus: row.payment_status,
    specialRequests: row.special_requests ?? undefined,
    createdAt: row.created_at,
  };
}

/** Staff-allowed status changes. Anything else is rejected by the API. */
export const BOOKING_TRANSITIONS: Record<Booking['status'], Booking['status'][]> = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['checked-in', 'cancelled'],
  'checked-in': ['completed'],
  completed: [],
  cancelled: [],
};
