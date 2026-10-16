import { NextResponse } from 'next/server';
import { resolveMx, resolve4, resolve6 } from 'node:dns/promises';
import { createAdminClient } from '@/lib/supabase/admin';
import { isSupabaseAdminConfigured } from '@/lib/env';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const NO_EMAIL_MESSAGE = 'This email does not exist. Please enter a real email address.';

/** True when the email's domain can actually receive mail (MX records, or an address record as fallback). */
async function domainCanReceiveMail(domain: string) {
  try {
    const mx = await resolveMx(domain);
    if (mx.length > 0) return true;
  } catch {
    // fall through to address records
  }
  try {
    return (await resolve4(domain)).length > 0;
  } catch {
    try {
      return (await resolve6(domain)).length > 0;
    } catch {
      return false;
    }
  }
}

/**
 * Creates a guest account with no confirmation email. The address is checked for
 * shape and for a mail-receiving domain; the mailbox itself cannot be verified
 * without sending mail, so a typo inside a real domain still gets through.
 */
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';
  const password = typeof body?.password === 'string' ? body.password : '';
  const firstName = typeof body?.firstName === 'string' ? body.firstName.trim().slice(0, 80) : '';
  const lastName = typeof body?.lastName === 'string' ? body.lastName.trim().slice(0, 80) : '';
  const phone = typeof body?.phone === 'string' ? body.phone.trim().slice(0, 32) : '';

  if (!EMAIL_PATTERN.test(email) || email.length > 254) {
    return NextResponse.json({ error: NO_EMAIL_MESSAGE }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ error: 'Password must be at least 8 characters.' }, { status: 400 });
  }
  if (!(await domainCanReceiveMail(email.split('@')[1]))) {
    return NextResponse.json({ error: NO_EMAIL_MESSAGE }, { status: 400 });
  }
  if (!isSupabaseAdminConfigured()) {
    return NextResponse.json({ error: 'Sign up is temporarily unavailable.' }, { status: 503 });
  }

  const { error } = await createAdminClient().auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { first_name: firstName, last_name: lastName, phone },
  });

  if (error) {
    const exists = /already|registered|exists/i.test(error.message);
    return NextResponse.json(
      { error: exists ? 'An account with this email already exists. Please sign in.' : 'Unable to create your account.' },
      { status: exists ? 409 : 500 }
    );
  }
  return NextResponse.json({ success: true });
}
