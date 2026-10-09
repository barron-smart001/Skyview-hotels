'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, BedDouble, Check, Users } from 'lucide-react';
import { BookingModal } from '@/components/rooms/BookingModal';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { formatCurrency } from '@/lib/utils';
import type { Room } from '@/types';

export function RoomDetails({ room }: { room: Room }) {
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [activeImage, setActiveImage] = useState(room.images[0] ?? '');

  return (
    <DashboardLayout>
      <div className="mb-6">
        <Link href="/rooms" className="inline-flex items-center gap-2 text-sm font-semibold text-sky-700 hover:text-sky-900">
          <ArrowLeft className="h-4 w-4" /> All rooms
        </Link>
      </div>
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(300px,0.8fr)]">
        <section>
          <div className="overflow-hidden rounded-2xl bg-slate-100">
            {activeImage ? <img src={activeImage} alt={room.name} className="aspect-[4/3] w-full object-cover" /> : <div className="flex aspect-[4/3] items-center justify-center text-sm text-slate-500">No room photographs provided</div>}
          </div>
          {room.images.length > 1 && <div className="mt-3 grid grid-cols-4 gap-3">
            {room.images.map((image, index) => <button key={`${image}-${index}`} type="button" onClick={() => setActiveImage(image)} aria-label={`Show room photo ${index + 1}`} aria-pressed={activeImage === image} className={`overflow-hidden rounded-lg border-2 ${activeImage === image ? 'border-sky-600' : 'border-transparent'}`}>
              <img src={image} alt={`${room.name}, photo ${index + 1}`} className="aspect-[4/3] w-full object-cover" />
            </button>)}
          </div>}
        </section>

        <section className="flex flex-col">
          <p className="text-xs font-bold uppercase tracking-wider text-sky-700">{room.type}</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">{room.name}</h1>
          <p className="mt-4 leading-relaxed text-slate-600">{room.description || 'A description has not been provided for this room.'}</p>
          <div className="mt-6 grid grid-cols-2 gap-3 rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
            <span className="flex items-center gap-2"><Users className="h-4 w-4 text-sky-700" /> Up to {room.capacity} guests</span>
            <span className="flex items-center gap-2"><BedDouble className="h-4 w-4 text-sky-700" /> {room.bedType}</span>
            {room.sizeSqFt != null && <span>{room.sizeSqFt} sq ft</span>}
            <span className={room.available ? 'font-semibold text-emerald-700' : 'font-semibold text-rose-700'}>{room.available ? 'Available' : 'Unavailable'}</span>
          </div>

          {room.amenities.length > 0 && <div className="mt-7">
            <h2 className="text-sm font-bold text-slate-900">Room features</h2>
            <ul className="mt-3 grid gap-2 sm:grid-cols-2">
              {room.amenities.map((amenity) => <li key={amenity} className="flex items-start gap-2 text-sm text-slate-600"><Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />{amenity}</li>)}
            </ul>
          </div>}

          <div className="mt-auto pt-8">
            <p className="text-xs text-slate-500">Nightly rate</p>
            <p className="text-2xl font-extrabold text-slate-900">{formatCurrency(room.pricePerNight)} <span className="text-sm font-normal text-slate-500">/ night</span></p>
            <button type="button" disabled={!room.available} onClick={() => setSelectedRoom(room)} className="mt-4 w-full rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-slate-300">Book This Room</button>
          </div>
        </section>
      </div>
      <BookingModal room={selectedRoom} onClose={() => setSelectedRoom(null)} onSuccess={() => undefined} />
    </DashboardLayout>
  );
}
