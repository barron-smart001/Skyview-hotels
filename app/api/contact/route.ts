import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/env';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function text(value: unknown, maxLength: number) {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : '';
}

/** Public contact form: general enquiries and problem reports. */
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== 'object') return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  const input = body as Record<string, unknown>;

  // Hidden field real visitors never fill in; bots do. Pretend success so they stop retrying.
  if (text(input.website, 200)) return NextResponse.json({ ok: true }, { status: 201 });

  const kind = input.kind === 'problem' ? 'problem' : 'enquiry';
  const name = text(input.name, 120);
  const email = text(input.email, 254).toLowerCase();
  const phone = text(input.phone, 32) || null;
  const bookingReference = text(input.bookingReference, 64) || null;
  const message = text(input.message, 2000);

  if (!name) return NextResponse.json({ error: 'Please enter your name.' }, { status: 400 });
  if (!EMAIL_PATTERN.test(email)) return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
  if (message.length < 10) return NextResponse.json({ error: 'Please describe your message in a little more detail.' }, { status: 400 });

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: 'Messages cannot be received right now. Please try again later.' }, { status: 503 });
  }

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from('contact_messages').insert({
      kind,
      name,
      email,
      phone,
      booking_reference: bookingReference,
      message,
      user_id: user?.id ?? null,
    });
    if (error) throw error;
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    console.error('Contact message failed:', error);
    return NextResponse.json({ error: 'We could not send your message. Please try again.' }, { status: 500 });
  }
}
