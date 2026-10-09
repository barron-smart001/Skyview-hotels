'use client';

import React, { useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { MOCK_ROOMS } from '@/lib/data/mock-data';
import { Brush, CheckCircle2, Clock, AlertTriangle, Sparkles, RefreshCw } from 'lucide-react';

type HousekeepingStatus = 'Clean & Ready' | 'Needs Cleaning' | 'In Progress' | 'Maintenance';

interface RoomHousekeeping {
  id: string;
  roomNumber: string;
  name: string;
  floor: number;
  status: HousekeepingStatus;
  lastInspected: string;
}

const INITIAL_HOUSEKEEPING: RoomHousekeeping[] = [
  { id: '101', roomNumber: 'RM 101', name: 'Skyline Presidential Suite', floor: 10, status: 'Clean & Ready', lastInspected: '10:30 AM' },
  { id: '201', roomNumber: 'RM 201', name: 'Executive Panorama Suite', floor: 8, status: 'In Progress', lastInspected: '11:15 AM' },
  { id: '305', roomNumber: 'RM 305', name: 'Deluxe Garden View Room', floor: 4, status: 'Needs Cleaning', lastInspected: 'Guest checkout 09:00 AM' },
  { id: '402', roomNumber: 'RM 402', name: 'Standard City Comfort', floor: 2, status: 'Clean & Ready', lastInspected: 'Yesterday' },
  { id: '508', roomNumber: 'RM 508', name: 'Signature Family Haven', floor: 5, status: 'Maintenance', lastInspected: 'HVAC Filter check' },
];

export default function AdminHousekeepingPage() {
  const [rooms, setRooms] = useState<RoomHousekeeping[]>(INITIAL_HOUSEKEEPING);

  const setStatus = (id: string, newStatus: HousekeepingStatus) => {
    setRooms(prev =>
      prev.map(r => (r.id === id ? { ...r, status: newStatus, lastInspected: 'Just now' } : r))
    );
  };

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Housekeeping & Property Readiness</h1>
        <p className="text-xs text-slate-400 mt-0.5">Live turn-down tracking, housekeeping dispatch, and maintenance inspections.</p>
      </div>

      {/* Housekeeping Columns / Kanban */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {(['Clean & Ready', 'Needs Cleaning', 'In Progress', 'Maintenance'] as HousekeepingStatus[]).map((col) => {
          const matching = rooms.filter(r => r.status === col);
          return (
            <div key={col} className="bg-slate-950 rounded-2xl border border-slate-800 p-4 flex flex-col">
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  {col === 'Clean & Ready' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                  {col === 'Needs Cleaning' && <Clock className="w-3.5 h-3.5 text-amber-400" />}
                  {col === 'In Progress' && <RefreshCw className="w-3.5 h-3.5 text-sky-400 animate-spin" />}
                  {col === 'Maintenance' && <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />}
                  {col}
                </span>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-slate-900 text-slate-300">
                  {matching.length}
                </span>
              </div>

              <div className="space-y-3 flex-1">
                {matching.map((r) => (
                  <div key={r.id} className="bg-slate-900 rounded-xl p-3.5 border border-slate-800/90 shadow-sm space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-mono text-xs font-bold text-sky-400">{r.roomNumber}</span>
                        <h4 className="text-xs font-bold text-white truncate">{r.name}</h4>
                      </div>
                      <span className="text-[10px] text-slate-500">Floor {r.floor}</span>
                    </div>

                    <p className="text-[11px] text-slate-400">Inspected: {r.lastInspected}</p>

                    {/* Quick Move Action */}
                    <div className="pt-2 border-t border-slate-800 flex justify-between gap-1">
                      {col !== 'Clean & Ready' && (
                        <button
                          onClick={() => setStatus(r.id, 'Clean & Ready')}
                          className="w-full py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-[10px] font-bold rounded-lg border border-emerald-500/20"
                        >
                          Mark Clean
                        </button>
                      )}
                      {col !== 'In Progress' && col !== 'Clean & Ready' && (
                        <button
                          onClick={() => setStatus(r.id, 'In Progress')}
                          className="w-full py-1 bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 text-[10px] font-bold rounded-lg border border-sky-500/20"
                        >
                          Dispatch Staff
                        </button>
                      )}
                      {col === 'Clean & Ready' && (
                        <button
                          onClick={() => setStatus(r.id, 'Needs Cleaning')}
                          className="w-full py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-[10px] font-bold rounded-lg border border-amber-500/20"
                        >
                          Request Clean
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
    </AdminLayout>
  );
}
