'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, Users, BedDouble, Search, ChevronRight } from 'lucide-react';

export function QuickBookingBar() {
  const router = useRouter();
  const [checkIn, setCheckIn] = useState('2026-10-15');
  const [checkOut, setCheckOut] = useState('2026-10-18');
  const [guests, setGuests] = useState('2');
  const [roomType, setRoomType] = useState('all');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/rooms?type=${roomType}&guests=${guests}&checkIn=${checkIn}&checkOut=${checkOut}`);
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-100 p-4 sm:p-6 mb-8 transition-all hover:shadow-2xl">
      <div className="mb-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-sky-600 flex items-center gap-2">
          <span>Book Your Exclusive Stay</span>
        </h3>
        <p className="text-xs text-slate-500 mt-0.5">Best rates guaranteed directly with Skyview Rewards</p>
      </div>

      <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
        {/* Check In */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-sky-600" /> Check In
          </label>
          <input
            type="date"
            value={checkIn}
            onChange={(e) => setCheckIn(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition"
          />
        </div>

        {/* Check Out */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-sky-600" /> Check Out
          </label>
          <input
            type="date"
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition"
          />
        </div>

        {/* Room Type & Guests */}
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-sky-600" /> Guests
            </label>
            <select
              value={guests}
              onChange={(e) => setGuests(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition"
            >
              <option value="1">1 Guest</option>
              <option value="2">2 Guests</option>
              <option value="3">3 Guests</option>
              <option value="4">4+ Guests</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
              <BedDouble className="w-3.5 h-3.5 text-sky-600" /> Tier
            </label>
            <select
              value={roomType}
              onChange={(e) => setRoomType(e.target.value)}
              className="w-full px-2.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition"
            >
              <option value="all">All Suites</option>
              <option value="Standard">Standard</option>
              <option value="Deluxe">Deluxe</option>
              <option value="Executive">Executive</option>
              <option value="Presidential">Presidential</option>
            </select>
          </div>
        </div>

        {/* Search CTA */}
        <div>
          <button
            type="submit"
            className="w-full py-2.5 px-4 bg-gradient-to-r from-sky-600 via-sky-500 to-cyan-600 hover:from-sky-700 hover:to-cyan-700 text-white font-semibold rounded-xl shadow-md shadow-sky-500/25 flex items-center justify-center gap-2 text-sm transition-all transform active:scale-98"
          >
            <Search className="w-4 h-4" />
            <span>Search Availability</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}