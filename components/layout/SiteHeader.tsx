'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Building2, Menu, X } from 'lucide-react';
import { HOTEL } from '@/lib/hotel-config';

const links = [
  { href: '#home', label: 'Home' },
  { href: '#rooms', label: 'Rooms & Suites' },
  { href: '#facilities', label: 'Facilities' },
  { href: '#about', label: 'About' },
  { href: '#gallery', label: 'Gallery' },
  { href: '#contact', label: 'Contact' },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="absolute inset-x-0 top-0 z-30">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8 lg:px-10">
        <Link href="/" className="flex items-center gap-3 text-white" aria-label={`${HOTEL.name} home`}>
          <span className="flex h-10 w-10 items-center justify-center rounded-full border border-white/35 bg-white/10 backdrop-blur-sm"><Building2 className="h-5 w-5" /></span>
          <span className="leading-none"><strong className="block font-serif text-lg tracking-[0.08em]">SKYVIEW</strong><small className="text-[9px] font-semibold tracking-[0.24em] text-amber-200">HOTEL · UYO</small></span>
        </Link>
        <nav className="hidden items-center gap-8 text-sm font-medium text-white/90 md:flex">
          {links.map((link) => <a key={link.href} href={link.href} className="transition hover:text-amber-200">{link.label}</a>)}
          <Link href="/sign-in" className="transition hover:text-amber-200">Guest sign in</Link>
          <a href="#rooms" className="rounded-full border border-amber-200/70 bg-amber-200 px-5 py-2.5 text-xs font-bold text-stone-950 transition hover:bg-white">Book a Room</a>
        </nav>
        <button onClick={() => setOpen(!open)} className="rounded-full border border-white/30 p-2 text-white md:hidden" aria-label="Toggle menu">{open ? <X /> : <Menu />}</button>
      </div>
      {open && <div className="mx-5 rounded-2xl bg-stone-950/95 p-5 text-white shadow-2xl backdrop-blur md:hidden"><nav className="flex flex-col gap-4 text-sm">{links.map((link) => <a key={link.href} onClick={() => setOpen(false)} href={link.href}>{link.label}</a>)}<Link onClick={() => setOpen(false)} href="/sign-in">Guest sign in</Link></nav></div>}
    </header>
  );
}
