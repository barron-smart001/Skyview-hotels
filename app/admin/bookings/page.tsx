'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Booking } from '@/types';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import { CheckCircle2, LogIn, LogOut, XCircle } from 'lucide-react';

type BookingsResponse = { bookings: Booking[]; total: number; page: number; pageSize: number; error?: string };

const FILTERS = ['all', 'pending', 'confirmed', 'checked-in', 'completed', 'cancelled'] as const;

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filterStatus, setFilterStatus] = useState<(typeof FILTERS)[number]>('all');
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadPage = useCallback(async (status: string, pageToLoad: number, signal?: AbortSignal) => {
    const params = new URLSearchParams({ page: String(pageToLoad) });
    if (status !== 'all') params.set('status', status);
    const response = await fetch(`/api/admin/bookings?${params}`, { signal });
    const result = (await response.json()) as BookingsResponse;
    if (!response.ok) throw new Error(result.error || 'Bookings could not be loaded.');
    return result;
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    loadPage(filterStatus, 0, controller.signal)
      .then((result) => {
        setBookings(result.bookings);
        setTotal(result.total);
        setPage(0);
      })
      .catch((loadError: unknown) => {
        if (loadError instanceof Error && loadError.name === 'AbortError') return;
        setError(loadError instanceof Error ? loadError.message : 'Bookings could not be loaded.');
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [filterStatus, loadPage]);

  const selectFilter = (status: (typeof FILTERS)[number]) => {
    if (status === filterStatus) return;
    setLoading(true);
    setError('');
    setBookings([]);
    setFilterStatus(status);
  };

  const loadMore = async () => {
    setLoading(true);
    try {
      const result = await loadPage(filterStatus, page + 1);
      setBookings((prev) => [...prev, ...result.bookings]);
      setPage(result.page);
      setTotal(result.total);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Bookings could not be loaded.');
    } finally {
      setLoading(false);
    }
  };

  const updateBookingStatus = async (id: string, newStatus: Booking['status']) => {
    if (newStatus === 'cancelled' && !window.confirm('Cancel this booking?')) return;
    setUpdatingId(id);
    setError('');
    try {
      const response = await fetch(`/api/admin/bookings/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Could not update the booking.');
      setBookings((prev) =>
        prev
          .map((b) => (b.id === id ? { ...b, status: newStatus } : b))
          .filter((b) => filterStatus === 'all' || b.status === filterStatus)
      );
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : 'Could not update the booking.');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <>
          <div className="mb-8">
        <h1 className="font-serif text-3xl text-white">Guest Reservations & Check-Ins</h1>
        <p className="text-xs text-stone-400 mt-0.5">Manage guest folios, reception check-ins, departures, and cancellations.</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {FILTERS.map((status) => (
          <button
            key={status}
            onClick={() => selectFilter(status)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold capitalize transition ${
              filterStatus === status
                ? 'bg-amber-500 text-stone-950 shadow-sm'
                : 'bg-stone-950 border border-stone-800 text-stone-400 hover:text-white'
            }`}
          >
            {status.replace('-', ' ')}
          </button>
        ))}
      </div>

      {error && (
        <p role="alert" className="mb-4 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">{error}</p>
      )}

      {/* Bookings Table */}
      <div className="bg-stone-950 rounded-2xl border border-stone-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-stone-800 text-stone-400 font-semibold bg-stone-900/40">
                <th className="p-4">Reference & Guest</th>
                <th className="p-4">Suite Reserved</th>
                <th className="p-4">Check-in / Check-out</th>
                <th className="p-4">Guests</th>
                <th className="p-4">Payment</th>
                <th className="p-4">Stay Status</th>
                <th className="p-4 text-right">Reception Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800/60">
              {!loading && bookings.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-stone-500">No bookings match this filter.</td>
                </tr>
              )}
              {bookings.map((b) => (
                <tr key={b.id} className="hover:bg-stone-900/40 transition">
                  <td className="p-4">
                    <span className="font-mono text-amber-300 font-bold block">{b.bookingReference}</span>
                    <span className="text-white font-medium">{b.guestName}</span>
                    <span className="text-[11px] text-stone-500 block">{b.guestPhone}</span>
                    <span className="text-[11px] text-stone-500 block">Booked {formatDateTime(b.createdAt)}</span>
                  </td>
                  <td className="p-4 text-stone-300 font-medium">{b.room.name}</td>
                  <td className="p-4 text-stone-400">
                    <div>{b.checkIn}</div>
                    <div className="text-[11px] text-stone-500">to {b.checkOut}</div>
                  </td>
                  <td className="p-4 text-stone-300">{b.guestsCount} {b.guestsCount === 1 ? 'Guest' : 'Guests'}</td>
                  <td className="p-4">
                    <div className="font-bold text-emerald-400">{formatCurrency(b.totalAmount)}</div>
                    <span
                      className={`text-[10px] uppercase tracking-wider font-semibold ${
                        b.paymentStatus === 'paid' ? 'text-emerald-500' : b.paymentStatus === 'failed' ? 'text-rose-400' : 'text-amber-400'
                      }`}
                    >
                      ● {b.paymentStatus}
                    </span>
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold capitalize ${
                        b.status === 'confirmed'
                          ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                          : b.status === 'checked-in'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : b.status === 'cancelled'
                          ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          : b.status === 'pending'
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          : 'bg-stone-800 text-stone-400'
                      }`}
                    >
                      {b.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {b.status === 'pending' && (
                        <button
                          disabled={updatingId === b.id}
                          onClick={() => updateBookingStatus(b.id, 'confirmed')}
                          className="px-2.5 py-1.5 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 border border-indigo-500/30 rounded-lg text-[11px] font-bold flex items-center gap-1 transition disabled:opacity-50"
                        >
                          <CheckCircle2 className="w-3 h-3" /> Confirm
                        </button>
                      )}

                      {b.status === 'confirmed' && (
                        <button
                          disabled={updatingId === b.id}
                          onClick={() => updateBookingStatus(b.id, 'checked-in')}
                          className="px-2.5 py-1.5 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-lg text-[11px] font-bold flex items-center gap-1 transition disabled:opacity-50"
                        >
                          <LogIn className="w-3 h-3" /> Check In
                        </button>
                      )}

                      {b.status === 'checked-in' && (
                        <button
                          disabled={updatingId === b.id}
                          onClick={() => updateBookingStatus(b.id, 'completed')}
                          className="px-2.5 py-1.5 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 border border-indigo-500/30 rounded-lg text-[11px] font-bold flex items-center gap-1 transition disabled:opacity-50"
                        >
                          <LogOut className="w-3 h-3" /> Check Out
                        </button>
                      )}

                      {(b.status === 'pending' || b.status === 'confirmed') && (
                        <button
                          disabled={updatingId === b.id}
                          onClick={() => updateBookingStatus(b.id, 'cancelled')}
                          className="p-1.5 text-stone-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition disabled:opacity-50"
                          title="Cancel Booking"
                          aria-label="Cancel booking"
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
        {loading && <p className="p-4 text-center text-xs text-stone-500">Loading bookings…</p>}
        {!loading && bookings.length < total && (
          <div className="border-t border-stone-800 p-4 text-center">
            <button onClick={loadMore} className="rounded-xl bg-stone-900 px-4 py-2 text-xs font-bold text-stone-300 hover:text-white">
              Load more ({total - bookings.length} remaining)
            </button>
          </div>
        )}
      </div>
    </>
  );
}
