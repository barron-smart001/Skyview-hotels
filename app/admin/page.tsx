import React from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { BOOKING_SELECT, mapBookingRow, type BookingRow } from '@/lib/bookings';
import { HOTEL } from '@/lib/hotel-config';
import { formatCurrency } from '@/lib/utils';
import { BedDouble, TrendingUp, Calendar, CheckCircle2 } from 'lucide-react';

type ServiceRequestRow = {
  id: string;
  requested_time: string;
  status: string;
  notes: string | null;
  service: { name: string } | { name: string }[] | null;
};

function hotelToday() {
  // en-CA formats as YYYY-MM-DD, matching the DATE columns.
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Africa/Lagos' });
}

async function loadDashboard() {
  const supabase = await createClient();
  const today = hotelToday();
  const monthStart = `${today.slice(0, 7)}-01`;

  // Independent queries run in parallel; counts use head requests so no rows are transferred.
  const [rooms, inHouse, upcoming, arrivals, revenue, recent, requests, departures, newMessages, stays] = await Promise.all([
    supabase.from('rooms').select('id, room_number, floor, status, status_note, hotel:hotels!inner(slug)').eq('hotel.slug', HOTEL.slug).order('room_number', { ascending: true }),
    supabase.from('bookings').select('id', { count: 'exact', head: true }).eq('status', 'checked-in'),
    supabase.from('bookings').select('id', { count: 'exact', head: true }).eq('status', 'confirmed').gte('check_out', today),
    supabase.from('bookings').select('id', { count: 'exact', head: true }).eq('status', 'confirmed').eq('check_in', today),
    supabase.from('payments').select('amount_ngn').eq('status', 'success').gte('paid_at', monthStart),
    supabase.from('bookings').select(BOOKING_SELECT).order('created_at', { ascending: false }).limit(8),
    supabase
      .from('service_requests')
      .select('id, requested_time, status, notes, service:services(name)')
      .in('status', ['Pending', 'Accepted', 'In Progress'])
      .order('created_at', { ascending: false })
      .limit(6),
    supabase.from('bookings').select('id', { count: 'exact', head: true }).eq('status', 'checked-in').eq('check_out', today),
    supabase.from('contact_messages').select('id', { count: 'exact', head: true }).eq('status', 'new'),
    supabase.from('bookings').select('room_id, guest_name, check_out').eq('status', 'checked-in'),
  ]);

  const roomRows = rooms.data ?? [];
  const totalRooms = roomRows.length;
  const checkedIn = inHouse.count ?? 0;
  const guestByRoom = new Map((stays.data ?? []).map((stay) => [stay.room_id as string, stay as { guest_name: string; check_out: string }]));
  const roomBoard = roomRows.map((room) => ({
    id: room.id as string,
    number: room.room_number as string,
    floor: room.floor as number,
    status: room.status as string,
    note: (room.status_note as string | null) ?? null,
    guest: guestByRoom.get(room.id as string) ?? null,
  }));

  return {
    totalRooms,
    availableRooms: roomRows.filter((room) => room.status === 'available').length,
    occupancy: totalRooms ? (checkedIn / totalRooms) * 100 : 0,
    checkedIn,
    activeBookings: (upcoming.count ?? 0) + checkedIn,
    arrivalsToday: arrivals.count ?? 0,
    departuresToday: departures.count ?? 0,
    newMessages: newMessages.count ?? 0,
    unavailableRooms: roomRows.filter((room) => room.status === 'maintenance').length,
    roomBoard,
    monthRevenue: (revenue.data ?? []).reduce((sum, payment) => sum + Number(payment.amount_ngn), 0),
    recentBookings: ((recent.data ?? []) as unknown as BookingRow[]).map(mapBookingRow),
    serviceRequests: (requests.data ?? []) as unknown as ServiceRequestRow[],
    loadFailed: [rooms, recent].some((result) => result.error),
  };
}

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  confirmed: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  'checked-in': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  completed: 'bg-stone-800 text-stone-400 border-stone-700',
  cancelled: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
};

const ROOM_TILE_STYLES: Record<string, string> = {
  Available: 'border-emerald-500/30 bg-emerald-500/5 text-emerald-400',
  Occupied: 'border-indigo-500/30 bg-indigo-500/5 text-indigo-400',
  Cleaning: 'border-amber-500/30 bg-amber-500/5 text-amber-400',
  Unavailable: 'border-rose-500/30 bg-rose-500/5 text-rose-400',
};

