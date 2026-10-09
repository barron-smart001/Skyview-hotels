'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import {
  ArrowRight, BedDouble, Car, ChevronRight, Clock3, MapPin, ShieldCheck,
  Sparkles, Star, UtensilsCrossed, Wifi,
} from 'lucide-react';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { BookingModal } from '@/components/rooms/BookingModal';
import { HOTEL, FACILITIES } from '@/lib/hotel-config';
import { MOCK_ROOMS } from '@/lib/data/mock-data';
import type { Room } from '@/types';
import { formatCurrency } from '@/lib/utils';

const images = {
  hero: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=2200&q=88',
  pool: 'https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=1400&q=85',
  dining: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1200&q=85',
  room: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=85',
};

const facilityIcons = [Wifi, Sparkles, BedDouble, Car] as const;

export default function Home() {
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const reduceMotion = useReducedMotion();
  const suites = MOCK_ROOMS.filter((room) => room.featured).slice(0, 3);
  const reveal = reduceMotion ? {} : { initial: { opacity: 0, y: 14 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, amount: 0.2 }, transition: { duration: 0.45 } };

  return (
    <main id="home" className="overflow-hidden bg-[#faf8f4] text-stone-900">
      <section className="relative min-h-[720px] bg-stone-950 sm:min-h-[800px]">
        <img src={images.hero} alt="Hotel exterior at dusk" className="absolute inset-0 h-full w-full object-cover opacity-75" />
        <div className="absolute inset-0 bg-gradient-to-b from-stone-950/80 via-stone-950/25 to-stone-950/85" />
        <SiteHeader />
        <motion.div {...reveal} className="relative mx-auto flex min-h-[720px] max-w-7xl flex-col justify-end px-5 pb-20 pt-36 sm:min-h-[800px] sm:px-8 lg:px-10">
          <p className="mb-5 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.28em] text-amber-200"><span className="h-px w-10 bg-amber-200" /> Hotel website demonstration</p>
          <h1 className="max-w-4xl font-serif text-5xl leading-[0.98] text-white sm:text-7xl lg:text-8xl">Experience Comfort.<br />Enjoy Every Moment.</h1>
          <p className="mt-7 max-w-xl text-base leading-relaxed text-stone-100 sm:text-lg">Discover a welcoming stay with comfortable accommodation, relaxing facilities, and convenient service.</p>
          <div className="mt-9 flex flex-wrap gap-4">
            <a href="#rooms" className="rounded-full bg-amber-200 px-6 py-3.5 text-sm font-bold text-stone-950 transition hover:bg-white">Explore Rooms</a>
            <a href="#book" className="rounded-full border border-white/45 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-white/10">Make a Reservation</a>
          </div>
        </motion.div>
      </section>

      <section id="facilities" className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-10">
        <motion.div {...reveal} className="max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-amber-700">Facilities</p>
          <h2 className="mt-3 font-serif text-4xl sm:text-5xl">Thoughtful spaces for every kind of stay.</h2>
          <p className="mt-5 text-sm leading-relaxed text-stone-600">The following is demonstration content based on the facilities identified for this concept. Final descriptions should be approved by the hotel.</p>
        </motion.div>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {FACILITIES.map((facility, index) => {
            const Icon = facilityIcons[index];
            return <motion.article {...reveal} key={facility.title} className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
              <Icon className="h-6 w-6 text-amber-700" />
              <h3 className="mt-8 font-serif text-2xl">{facility.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-stone-600">{facility.description}</p>
            </motion.article>;
          })}
        </div>
      </section>

      <section id="rooms" className="bg-[#213b35] px-5 py-20 text-white sm:px-8 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
            <div><p className="text-xs font-bold uppercase tracking-[0.22em] text-amber-200">Rooms & suites</p><h2 className="mt-3 font-serif text-4xl sm:text-5xl">A room to settle into.</h2></div>
            <Link href="/rooms" className="inline-flex items-center gap-1 text-sm font-bold text-amber-200">Browse all demo rooms <ChevronRight className="h-4 w-4" /></Link>
          </div>
          <p className="mt-4 max-w-2xl text-sm text-stone-300">Room names, images, amenities, rates and availability shown below are demo data. Replace them with verified hotel inventory before publishing.</p>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {suites.map((room) => <motion.article {...reveal} key={room.id} className="group overflow-hidden rounded-2xl bg-white text-stone-900">
              <img src={room.images[0]} alt={room.name} className="h-56 w-full object-cover transition duration-500 group-hover:scale-105" />
              <div className="p-6">
                <div className="flex items-center justify-between text-xs"><span className="rounded-full bg-amber-100 px-2.5 py-1 font-bold text-amber-900">{room.type}</span><span className="flex items-center gap-1"><Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" /> Demo</span></div>
                <h3 className="mt-4 font-serif text-2xl">{room.name}</h3>
                <p className="mt-2 min-h-10 text-sm leading-relaxed text-stone-600">{room.description}</p>
                <p className="mt-4 text-xs font-semibold text-stone-500">Demo rate from <span className="text-stone-900">{formatCurrency(room.pricePerNight)}</span> / night</p>
                <div className="mt-5 flex items-center justify-between border-t border-stone-100 pt-4">
                  <Link href="/rooms" className="text-sm font-bold text-stone-700">View Details</Link>
                  <button onClick={() => setSelectedRoom(room)} className="rounded-full bg-stone-900 px-4 py-2 text-sm font-bold text-white transition hover:bg-amber-700">Book This Room</button>
                </div>
              </div>
            </motion.article>)}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-10 px-5 py-24 sm:px-8 lg:grid-cols-2 lg:px-10">
        <div className="overflow-hidden rounded-3xl"><img src={images.pool} alt="Swimming pool setting" className="h-full min-h-80 w-full object-cover" /></div>
        <motion.div {...reveal} className="flex flex-col justify-center">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-amber-700">Swimming pool</p>
          <h2 className="mt-4 font-serif text-4xl leading-tight sm:text-5xl">A calm poolside pause.</h2>
          <p className="mt-6 max-w-xl leading-relaxed text-stone-600">This dedicated pool feature can be updated with the hotel’s own photographs, access policy, and guest guidance. Until then, it presents the confirmed swimming-pool facility without adding unverified details.</p>
          <div className="mt-8 flex flex-wrap gap-4"><a href="#book" className="rounded-full bg-stone-900 px-5 py-3 text-sm font-bold text-white transition hover:bg-amber-700">Enquire about your stay</a><Link href="/rooms" className="rounded-full border border-stone-300 px-5 py-3 text-sm font-bold transition hover:border-stone-900">Explore accommodation</Link></div>
        </motion.div>
      </section>

      <section id="about" className="bg-[#eee8dc] px-5 py-24 sm:px-8 lg:px-10">
        <motion.div {...reveal} className="mx-auto max-w-3xl text-center"><p className="text-xs font-bold uppercase tracking-[0.22em] text-amber-700">About the hotel</p><h2 className="mt-4 font-serif text-4xl sm:text-5xl">Hospitality that can be made distinctly yours.</h2><p className="mt-6 leading-relaxed text-stone-600">{HOTEL.name}’s story, location details, and distinctive offerings can be added here after owner approval. This neutral demonstration copy is designed to be replaced easily with accurate information about the property and its guests.</p></motion.div>
      </section>

      <section id="gallery" className="mx-auto max-w-7xl px-5 py-24 sm:px-8 lg:px-10">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-xs font-bold uppercase tracking-[0.22em] text-amber-700">Gallery</p><h2 className="mt-3 font-serif text-4xl sm:text-5xl">A preview of the experience.</h2></div><p className="max-w-sm text-sm text-stone-500">Replace these demonstration photographs with licensed, hotel-approved images before launch.</p></div>
        <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4"><img src={images.pool} alt="Demo pool photograph" className="h-52 w-full rounded-2xl object-cover md:h-72" /><img src={images.dining} alt="Demo dining photograph" className="h-52 w-full rounded-2xl object-cover md:h-72" /><img src={images.room} alt="Demo room photograph" className="h-52 w-full rounded-2xl object-cover md:h-72" /><img src={images.hero} alt="Demo hotel exterior photograph" className="h-52 w-full rounded-2xl object-cover md:h-72" /></div>
      </section>

      <section id="book" className="mx-5 mb-8 overflow-hidden rounded-3xl bg-stone-900 sm:mx-8 lg:mx-10">
        <div className="mx-auto grid max-w-6xl lg:grid-cols-2"><div className="p-9 text-white sm:p-14"><p className="text-xs font-bold uppercase tracking-[0.22em] text-amber-200">Reservations</p><h2 className="mt-4 font-serif text-4xl sm:text-5xl">Book Your Stay</h2><p className="mt-5 max-w-lg text-sm leading-relaxed text-stone-300">Send a reservation enquiry with your dates and guest details. The hotel can then confirm availability and payment directly.</p><Link href="/rooms" className="mt-8 inline-flex items-center gap-2 rounded-full bg-amber-200 px-6 py-3.5 text-sm font-bold text-stone-950 transition hover:bg-white">Start a reservation <ArrowRight className="h-4 w-4" /></Link></div><img src={images.room} alt="Demo hotel suite" className="h-72 w-full object-cover lg:h-full" /></div>
      </section>

      <footer id="contact" className="border-t border-stone-200 px-5 py-10 sm:px-8 lg:px-10"><div className="mx-auto grid max-w-7xl gap-8 text-sm md:grid-cols-3"><div><p className="font-serif text-2xl">{HOTEL.name}</p><p className="mt-2 text-stone-500">Hotel website demonstration.</p></div><div className="text-stone-600"><p className="flex items-center gap-2"><MapPin className="h-4 w-4 text-amber-700" /> {HOTEL.location}</p><p className="mt-2 flex items-center gap-2"><Clock3 className="h-4 w-4 text-amber-700" /> Contact details to be confirmed by the hotel</p></div><div className="flex gap-4 md:justify-end"><span className="flex items-center gap-1 text-xs font-semibold"><ShieldCheck className="h-4 w-4 text-amber-700" /> Secure enquiry</span><span className="flex items-center gap-1 text-xs font-semibold"><Wifi className="h-4 w-4 text-amber-700" /> Configurable content</span></div></div><p className="mx-auto mt-8 max-w-7xl border-t border-stone-200 pt-5 text-xs text-stone-500">© {new Date().getFullYear()} {HOTEL.name}. {HOTEL.demoNotice}</p></footer>
      <BookingModal room={selectedRoom} onClose={() => setSelectedRoom(null)} onSuccess={() => undefined} />
    </main>
  );
}
