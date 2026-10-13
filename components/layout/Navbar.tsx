'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Home,
  BedDouble,
  CalendarCheck2,
  Sparkles,
  User,
  Search,
  Menu,
  X,
  LogIn,
  LogOut,
  ShieldCheck,
} from 'lucide-react';
import { BrandMark } from '@/components/layout/BrandMark';
import { SignOutDialog } from './SignOutDialog';
import { signOutUser, useGuestProfile } from '@/lib/guest-profile';

const NAV_ITEMS = [
  { label: 'Hotel Home', href: '/', icon: Home },
  { label: 'Rooms & Suites', href: '/rooms', icon: BedDouble },
  { label: 'My Bookings', href: '/bookings', icon: CalendarCheck2 },
  { label: 'Hotel Services', href: '/services', icon: Sparkles },
  { label: 'My Account', href: '/profile', icon: User },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const { profile, avatarUrl, ready, authenticated, isAdmin, error } = useGuestProfile();
  const fullName = `${profile.firstName} ${profile.lastName}`.trim();
  const initials = fullName
    ? fullName.split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase()
    : 'G';

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

  return (
    <>
      {/* Mobile Toggle Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2.5 bg-white rounded-xl shadow-md border border-stone-200 text-stone-700 hover:bg-stone-50 transition"
          aria-label="Toggle navigation menu"
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="lg:hidden fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-40 transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-40 w-64 bg-white border-r border-stone-200/80 flex flex-col justify-between overflow-y-auto transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-6">
          <BrandMark className="mb-8 mt-10 lg:mt-0" />

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`flex items-center gap-3.5 px-3.5 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${
                    isActive
                      ? 'bg-amber-50 text-amber-800 font-semibold shadow-xs'
                      : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-amber-700' : 'text-stone-400'}`} />
                  {item.label}
                </Link>
              );
            })}
            {isAdmin && (
              <Link
                href="/admin"
                className="mt-3 flex items-center gap-3.5 px-3.5 py-3 rounded-xl text-sm font-semibold text-stone-900 bg-stone-100 hover:bg-amber-100 transition"
              >
                <ShieldCheck className="w-5 h-5 text-amber-700" />
                Admin Dashboard
              </Link>
            )}
          </nav>
        </div>

        {/* Account card */}
        <div className="p-4 m-4 rounded-2xl bg-stone-50 border border-stone-200/80">
          {ready && !authenticated ? (
            <div className="space-y-3 text-center">
              <p className="text-xs text-stone-600">Sign in to manage your stays and requests.</p>
              <Link
                href={`/sign-in?next=${encodeURIComponent(pathname)}`}
                className="flex items-center justify-center gap-2 rounded-xl bg-stone-900 px-3 py-2 text-xs font-semibold text-white hover:bg-amber-800 transition"
              >
                <LogIn className="w-3.5 h-3.5" /> Sign in
              </Link>
              <Link href="/sign-up" className="block text-xs font-semibold text-amber-800 hover:text-amber-900">
                Create an account
              </Link>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3 mb-3">
                {avatarUrl ? (
                  <Image src={avatarUrl} alt={`${fullName || 'Guest'} profile`} width={40} height={40} unoptimized className="h-10 w-10 rounded-full object-cover ring-2 ring-white shadow-xs" />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-stone-900 text-sm font-bold text-amber-200 ring-2 ring-white shadow-xs">
                    {initials}
                  </div>
                )}
                <div className="overflow-hidden">
                  <h4 className="text-sm font-semibold text-stone-900 truncate">{fullName || (ready ? 'Guest' : 'Loading…')}</h4>
                  <p className="text-xs text-stone-500 truncate">{profile.email}</p>
                </div>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-stone-200 text-xs font-medium">
                {error ? (
                  <span className="text-rose-600" role="status">Profile unavailable</span>
                ) : (
                  <span className="text-amber-800">{isAdmin ? 'Administrator' : 'Skyview Guest'}</span>
                )}
                {authenticated && (
                  <button
                    onClick={() => { setSignOutError(null); setSignOutOpen(true); }}
                    disabled={signingOut}
                    className="flex items-center gap-1 text-stone-500 hover:text-rose-600 disabled:opacity-50"
                  >
                    <LogOut className="w-3.5 h-3.5" /> {signingOut ? 'Signing out…' : 'Sign out'}
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </aside>
      <SignOutDialog open={signOutOpen} signingOut={signingOut} error={signOutError} onCancel={() => setSignOutOpen(false)} onConfirm={() => void handleSignOut()} />
    </>
  );
}

export function Header() {
  const router = useRouter();
  const [query, setQuery] = useState('');

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = query.trim();
    router.push(trimmed ? `/rooms?q=${encodeURIComponent(trimmed)}` : '/rooms');
  };

  return (
    <header className="h-20 border-b border-stone-200/80 bg-white/80 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between gap-4 px-6 lg:px-8">
      <form onSubmit={handleSearch} role="search" className="flex items-center gap-4 pl-12 lg:pl-0 flex-1 max-w-md">
        <div className="relative w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search rooms and amenities..."
            aria-label="Search rooms"
            className="w-full pl-10 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition"
          />
        </div>
      </form>

      <Link
        href="/rooms"
        className="hidden sm:inline-flex items-center gap-2 bg-stone-900 hover:bg-amber-800 text-white text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-xl shadow-sm transition"
      >
        Book a Room
      </Link>
    </header>
  );
}
