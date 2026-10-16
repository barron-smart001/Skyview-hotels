'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useAdminRooms } from '@/components/admin/useAdminRooms';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';
import type { AdminRoom } from '@/types';

const STATUS_LABELS = {
  available: 'Available',
  occupied: 'Occupied',
  cleaning: 'Cleaning',
  maintenance: 'Unavailable (blocked)',
} as const;

const STATUS_STYLES: Record<AdminRoom['status'], string> = {
  available: 'text-emerald-400 border-emerald-500/30',
  occupied: 'text-indigo-400 border-indigo-500/30',
  cleaning: 'text-amber-400 border-amber-500/30',
  maintenance: 'text-rose-400 border-rose-500/30',
};

/** Inline nightly-rate editor. */
function RoomPrice({ room, saving, onSave }: { room: AdminRoom; saving: boolean; onSave: (id: string, price: number) => Promise<void> }) {
  const [value, setValue] = useState(String(room.pricePerNight));
  const price = Number(value);
  const changed = value !== '' && price !== room.pricePerNight;

  return (
    <div className="space-y-2 min-w-36">
      <div className="flex items-center gap-1 rounded-lg border border-stone-800 bg-stone-900 px-2 py-1.5 focus-within:border-amber-500">
        <span className="text-[11px] text-stone-500">₦</span>
        <input
          type="number"
          min={1}
          inputMode="numeric"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          aria-label={`Price per night for ${room.name}`}
          className="w-full bg-transparent text-xs font-bold text-amber-300 focus:outline-none"
        />
      </div>
      {changed && (
        <button
          disabled={saving || !Number.isFinite(price) || price <= 0}
          onClick={() => void onSave(room.id, price)}
          className="rounded-lg bg-amber-500 px-3 py-1 text-[11px] font-bold text-stone-950 disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Save price'}
        </button>
      )}
    </div>
  );
}

/** Lets staff change a room's availability and say why it is out of service. */
function RoomAvailability({ room, saving, onSave }: { room: AdminRoom; saving: boolean; onSave: (id: string, status: AdminRoom['status'], note?: string) => Promise<void> }) {
  const [status, setStatus] = useState(room.status);
  const [note, setNote] = useState(room.statusNote ?? '');
  const changed = status !== room.status || (status !== 'available' && note.trim() !== (room.statusNote ?? ''));

  return (
    <div className="space-y-2 min-w-52">
      <select
        value={status}
        onChange={(e) => setStatus(e.target.value as AdminRoom['status'])}
        aria-label={`Availability for ${room.name}`}
        className={`w-full rounded-lg border bg-stone-900 px-2 py-1.5 text-[11px] font-bold focus:outline-none ${STATUS_STYLES[status]}`}
      >
        {(Object.keys(STATUS_LABELS) as AdminRoom['status'][]).map((value) => (
          <option key={value} value={value}>{STATUS_LABELS[value]}</option>
        ))}
      </select>
      {status !== 'available' && (
        <input
          value={note}
          maxLength={200}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Reason (e.g. AC repair)"
          className="w-full rounded-lg border border-stone-800 bg-stone-900 px-2 py-1.5 text-[11px] text-white focus:border-amber-500 focus:outline-none"
        />
      )}
      {changed && (
        <button
          disabled={saving}
          onClick={() => void onSave(room.id, status, note)}
          className="rounded-lg bg-amber-500 px-3 py-1 text-[11px] font-bold text-stone-950 disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Save'}
        </button>
      )}
    </div>
  );
}

export default function AdminRoomsPage() {
  const { rooms, loading, error, updatingId, setStatus, setPrice } = useAdminRooms();
  const [search, setSearch] = useState('');

  const query = search.toLowerCase();
  const filtered = rooms.filter(r =>
    r.name.toLowerCase().includes(query) || r.roomNumber.toLowerCase().includes(query)
  );

  return (
    <>
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl text-white">Room Inventory & Rates</h1>
          <p className="text-xs text-stone-400 mt-0.5">Control pricing, capacity, amenities, and instant room availability.</p>
        </div>

        <button
          disabled
          title="Room creation is managed in Supabase for now"
          className="px-4 py-2.5 bg-amber-500 text-stone-950 font-bold text-xs rounded-xl flex items-center gap-2 self-start sm:self-auto transition disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Suite</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-stone-950 p-4 rounded-2xl border border-stone-800 mb-6 flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" />
          <input
            type="text"
            placeholder="Search by suite name or room number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-stone-900 border border-stone-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
          />
        </div>
      </div>

      {error && (
        <p role="alert" className="mb-4 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">{error}</p>
      )}

      {/* Room Inventory Table */}
      <div className="bg-stone-950 rounded-2xl border border-stone-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-stone-800 text-stone-400 font-semibold bg-stone-900/40">
                <th className="p-4">Suite Image & Name</th>
                <th className="p-4">Room</th>
                <th className="p-4">Capacity & Bed</th>
                <th className="p-4">Price / Night</th>
                <th className="p-4">Availability</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800/60">
              {loading && (
                <tr><td colSpan={6} className="p-8 text-center text-stone-500">Loading rooms…</td></tr>
              )}
              {!loading && filtered.length === 0 && (
                <tr><td colSpan={6} className="p-8 text-center text-stone-500">No rooms found.</td></tr>
              )}
              {filtered.map((room) => {
                return (
                  <tr key={room.id} className="hover:bg-stone-900/40 transition">
                    <td className="p-4 flex items-center gap-3">
                      {room.image ? (
                        <Image src={room.image} alt={room.name} width={56} height={40} className="w-14 h-10 rounded-lg object-cover" />
                      ) : (
                        <div className="w-14 h-10 rounded-lg bg-stone-800" />
                      )}
                      <div>
                        <span className="font-bold text-white block truncate">{room.name}</span>
                        {room.sizeSqFt != null && <span className="text-[11px] text-stone-400">{room.sizeSqFt} sq ft</span>}
                      </div>
                    </td>
                    <td className="p-4 text-stone-300 font-medium">
                      <div className="font-mono">{room.roomNumber}</div>
                      <div className="text-[11px] text-stone-500">Floor {room.floor}</div>
                    </td>
                    <td className="p-4 text-stone-300">
                      <div>{room.capacity} Guests</div>
                      <div className="text-[11px] text-stone-500">{room.bedType}</div>
                    </td>
                    <td className="p-4">
                      <RoomPrice room={room} saving={updatingId === room.id} onSave={setPrice} />
                    </td>
                    <td className="p-4">
                      <RoomAvailability room={room} saving={updatingId === room.id} onSave={setStatus} />
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button disabled title="Editing rooms is managed in Supabase for now" className="p-1.5 bg-stone-900 text-stone-300 rounded-lg opacity-40 cursor-not-allowed">
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button disabled title="Deleting rooms is managed in Supabase for now" className="p-1.5 bg-stone-900 text-rose-400 rounded-lg opacity-40 cursor-not-allowed">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
