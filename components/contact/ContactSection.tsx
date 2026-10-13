'use client';

import { useState } from 'react';
import { AlertTriangle, CheckCircle2, MessageSquare, Send } from 'lucide-react';

type Kind = 'enquiry' | 'problem';

const KINDS: { value: Kind; label: string; icon: typeof MessageSquare; hint: string }[] = [
  { value: 'enquiry', label: 'Get in touch', icon: MessageSquare, hint: 'Questions about rooms, rates or your stay.' },
  { value: 'problem', label: 'Report a problem', icon: AlertTriangle, hint: 'Something went wrong with a booking, payment, room or this website.' },
];

const fieldClass = 'mt-1.5 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-amber-600 focus:ring-2 focus:ring-amber-200';

export function ContactSection() {
  const [kind, setKind] = useState<Kind>('enquiry');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form));
    setSending(true);
    setError('');
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, kind }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || 'We could not send your message. Please try again.');
      form.reset();
      setSent(true);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'We could not send your message. Please try again.');
    } finally {
      setSending(false);
    }
  }

  const active = KINDS.find((item) => item.value === kind)!;

  return (
    <section id="contact-us" className="mx-auto max-w-7xl px-5 py-24 sm:px-8 lg:px-10">
      <div className="grid gap-10 lg:grid-cols-[1fr_1.2fr]">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-amber-700">Contact</p>
          <h2 className="mt-3 font-serif text-4xl sm:text-5xl">We&apos;re here to help.</h2>
          <p className="mt-5 max-w-md text-sm leading-relaxed text-stone-600">Ask us anything before you book, or tell us if something isn&apos;t right. A member of the team will reply to the email address you give.</p>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-stone-500">For a problem with a booking, include your booking reference so we can find it quickly.</p>
        </div>

        <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
          {sent ? (
            <div role="status" className="py-10 text-center">
              <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-600" />
              <h3 className="mt-4 font-serif text-2xl">Thank you, your message is on its way.</h3>
              <p className="mx-auto mt-2 max-w-sm text-sm text-stone-600">We&apos;ll reply to the email address you provided.</p>
              <button type="button" onClick={() => setSent(false)} className="mt-6 rounded-full border border-stone-300 px-5 py-2.5 text-sm font-bold transition hover:border-stone-900">Send another message</button>
            </div>
          ) : (
            <form onSubmit={submit} className="relative space-y-4">
              <div role="tablist" aria-label="Message type" className="grid grid-cols-2 gap-2 rounded-full bg-stone-100 p-1">
                {KINDS.map(({ value, label, icon: Icon }) => (
                  <button
                    key={value}
                    type="button"
                    role="tab"
                    aria-selected={kind === value}
                    onClick={() => setKind(value)}
                    className={`flex items-center justify-center gap-2 rounded-full px-3 py-2.5 text-xs font-bold transition sm:text-sm ${kind === value ? 'bg-stone-900 text-white shadow' : 'text-stone-600 hover:text-stone-900'}`}
                  >
                    <Icon className="h-4 w-4" /> {label}
                  </button>
                ))}
              </div>
              <p className="text-xs text-stone-500">{active.hint}</p>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-xs font-bold text-stone-700">Full name
                  <input name="name" required maxLength={120} autoComplete="name" className={fieldClass} />
                </label>
                <label className="block text-xs font-bold text-stone-700">Email
                  <input name="email" type="email" required maxLength={254} autoComplete="email" className={fieldClass} />
                </label>
                <label className="block text-xs font-bold text-stone-700">Phone <span className="font-normal text-stone-400">(optional)</span>
                  <input name="phone" type="tel" maxLength={32} autoComplete="tel" className={fieldClass} />
                </label>
                {kind === 'problem' && (
                  <label className="block text-xs font-bold text-stone-700">Booking reference <span className="font-normal text-stone-400">(if any)</span>
                    <input name="bookingReference" maxLength={64} className={fieldClass} />
                  </label>
                )}
              </div>

              <label className="block text-xs font-bold text-stone-700">{kind === 'problem' ? 'What went wrong?' : 'Your message'}
                <textarea name="message" required minLength={10} maxLength={2000} rows={5} className={fieldClass} />
              </label>

              {/* Honeypot: hidden from people, filled in by bots. */}
              <input name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="sr-only" />

              {error && <p role="alert" className="rounded-xl bg-rose-50 p-3 text-xs font-semibold text-rose-700">{error}</p>}

              <button type="submit" disabled={sending} className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-stone-900 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-stone-700 disabled:opacity-60 sm:w-auto">
                {sending ? 'Sending…' : kind === 'problem' ? 'Report problem' : 'Send message'} <Send className="h-4 w-4" />
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
