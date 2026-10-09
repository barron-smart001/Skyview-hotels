'use client';

import React from 'react';
import Link from 'next/link';
import { Room } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { Users, BedDouble, Maximize2, Star, Sparkles, Check, ChevronRight } from 'lucide-react';

interface RoomCardProps {
  room: Room;
  onBookNow: (room: Room) => void;
}

export function RoomCard({ room, onBookNow }: RoomCardProps) {
  return (
    <div className="group bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between">
      <div>
        {/* Image Container */}
        <div className="relative h-56 w-full overflow-hidden bg-slate-100">
          <img
            src={room.images[0]}
            alt={room.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          {room.featured && (
            <span className="absolute top-3 left-3 bg-sky-600/90 backdrop-blur-md text-white text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
              <Sparkles className="w-3 h-3" /> Featured Suite
            </span>
          )}
          <div className="absolute top-3 right-3 bg-slate-900/70 backdrop-blur-md text-white text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span>{room.rating ?? 'Room'}</span>
            {room.reviewCount != null && <span className="text-slate-300 font-normal">({room.reviewCount})</span>}
          </div>
          <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-md text-slate-800 text-xs font-medium px-2.5 py-1 rounded-lg">
            {room.type}
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          <div className="flex items-baseline justify-between mb-2">
            <h3 className="text-base font-bold text-slate-900 group-hover:text-sky-600 transition truncate">
              {room.name}
            </h3>
          </div>

          <p className="text-xs text-slate-500 line-clamp-2 mb-4 leading-relaxed">
            {room.description}
          </p>

          {/* Room Specs */}
          <div className="grid grid-cols-3 gap-2 py-2.5 px-3 bg-slate-50/80 rounded-xl mb-4 text-xs text-slate-600 border border-slate-100">
            <div className="flex items-center gap-1.5 truncate">
              <Users className="w-3.5 h-3.5 text-sky-600 shrink-0" />
              <span className="truncate">{room.capacity} Guests</span>
            </div>
            <div className="flex items-center gap-1.5 truncate">
              <BedDouble className="w-3.5 h-3.5 text-sky-600 shrink-0" />
              <span className="truncate">{room.bedType}</span>
            </div>
            <div className="flex items-center gap-1.5 truncate">
              <Maximize2 className="w-3.5 h-3.5 text-sky-600 shrink-0" />
              <span className="truncate">{room.sizeSqFt ? `${room.sizeSqFt} sq ft` : 'Size unlisted'}</span>
            </div>
          </div>

          {/* Key Amenities */}
          <div className="space-y-1.5 mb-2">
            {room.amenities.slice(0, 3).map((amenity, idx) => (
              <div key={idx} className="flex items-center gap-2 text-xs text-slate-600">
                <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span className="truncate">{amenity}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer & Price */}
        <div className="px-5 pb-5 pt-3 border-t border-slate-100 flex items-end justify-between gap-2">
        <div>
            <span className="text-xs text-slate-400 block font-medium">{room.available ? 'Available' : 'Unavailable'}</span>
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-extrabold text-slate-900">
              {formatCurrency(room.pricePerNight)}
            </span>
            <span className="text-xs text-slate-500">/ night</span>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          <Link href={`/rooms/${encodeURIComponent(room.id)}`} className="text-xs font-bold text-sky-700 hover:text-sky-900">View Details</Link>
          <button
            onClick={() => onBookNow(room)}
            disabled={!room.available}
            className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-sky-600 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            <span>Book This Room</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}