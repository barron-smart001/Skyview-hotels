'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { BrandMark } from '@/components/layout/BrandMark';
import { useRouter } from 'next/navigation';
import { Lock, ArrowRight } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [sessionReady, setSessionReady] = useState(false);
  const [hasRecoverySession, setHasRecoverySession] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    let active = true;

    void supabase.auth.getSession().then(({ data, error: sessionError }) => {
      if (!active) return;
      if (sessionError) setError(sessionError.message);
      setHasRecoverySession(Boolean(data.session));
      setSessionReady(true);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!active) return;
      if (event === 'PASSWORD_RECOVERY') setHasRecoverySession(Boolean(session));
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) throw updateError;
      router.replace('/profile');
      router.refresh();
    } catch (updateError: unknown) {
      setError(updateError instanceof Error ? updateError.message : 'Unable to update your password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-stone-900">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 sm:p-10 shadow-2xl">
        <BrandMark subtitle="Reset Password" className="mb-6" />

        <h1 className="font-serif text-3xl text-stone-900 mb-2">Choose a new password</h1>
        <p className="text-xs text-stone-500 mb-6">Set a new password for your Skyview guest account.</p>

        {!sessionReady ? (
          <p className="text-sm text-stone-500" role="status">Verifying your reset link…</p>
        ) : !hasRecoverySession ? (
          <div className="space-y-4">
            <p className="text-sm text-stone-600">This password reset link is invalid or has expired. Request a new one to continue.</p>
            <Link href="/forgot-password" className="inline-flex items-center gap-2 text-sm font-bold text-amber-700 hover:text-amber-800">
              Request another link <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div role="alert" className="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs font-semibold">
                {error}
              </div>
            )}
            <div>
              <label htmlFor="password" className="text-xs font-semibold text-stone-700 block mb-1">New Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  minLength={8}
                  autoComplete="new-password"
                  placeholder="At least 8 characters"
                  className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-stone-900 hover:bg-amber-800 text-white font-bold text-sm rounded-xl shadow-md transition disabled:opacity-75"
            >
              {loading ? 'Updating Password…' : 'Update Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
