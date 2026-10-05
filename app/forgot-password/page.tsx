'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Building2, Mail, ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 800);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-900">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 sm:p-10 shadow-2xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-cyan-500 flex items-center justify-center text-white">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <span className="font-extrabold text-base text-slate-900 block leading-tight">SKYVIEW</span>
            <span className="text-[10px] text-sky-600 font-bold uppercase tracking-wider">Account Recovery</span>
          </div>
        </div>

        {submitted ? (
          <div className="text-center space-y-4 py-4">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Recovery Link Sent</h2>
            <p className="text-xs text-slate-500">
              We have sent a secure password reset link to <span className="font-bold text-slate-800">{email}</span>. Please check your inbox.
            </p>
            <div className="pt-4">
              <Link
                href="/sign-in"
                className="inline-flex items-center gap-2 text-xs font-bold text-sky-600 hover:text-sky-700"
              >
                <ArrowLeft className="w-4 h-4" /> Return to Sign In
              </Link>
            </div>
          </div>
        ) : (
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-2">
              Forgot Password?
            </h2>
            <p className="text-xs text-slate-500 mb-6">
              Enter your registered email address and we will send you instructions to reset your access credentials.
            </p>

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
                    placeholder="eleanor@example.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-sky-600 to-cyan-600 hover:from-sky-700 hover:to-cyan-700 text-white font-bold text-sm rounded-xl shadow-md transition flex items-center justify-center gap-2 active:scale-98 disabled:opacity-75"
              >
                <span>{loading ? 'Sending Recovery Link...' : 'Send Recovery Link'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-slate-100 text-center">
              <Link
                href="/sign-in"
                className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900"
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