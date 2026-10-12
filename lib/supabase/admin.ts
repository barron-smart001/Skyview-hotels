import { createClient as createSupabaseClient } from '@supabase/supabase-js';

/**
 * Cookie-less clients for server code.
 *
 * - createPublicClient: anon key, no user session. Safe to use inside cached
 *   functions because it never reads request cookies.
 * - createAdminClient: service-role key, bypasses RLS. Only use in route
 *   handlers after validating input; never import into client components.
 */

const serverOptions = { auth: { persistSession: false, autoRefreshToken: false } } as const;

export function createPublicClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    serverOptions
  );
}

export function createAdminClient() {
  if (typeof window !== 'undefined') {
    throw new Error('The Supabase admin client cannot be used in the browser.');
  }
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    serverOptions
  );
}
