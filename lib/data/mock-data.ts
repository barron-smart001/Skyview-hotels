import { Room, HotelService, Booking, ServiceRequest } from "@/types";

export const MOCK_ROOMS: Room[] = [
  {
    id: "room-1",
    name: "Skyline Presidential Suite",
    type: "Presidential",
    pricePerNight: 280000,
    capacity: 4,
    bedType: "Super King Bed + Guest Room",
    sizeSqFt: 1100,
    rating: 4.98,
    reviewCount: 124,
    description: "Panoramic top-floor skyline views, private jacuzzi, expansive living terrace, butler service and priority lounge access.",
    images: [
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1200&q=80"
    ],
    amenities: ["Free High-Speed Wi-Fi", "Private Jacuzzi", "Skyline Balcony", "Butler Service", "Complimentary Breakfast", "Airport Chauffeur", "Smart Climate Control"],
    available: true,
    featured: true,
  },
  {
    id: "room-2",
    name: "Executive Panorama Suite",
    type: "Executive",
    pricePerNight: 165000,
    capacity: 2,
    bedType: "King Bed",
    sizeSqFt: 650,
    rating: 4.92,
    reviewCount: 98,
    description: "Thoughtfully crafted for business and leisure travelers with a dedicated work lounge, marble bathtub, and expansive city views.",
    images: [
      "https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80"
    ],
    amenities: ["High-Speed Wi-Fi", "Workstation & Ergonomic Chair", "Espresso Machine", "Private Balcony", "Rain Shower", "Mini Bar"],
    available: true,
    featured: true,
  },
  {
    id: "room-3",
    name: "Deluxe Garden View Room",
    type: "Deluxe",
    pricePerNight: 95000,
    capacity: 2,
    bedType: "Queen Bed",
    sizeSqFt: 450,
    rating: 4.85,
    reviewCount: 86,
    description: "Serene garden vistas with luxury linens, warm timber accents, acoustic soundproofing, and premium bath amenities.",
    images: [
      "https://images.unsplash.com/photo-1595576508898-0ad5c879a061?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=80"
    ],
    amenities: ["Free Wi-Fi", "Garden Balcony", "Smart 4K TV", "Breakfast Included", "Air Conditioning", "Coffee Maker"],
    available: true,
    featured: true,
  },
  {
    id: "room-4",
    name: "Standard City Comfort",
    type: "Standard",
    pricePerNight: 65000,
    capacity: 2,
    bedType: "Double Bed",
    sizeSqFt: 350,
    rating: 4.75,
    reviewCount: 64,
    description: "Modern, cozy sanctuary engineered for restful sleep with fast connectivity and central access to all hotel amenities.",
    images: [
      "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=80"
    ],
    amenities: ["Free Wi-Fi", "Air Conditioning", "Smart TV", "Safe Box", "En-suite Bathroom"],
    available: true,
    featured: false,
  },
  {
    id: "room-5",
    name: "Signature Family Haven",
    type: "Suite",
    pricePerNight: 195000,
    capacity: 5,
    bedType: "1 King + 2 Single Beds",
    sizeSqFt: 850,
    rating: 4.94,
    reviewCount: 52,
    description: "Spacious dual-bedroom layout with a family dining area, kitchenette, child-safe design, and direct pool access.",
    images: [
      "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1200&q=80"
    ],
    amenities: ["Free Wi-Fi", "Connecting Rooms", "Kitchenette", "Pool Access", "Family Breakfast", "Smart TV", "Laundry Service"],
    available: true,
    featured: false,
  }
];

export const MOCK_SERVICES: HotelService[] = [
  {
    id: "srv-1",
    name: "Deep Tissue Swedish Massage",
    category: "Spa & Wellness",
    price: 35000,
    duration: "75 mins",
    description: "Relaxing full body therapeutic massage with calming aromatic organic oils by certified wellness specialists.",
    image: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=800&q=80",
    popular: true,
  },
  {
    id: "srv-2",
    name: "VIP Airport Chauffeur Transfer",
    category: "Concierge",
    price: 45000,
    duration: "One-way",
    description: "Seamless door-to-door transfer in a luxury executive SUV with complimentary refreshments and Wi-Fi.",
    image: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=800&q=80",
    popular: true,
  },
  {
    id: "srv-3",
    name: "Gourmet Champagne Breakfast",
    category: "Room Service",
    price: 25000,
    duration: "Fresh on demand",
    description: "Freshly baked artisan pastries, poached eggs on avocado brioche, seasonal exotic fruits and chilled champagne.",
    image: "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?auto=format&fit=crop&w=800&q=80",
    popular: true,
  },
  {
    id: "srv-4",
    name: "Ibom Heritage City Tour",
    category: "Tours & Experiences",
    price: 85000,
    duration: "3 hours",
    description: "A thoughtfully guided Uyo experience featuring cultural landmarks, artisan stops, and a relaxed evening return.",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
    popular: false,
  }
];

export const MOCK_BOOKINGS: Booking[] = [
  {
    id: "bk-101",
    bookingReference: "SKV-8942-NG",
    room: MOCK_ROOMS[0],
    guestName: "Eleanor Vance",
    guestEmail: "eleanor.vance@example.com",
    guestPhone: "+234 812 345 6789",
    checkIn: "2026-10-12",
    checkOut: "2026-10-16",
    guestsCount: 2,
    totalAmount: 1120000,
    status: "confirmed",
    paymentStatus: "paid",
    specialRequests: "High floor requested, late evening check-in at 8:00 PM.",
    createdAt: "2026-10-01",
  },
  {
    id: "bk-102",
    bookingReference: "SKV-4512-NG",
    room: MOCK_ROOMS[1],
    guestName: "Eleanor Vance",
    guestEmail: "eleanor.vance@example.com",
    guestPhone: "+234 812 345 6789",
    checkIn: "2026-08-04",
    checkOut: "2026-08-08",
    guestsCount: 2,
    totalAmount: 660000,
    status: "completed",
    paymentStatus: "paid",
    createdAt: "2026-07-20",
  }
];

export const MOCK_REQUESTS: ServiceRequest[] = [
  {
    id: "req-1",
    serviceId: "srv-1",
    serviceName: "Deep Tissue Swedish Massage",
    category: "Spa & Wellness",
    requestedTime: "Tomorrow at 4:00 PM",
    status: "Accepted",
    notes: "Please allocate female therapist.",
    createdAt: "2026-10-05",
  },
  {
    id: "req-2",
    serviceId: "srv-3",
    serviceName: "Gourmet Champagne Breakfast",
    category: "Room Service",
    requestedTime: "Oct 13 at 8:30 AM",
    status: "In Progress",
    notes: "Oat milk preference for lattes.",
    createdAt: "2026-10-05",
  }
];
