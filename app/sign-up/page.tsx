'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { BrandMark } from '@/components/layout/BrandMark';
import { useRouter } from 'next/navigation';
import { Mail, Lock, User, Phone, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function SignUpPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [confirmationMessage, setConfirmationMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSaveError(null);
    setConfirmationMessage(null);

    try {
      const nameParts = fullName.trim().split(/\s+/);
      const firstName = nameParts.shift() ?? '';
      const response = await fetch('/api/auth/sign-up', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password, firstName, lastName: nameParts.join(' '), phone: phone.trim() }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Unable to create your guest account.');

      // No confirmation email: sign straight in with the new account.
      const { error } = await createClient().auth.signInWithPassword({ email: email.trim().toLowerCase(), password });
      if (error) throw error;
      router.push('/');
      router.refresh();
    } catch (error: unknown) {
      setSaveError(error instanceof Error ? error.message : 'Unable to create your guest account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-stone-900">
      {/* Left visual banner */}
      <div className="relative hidden lg:flex flex-col justify-between p-12 overflow-hidden bg-stone-950">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1600&q=80"
            alt="Skyview Luxury Suite"
            fill
            sizes="50vw"
            className="object-cover opacity-35"
            />
          <div className="absolute inset-0 bg-linear-to-t from-stone-950 via-stone-950/60 to-transparent" />
        </div>

        {/* Brand */}
        <div className="relative z-10">
          <BrandMark tone="light" />
        </div>

        {/* Perks Quote */}
        <div className="relative z-10 max-w-md">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-200 text-xs font-semibold mb-4 border border-amber-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Create an Account</span>
          </div>
          <p className="font-serif text-3xl leading-tight text-white mb-4">Experience Comfort.<br />Enjoy Every Moment.</p>
          <div className="text-xs text-stone-400">
            <span className="font-bold text-white block text-sm">Book faster next time</span>
            <span>Your details are saved and your reservations stay linked to your account.</span>
          </div>
        </div>
      </div>

      {/* Right form */}
      <div className="flex items-center justify-center p-6 sm:p-12 bg-white">
        <div className="max-w-md w-full">
          {/* Mobile brand header */}
          <BrandMark className="lg:hidden mb-8" />

          <div className="mb-6">
            <h2 className="font-serif text-3xl sm:text-4xl text-stone-900">
              Create Your Guest Profile
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 mt-1">
              Create an account to manage your reservations and guest profile.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {saveError && (
              <div role="alert" className="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs font-semibold">
                {saveError}
              </div>
            )}
            {confirmationMessage && (
              <div role="status" className="p-3 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-semibold">
                {confirmationMessage}
              </div>
            )}
            <div>
              <label className="text-xs font-semibold text-stone-700 block mb-1">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  placeholder="Your first and last name"
                  className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-stone-700 block mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-stone-700 block mb-1">Phone Number</label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  placeholder="+234 812 345 6789"
                  className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="text-xs font-semibold text-stone-700 block mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  autoComplete="new-password"
                  placeholder="At least 8 characters"
                  className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-stone-900 hover:bg-amber-800 text-white font-bold text-sm rounded-xl shadow-md shadow-amber-500/20 transition flex items-center justify-center gap-2 active:scale-98 disabled:opacity-75"
            >
              <span>{loading ? 'Creating Account...' : 'Create Guest Account'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-stone-100 text-center text-xs text-stone-500">
            Already have a Skyview account?{' '}
            <Link href="/sign-in" className="font-bold text-amber-700 hover:text-amber-800">
              Sign In
            </Link>
          </div>

          <div className="mt-8 p-3 rounded-xl bg-stone-50 border border-stone-200/80 flex items-center gap-2 text-[11px] text-stone-500">
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Your password is securely managed by Supabase authentication.</span>
          </div>
        </div>
      </div>
    </div>
  );
}