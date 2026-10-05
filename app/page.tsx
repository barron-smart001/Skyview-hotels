'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { QuickBookingBar } from '@/components/dashboard/QuickBookingBar';
import { RoomCard } from '@/components/rooms/RoomCard';
import { BookingModal } from '@/components/rooms/BookingModal';
import { MOCK_ROOMS, MOCK_BOOKINGS, MOCK_SERVICES } from '@/lib/data/mock-data';
import { Room } from '@/types';
import { formatCurrency } from '@/lib/utils';
import Link from 'next/link';
import { 
  Calendar, 
  MapPin, 
  Sparkles, 
  ArrowUpRight, 
  Clock, 
  CheckCircle2, 
  Coffee, 
  Wifi, 
  Car, 
  Waves,
  ChevronRight
} from 'lucide-react';

export default function Home() {
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const featuredRooms = MOCK_ROOMS.filter(r => r.featured);
  const activeBooking = MOCK_BOOKINGS[0];

  const handleBookingSuccess = (ref: string) => {
    console.log('Booked reference:', ref);
  };

  return (
    <DashboardLayout>
      {/* Welcome Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 p-6 sm:p-10 mb-8 text-white shadow-xl shadow-slate-900/10">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px]" />
        
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/20 text-sky-300 text-xs font-semibold mb-4 border border-sky-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Welcome to Skyview Grand Palace</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white mb-2 leading-tight">
            Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-cyan-200">Eleanor!</span>
          </h1>

          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed mb-6">
            Discover tailored luxury, five-star amenities, and customized guest services during your stay.
          </p>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/rooms"
              className="px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs sm:text-sm transition flex items-center gap-1.5 shadow-lg shadow-sky-500/30"
            >
              <span>Explore Suites</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>

            <Link
              href="/services"
              className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm backdrop-blur-md transition flex items-center gap-1.5 border border-white/10"
            >
              <span>Request Services</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Booking Search Engine Bar */}
      <QuickBookingBar />

      {/* Main Grid: Upcoming Reservation & Curated Amenities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
        {/* Left 2 Cols: Active/Upcoming Stay */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Your Upcoming Reservation</h2>
              <p className="text-xs text-slate-500">Active confirmation with priority check-in</p>
            </div>
            <Link href="/bookings" className="text-xs font-semibold text-sky-600 hover:text-sky-700 flex items-center gap-1">
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {activeBooking ? (
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-sm hover:shadow-md transition">
              <div className="flex flex-col sm:flex-row gap-5">
                <img
                  src={activeBooking.room.images[0]}
                  alt={activeBooking.room.name}
                  className="w-full sm:w-44 h-32 rounded-xl object-cover"
                />
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-xs font-mono font-bold text-sky-600 bg-sky-50 px-2 py-0.5 rounded-md">
                        {activeBooking.bookingReference}
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3 h-3" /> Confirmed
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900">{activeBooking.room.name}</h3>
                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" /> Skyview Lagos Grand Tower • Ocean Wing
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-100 text-xs">
                    <div className="flex items-center gap-2 text-slate-600">
                      <Calendar className="w-4 h-4 text-sky-600" />
                      <span>{activeBooking.checkIn} → {activeBooking.checkOut}</span>
                    </div>
                    <div className="font-extrabold text-slate-900 text-sm">
                      {formatCurrency(activeBooking.totalAmount)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          {/* Luxury Featured Suites Section */}
          <div className="pt-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Featured Luxury Suites</h2>
                <p className="text-xs text-slate-500">Hand-picked premium rooms for extraordinary stays</p>
              </div>
              <Link href="/rooms" className="text-xs font-semibold text-sky-600 hover:text-sky-700 flex items-center gap-1">
                <span>Browse All</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {featuredRooms.map((room) => (
                <RoomCard key={room.id} room={room} onBookNow={(r) => setSelectedRoom(r)} />
              ))}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Quick Concierge, Hotel Perks & Services */}
        <div className="space-y-6">
          {/* Quick Perks */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-sky-600" />
              <span>Complimentary Guest Perks</span>
            </h3>

            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div className="w-9 h-9 rounded-lg bg-sky-100 text-sky-600 flex items-center justify-center shrink-0">
                  <Wifi className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Ultra-Fast Fiber Wi-Fi</h4>
                  <p className="text-[11px] text-slate-500">Up to 1 Gbps high-speed connectivity</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div className="w-9 h-9 rounded-lg bg-cyan-100 text-cyan-600 flex items-center justify-center shrink-0">
                  <Coffee className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Artisan Morning Coffee</h4>
                  <p className="text-[11px] text-slate-500">Fresh roasts served in Sky Lounge</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                  <Waves className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Rooftop Infinity Pool</h4>
                  <p className="text-[11px] text-slate-500">Heated pool with sunset views</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                  <Car className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Valet & EV Charging</h4>
                  <p className="text-[11px] text-slate-500">24/7 safe secure executive parking</p>
                </div>
              </div>
            </div>
          </div>

          {/* Popular Services Quick Request */}
          <div className="bg-gradient-to-b from-sky-50 to-blue-50/40 rounded-2xl border border-sky-100 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900">Popular Guest Services</h3>
              <Link href="/services" className="text-xs font-semibold text-sky-600 hover:text-sky-700">
                View all
              </Link>
            </div>

            <div className="space-y-2.5">
              {MOCK_SERVICES.slice(0, 3).map((srv) => (
                <Link
                  key={srv.id}
                  href="/services"
                  className="flex items-center gap-3 p-2.5 bg-white rounded-xl border border-sky-100 hover:border-sky-300 transition group"
                >
                  <img src={srv.image} alt={srv.name} className="w-12 h-12 rounded-lg object-cover" />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-slate-900 truncate group-hover:text-sky-600 transition">
                      {srv.name}
                    </h4>
                    <p className="text-[11px] text-sky-700 font-semibold">{formatCurrency(srv.price)}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-sky-600" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      <BookingModal
        room={selectedRoom}
        onClose={() => setSelectedRoom(null)}
        onSuccess={handleBookingSuccess}
      />
    </DashboardLayout>
  );
}
