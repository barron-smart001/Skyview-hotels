'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  BedDouble,
  CalendarCheck2,
  Brush,
  ClipboardList,
  Users,
  CreditCard,
  ConciergeBell,
  Mail,
  Building2,
  ExternalLink,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { BrandMark } from '@/components/layout/BrandMark';
import { SignOutDialog } from '@/components/layout/SignOutDialog';
import { signOutUser } from '@/lib/guest-profile';
import type { AdminIdentity } from '@/types';

const ADMIN_NAV = [
  { label: 'Overview', href: '/admin', icon: LayoutDashboard },
  { label: 'Bookings', href: '/admin/bookings', icon: CalendarCheck2 },
  { label: 'Walk-in Records', href: '/admin/walk-ins', icon: ClipboardList },
  { label: 'Guests', href: '/admin/guests', icon: Users },
  { label: 'Rooms', href: '/admin/rooms', icon: BedDouble },
  { label: 'Housekeeping', href: '/admin/housekeeping', icon: Brush },
  { label: 'Messages', href: '/admin/messages', icon: Mail },
  { label: 'Service Requests', href: '/admin/service-requests', icon: ConciergeBell },
  { label: 'Payments', href: '/admin/payments', icon: CreditCard },
  { label: 'Hotel Information', href: '/admin/hotel', icon: Building2 },
];

export function AdminLayout({ admin, children }: { admin: AdminIdentity; children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const initials = admin.name.split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase() || 'AD';

  const [signOutOpen, setSignOutOpen] = useState(false);
  const [signOutError, setSignOutError] = useState<string | null>(null);

  const handleSignOut = async () => {
    setSigningOut(true);
    setSignOutError(null);
    try {
      await signOutUser();
      setSignOutOpen(false);
      router.push('/');
      router.refresh();
    } catch {
      setSignOutError('We could not sign you out. Please try again.');
    } finally {
      setSigningOut(false);
    }
  };

  const nav = (
    <nav className="space-y-1">
      {ADMIN_NAV.map((item) => {
        const Icon = item.icon;
        const isActive = item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setMenuOpen(false)}
            aria-current={isActive ? 'page' : undefined}
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition ${
              isActive
                ? 'bg-amber-200/10 text-amber-200 font-bold border border-amber-200/20'
                : 'text-stone-400 hover:bg-stone-900 hover:text-stone-100 border border-transparent'
            }`}
          >
            <Icon className={`w-4 h-4 ${isActive ? 'text-amber-200' : 'text-stone-500'}`} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  const accountCard = (
    <div className="p-4 m-4 bg-stone-900 rounded-2xl border border-stone-800 space-y-3">
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-full bg-amber-200 text-stone-950 flex items-center justify-center font-bold text-xs shrink-0">
          {initials}
        </div>
        <div className="overflow-hidden">
          <span className="text-xs font-bold text-white block truncate">{admin.name}</span>
          <span className="text-[10px] text-stone-400 block truncate">{admin.email}</span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Link
          href="/"
          className="py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-xl text-[11px] font-semibold flex items-center justify-center gap-1.5 transition"
        >
          <ExternalLink className="w-3.5 h-3.5" /> Website
        </Link>
        <button
          onClick={() => { setSignOutError(null); setSignOutOpen(true); }}
          disabled={signingOut}
          className="py-2 bg-stone-800 hover:bg-rose-950 hover:text-rose-300 text-stone-300 rounded-xl text-[11px] font-semibold flex items-center justify-center gap-1.5 transition disabled:opacity-50"
        >
          <LogOut className="w-3.5 h-3.5" /> {signingOut ? '…' : 'Sign out'}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-stone-900 text-stone-100 flex">
      {/* Desktop sidebar */}
      <aside className="w-64 bg-stone-950 border-r border-stone-800 hidden md:flex flex-col justify-between shrink-0 sticky top-0 h-screen overflow-y-auto">
        <div className="p-6">
          <BrandMark tone="light" subtitle="Admin Portal" href="/admin" className="mb-8" />
          {nav}
        </div>
        {accountCard}
      </aside>

      {/* Mobile drawer */}
      {menuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-stone-950/70" onClick={() => setMenuOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-72 bg-stone-950 border-r border-stone-800 flex flex-col justify-between overflow-y-auto">
            <div className="p-6">
              <BrandMark tone="light" subtitle="Admin Portal" href="/admin" className="mb-8" />
              {nav}
            </div>
            {accountCard}
          </aside>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-stone-800 bg-stone-950/80 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMenuOpen(true)}
              className="md:hidden rounded-lg border border-stone-700 p-2 text-stone-300"
              aria-label="Open admin menu"
              aria-expanded={menuOpen}
            >
              {menuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
            <span className="text-xs font-semibold text-stone-400">
              {ADMIN_NAV.find((item) => (item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href)))?.label ?? 'Admin'}
            </span>
          </div>
          <span className="text-[11px] font-semibold text-amber-200 bg-amber-200/10 border border-amber-200/20 px-2.5 py-1 rounded-md">
            Administrator
          </span>
        </header>

        <main className="flex-1 p-4 sm:p-6 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
      <SignOutDialog open={signOutOpen} signingOut={signingOut} error={signOutError} onCancel={() => setSignOutOpen(false)} onConfirm={() => void handleSignOut()} />
    </div>
  );
}
