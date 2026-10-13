'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { BrandMark } from '@/components/layout/BrandMark';
import { useRouter } from 'next/navigation';
import { Mail, Lock, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [signInError, setSignInError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSignInError(null);

    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error) throw error;

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .maybeSingle();
      if (profileError) throw profileError;

      if (!profile) {
        await supabase.auth.signOut();
        throw new Error('No profile was found for this account. Please contact the hotel.');
      }

      // Administrators land on the admin portal; everyone else returns to where they were headed.
      const isAdmin = profile.role === 'admin';
      const next = new URLSearchParams(window.location.search).get('next');
      const safeNext = next && next.startsWith('/') && !next.startsWith('//') && !next.startsWith('/\\') ? next : null;
      const destination = safeNext && (isAdmin || !safeNext.startsWith('/admin')) ? safeNext : isAdmin ? '/admin' : '/';

      router.push(destination);
      router.refresh();
    } catch (error: unknown) {
      setSignInError(error instanceof Error ? error.message : 'Unable to sign in. Please try again.');
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
            src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1600&q=80"
            alt="Skyview Grand Exterior"
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

        {/* Testimonial Quote */}
        <div className="relative z-10 max-w-md">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-200 text-xs font-semibold mb-4 border border-amber-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Guest Account</span>
          </div>
          <p className="font-serif text-3xl leading-tight text-white mb-4">Experience Comfort.<br />Enjoy Every Moment.</p>
          <div className="text-xs text-stone-400">
            <span className="font-bold text-white block text-sm">Your stays in one place</span>
            <span>View reservations, request services, and manage your profile.</span>
          </div>
        </div>
      </div>

      {/* Right sign-in form */}
      <div className="flex items-center justify-center p-6 sm:p-12 bg-white">
        <div className="max-w-md w-full">
          {/* Mobile brand header */}
          <BrandMark className="lg:hidden mb-8" />

          <div className="mb-6">
            <h2 className="font-serif text-3xl sm:text-4xl text-stone-900">
              Sign In to Your Account
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 mt-1">
              Sign in to manage your guest profile and reservations.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {signInError && (
              <div role="alert" className="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs font-semibold">
                {signInError}
              </div>
            )}
            <div>
              <label className="text-xs font-semibold text-stone-700 block mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-semibold text-stone-700">Password</label>
                <Link
                  href="/forgot-password"
                  className="text-xs font-semibold text-amber-700 hover:text-amber-800"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-stone-900 hover:bg-amber-800 text-white font-bold text-sm rounded-xl shadow-md shadow-amber-500/20 transition flex items-center justify-center gap-2 active:scale-98 disabled:opacity-75"
            >
              <span>{loading ? 'Signing In...' : 'Sign In as Guest'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-stone-100 text-center text-xs text-stone-500">
            Don&apos;t have an account yet?{' '}
            <Link href="/sign-up" className="font-bold text-amber-700 hover:text-amber-800">
              Create an account
            </Link>
          </div>

          <div className="mt-8 p-3 rounded-xl bg-stone-50 border border-stone-200/80 flex items-center gap-2 text-[11px] text-stone-500">
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Encrypted authentication powered by Supabase & Next.js</span>
          </div>
        </div>
      </div>
    </div>
  );
}