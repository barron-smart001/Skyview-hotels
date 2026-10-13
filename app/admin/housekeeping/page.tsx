'use client';

import React from 'react';
import { useAdminRooms } from '@/components/admin/useAdminRooms';
import type { AdminRoom } from '@/types';
import { BedDouble, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';

const COLUMNS: { status: AdminRoom['status']; title: string; icon: React.ReactNode }[] = [
  { status: 'available', title: 'Clean & Ready', icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> },
  { status: 'cleaning', title: 'Needs Cleaning', icon: <Clock className="w-3.5 h-3.5 text-amber-400" /> },
  { status: 'occupied', title: 'Occupied', icon: <BedDouble className="w-3.5 h-3.5 text-indigo-400" /> },
  { status: 'maintenance', title: 'Maintenance', icon: <AlertTriangle className="w-3.5 h-3.5 text-rose-400" /> },
];

function formatUpdated(value: string | null) {
  if (!value) return 'Not recorded';
  return new Date(value).toLocaleString('en-NG', { dateStyle: 'medium', timeStyle: 'short' });
}

export default function AdminHousekeepingPage() {
  const { rooms, loading, error, updatingId, setStatus } = useAdminRooms();

  return (
    <>
          <div className="mb-8">
        <h1 className="font-serif text-3xl text-white">Housekeeping & Property Readiness</h1>
        <p className="text-xs text-stone-400 mt-0.5">Live turn-down tracking, housekeeping dispatch, and maintenance inspections.</p>
      </div>

      {error && (
        <p role="alert" className="mb-4 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">{error}</p>
      )}
      {loading && <p className="mb-4 text-xs text-stone-500">Loading rooms…</p>}

      {/* Housekeeping Columns / Kanban */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {COLUMNS.map((col) => {
          const matching = rooms.filter(r => r.status === col.status);
          return (
            <div key={col.status} className="bg-stone-950 rounded-2xl border border-stone-800 p-4 flex flex-col">
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-stone-800">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  {col.icon}
                  {col.title}
                </span>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-stone-900 text-stone-300">
                  {matching.length}
                </span>
              </div>

              <div className="space-y-3 flex-1">
                {matching.map((r) => (
                  <div key={r.id} className="bg-stone-900 rounded-xl p-3.5 border border-stone-800/90 shadow-sm space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-mono text-xs font-bold text-amber-300">RM {r.roomNumber}</span>
                        <h4 className="text-xs font-bold text-white truncate">{r.name}</h4>
                      </div>
                      <span className="text-[10px] text-stone-500">Floor {r.floor}</span>
                    </div>

                    <p className="text-[11px] text-stone-400">Updated: {formatUpdated(r.updatedAt)}</p>

                    {/* Quick Move Action */}
                    <div className="pt-2 border-t border-stone-800 flex justify-between gap-1">
                      {(col.status === 'cleaning' || col.status === 'maintenance') && (
                        <button
                          disabled={updatingId === r.id}
                          onClick={() => setStatus(r.id, 'available')}
                          className="w-full py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-[10px] font-bold rounded-lg border border-emerald-500/20 disabled:opacity-50"
                        >
                          Mark Clean
                        </button>
                      )}
                      {(col.status === 'available' || col.status === 'occupied') && (
                        <button
                          disabled={updatingId === r.id}
                          onClick={() => setStatus(r.id, 'cleaning')}
                          className="w-full py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-[10px] font-bold rounded-lg border border-amber-500/20 disabled:opacity-50"
                        >
                          Request Clean
                        </button>
                      )}
                      {col.status !== 'maintenance' && (
                        <button
                          disabled={updatingId === r.id}
                          onClick={() => setStatus(r.id, 'maintenance')}
                          className="w-full py-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-[10px] font-bold rounded-lg border border-rose-500/20 disabled:opacity-50"
                        >
                          Report Issue
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
