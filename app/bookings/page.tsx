'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { MOCK_BOOKINGS } from '@/lib/data/mock-data';
import { formatCurrency } from '@/lib/utils';
import { Calendar, MapPin, CheckCircle2, Clock, Ban, ChevronRight, Sparkles, Download, MessageSquare } from 'lucide-react';
import Link from 'next/link';

export default function BookingsPage() {
  const [tab, setTab] = useState<'all' | 'upcoming' | 'completed'>('all');
  const [bookings, setBookings] = useState(MOCK_BOOKINGS);

  const filteredBookings = bookings.filter((b) => {
    if (tab === 'upcoming') return b.status === 'confirmed' || b.status === 'pending';
    if (tab === 'completed') return b.status === 'completed';
    return true;
  });

  const handleCancelBooking = (id: string) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: 'cancelled' as const } : b))
    );
  };

  return (
    <DashboardLayout>
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-100 text-sky-700 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" /> Stay Management
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            My Bookings & Reservations
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Access upcoming reservation details, invoices, and service requests for your visits.
          </p>
        </div>

        <Link
          href="/rooms"
          className="self-start md:self-auto px-4 py-2.5 bg-gradient-to-r from-sky-600 to-cyan-600 hover:from-sky-700 hover:to-cyan-700 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-sm transition"
        >
          Book New Suite
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 mb-6 gap-6">
        {[
          { key: 'all', label: 'All Stays' },
          { key: 'upcoming', label: 'Upcoming Stays' },
          { key: 'completed', label: 'Past Stays' },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key as any)}
            className={`pb-3 text-sm font-semibold border-b-2 transition -mb-[2px] ${
              tab === t.key
                ? 'border-sky-600 text-sky-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Booking list */}
      <div className="space-y-4">
        {filteredBookings.map((b) => (
          <div
            key={b.id}
            className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-sm hover:shadow-md transition flex flex-col md:flex-row gap-6 items-start md:items-center justify-between"
          >
            <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-center">
              <img
                src={b.room.images[0]}
                alt={b.room.name}
                className="w-full sm:w-36 h-28 rounded-xl object-cover"
              />
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-xs font-mono font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-md">
                    {b.bookingReference}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                      b.status === 'confirmed'
                        ? 'bg-emerald-50 text-emerald-700'
                        : b.status === 'cancelled'
                        ? 'bg-rose-50 text-rose-700'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {b.status === 'confirmed' ? (
                      <CheckCircle2 className="w-3 h-3" />
                    ) : b.status === 'cancelled' ? (
                      <Ban className="w-3 h-3" />
                    ) : (
                      <Clock className="w-3 h-3" />
                    )}
                    <span className="capitalize">{b.status}</span>
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900">{b.room.name}</h3>
                <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" /> Skyview Lagos • {b.guestsCount} Guests
                </p>
                <p className="text-xs text-slate-600 flex items-center gap-1.5 mt-2 font-medium">
                  <Calendar className="w-3.5 h-3.5 text-sky-600" /> {b.checkIn} to {b.checkOut}
                </p>
              </div>
            </div>

            <div className="w-full md:w-auto flex md:flex-col items-center md:items-end justify-between border-t md:border-t-0 pt-4 md:pt-0 border-slate-100 gap-3">
              <div className="text-left md:text-right">
                <span className="text-[11px] text-slate-400 block font-medium">Total Paid</span>
                <span className="text-base sm:text-lg font-extrabold text-slate-900">
                  {formatCurrency(b.totalAmount)}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {b.status === 'confirmed' && (
                  <button
                    onClick={() => handleCancelBooking(b.id)}
                    className="px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition"
                  >
                    Cancel
                  </button>
                )}
                <Link
                  href="/services"
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl flex items-center gap-1.5 transition"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Request Services</span>
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}