'use client';

import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

type DayCounts = { arrivals: number; departures: number; inHouse: number };
type Stay = {
  id: string;
  reference: string;
  guest: string;
  phone: string;
  room: string;
  checkIn: string;
  checkOut: string;
  status: string;
  paymentStatus: string;
  amount: number;
  source: string;
};
type DayDetail = {
  date: string;
  arrivals: Stay[];
  departures: Stay[];
  inHouse: Stay[];
  created: Stay[];
  payments: { id: string; amount: number; channel: string | null; reference: string; guest: string }[];
  messages: { id: string; kind: string; name: string; status: string }[];
  serviceRequests: { id: string; status: string; service: string; time: string }[];
};

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const hotelToday = () => new Date().toLocaleDateString('en-CA', { timeZone: 'Africa/Lagos' });

function monthLabel(month: string) {
  return new Date(`${month}-01T00:00:00Z`).toLocaleDateString('en-NG', { month: 'long', year: 'numeric', timeZone: 'UTC' });
}

function shiftMonth(month: string, delta: number) {
  const date = new Date(Date.UTC(Number(month.slice(0, 4)), Number(month.slice(5, 7)) - 1 + delta, 1));
  return date.toISOString().slice(0, 7);
}

function StayList({ title, stays, empty }: { title: string; stays: Stay[]; empty: string }) {
  return (
    <section className="rounded-2xl border border-stone-800 bg-stone-950 p-4">
      <h3 className="mb-3 flex items-center justify-between text-sm font-bold text-white">
        {title}
        <span className="rounded-full bg-stone-800 px-2 py-0.5 text-[10px] text-stone-300">{stays.length}</span>
      </h3>
      {stays.length === 0 ? (
        <p className="text-xs text-stone-500">{empty}</p>
      ) : (
        <ul className="space-y-2">
          {stays.map((stay) => (
            <li key={stay.id} className="rounded-xl border border-stone-800 bg-stone-900 p-3 text-xs">
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold text-white">{stay.guest}</span>
                <span className="font-mono text-amber-300">Room {stay.room}</span>
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-stone-400">
                <span className="font-mono">{stay.reference}</span>
                <span className="capitalize">{stay.status}</span>
                <span className="capitalize">{stay.source}</span>
                <span className={stay.paymentStatus === 'paid' ? 'text-emerald-400' : 'text-amber-400'}>
                  {stay.paymentStatus} · {formatCurrency(stay.amount)}
                </span>
              </div>
              <div className="mt-1 text-[11px] text-stone-500">{stay.checkIn} → {stay.checkOut} · {stay.phone}</div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default function AdminCalendarPage() {
  const [today] = useState(hotelToday);
  const [month, setMonth] = useState(today.slice(0, 7));
  const [selected, setSelected] = useState(today);
  const [counts, setCounts] = useState<Record<string, DayCounts>>({});
  const [detail, setDetail] = useState<DayDetail | null>(null);
  const [monthError, setMonthError] = useState('');
  const [dayError, setDayError] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/admin/calendar?month=${month}`, { signal: controller.signal })
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'The calendar could not be loaded.');
        setCounts(result.days);
        setMonthError('');
      })
      .catch((error: unknown) => {
        if (error instanceof Error && error.name === 'AbortError') return;
        setMonthError(error instanceof Error ? error.message : 'The calendar could not be loaded.');
      });
    return () => controller.abort();
  }, [month]);

  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/admin/calendar?date=${selected}`, { signal: controller.signal })
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'That day could not be loaded.');
        setDetail(result);
        setDayError('');
      })
      .catch((error: unknown) => {
        if (error instanceof Error && error.name === 'AbortError') return;
        setDayError(error instanceof Error ? error.message : 'That day could not be loaded.');
      });
    return () => controller.abort();
  }, [selected]);

  const first = new Date(`${month}-01T00:00:00Z`);
  const offset = (first.getUTCDay() + 6) % 7; // Monday first
  const daysInMonth = new Date(Date.UTC(first.getUTCFullYear(), first.getUTCMonth() + 1, 0)).getUTCDate();
  const cells: (string | null)[] = [
    ...Array.from({ length: offset }, () => null),
    ...Array.from({ length: daysInMonth }, (_, index) => `${month}-${String(index + 1).padStart(2, '0')}`),
  ];

  const loadedDetail = detail && detail.date === selected ? detail : null;

  return (
    <>
      <div className="mb-8">
        <h1 className="font-serif text-3xl text-white">Hotel Calendar</h1>
        <p className="mt-0.5 text-xs text-stone-400">Pick a date to see arrivals, departures, guests in the hotel, bookings made, payments and messages for that day.</p>
      </div>

      {monthError && <p role="alert" className="mb-4 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">{monthError}</p>}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <div className="rounded-2xl border border-stone-800 bg-stone-950 p-4">
          <div className="mb-4 flex items-center justify-between">
            <button onClick={() => setMonth(shiftMonth(month, -1))} aria-label="Previous month" className="rounded-lg p-2 text-stone-300 hover:bg-stone-800"><ChevronLeft className="h-4 w-4" /></button>
            <div className="text-center">
              <div className="font-serif text-xl text-white">{monthLabel(month)}</div>
              {month !== today.slice(0, 7) && (
                <button onClick={() => { setMonth(today.slice(0, 7)); setSelected(today); }} className="text-[11px] text-amber-300 hover:text-amber-200">Back to today</button>
              )}
            </div>
            <button onClick={() => setMonth(shiftMonth(month, 1))} aria-label="Next month" className="rounded-lg p-2 text-stone-300 hover:bg-stone-800"><ChevronRight className="h-4 w-4" /></button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-semibold uppercase tracking-wider text-stone-500">
            {WEEKDAYS.map((day) => <div key={day} className="py-1">{day}</div>)}
          </div>
          <div className="mt-1 grid grid-cols-7 gap-1">
            {cells.map((day, index) => {
              if (!day) return <div key={`blank-${index}`} />;
              const count = counts[day];
              const isSelected = day === selected;
              return (
                <button
                  key={day}
                  onClick={() => setSelected(day)}
                  aria-label={`${day}${count ? `, ${count.arrivals} arrivals, ${count.departures} departures, ${count.inHouse} in house` : ''}`}
                  className={`flex min-h-16 flex-col items-center rounded-xl border p-1 text-xs transition sm:min-h-20 ${
                    isSelected ? 'border-amber-500 bg-amber-500/10' : day === today ? 'border-stone-600 bg-stone-900' : 'border-stone-800 bg-stone-900/40 hover:border-stone-600'
                  }`}
                >
                  <span className={`font-bold ${isSelected ? 'text-amber-300' : 'text-white'}`}>{Number(day.slice(8))}</span>
                  <span className="mt-1 flex flex-wrap justify-center gap-0.5">
                    {count?.arrivals ? <span className="rounded bg-emerald-500/20 px-1 text-[9px] font-bold text-emerald-400">↓{count.arrivals}</span> : null}
                    {count?.departures ? <span className="rounded bg-indigo-500/20 px-1 text-[9px] font-bold text-indigo-400">↑{count.departures}</span> : null}
                    {count?.inHouse ? <span className="rounded bg-amber-500/20 px-1 text-[9px] font-bold text-amber-400">{count.inHouse}</span> : null}
                  </span>
                </button>
              );
            })}
          </div>
          <p className="mt-3 text-[11px] text-stone-500">
            <span className="text-emerald-400">↓</span> arrivals · <span className="text-indigo-400">↑</span> departures · <span className="text-amber-400">number</span> guests staying
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="font-serif text-2xl text-white">
            {new Date(`${selected}T00:00:00Z`).toLocaleDateString('en-NG', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })}
          </h2>
          {dayError && <p role="alert" className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">{dayError}</p>}
          {!loadedDetail && !dayError && <p className="text-xs text-stone-500">Loading…</p>}
          {loadedDetail && (
            <>
              <StayList title="Arrivals (check-in date)" stays={loadedDetail.arrivals} empty="No arrivals this day." />
              <StayList title="Departures (check-out date)" stays={loadedDetail.departures} empty="No departures this day." />
              <StayList title="Guests staying that night" stays={loadedDetail.inHouse} empty="No guests staying this night." />
              <StayList title="Bookings recorded this day" stays={loadedDetail.created} empty="No bookings were made this day." />

              <section className="rounded-2xl border border-stone-800 bg-stone-950 p-4">
                <h3 className="mb-3 flex items-center justify-between text-sm font-bold text-white">
                  Online payments received
                  <span className="rounded-full bg-stone-800 px-2 py-0.5 text-[10px] text-stone-300">{loadedDetail.payments.length}</span>
                </h3>
                {loadedDetail.payments.length === 0 ? (
                  <p className="text-xs text-stone-500">No online payments this day.</p>
                ) : (
                  <ul className="space-y-1 text-xs text-stone-300">
                    {loadedDetail.payments.map((payment) => (
                      <li key={payment.id} className="flex justify-between gap-2">
                        <span>{payment.guest} <span className="font-mono text-stone-500">{payment.reference}</span></span>
                        <span className="font-bold text-emerald-400">{formatCurrency(payment.amount)}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              <section className="rounded-2xl border border-stone-800 bg-stone-950 p-4">
                <h3 className="mb-3 flex items-center justify-between text-sm font-bold text-white">
                  Messages & service requests
                  <span className="rounded-full bg-stone-800 px-2 py-0.5 text-[10px] text-stone-300">{loadedDetail.messages.length + loadedDetail.serviceRequests.length}</span>
                </h3>
                {loadedDetail.messages.length + loadedDetail.serviceRequests.length === 0 ? (
                  <p className="text-xs text-stone-500">Nothing came in this day.</p>
                ) : (
                  <ul className="space-y-1 text-xs text-stone-300">
                    {loadedDetail.messages.map((message) => (
                      <li key={message.id}>✉ {message.name} · <span className="capitalize">{message.kind}</span> · {message.status}</li>
                    ))}
                    {loadedDetail.serviceRequests.map((request) => (
                      <li key={request.id}>🛎 {request.service} · {request.status} · {request.time}</li>
                    ))}
                  </ul>
                )}
              </section>
            </>
          )}
        </div>
      </div>
    </>
  );
}
