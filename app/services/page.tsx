'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { HotelService, ServiceRequest } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { Sparkles, Clock, CheckCircle2, MessageSquare, Plus, X, Send } from 'lucide-react';

type RequestsState = 'loading' | 'ready' | 'signed-out' | 'error';

export default function ServicesPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedService, setSelectedService] = useState<HotelService | null>(null);
  const [services, setServices] = useState<HotelService[]>([]);
  const [servicesLoading, setServicesLoading] = useState(true);
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [requestsState, setRequestsState] = useState<RequestsState>('loading');
  const [time, setTime] = useState('Tomorrow at 3:00 PM');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');

  const categories = ['all', 'Spa & Wellness', 'Concierge', 'Room Service', 'Tours & Experiences'];

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;

    fetch('/api/services', { signal })
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok || !Array.isArray(result.services)) throw new Error('Services could not be loaded.');
        setServices(result.services);
      })
      .catch((loadError: unknown) => {
        if (loadError instanceof Error && loadError.name === 'AbortError') return;
        setError('Services could not be loaded right now.');
      })
      .finally(() => {
        if (!signal.aborted) setServicesLoading(false);
      });

    fetch('/api/service-requests', { signal })
      .then(async (response) => {
        if (response.status === 401) return setRequestsState('signed-out');
        const result = await response.json();
        if (!response.ok) throw new Error(result.error);
        setRequests(result.requests);
        setRequestsState('ready');
      })
      .catch((loadError: unknown) => {
        if (loadError instanceof Error && loadError.name === 'AbortError') return;
        setRequestsState('error');
      });

    return () => controller.abort();
  }, []);

  const filteredServices = selectedCategory === 'all'
    ? services
    : services.filter((s) => s.category === selectedCategory);

  const closeModal = () => {
    setSelectedService(null);
    setSuccessMessage('');
    setError('');
    setNotes('');
  };

  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService) return;
    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/service-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serviceId: selectedService.id, requestedTime: time, notes }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'We could not send your request.');

      setRequests((prev) => [result.request, ...prev]);
      setRequestsState('ready');
      setSuccessMessage('Service request submitted to concierge team!');
      window.setTimeout(closeModal, 1500);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'We could not send your request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-semibold mb-2">
          <Sparkles className="w-3.5 h-3.5" /> Curated Experiences
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl text-stone-900">
          Hotel Services & Concierge
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 mt-1">
          From rejuvenating spa treatments to bespoke dining and private chauffeurs, enhance your luxury stay.
        </p>
      </div>

      {/* Category Filter Pills */}
      <div className="flex flex-wrap gap-2 mb-8">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition ${
              selectedCategory === cat
                ? 'bg-amber-700 text-white shadow-sm'
                : 'bg-white border border-stone-200/80 text-stone-600 hover:bg-stone-50'
            }`}
          >
            {cat === 'all' ? 'All Services' : cat}
          </button>
        ))}
      </div>

      {servicesLoading && <p className="mb-6 text-sm text-stone-500">Loading services…</p>}
      {!servicesLoading && !selectedService && error && (
        <p role="alert" className="mb-6 rounded-xl bg-rose-50 p-3 text-xs font-semibold text-rose-700">{error}</p>
      )}

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {filteredServices.map((service) => (
          <div
            key={service.id}
            className="bg-white rounded-2xl border border-stone-200/80 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col justify-between group"
          >
            <div>
              <div className="relative h-44 w-full overflow-hidden bg-stone-100">
                {service.image ? (
                  <Image
                    src={service.image}
                    alt={service.name}
                    fill
                    sizes="(min-width: 1024px) 25vw, (min-width: 768px) 50vw, 100vw"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  ) : null}
                <span className="absolute top-3 left-3 bg-stone-900/70 backdrop-blur-md text-white text-[11px] font-medium px-2.5 py-0.5 rounded-md">
                  {service.category}
                </span>
                {service.duration && (
                  <span className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-md text-stone-700 text-[11px] font-semibold px-2 py-0.5 rounded-md flex items-center gap-1">
                    <Clock className="w-3 h-3 text-amber-700" /> {service.duration}
                  </span>
                )}
              </div>

              <div className="p-4">
                <h3 className="text-sm font-bold text-stone-900 group-hover:text-amber-700 transition mb-1">
                  {service.name}
                </h3>
                <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed">
                  {service.description}
                </p>
              </div>
            </div>

            <div className="p-4 pt-2 border-t border-stone-100 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-stone-400 block font-medium">Pricing</span>
                <span className="text-sm font-extrabold text-stone-900">
                  {formatCurrency(service.price)}
                </span>
              </div>

              <button
                onClick={() => setSelectedService(service)}
                className="px-3 py-1.5 bg-amber-50 text-amber-700 hover:bg-amber-700 hover:text-white rounded-xl text-xs font-semibold transition flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Request
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Guest Service Requests History */}
      <div className="bg-white rounded-2xl border border-stone-200/90 p-6 shadow-sm">
        <h3 className="text-base font-bold text-stone-900 mb-1 flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-amber-700" /> Active Service Requests
        </h3>
        <p className="text-xs text-stone-500 mb-4">Track orders dispatched to your suite</p>

        {requestsState === 'loading' && <p className="py-4 text-xs text-stone-500">Loading your requests…</p>}
        {requestsState === 'signed-out' && (
          <p className="py-4 text-xs text-stone-500">
            <Link href="/sign-in?next=/services" className="font-semibold text-amber-700">Sign in</Link> to request services and track them here.
          </p>
        )}
        {requestsState === 'error' && <p className="py-4 text-xs text-rose-600">Your requests could not be loaded right now.</p>}
        {requestsState === 'ready' && requests.length === 0 && (
          <p className="py-4 text-xs text-stone-500">You have no service requests yet.</p>
        )}

        <div className="divide-y divide-stone-100">
          {requests.map((req) => (
            <div key={req.id} className="py-3 flex items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-xs sm:text-sm font-bold text-stone-800">{req.serviceName}</h4>
                  <span className="text-[11px] text-stone-400">• {req.category}</span>
                </div>
                <p className="text-xs text-stone-500 mt-0.5">
                  Scheduled for: <span className="font-medium text-stone-700">{req.requestedTime}</span>
                  {req.notes && ` (${req.notes})`}
                </p>
              </div>

              <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-800">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {req.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Service Request Modal */}
      {selectedService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl p-6 border border-stone-100">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-bold text-stone-900">Request {selectedService.name}</h3>
              <button
                onClick={closeModal}
                aria-label="Close"
                className="p-1.5 text-stone-400 hover:text-stone-600 rounded-full hover:bg-stone-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {successMessage ? (
              <div className="p-6 text-center text-emerald-600 font-bold text-sm bg-emerald-50 rounded-2xl">
                {successMessage}
              </div>
            ) : (
              <form onSubmit={handleRequestSubmit} className="space-y-4">
                {error && <p role="alert" className="rounded-xl bg-rose-50 p-3 text-xs font-semibold text-rose-700">{error}</p>}
                <div>
                  <label className="text-xs font-semibold text-stone-700 block mb-1">Preferred Time / Delivery</label>
                  <input
                    type="text"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    required
                    className="w-full px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-stone-700 block mb-1">Special Instructions</label>
                  <textarea
                    rows={3}
                    placeholder="Dietary preferences, specific therapist, luggage details, etc."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                </div>

                <div className="p-3 bg-stone-50 rounded-xl flex justify-between text-xs font-semibold">
                  <span className="text-stone-600">Charge to Room Folio:</span>
                  <span className="text-amber-700 font-bold">{formatCurrency(selectedService.price)}</span>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 bg-amber-700 hover:bg-amber-800 text-white rounded-xl text-xs font-bold shadow transition flex items-center justify-center gap-2"
                >
                  <Send className="w-3.5 h-3.5" />
                  {isSubmitting ? 'Sending Request...' : 'Confirm Request'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}