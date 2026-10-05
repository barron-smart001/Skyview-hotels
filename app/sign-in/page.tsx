'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Building2, Mail, Lock, ArrowRight, ShieldCheck, Sparkles, User, Briefcase } from 'lucide-react';

export default function SignInPage() {
  const router = useRouter();
  const [role, setRole] = useState<'guest' | 'staff'>('guest');
  const [email, setEmail] = useState('eleanor.vance@example.com');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      if (role === 'staff') {
        router.push('/');
      } else {
        router.push('/');
      }
    }, 800);
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-slate-900">
      {/* Left visual banner */}
      <div className="relative hidden lg:flex flex-col justify-between p-12 overflow-hidden bg-slate-950">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1600&q=80"
            alt="Skyview Grand Exterior"
            className="w-full h-full object-cover opacity-35"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
        </div>

        {/* Brand */}
        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-3 group inline-flex">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-sky-500 to-cyan-400 flex items-center justify-center text-slate-950 shadow-lg shadow-sky-500/30">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <span className="font-extrabold text-xl text-white tracking-tight block">SKYVIEW</span>
              <span className="text-xs text-sky-400 font-medium tracking-widest uppercase">Grand Hotel & Suites</span>
            </div>
          </Link>
        </div>

        {/* Testimonial Quote */}
        <div className="relative z-10 max-w-md">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/20 text-sky-300 text-xs font-semibold mb-4 border border-sky-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Five-Star Hospitality</span>
          </div>
          <p className="text-lg font-medium text-slate-200 leading-relaxed mb-4">
            &ldquo;An extraordinary sanctuary where intuitive service meets modern architecture and unforgettable luxury.&rdquo;
          </p>
          <div className="text-xs text-slate-400">
            <span className="font-bold text-white block text-sm">International Luxury Travel Guide</span>
            <span>2026 Winner — Best Urban Resort</span>
          </div>
        </div>
      </div>

      {/* Right sign-in form */}
      <div className="flex items-center justify-center p-6 sm:p-12 bg-white">
        <div className="max-w-md w-full">
          {/* Mobile brand header */}
          <div className="lg:hidden flex items-center gap-2.5 mb-8">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-600 to-cyan-500 flex items-center justify-center text-white">
              <Building2 className="w-5 h-5" />
            </div>
            <span className="font-extrabold text-lg text-slate-900 tracking-tight">SKYVIEW HOTELS</span>
          </div>

          <div className="mb-6">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Sign In to Your Account
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Access your reservations, VIP privileges, and concierge preferences.
            </p>
          </div>

          {/* Role selector */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-2xl mb-6">
            <button
              type="button"
              onClick={() => setRole('guest')}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
                role === 'guest'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <User className="w-3.5 h-3.5" /> Guest Portal
            </button>
            <button
              type="button"
              onClick={() => setRole('staff')}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
                role === 'staff'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" /> Staff / Admin
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-semibold text-slate-700">Password</label>
                <Link
                  href="/forgot-password"
                  className="text-xs font-semibold text-sky-600 hover:text-sky-700"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-sky-600 via-sky-500 to-cyan-600 hover:from-sky-700 hover:to-cyan-700 text-white font-bold text-sm rounded-xl shadow-md shadow-sky-500/20 transition flex items-center justify-center gap-2 active:scale-98 disabled:opacity-75"
            >
              <span>{loading ? 'Authenticating...' : `Sign In as ${role === 'guest' ? 'Guest' : 'Staff'}`}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-100 text-center text-xs text-slate-500">
            Don&apos;t have an account yet?{' '}
            <Link href="/sign-up" className="font-bold text-sky-600 hover:text-sky-700">
              Create an account
            </Link>
          </div>

          <div className="mt-8 p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center gap-2 text-[11px] text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Encrypted authentication powered by Supabase & Next.js</span>
          </div>
        </div>
      </div>
    </div>
  );
}