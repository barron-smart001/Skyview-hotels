'use client';

import React, { useEffect, useState } from 'react';
import { useAdminRooms } from '@/components/admin/useAdminRooms';
import { formatCurrency } from '@/lib/utils';
import type { Booking } from '@/types';
import { LogIn, LogOut, XCircle } from 'lucide-react';

type WalkInRecord = Booking & { source: string; paymentMethod: string | null };

const today = () => new Date().toLocaleDateString('en-CA', { timeZone: 'Africa/Lagos' });
const addDays = (date: string, days: number) => {
  const next = new Date(`${date}T00:00:00Z`);
  next.setUTCDate(next.getUTCDate() + days);
  return next.toISOString().slice(0, 10);
};

const INPUT = 'w-full rounded-xl border border-stone-800 bg-stone-900 px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none';
const LABEL = 'mb-1 block text-[11px] font-semibold text-stone-400';

export default function WalkInRecordsPage() {
  const { rooms } = useAdminRooms();
  const [records, setRecords] = useState<WalkInRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [saving, setSaving] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const [roomId, setRoomId] = useState('');
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [checkIn, setCheckIn] = useState(today());
  const [checkOut, setCheckOut] = useState(addDays(today(), 1));
  const [guestsCount, setGuestsCount] = useState(1);
  const [source, setSource] = useState('walk-in');
  const [paymentStatus, setPaymentStatus] = useState('paid');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [totalAmount, setTotalAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [checkInNow, setCheckInNow] = useState(false);

  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/admin/walk-ins', { signal: controller.signal })
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'Records could not be loaded.');
        setRecords(result.records);
      })
      .catch((loadError: unknown) => {
        if (loadError instanceof Error && loadError.name === 'AbortError') return;
        setError(loadError instanceof Error ? loadError.message : 'Records could not be loaded.');
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [reloadKey]);

  const selectedRoom = rooms.find((room) => room.id === roomId);
  const nights = Math.max(0, Math.round((new Date(`${checkOut}T00:00:00Z`).valueOf() - new Date(`${checkIn}T00:00:00Z`).valueOf()) / 86400000));
  const suggested = selectedRoom ? selectedRoom.pricePerNight * nights : 0;

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setNotice('');
    try {
      const response = await fetch('/api/admin/walk-ins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId, guestName, guestPhone, guestEmail, checkIn, checkOut, guestsCount, source, paymentStatus, paymentMethod, totalAmount, notes, checkInNow }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Could not save the record.');
      setNotice(`Saved. Reference ${result.booking.booking_reference}${result.roomStatus === 'occupied' ? ' · room marked occupied' : ''}`);
      setGuestName('');
      setGuestPhone('');
      setGuestEmail('');
      setTotalAmount('');
      setNotes('');
      setCheckInNow(false);
      setGuestsCount(1);
      setReloadKey((key) => key + 1);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Could not save the record.');
    } finally {
      setSaving(false);
    }
  };

  const updateStatus = async (id: string, status: Booking['status']) => {
    if (status === 'cancelled' && !window.confirm('Cancel this record?')) return;
    setUpdatingId(id);
    setError('');
    try {
      const response = await fetch(`/api/admin/bookings/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Could not update the record.');
      setRecords((prev) => prev.map((record) => (record.id === id ? { ...record, status } : record)));
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : 'Could not update the record.');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <>
      <div className="mb-8">
        <h1 className="font-serif text-3xl text-white">Walk-in & Phone Records</h1>
        <p className="mt-0.5 text-xs text-stone-400">Record guests who book at the desk or by phone, so every stay is in one place.</p>
      </div>

      {error && <p role="alert" className="mb-4 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">{error}</p>}
      {notice && <p role="status" className="mb-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-300">{notice}</p>}

      <form onSubmit={submit} className="mb-8 grid gap-4 rounded-2xl border border-stone-800 bg-stone-950 p-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-2">
          <label className={LABEL}>Room *</label>
          <select required value={roomId} onChange={(e) => setRoomId(e.target.value)} className={INPUT}>
            <option value="">Select a room…</option>
            {rooms.map((room) => (
              <option key={room.id} value={room.id}>
                {room.roomNumber} · {room.name} · {formatCurrency(room.pricePerNight)}{room.status === 'maintenance' ? ' (unavailable)' : ''}
              </option>
            ))}
          </select>
        </div>
        <div><label className={LABEL}>Guest name *</label><input required value={guestName} onChange={(e) => setGuestName(e.target.value)} maxLength={120} className={INPUT} /></div>
        <div><label className={LABEL}>Phone *</label><input required value={guestPhone} onChange={(e) => setGuestPhone(e.target.value)} maxLength={32} className={INPUT} /></div>
        <div><label className={LABEL}>Email (optional)</label><input type="email" value={guestEmail} onChange={(e) => setGuestEmail(e.target.value)} className={INPUT} /></div>
        <div><label className={LABEL}>Check-in *</label><input required type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} className={INPUT} /></div>
        <div><label className={LABEL}>Check-out *</label><input required type="date" value={checkOut} min={checkIn} onChange={(e) => setCheckOut(e.target.value)} className={INPUT} /></div>
        <div><label className={LABEL}>Guests *</label><input required type="number" min={1} value={guestsCount} onChange={(e) => setGuestsCount(Number(e.target.value))} className={INPUT} /></div>
        <div>
          <label className={LABEL}>How did they book?</label>
          <select value={source} onChange={(e) => setSource(e.target.value)} className={INPUT}>
            <option value="walk-in">Walk-in</option>
            <option value="phone">Phone call</option>
          </select>
        </div>
        <div>
          <label className={LABEL}>Amount (₦) {suggested > 0 && <span className="text-stone-500">· standard {formatCurrency(suggested)}</span>}</label>
          <input type="number" min={0} value={totalAmount} placeholder={suggested ? String(suggested) : 'Auto'} onChange={(e) => setTotalAmount(e.target.value)} className={INPUT} />
        </div>
        <div>
          <label className={LABEL}>Payment</label>
          <select value={paymentStatus} onChange={(e) => setPaymentStatus(e.target.value)} className={INPUT}>
            <option value="paid">Paid</option>
            <option value="pending">Not paid yet</option>
          </select>
        </div>
        {paymentStatus === 'paid' && (
          <div>
            <label className={LABEL}>Paid by</label>
            <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className={INPUT}>
              <option value="cash">Cash</option>
              <option value="transfer">Bank transfer</option>
              <option value="pos">POS</option>
              <option value="card">Card</option>
            </select>
          </div>
        )}
        <div className="sm:col-span-2"><label className={LABEL}>Notes</label><input value={notes} onChange={(e) => setNotes(e.target.value)} maxLength={1000} placeholder="ID checked, special requests…" className={INPUT} /></div>
        <label className="flex items-center gap-2 text-xs text-stone-300 sm:col-span-2 lg:col-span-3">
          <input type="checkbox" checked={checkInNow} onChange={(e) => setCheckInNow(e.target.checked)} /> Guest is checking in now (also happens automatically when the stay starts today)
        </label>
        <button disabled={saving} className="rounded-xl bg-amber-500 px-4 py-2.5 text-xs font-bold text-stone-950 disabled:opacity-50">
          {saving ? 'Saving…' : 'Save record'}
        </button>
      </form>

      <div className="overflow-hidden rounded-2xl border border-stone-800 bg-stone-950">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-stone-800 bg-stone-900/40 font-semibold text-stone-400">
                <th className="p-4">Reference & Guest</th>
                <th className="p-4">Room</th>
                <th className="p-4">Dates</th>
                <th className="p-4">Payment</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800/60">
              {loading && <tr><td colSpan={6} className="p-8 text-center text-stone-500">Loading records…</td></tr>}
              {!loading && records.length === 0 && <tr><td colSpan={6} className="p-8 text-center text-stone-500">No walk-in or phone records yet.</td></tr>}
              {records.map((record) => (
                <tr key={record.id} className="hover:bg-stone-900/40">
                  <td className="p-4">
                    <span className="block font-mono font-bold text-amber-300">{record.bookingReference}</span>
                    <span className="font-medium text-white">{record.guestName}</span>
                    <span className="block text-[11px] text-stone-500">{record.guestPhone} · {record.source}</span>
                  </td>
                  <td className="p-4 text-stone-300">{record.room.name}</td>
                  <td className="p-4 text-stone-400">{record.checkIn}<span className="block text-[11px] text-stone-500">to {record.checkOut}</span></td>
                  <td className="p-4">
                    <div className="font-bold text-emerald-400">{formatCurrency(record.totalAmount)}</div>
                    <span className={`text-[10px] font-semibold uppercase tracking-wider ${record.paymentStatus === 'paid' ? 'text-emerald-500' : 'text-amber-400'}`}>
                      ● {record.paymentStatus}{record.paymentMethod ? ` · ${record.paymentMethod}` : ''}
                    </span>
                  </td>
                  <td className="p-4 capitalize text-stone-300">{record.status}</td>
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-2">
                      {record.status === 'confirmed' && (
                        <button disabled={updatingId === record.id} onClick={() => void updateStatus(record.id, 'checked-in')} className="flex items-center gap-1 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1.5 text-[11px] font-bold text-emerald-400 disabled:opacity-50"><LogIn className="h-3 w-3" /> Check In</button>
                      )}
                      {record.status === 'checked-in' && (
                        <button disabled={updatingId === record.id} onClick={() => void updateStatus(record.id, 'completed')} className="flex items-center gap-1 rounded-lg border border-indigo-500/30 bg-indigo-500/10 px-2.5 py-1.5 text-[11px] font-bold text-indigo-400 disabled:opacity-50"><LogOut className="h-3 w-3" /> Check Out</button>
                      )}
                      {record.status === 'confirmed' && (
                        <button disabled={updatingId === record.id} onClick={() => void updateStatus(record.id, 'cancelled')} aria-label="Cancel record" className="rounded-lg p-1.5 text-stone-500 hover:bg-rose-500/10 hover:text-rose-400 disabled:opacity-50"><XCircle className="h-4 w-4" /></button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
