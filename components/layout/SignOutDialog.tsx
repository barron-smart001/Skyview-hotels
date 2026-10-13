'use client';

import { useEffect } from 'react';
import { LogOut } from 'lucide-react';

type Props = {
  open: boolean;
  signingOut: boolean;
  error?: string | null;
  description?: string;
  onCancel: () => void;
  onConfirm: () => void;
};

/** Confirmation modal shown before ending a session. */
export function SignOutDialog({ open, signingOut, error, description, onCancel, onConfirm }: Props) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !signingOut) onCancel();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, signingOut, onCancel]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-60 flex items-center justify-center bg-stone-950/60 p-4"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !signingOut) onCancel();
      }}
    >
      <section role="dialog" aria-modal="true" aria-labelledby="sign-out-dialog-title" className="w-full max-w-sm rounded-2xl bg-white p-6 text-stone-900 shadow-2xl">
        <h2 id="sign-out-dialog-title" className="text-base font-bold">Sign out of your account?</h2>
        <p className="mt-2 text-sm text-stone-600">{description ?? 'You will need to sign in again to access your account and reservations.'}</p>
        {error && <p role="alert" className="mt-4 rounded-lg bg-rose-50 p-3 text-xs font-semibold text-rose-700">{error}</p>}
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            autoFocus
            onClick={onCancel}
            disabled={signingOut}
            className="rounded-xl border border-stone-200 px-4 py-2.5 text-xs font-bold text-stone-700 transition hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={signingOut}
            className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <LogOut className="h-3.5 w-3.5" /> {signingOut ? 'Signing out…' : 'Sign out'}
          </button>
        </div>
      </section>
    </div>
  );
}
