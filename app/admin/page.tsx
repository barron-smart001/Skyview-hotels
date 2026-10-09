'use client';

import React from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { MOCK_ROOMS, MOCK_BOOKINGS, MOCK_REQUESTS } from '@/lib/data/mock-data';
import { formatCurrency } from '@/lib/utils';
import { 
  Users, 
  BedDouble, 
  TrendingUp, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Sparkles,
  ArrowUpRight,
  ShieldCheck
} from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboardPage() {
  const totalRooms = MOCK_ROOMS.length;
  const availableRooms = MOCK_ROOMS.filter(r => r.available).length;
  const activeBookings = MOCK_BOOKINGS.filter(b => b.status === 'confirmed').length;
  const totalRevenue = MOCK_BOOKINGS.reduce((sum, b) => sum + b.totalAmount, 0);

  return (
    <AdminLayout>
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">Property Operations Dashboard</h1>
            <p className="text-xs text-slate-400 mt-0.5">Real-time status overview of rooms, occupancy, arrivals, and revenue.</p>
          </div>
          <span className="text-xs text-slate-400 bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700">
            Hotel: <strong className="text-white">Skyview Grand Uyo</strong>
          </span>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-medium">Occupancy Rate</span>
            <div className="text-2xl font-extrabold text-white mt-1">78.4%</div>
            <span className="text-[11px] text-emerald-400 flex items-center gap-1 mt-1">
              <TrendingUp className="w-3 h-3" /> +4.2% vs last week
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center">
            <BedDouble className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-medium">Available Suites</span>
            <div className="text-2xl font-extrabold text-white mt-1">{availableRooms} / {totalRooms}</div>
            <span className="text-[11px] text-sky-400 mt-1 block">Ready for check-in</span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-medium">Active Reservations</span>
            <div className="text-2xl font-extrabold text-white mt-1">{activeBookings} Stays</div>
            <span className="text-[11px] text-slate-400 mt-1 block">2 Arrivals scheduled today</span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
            <Calendar className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-medium">Month Revenue</span>
            <div className="text-2xl font-extrabold text-white mt-1">{formatCurrency(totalRevenue)}</div>
            <span className="text-[11px] text-emerald-400 flex items-center gap-1 mt-1">
              <TrendingUp className="w-3 h-3" /> 100% verified via Paystack
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main operational tables */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Left 2 Cols: Live Today Arrivals & Bookings */}
        <div className="lg:col-span-2 bg-slate-950 rounded-2xl border border-slate-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white">Live Guest Reservations & Stays</h3>
            <Link href="/admin/bookings" className="text-xs text-sky-400 hover:text-sky-300">
              Manage all bookings
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-slate-400 border-b border-slate-800 pb-2 font-semibold">
                  <th className="pb-3">Reference</th>
                  <th className="pb-3">Guest Name</th>
                  <th className="pb-3">Suite</th>
                  <th className="pb-3">Dates</th>
                  <th className="pb-3">Folio Total</th>
                  <th className="pb-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {MOCK_BOOKINGS.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-900/50 transition">
                    <td className="py-3 font-mono text-sky-400 font-bold">{b.bookingReference}</td>
                    <td className="py-3 text-white font-medium">{b.guestName}</td>
                    <td className="py-3 text-slate-300">{b.room.name}</td>
                    <td className="py-3 text-slate-400">{b.checkIn} → {b.checkOut}</td>
                    <td className="py-3 text-emerald-400 font-bold">{formatCurrency(b.totalAmount)}</td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 capitalize">
                        {b.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right 1 Col: Urgent Concierge & Service Dispatches */}
        <div className="bg-slate-950 rounded-2xl border border-slate-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white">Service Requests Dispatch</h3>
            <span className="text-[10px] text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-md border border-amber-400/20">
              2 Pending
            </span>
          </div>

          <div className="space-y-3">
            {MOCK_REQUESTS.map((req) => (
              <div key={req.id} className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-white truncate">{req.serviceName}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400">
                    {req.status}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mb-2">Timing: {req.requestedTime}</p>
                {req.notes && (
                  <p className="text-[11px] text-amber-300/80 bg-slate-950 p-2 rounded-lg border border-slate-800/80">
                    Note: {req.notes}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
