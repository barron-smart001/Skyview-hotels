'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Building2, 
  Home, 
  BedDouble, 
  CalendarCheck2, 
  Sparkles, 
  User, 
  Search,
  Bell, 
  Menu,
  X
} from 'lucide-react';
import { useGuestProfile } from '@/lib/guest-profile';

const NAV_ITEMS = [
  { label: 'Overview', href: '/', icon: Home },
  { label: 'Rooms & Suites', href: '/rooms', icon: BedDouble },
  { label: 'My Bookings', href: '/bookings', icon: CalendarCheck2 },
  { label: 'Hotel Services', href: '/services', icon: Sparkles },
  { label: 'My Account', href: '/profile', icon: User },
];

export function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const { profile, avatarUrl, error } = useGuestProfile();
  const fullName = `${profile.firstName} ${profile.lastName}`.trim();
  const initials = fullName
    ? fullName.split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase()
    : 'G';

  return (
    <>
      {/* Mobile Toggle Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2.5 bg-white rounded-xl shadow-md border border-slate-200 text-slate-700 hover:bg-slate-50 transition"
          aria-label="Toggle navigation menu"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Backdrop */}
      {mobileOpen && (
        <div 
          onClick={() => setMobileOpen(false)} 
          className="lg:hidden fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-40 w-64 bg-white border-r border-slate-200/80 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-6">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-3 group mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-sky-500/20 group-hover:scale-105 transition">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-lg text-slate-900 tracking-tight block leading-tight">SKYVIEW</span>
              <span className="text-xs text-sky-600 font-medium tracking-widest uppercase">Luxury Hotels</span>
            </div>
          </Link>

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
                  className={`flex items-center gap-3.5 px-3.5 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${
                    isActive
                      ? 'bg-sky-50 text-sky-600 font-semibold shadow-xs'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-sky-600' : 'text-slate-400'}`} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Card in Sidebar Footer */}
        <div className="p-4 m-4 rounded-2xl bg-gradient-to-b from-sky-50 to-blue-50/50 border border-sky-100/80">
          <div className="flex items-center gap-3 mb-3">
            {avatarUrl ? (
              <img src={avatarUrl} alt={`${fullName || 'Guest'} profile`} className="h-10 w-10 rounded-full object-cover ring-2 ring-white shadow-xs" />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-600 text-sm font-bold text-white ring-2 ring-white shadow-xs">
                {initials}
              </div>
            )}
            <div className="overflow-hidden">
              <h4 className="text-sm font-semibold text-slate-900 truncate">{fullName || 'Guest'}</h4>
              <p className="text-xs text-slate-500 truncate">{profile.email || 'No email saved'}</p>
            </div>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-sky-100 text-xs text-sky-700 font-medium">
            <span>Skyview Guest</span>
            {error && <span className="text-rose-600" role="status">Profile unavailable</span>}
          </div>
        </div>
      </aside>
    </>
  );
}

export function Header() {
  return (
    <header className="h-20 border-b border-slate-200/80 bg-white/80 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between px-6 lg:px-8">
      <div className="flex items-center gap-4 pl-12 lg:pl-0 flex-1 max-w-md">
        <div className="relative w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search rooms, destinations, amenities..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition"
          />
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-4">
        <button className="relative p-2.5 text-slate-600 hover:bg-slate-100 rounded-xl transition" aria-label="Notifications">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-sky-500 rounded-full ring-2 ring-white" />
        </button>

        <Link
          href="/rooms"
          className="hidden sm:inline-flex items-center gap-2 bg-gradient-to-r from-sky-600 to-cyan-600 text-white text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-xl shadow-sm hover:shadow-md hover:from-sky-700 hover:to-cyan-700 transition"
        >
          Explore Rooms
        </Link>
      </div>
    </header>
  );
}