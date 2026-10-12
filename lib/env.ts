/**
 * Central place for reading environment configuration so feature checks
 * (Supabase, Paystack, demo fallbacks) behave the same everywhere.
 */

function isPlaceholder(value: string | undefined) {
  return !value || value.includes('your-') || value.includes('placeholder');
}

export const isProduction = process.env.NODE_ENV === 'production';

export function isSupabaseConfigured() {
  return !isPlaceholder(process.env.NEXT_PUBLIC_SUPABASE_URL) && !isPlaceholder(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

export function isSupabaseAdminConfigured() {
  return isSupabaseConfigured() && !isPlaceholder(process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export function getPaystackSecret(): string | null {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  return isPlaceholder(secret) ? null : secret!;
}

export function getAppUrl() {
  return (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').replace(/\/+$/, '');
}
