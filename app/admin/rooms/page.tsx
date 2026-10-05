'use client';

import React, { useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { MOCK_ROOMS } from '@/lib/data/mock-data';
import { Room } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { BedDouble, Plus, Search, Filter, CheckCircle2, AlertCircle, Edit, Trash2 } from 'lucide-react';

export default function AdminRoomsPage() {
  const [rooms, setRooms] = useState<Room[]>(MOCK_ROOMS);
  const [search, setSearch] = useState('');

  const toggleAvailability = (id: string) => {
    setRooms(prev =>
      prev.map(r => (r.id === id ? { ...r, available: !r.available } : r))
    );
  };

  const filtered = rooms.filter(r =>
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    r.type.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Room Inventory & Rates</h1>
          <p className="text-xs text-slate-400 mt-0.5">Control pricing, capacity, amenities, and instant room availability.</p>
        </div>

        <button className="px-4 py-2.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-2 self-start sm:self-auto transition">
          <Plus className="w-4 h-4" />
          <span>Add New Suite</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 mb-6 flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search suites by name, category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
          />
        </div>
      </div>

      {/* Room Inventory Table */}
      <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-semibold bg-slate-900/40">
                <th className="p-4">Suite Image & Name</th>
                <th className="p-4">Category</th>
                <th className="p-4">Capacity & Bed</th>
                <th className="p-4">Price / Night</th>
                <th className="p-4">Availability</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filtered.map((room) => (
                <tr key={room.id} className="hover:bg-slate-900/40 transition">
                  <td className="p-4 flex items-center gap-3">
                    <img src={room.images[0]} alt={room.name} className="w-14 h-10 rounded-lg object-cover" />
                    <div>
                      <span className="font-bold text-white block truncate">{room.name}</span>
                      <span className="text-[11px] text-slate-400">{room.sizeSqFt} sq ft</span>
                    </div>
                  </td>
                  <td className="p-4 text-slate-300 font-medium">{room.type}</td>
                  <td className="p-4 text-slate-300">
                    <div>{room.capacity} Guests</div>
                    <div className="text-[11px] text-slate-500">{room.bedType}</div>
                  </td>
                  <td className="p-4 font-bold text-sky-400">{formatCurrency(room.pricePerNight)}</td>
                  <td className="p-4">
                    <button
                      onClick={() => toggleAvailability(room.id)}
                      className={`px-3 py-1 rounded-full text-[10px] font-bold transition flex items-center gap-1.5 ${
                        room.available
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}
                    >
                      {room.available ? (
                        <>
                          <CheckCircle2 className="w-3 h-3" /> Available
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-3 h-3" /> Blocked
                        </>
                      )}
                    </button>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <button className="p-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-lg transition">
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button className="p-1.5 bg-slate-900 hover:bg-rose-950 text-rose-400 rounded-lg transition">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
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