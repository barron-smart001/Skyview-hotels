'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { MOCK_SERVICES, MOCK_REQUESTS } from '@/lib/data/mock-data';
import { HotelService, ServiceRequest } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { Sparkles, Clock, CheckCircle2, MessageSquare, Plus, X, Send } from 'lucide-react';

export default function ServicesPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedService, setSelectedService] = useState<HotelService | null>(null);
  const [requests, setRequests] = useState<ServiceRequest[]>(MOCK_REQUESTS);
  const [time, setTime] = useState('Tomorrow at 3:00 PM');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const categories = ['all', 'Spa & Wellness', 'Concierge', 'Room Service', 'Tours & Experiences'];

  const filteredServices = selectedCategory === 'all'
    ? MOCK_SERVICES
    : MOCK_SERVICES.filter((s) => s.category === selectedCategory);

  const handleRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService) return;
    setIsSubmitting(true);

    setTimeout(() => {
      const newReq: ServiceRequest = {
        id: `req-${Date.now()}`,
        serviceId: selectedService.id,
        serviceName: selectedService.name,
        category: selectedService.category,
        requestedTime: time,
        status: 'Pending',
        notes: notes || undefined,
        createdAt: 'Just now',
      };
      setRequests([newReq, ...requests]);
      setIsSubmitting(false);
      setSuccessMessage('Service request submitted to concierge team!');
      setTimeout(() => {
        setSuccessMessage('');
        setSelectedService(null);
        setNotes('');
      }, 1500);
    }, 800);
  };

  return (
    <DashboardLayout>
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-100 text-sky-700 text-xs font-semibold mb-2">
          <Sparkles className="w-3.5 h-3.5" /> Curated Experiences
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Hotel Services & Concierge
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
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
                ? 'bg-sky-600 text-white shadow-sm'
                : 'bg-white border border-slate-200/80 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {cat === 'all' ? 'All Services' : cat}
          </button>
        ))}
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {filteredServices.map((service) => (
          <div
            key={service.id}
            className="bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col justify-between group"
          >
            <div>
              <div className="relative h-44 w-full overflow-hidden bg-slate-100">
                <img
                  src={service.image}
                  alt={service.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-3 left-3 bg-slate-900/70 backdrop-blur-md text-white text-[11px] font-medium px-2.5 py-0.5 rounded-md">
                  {service.category}
                </span>
                {service.duration && (
                  <span className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-md text-slate-700 text-[11px] font-semibold px-2 py-0.5 rounded-md flex items-center gap-1">
                    <Clock className="w-3 h-3 text-sky-600" /> {service.duration}
                  </span>
                )}
              </div>

              <div className="p-4">
                <h3 className="text-sm font-bold text-slate-900 group-hover:text-sky-600 transition mb-1">
                  {service.name}
                </h3>
                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                  {service.description}
                </p>
              </div>
            </div>

            <div className="p-4 pt-2 border-t border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-slate-400 block font-medium">Pricing</span>
                <span className="text-sm font-extrabold text-slate-900">
                  {formatCurrency(service.price)}
                </span>
              </div>

              <button
                onClick={() => setSelectedService(service)}
                className="px-3 py-1.5 bg-sky-50 text-sky-600 hover:bg-sky-600 hover:text-white rounded-xl text-xs font-semibold transition flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Request
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Guest Service Requests History */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm">
        <h3 className="text-base font-bold text-slate-900 mb-1 flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-sky-600" /> Active Service Requests
        </h3>
        <p className="text-xs text-slate-500 mb-4">Track orders dispatched to your suite</p>

        <div className="divide-y divide-slate-100">
          {requests.map((req) => (
            <div key={req.id} className="py-3 flex items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-xs sm:text-sm font-bold text-slate-800">{req.serviceName}</h4>
                  <span className="text-[11px] text-slate-400">• {req.category}</span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Scheduled for: <span className="font-medium text-slate-700">{req.requestedTime}</span>
                  {req.notes && ` (${req.notes})`}
                </p>
              </div>

              <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-sky-50 text-sky-700">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {req.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Service Request Modal */}
      {selectedService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl p-6 border border-slate-100">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-bold text-slate-900">Request {selectedService.name}</h3>
              <button
                onClick={() => setSelectedService(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
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
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Preferred Time / Delivery</label>
                  <input
                    type="text"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    required
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Special Instructions</label>
                  <textarea
                    rows={3}
                    placeholder="Dietary preferences, specific therapist, luggage details, etc."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                  />
                </div>

                <div className="p-3 bg-slate-50 rounded-xl flex justify-between text-xs font-semibold">
                  <span className="text-slate-600">Charge to Room Folio:</span>
                  <span className="text-sky-600 font-bold">{formatCurrency(selectedService.price)}</span>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold shadow transition flex items-center justify-center gap-2"
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