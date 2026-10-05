'use client';

import React, { useState } from 'react';
import { Room } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { X, Calendar, User, Mail, Phone, CreditCard, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface BookingModalProps {
  room: Room | null;
  onClose: () => void;
  onSuccess: (bookingRef: string) => void;
}

export function BookingModal({ room, onClose, onSuccess }: BookingModalProps) {
  const [checkIn, setCheckIn] = useState('2026-10-15');
  const [checkOut, setCheckOut] = useState('2026-10-18');
  const [guests, setGuests] = useState(2);
  const [name, setName] = useState('Eleanor Vance');
  const [email, setEmail] = useState('eleanor.vance@example.com');
  const [phone, setPhone] = useState('+234 812 345 6789');
  const [specialRequests, setSpecialRequests] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [bookingRef, setBookingRef] = useState('');

  if (!room) return null;

  // Calculate nights
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const nights = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24))) || 3;
  const totalAmount = room.pricePerNight * nights;

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate Paystack processing
    setTimeout(() => {
      const generatedRef = `SKV-${Math.floor(1000 + Math.random() * 9000)}-NG`;
      setBookingRef(generatedRef);
      setIsSubmitting(false);
      setConfirmed(true);
      onSuccess(generatedRef);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl overflow-hidden border border-slate-100 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              {confirmed ? 'Reservation Confirmed' : 'Complete Reservation'}
            </h3>
            <p className="text-xs text-slate-500">
              {confirmed ? 'Your stay has been confirmed with Skyview Hotels' : room.name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-200/50 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {confirmed ? (
          <div className="p-8 text-center space-y-5 overflow-y-auto">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto ring-8 ring-emerald-50">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <h4 className="text-xl font-bold text-slate-900">Booking Reference #{bookingRef}</h4>
              <p className="text-sm text-slate-600 mt-1">
                We have emailed your complete check-in itinerary to <span className="font-semibold text-slate-800">{email}</span>.
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/70 text-left text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Suite</span>
                <span className="font-semibold text-slate-800">{room.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Dates</span>
                <span className="font-semibold text-slate-800">{checkIn} to {checkOut} ({nights} nights)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Guests</span>
                <span className="font-semibold text-slate-800">{guests} Adults</span>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-2 text-sm font-bold">
                <span className="text-slate-900">Total Paid (Paystack)</span>
                <span className="text-sky-600">{formatCurrency(totalAmount)}</span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-semibold transition"
            >
              Done & Return
            </button>
          </div>
        ) : (
          <form onSubmit={handleBookingSubmit} className="p-6 overflow-y-auto space-y-4">
            {/* Room Summary Preview */}
            <div className="flex items-center gap-4 p-3 bg-sky-50/60 border border-sky-100 rounded-2xl">
              <img
                src={room.images[0]}
                alt={room.name}
                className="w-16 h-16 rounded-xl object-cover"
              />
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold text-slate-900 truncate">{room.name}</h4>
                <p className="text-xs text-sky-700 font-medium">{formatCurrency(room.pricePerNight)} / night</p>
                <p className="text-xs text-slate-500">{room.bedType}</p>
              </div>
            </div>

            {/* Dates & Guests Selection */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Check-in</label>
                <div className="relative">
                  <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="date"
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                    required
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Check-out</label>
                <div className="relative">
                  <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="date"
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    required
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                  />
                </div>
              </div>
            </div>

            {/* Guest Details */}
            <div className="space-y-3 pt-2">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Full Guest Name</label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Email Address</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Phone Number</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Special Requests (Optional)</label>
                <textarea
                  rows={2}
                  placeholder="Late check-in, dietary preferences, high floor, etc."
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                />
              </div>
            </div>

            {/* Price Calculation & Paystack CTA */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2 mt-4">
              <div className="flex justify-between text-xs text-slate-600">
                <span>{formatCurrency(room.pricePerNight)} x {nights} nights</span>
                <span>{formatCurrency(totalAmount)}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-600">
                <span>Taxes & Service Fees</span>
                <span className="text-emerald-600 font-medium">Included</span>
              </div>
              <div className="border-t border-slate-200 pt-2 flex justify-between items-baseline">
                <span className="text-sm font-bold text-slate-900">Total Due</span>
                <span className="text-lg font-extrabold text-sky-600">{formatCurrency(totalAmount)}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-gradient-to-r from-sky-600 to-cyan-600 hover:from-sky-700 hover:to-cyan-700 text-white rounded-xl font-bold text-sm shadow-md flex items-center justify-center gap-2 transition active:scale-98 disabled:opacity-75"
            >
              <CreditCard className="w-4 h-4" />
              {isSubmitting ? 'Securing with Paystack...' : `Pay ${formatCurrency(totalAmount)} via Paystack`}
            </button>

            <p className="text-[11px] text-center text-slate-400 flex items-center justify-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> 256-Bit SSL Encrypted & Secured Payment Gateway
            </p>
          </form>
        )}
      </div>
    </div>
  );
}