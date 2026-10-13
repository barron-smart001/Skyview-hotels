'use client';

import React, { Suspense, useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { RoomCard } from '@/components/rooms/RoomCard';
import { BookingModal } from '@/components/rooms/BookingModal';
import { useRoomCatalog } from '@/components/rooms/useRoomCatalog';
import { Room } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { HOTEL } from '@/lib/hotel-config';
import { Filter, BedDouble, Search, Sparkles } from 'lucide-react';

/** Filters can be preset from the URL: /rooms?q=pool&type=Deluxe&guests=2 */
export default function RoomsPage() {
  return (
    <Suspense>
      <RoomsFromUrl />
    </Suspense>
  );
}

function RoomsFromUrl() {
  const searchParams = useSearchParams();
  // Remount when the URL changes so a new header search resets the filters.
  return <RoomsPageContent key={searchParams.toString()} initialQuery={searchParams.get('q') ?? ''} initialType={searchParams.get('type') ?? 'all'} minGuests={Number(searchParams.get('guests')) || 1} />;
}

function RoomsPageContent({ initialQuery, initialType, minGuests }: { initialQuery: string; initialType: string; minGuests: number }) {
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [selectedType, setSelectedType] = useState<string>(initialType);
  const [maxPrice, setMaxPrice] = useState<number>(300000);
  const [searchQuery, setSearchQuery] = useState<string>(initialQuery);
  const [guestCount, setGuestCount] = useState<number>(minGuests);
  const [selectedAmenity, setSelectedAmenity] = useState<string>('all');
  const { rooms, loading, error } = useRoomCatalog();

  const roomTypes = ['all', ...new Set(rooms.map((room) => room.type))];
  const amenitiesList = ['all', 'Free Wi-Fi', 'Private Jacuzzi', 'Breakfast Included', 'Private Balcony', 'Airport Chauffeur'];

  const filteredRooms = useMemo(() => {
    return rooms.filter((room) => {
      const matchesType = selectedType === 'all' || room.type === selectedType;
      const matchesPrice = room.pricePerNight <= maxPrice;
      const matchesSearch = room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            room.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesAmenity = selectedAmenity === 'all' || room.amenities.some(a => a.toLowerCase().includes(selectedAmenity.toLowerCase()));
      const matchesGuests = room.capacity >= guestCount;
      return matchesType && matchesPrice && matchesSearch && matchesAmenity && matchesGuests;
    });
  }, [rooms, selectedType, maxPrice, searchQuery, selectedAmenity, guestCount]);

  return (
    <DashboardLayout>
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5" /> Luxury Accommodation
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl text-stone-900">
              Rooms & Signature Suites
            </h1>
            <p className="text-xs sm:text-sm text-stone-500 mt-1">
              Find the perfect sanctuary crafted for ultimate relaxation, wellness, and executive comfort.
            </p>
          </div>

          <div className="text-xs font-semibold text-stone-500 bg-white px-4 py-2 rounded-xl border border-stone-200/80 shadow-xs self-start md:self-auto">
            {loading ? 'Loading rooms…' : <>Showing <span className="text-amber-700 font-bold">{filteredRooms.filter((room) => room.available).length}</span> available rooms</>}
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-sm mb-8 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-center">
          {/* Search input */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              placeholder="Search by suite name or features..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            />
          </div>

          {/* Amenity filter */}
          <div>
            <select
              value={selectedAmenity}
              onChange={(e) => setSelectedAmenity(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-700 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            >
              <option value="all">Any Amenity / Feature</option>
              {amenitiesList.filter(a => a !== 'all').map(amenity => (
                <option key={amenity} value={amenity}>{amenity}</option>
              ))}
            </select>
          </div>

          {/* Guests filter */}
          <div>
            <select
              value={guestCount}
              onChange={(e) => setGuestCount(Number(e.target.value))}
              aria-label="Number of guests"
              className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-700 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            >
              {[1, 2, 3, 4].map((count) => (
                <option key={count} value={count}>{count === 1 ? 'Any number of guests' : `${count}+ guests`}</option>
              ))}
            </select>
          </div>

          {/* Price Range Slider */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-medium text-stone-600">
              <span>Max Price / Night</span>
              <span className="font-bold text-amber-700">{formatCurrency(maxPrice)}</span>
            </div>
            <input
              type="range"
              min="50000"
              max="300000"
              step="10000"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-amber-700 cursor-pointer h-1.5 bg-stone-200 rounded-lg"
            />
          </div>
        </div>

        {/* Room Type Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-stone-100">
          <span className="text-xs font-bold text-stone-500 mr-2 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Category:
          </span>
          {roomTypes.map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold capitalize transition ${
                selectedType === type
                  ? 'bg-amber-700 text-white shadow-sm'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200/70'
              }`}
            >
              {type === 'all' ? 'All Tiers' : type}
            </button>
          ))}
        </div>
      </div>

      {/* Room Listing Cards Grid */}
      {error ? (
        <div role="alert" className="mb-12 rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-800">{error}</div>
      ) : loading ? (
        <p className="mb-12 py-12 text-center text-sm text-stone-500">Loading {HOTEL.name} rooms…</p>
      ) : filteredRooms.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {filteredRooms.map((room) => (
            <RoomCard key={room.id} room={room} onBookNow={(r) => setSelectedRoom(r)} />
          ))}
        </div>
      ) : (
        <div className="p-12 text-center bg-white rounded-2xl border border-stone-200/80 mb-12">
          <BedDouble className="w-12 h-12 text-stone-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-stone-800">No matching suites found</h3>
          <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
            Try adjusting your search keywords, budget slider, or category filter to view available rooms.
          </p>
          <button
            onClick={() => {
              setSelectedType('all');
              setSelectedAmenity('all');
              setMaxPrice(300000);
              setSearchQuery('');
              setGuestCount(1);
            }}
            className="mt-4 px-4 py-2 bg-amber-50 text-amber-700 font-semibold text-xs rounded-xl hover:bg-amber-100 transition"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* Booking Modal */}
      <BookingModal
        room={selectedRoom}
        onClose={() => setSelectedRoom(null)}
        onSuccess={(ref) => console.log('Booked ref:', ref)}
      />
    </DashboardLayout>
  );
}
