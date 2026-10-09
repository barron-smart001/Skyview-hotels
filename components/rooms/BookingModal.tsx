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
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(1);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [bookingRef, setBookingRef] = useState('');
  const [error, setError] = useState('');

  if (!room) return null;

  const start = checkIn ? new Date(`${checkIn}T00:00:00`) : new Date(Number.NaN);
  const end = checkOut ? new Date(`${checkOut}T00:00:00`) : new Date(Number.NaN);
  const datesValid = !Number.isNaN(start.valueOf()) && !Number.isNaN(end.valueOf()) && end > start;
  const nights = datesValid ? Math.ceil((end.valueOf() - start.valueOf()) / 86400000) : 0;
  const totalAmount = room.pricePerNight * nights;

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!datesValid) {
      setError('Please choose a check-out date after your arrival date.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId: room.id,
          checkIn,
          checkOut,
          guestName: name,
          guestEmail: email,
          guestPhone: phone,
          guestsCount: guests,
          totalAmount,
          specialRequests,
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'We could not submit your booking enquiry.');

      const reference = result.booking.bookingReference || result.booking.booking_reference;
      setBookingRef(reference);
      setConfirmed(true);
      onSuccess(reference);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'We could not submit your booking enquiry.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl overflow-hidden border border-slate-100 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              {confirmed ? 'Enquiry Received' : 'Request a Stay'}
            </h3>
            <p className="text-xs text-slate-500">
              {confirmed ? 'Our reservations team will confirm your stay shortly' : room.name}
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
              <h4 className="text-xl font-bold text-slate-900">Enquiry Reference #{bookingRef}</h4>
              <p className="text-sm text-slate-600 mt-1">
                We have received your stay enquiry and will contact <span className="font-semibold text-slate-800">{email}</span> to confirm availability and payment.
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
                <span className="text-slate-900">Estimated stay total</span>
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
            {error && <p role="alert" className="rounded-xl bg-rose-50 p-3 text-xs font-semibold text-rose-700">{error}</p>}
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
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Guests</label>
              <select value={guests} onChange={(e) => setGuests(Number(e.target.value))} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500">
                {Array.from({ length: room.capacity }, (_, index) => index + 1).map((count) => <option key={count} value={count}>{count} {count === 1 ? 'guest' : 'guests'}</option>)}
              </select>
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

            {/* Price calculation and enquiry CTA */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2 mt-4">
              <div className="flex justify-between text-xs text-slate-600">
                <span>{datesValid ? `${formatCurrency(room.pricePerNight)} x ${nights} nights` : `${formatCurrency(room.pricePerNight)} / night`}</span>
                <span>{datesValid ? formatCurrency(totalAmount) : 'Select dates'}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-600">
                <span>Taxes & Service Fees</span>
                <span className="text-emerald-600 font-medium">Included</span>
              </div>
              <div className="border-t border-slate-200 pt-2 flex justify-between items-baseline">
                <span className="text-sm font-bold text-slate-900">Estimated total</span>
                <span className="text-lg font-extrabold text-sky-600">{datesValid ? formatCurrency(totalAmount) : 'Select dates'}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-gradient-to-r from-sky-600 to-cyan-600 hover:from-sky-700 hover:to-cyan-700 text-white rounded-xl font-bold text-sm shadow-md flex items-center justify-center gap-2 transition active:scale-98 disabled:opacity-75"
            >
              <CreditCard className="w-4 h-4" />
              {isSubmitting ? 'Sending your enquiry...' : 'Request this stay'}
            </button>

            <p className="text-[11px] text-center text-slate-400 flex items-center justify-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Your request is secure. Payment is only arranged after availability is confirmed.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