export default async function AdminDashboardPage() {
  const stats = await loadDashboard();

  return (
    <>
          <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-serif text-3xl text-white">Property Operations Dashboard</h1>
            <p className="text-xs text-stone-400 mt-0.5">Live status overview of rooms, occupancy, arrivals, and revenue.</p>
          </div>
          <span className="text-xs text-stone-400 bg-stone-800 px-3 py-1.5 rounded-xl border border-stone-700">
            Hotel: <strong className="text-white">{HOTEL.name}</strong>
          </span>
        </div>
        {stats.loadFailed && (
          <p role="alert" className="mt-4 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">
            Some dashboard data could not be loaded. Figures may be incomplete.
          </p>
        )}
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-stone-950 p-5 rounded-2xl border border-stone-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-stone-400 font-medium">Occupancy Rate</span>
            <div className="text-2xl font-extrabold text-white mt-1">{stats.occupancy.toFixed(1)}%</div>
            <span className="text-[11px] text-stone-400 mt-1 block">{stats.checkedIn} guests in house</span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-500/10 text-amber-300 flex items-center justify-center">
            <BedDouble className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-stone-950 p-5 rounded-2xl border border-stone-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-stone-400 font-medium">Available Suites</span>
            <div className="text-2xl font-extrabold text-white mt-1">{stats.availableRooms} / {stats.totalRooms}</div>
            <span className="text-[11px] text-amber-300 mt-1 block">Ready for check-in</span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-stone-950 p-5 rounded-2xl border border-stone-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-stone-400 font-medium">Active Reservations</span>
            <div className="text-2xl font-extrabold text-white mt-1">{stats.activeBookings} Stays</div>
            <span className="text-[11px] text-stone-400 mt-1 block">
              {stats.arrivalsToday} {stats.arrivalsToday === 1 ? 'arrival' : 'arrivals'} scheduled today
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
            <Calendar className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-stone-950 p-5 rounded-2xl border border-stone-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-stone-400 font-medium">Month Revenue</span>
            <div className="text-2xl font-extrabold text-white mt-1">{formatCurrency(stats.monthRevenue)}</div>
            <span className="text-[11px] text-emerald-400 mt-1 block">Verified Paystack payments</span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* At-a-glance counters */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Check-outs today', value: stats.departuresToday, href: '/admin/bookings' },
          { label: 'Unavailable rooms', value: stats.unavailableRooms, href: '/admin/rooms' },
          { label: 'New messages', value: stats.newMessages, href: '/admin/messages' },
          { label: 'Open service requests', value: stats.serviceRequests.length, href: '/admin/housekeeping' },
        ].map((item) => (
          <Link key={item.label} href={item.href} className="bg-stone-950 p-4 rounded-2xl border border-stone-800 hover:border-amber-500/50 transition">
            <span className="text-[11px] text-stone-400">{item.label}</span>
            <div className="text-xl font-extrabold text-white mt-1">{item.value}</div>
          </Link>
        ))}
      </div>

      {/* Live room board */}
      <div className="bg-stone-950 rounded-2xl border border-stone-800 p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-white">Room Status Board</h3>
          <Link href="/admin/rooms" className="text-xs text-amber-300 hover:text-amber-200">Change availability</Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {stats.roomBoard.map((room) => {
            const unavailable = room.status === 'maintenance';
            const label = unavailable ? 'Unavailable' : room.guest ? 'Occupied' : room.status === 'cleaning' ? 'Cleaning' : room.status === 'occupied' ? 'Occupied' : 'Available';
            return (
              <div key={room.id} className={`rounded-xl border p-3 ${ROOM_TILE_STYLES[label]}`}>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-sm font-bold text-white">{room.number}</span>
                  <span className="text-[10px] font-bold">{label}</span>
                </div>
                <p className="mt-1 truncate text-[11px] text-stone-300">
                  {room.guest ? `${room.guest.guest_name} · out ${room.guest.check_out}` : unavailable && room.note ? room.note : `Floor ${room.floor}`}
                </p>
              </div>
            );
          })}
          {stats.roomBoard.length === 0 && <p className="col-span-full py-4 text-center text-xs text-stone-500">No rooms found.</p>}
        </div>
      </div>

      {/* Main operational tables */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 bg-stone-950 rounded-2xl border border-stone-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white">Latest Guest Reservations</h3>
            <Link href="/admin/bookings" className="text-xs text-amber-300 hover:text-amber-200">
              Manage all bookings
            </Link>
          </div>

          {stats.recentBookings.length === 0 ? (
            <p className="py-8 text-center text-xs text-stone-500">No reservations yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-stone-400 border-b border-stone-800 pb-2 font-semibold">
                    <th className="pb-3">Reference</th>
                    <th className="pb-3">Guest Name</th>
                    <th className="pb-3">Suite</th>
                    <th className="pb-3">Dates</th>
                    <th className="pb-3">Folio Total</th>
                    <th className="pb-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-800/60">
                  {stats.recentBookings.map((b) => (
                    <tr key={b.id} className="hover:bg-stone-900/50 transition">
                      <td className="py-3 font-mono text-amber-300 font-bold">{b.bookingReference}</td>
                      <td className="py-3 text-white font-medium">{b.guestName}</td>
                      <td className="py-3 text-stone-300">{b.room.name}</td>
                      <td className="py-3 text-stone-400">{b.checkIn} → {b.checkOut}</td>
                      <td className="py-3 text-emerald-400 font-bold">{formatCurrency(b.totalAmount)}</td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border capitalize ${STATUS_STYLES[b.status]}`}>
                          {b.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="bg-stone-950 rounded-2xl border border-stone-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white">Service Requests Dispatch</h3>
            <span className="text-[10px] text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-md border border-amber-400/20">
              {stats.serviceRequests.filter((req) => req.status === 'Pending').length} Pending
            </span>
          </div>

          <div className="space-y-3">
            {stats.serviceRequests.length === 0 && (
              <p className="py-6 text-center text-xs text-stone-500">No open service requests.</p>
            )}
            {stats.serviceRequests.map((req) => {
              const service = Array.isArray(req.service) ? req.service[0] : req.service;
              return (
                <div key={req.id} className="p-3 bg-stone-900 rounded-xl border border-stone-800">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-white truncate">{service?.name ?? 'Service'}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400">
                      {req.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-400 mb-2">Timing: {req.requested_time}</p>
                  {req.notes && (
                    <p className="text-[11px] text-amber-300/80 bg-stone-950 p-2 rounded-lg border border-stone-800/80">
                      Note: {req.notes}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
