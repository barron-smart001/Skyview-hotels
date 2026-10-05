'use client';

import React, { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { RoomCard } from '@/components/rooms/RoomCard';
import { BookingModal } from '@/components/rooms/BookingModal';
import { MOCK_ROOMS } from '@/lib/data/mock-data';
import { Room } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { Filter, SlidersHorizontal, BedDouble, Search, Sparkles } from 'lucide-react';

export default function RoomsPage() {
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [maxPrice, setMaxPrice] = useState<number>(300000);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedAmenity, setSelectedAmenity] = useState<string>('all');

  const roomTypes = ['all', 'Standard', 'Deluxe', 'Executive', 'Suite', 'Presidential'];
  const amenitiesList = ['all', 'Free Wi-Fi', 'Private Jacuzzi', 'Breakfast Included', 'Ocean View Balcony', 'Airport Chauffeur'];

  const filteredRooms = useMemo(() => {
    return MOCK_ROOMS.filter((room) => {
      const matchesType = selectedType === 'all' || room.type === selectedType;
      const matchesPrice = room.pricePerNight <= maxPrice;
      const matchesSearch = room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            room.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesAmenity = selectedAmenity === 'all' || room.amenities.some(a => a.toLowerCase().includes(selectedAmenity.toLowerCase()));
      return matchesType && matchesPrice && matchesSearch && matchesAmenity;
    });
  }, [selectedType, maxPrice, searchQuery, selectedAmenity]);

  return (
    <DashboardLayout>
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-100 text-sky-700 text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5" /> Luxury Accommodation
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Rooms & Signature Suites
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Find the perfect sanctuary crafted for ultimate relaxation, wellness, and executive comfort.
            </p>
          </div>

          <div className="text-xs font-semibold text-slate-500 bg-white px-4 py-2 rounded-xl border border-slate-200/80 shadow-xs self-start md:self-auto">
            Showing <span className="text-sky-600 font-bold">{filteredRooms.length}</span> suites available
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm mb-8 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          {/* Search input */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by suite name or features..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
            />
          </div>

          {/* Amenity filter */}
          <div>
            <select
              value={selectedAmenity}
              onChange={(e) => setSelectedAmenity(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
            >
              <option value="all">Any Amenity / Feature</option>
              {amenitiesList.filter(a => a !== 'all').map(amenity => (
                <option key={amenity} value={amenity}>{amenity}</option>
              ))}
            </select>
          </div>

          {/* Price Range Slider */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-medium text-slate-600">
              <span>Max Price / Night</span>
              <span className="font-bold text-sky-600">{formatCurrency(maxPrice)}</span>
            </div>
            <input
              type="range"
              min="50000"
              max="300000"
              step="10000"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-sky-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
            />
          </div>
        </div>

        {/* Room Type Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-100">
          <span className="text-xs font-bold text-slate-500 mr-2 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Category:
          </span>
          {roomTypes.map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold capitalize transition ${
                selectedType === type
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
              }`}
            >
              {type === 'all' ? 'All Tiers' : type}
            </button>
          ))}
        </div>
      </div>

      {/* Room Listing Cards Grid */}
      {filteredRooms.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {filteredRooms.map((room) => (
            <RoomCard key={room.id} room={room} onBookNow={(r) => setSelectedRoom(r)} />
          ))}
        </div>
      ) : (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200/80 mb-12">
          <BedDouble className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No matching suites found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Try adjusting your search keywords, budget slider, or category filter to view available rooms.
          </p>
          <button
            onClick={() => {
              setSelectedType('all');
              setSelectedAmenity('all');
              setMaxPrice(300000);
              setSearchQuery('');
            }}
            className="mt-4 px-4 py-2 bg-sky-50 text-sky-600 font-semibold text-xs rounded-xl hover:bg-sky-100 transition"
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