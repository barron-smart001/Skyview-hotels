'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Building2, 
  LayoutDashboard, 
  BedDouble, 
  CalendarCheck2, 
  Sparkles, 
  Brush, 
  LogOut, 
  Search, 
  Bell, 
  ArrowLeft,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';

const ADMIN_NAV = [
  { label: 'Operations Overview', href: '/admin', icon: LayoutDashboard },
  { label: 'Room Management', href: '/admin/rooms', icon: BedDouble },
  { label: 'Guest Bookings', href: '/admin/bookings', icon: CalendarCheck2 },
  { label: 'Housekeeping & Status', href: '/admin/housekeeping', icon: Brush },
];

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-950 border-r border-slate-800 flex flex-col justify-between hidden md:flex shrink-0">
        <div className="p-6">
          {/* Brand */}
          <Link href="/admin" className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-cyan-400 flex items-center justify-center text-slate-950 shadow-md shadow-sky-500/20 font-bold">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-base text-white tracking-tight block">SKYVIEW ADMIN</span>
              <span className="text-[10px] text-sky-400 font-bold tracking-widest uppercase">Operations Portal</span>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="space-y-1.5">
            {ADMIN_NAV.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3.5 px-3.5 py-3 rounded-xl font-medium text-xs transition ${
                    isActive
                      ? 'bg-sky-500/10 text-sky-400 font-bold border border-sky-500/20'
                      : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-sky-400' : 'text-slate-500'}`} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer info & Return to Guest Portal */}
        <div className="p-4 m-4 bg-slate-900 rounded-2xl border border-slate-800 space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold text-xs">
              AD
            </div>
            <div className="overflow-hidden">
              <span className="text-xs font-bold text-white block truncate">Duty Manager</span>
              <span className="text-[10px] text-emerald-400 flex items-center gap-1">● Live On-Duty</span>
            </div>
          </div>

          <Link
            href="/"
            className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Exit to Guest View</span>
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-16 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 text-xs font-medium border border-emerald-500/20">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Live Property Sync
            </span>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-xs font-semibold text-sky-400 hover:text-sky-300 md:hidden flex items-center gap-1"
            >
              Guest Portal <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </header>

        {/* Main Body */}
        <main className="flex-1 p-6 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}