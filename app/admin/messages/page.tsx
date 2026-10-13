'use client';

import { useCallback, useEffect, useState } from 'react';
import { AlertTriangle, Mail, MessageSquare, Phone } from 'lucide-react';

type Status = 'new' | 'in-progress' | 'resolved';
type Message = {
  id: string;
  kind: 'enquiry' | 'problem';
  name: string;
  email: string;
  phone: string | null;
  booking_reference: string | null;
  message: string;
  status: Status;
  created_at: string;
};

const FILTERS: { value: Status | 'all'; label: string }[] = [
  { value: 'new', label: 'New' },
  { value: 'in-progress', label: 'In progress' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'all', label: 'All' },
];

const STATUSES: Status[] = ['new', 'in-progress', 'resolved'];

export default function AdminMessagesPage() {
  const [filter, setFilter] = useState<Status | 'all'>('new');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/admin/messages${filter === 'all' ? '' : `?status=${filter}`}`, { signal: controller.signal })
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'Messages could not be loaded.');
        setMessages(result.messages);
      })
      .catch((loadError: unknown) => {
        if (loadError instanceof Error && loadError.name === 'AbortError') return;
        setError(loadError instanceof Error ? loadError.message : 'Messages could not be loaded.');
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [filter]);

  const setStatus = useCallback(async (id: string, status: Status) => {
    setError('');
    const response = await fetch(`/api/admin/messages/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (!response.ok) {
      const result = await response.json().catch(() => ({}));
      setError(result.error || 'The message could not be updated.');
      return;
    }
    setMessages((current) => (filter === 'all'
      ? current.map((item) => (item.id === id ? { ...item, status } : item))
      : current.filter((item) => item.id !== id)));
  }, [filter]);

  return (
    <>
      <div className="mb-6">
        <h1 className="font-serif text-3xl text-white">Messages & Problem Reports</h1>
        <p className="mt-0.5 text-xs text-stone-400">Enquiries and issues sent from the public contact form.</p>
      </div>

      <div className="mb-5 flex flex-wrap gap-2">
        {FILTERS.map((item) => (
          <button key={item.value} onClick={() => { setLoading(true); setError(''); setFilter(item.value); }} className={`rounded-full px-4 py-1.5 text-xs font-bold transition ${filter === item.value ? 'bg-amber-200 text-stone-950' : 'bg-stone-900 text-stone-300 hover:bg-stone-800'}`}>{item.label}</button>
        ))}
      </div>

      {error && <p role="alert" className="mb-4 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">{error}</p>}
      {loading && <p className="text-xs text-stone-500">Loading messages…</p>}
      {!loading && !error && messages.length === 0 && <p className="rounded-2xl border border-stone-800 bg-stone-950 p-6 text-sm text-stone-400">No messages here.</p>}

      <ul className="space-y-3">
        {messages.map((item) => (
          <li key={item.id} className="rounded-2xl border border-stone-800 bg-stone-950 p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                {item.kind === 'problem'
                  ? <span className="flex items-center gap-1 rounded-full bg-rose-500/15 px-2.5 py-1 text-[10px] font-bold uppercase text-rose-300"><AlertTriangle className="h-3 w-3" /> Problem</span>
                  : <span className="flex items-center gap-1 rounded-full bg-sky-500/15 px-2.5 py-1 text-[10px] font-bold uppercase text-sky-300"><MessageSquare className="h-3 w-3" /> Enquiry</span>}
                <span className="text-sm font-bold text-white">{item.name}</span>
              </div>
              <span className="text-[11px] text-stone-500">{new Date(item.created_at).toLocaleString('en-NG', { dateStyle: 'medium', timeStyle: 'short' })}</span>
            </div>
            <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-xs text-stone-400">
              <a href={`mailto:${item.email}`} className="flex items-center gap-1 hover:text-amber-200"><Mail className="h-3.5 w-3.5" /> {item.email}</a>
              {item.phone && <a href={`tel:${item.phone}`} className="flex items-center gap-1 hover:text-amber-200"><Phone className="h-3.5 w-3.5" /> {item.phone}</a>}
              {item.booking_reference && <span>Booking ref: <span className="font-mono text-amber-300">{item.booking_reference}</span></span>}
            </div>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-stone-200">{item.message}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {STATUSES.filter((status) => status !== item.status).map((status) => (
                <button key={status} onClick={() => setStatus(item.id, status)} className="rounded-full border border-stone-700 px-3 py-1 text-[11px] font-bold text-stone-300 transition hover:border-amber-200 hover:text-amber-200">Mark {status === 'in-progress' ? 'in progress' : status}</button>
              ))}
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
