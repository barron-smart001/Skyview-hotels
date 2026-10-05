'use client';

import React, { useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { MOCK_BOOKINGS } from '@/lib/data/mock-data';
import { Booking } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { Calendar, User, Search, Filter, CheckCircle2, LogIn, LogOut, XCircle } from 'lucide-react';

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>(MOCK_BOOKINGS);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const updateBookingStatus = (id: string, newStatus: Booking['status']) => {
    setBookings(prev =>
      prev.map(b => (b.id === id ? { ...b, status: newStatus } : b))
    );
  };

  const filtered = bookings.filter(b =>
    filterStatus === 'all' ? true : b.status === filterStatus
  );

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Guest Reservations & Check-Ins</h1>
        <p className="text-xs text-slate-400 mt-0.5">Manage guest folios, reception check-ins, departures, and cancellations.</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {['all', 'confirmed', 'checked-in', 'completed', 'cancelled'].map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold capitalize transition ${
              filterStatus === status
                ? 'bg-sky-500 text-slate-950 shadow-sm'
                : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            {status.replace('-', ' ')}
          </button>
        ))}
      </div>

      {/* Bookings Table */}
      <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-semibold bg-slate-900/40">
                <th className="p-4">Reference & Guest</th>
                <th className="p-4">Suite Reserved</th>
                <th className="p-4">Check-in / Check-out</th>
                <th className="p-4">Guests</th>
                <th className="p-4">Payment</th>
                <th className="p-4">Stay Status</th>
                <th className="p-4 text-right">Reception Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filtered.map((b) => (
                <tr key={b.id} className="hover:bg-slate-900/40 transition">
                  <td className="p-4">
                    <span className="font-mono text-sky-400 font-bold block">{b.bookingReference}</span>
                    <span className="text-white font-medium">{b.guestName}</span>
                    <span className="text-[11px] text-slate-500 block">{b.guestPhone}</span>
                  </td>
                  <td className="p-4 text-slate-300 font-medium">{b.room.name}</td>
                  <td className="p-4 text-slate-400">
                    <div>{b.checkIn}</div>
                    <div className="text-[11px] text-slate-500">to {b.checkOut}</div>
                  </td>
                  <td className="p-4 text-slate-300">{b.guestsCount} Adults</td>
                  <td className="p-4">
                    <div className="font-bold text-emerald-400">{formatCurrency(b.totalAmount)}</div>
                    <span className="text-[10px] text-emerald-500 uppercase tracking-wider font-semibold">
                      ● {b.paymentStatus}
                    </span>
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold capitalize ${
                        b.status === 'confirmed'
                          ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20'
                          : b.status === 'checked-in'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : b.status === 'cancelled'
                          ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {b.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {b.status === 'confirmed' && (
                        <button
                          onClick={() => updateBookingStatus(b.id, 'checked-in')}
                          className="px-2.5 py-1.5 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-lg text-[11px] font-bold flex items-center gap-1 transition"
                        >
                          <LogIn className="w-3 h-3" /> Check In
                        </button>
                      )}

                      {b.status === 'checked-in' && (
                        <button
                          onClick={() => updateBookingStatus(b.id, 'completed')}
                          className="px-2.5 py-1.5 bg-sky-500/10 text-sky-400 hover:bg-sky-500/20 border border-sky-500/30 rounded-lg text-[11px] font-bold flex items-center gap-1 transition"
                        >
                          <LogOut className="w-3 h-3" /> Check Out
                        </button>
                      )}

                      {b.status !== 'cancelled' && b.status !== 'completed' && (
                        <button
                          onClick={() => updateBookingStatus(b.id, 'cancelled')}
                          className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
                          title="Cancel Booking"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}