'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { BrandMark } from '@/components/layout/BrandMark';
import { Mail, ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (resetError) throw resetError;
      setSubmitted(true);
    } catch (resetError: unknown) {
      setError(resetError instanceof Error ? resetError.message : 'Unable to send a password reset link.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-stone-900">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 sm:p-10 shadow-2xl">
        <BrandMark subtitle="Account Recovery" className="mb-6" />

        {submitted ? (
          <div className="text-center space-y-4 py-4">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-stone-900">Recovery Link Sent</h2>
            <p className="text-xs text-stone-500">
              If an account exists for <span className="font-bold text-stone-800">{email}</span>, a secure password reset link will arrive by email. Check your inbox.
            </p>
            <div className="pt-4">
              <Link
                href="/sign-in"
                className="inline-flex items-center gap-2 text-xs font-bold text-amber-700 hover:text-amber-800"
              >
                <ArrowLeft className="w-4 h-4" /> Return to Sign In
              </Link>
            </div>
          </div>
        ) : (
          <div>
            <h2 className="font-serif text-3xl text-stone-900 mb-2">
              Forgot Password?
            </h2>
            <p className="text-xs text-stone-500 mb-6">
              Enter your registered email address and we will send you instructions to reset your access credentials.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div role="alert" className="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs font-semibold">
                  {error}
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
                    placeholder="you@example.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-stone-900 hover:bg-amber-800 text-white font-bold text-sm rounded-xl shadow-md transition flex items-center justify-center gap-2 active:scale-98 disabled:opacity-75"
              >
                <span>{loading ? 'Sending Recovery Link...' : 'Send Recovery Link'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-stone-100 text-center">
              <Link
                href="/sign-in"
                className="inline-flex items-center gap-2 text-xs font-semibold text-stone-500 hover:text-stone-900"
              >
                <ArrowLeft className="w-4 h-4" /> Back to Sign In
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}