export interface Room {
  id: string;
  name: string;
  type: 'Standard' | 'Deluxe' | 'Executive' | 'Suite' | 'Presidential';
  pricePerNight: number;
  capacity: number;
  bedType: string;
  sizeSqFt: number;
  rating: number;
  reviewCount: number;
  description: string;
  images: string[];
  amenities: string[];
  available: boolean;
  featured?: boolean;
}

export interface Booking {
  id: string;
  bookingReference: string;
  room: Room;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  checkIn: string;
  checkOut: string;
  guestsCount: number;
  totalAmount: number;
  status: 'confirmed' | 'pending' | 'checked-in' | 'completed' | 'cancelled';
  paymentStatus: 'paid' | 'pending' | 'refunded';
  specialRequests?: string;
  createdAt: string;
}

export interface HotelService {
  id: string;
  name: string;
  category: 'Spa & Wellness' | 'Concierge' | 'Room Service' | 'Tours & Experiences';
  price: number;
  duration?: string;
  description: string;
  image: string;
  popular?: boolean;
}

export interface ServiceRequest {
  id: string;
  serviceId: string;
  serviceName: string;
  category: string;
  requestedTime: string;
  status: 'Pending' | 'Accepted' | 'In Progress' | 'Completed' | 'Cancelled';
  notes?: string;
  createdAt: string;
}
