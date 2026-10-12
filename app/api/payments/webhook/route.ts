import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { getPaystackSecret } from '@/lib/env';
import { recordSuccessfulPayment } from '@/lib/payments';

function isValidSignature(rawBody: string, signature: string | null, secret: string) {
  if (!signature) return false;
  const expected = Buffer.from(crypto.createHmac('sha512', secret).update(rawBody).digest('hex'));
  const received = Buffer.from(signature);
  return expected.length === received.length && crypto.timingSafeEqual(expected, received);
}

export async function POST(request: Request) {
  const secret = getPaystackSecret();
  if (!secret) {
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 503 });
  }

  const rawBody = await request.text();
  // Unsigned or mis-signed requests are rejected; previously a missing header skipped verification.
  if (!isValidSignature(rawBody, request.headers.get('x-paystack-signature'), secret)) {
    return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 401 });
  }

  let event: { event?: string; data?: { reference?: string; amount?: number; channel?: string; paid_at?: string } };
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  if (event.event === 'charge.success' && event.data?.reference && typeof event.data.amount === 'number') {
    try {
      const outcome = await recordSuccessfulPayment({
        reference: event.data.reference,
        amountKobo: event.data.amount,
        channel: event.data.channel,
        paidAt: event.data.paid_at,
      });
      if (outcome !== 'confirmed' && outcome !== 'already-processed') {
        console.warn(`Webhook for ${event.data.reference}: ${outcome}`);
      }
    } catch (error) {
      // Non-2xx makes Paystack retry, so transient database errors are not lost.
      console.error('Database update error on webhook:', error);
      return NextResponse.json({ error: 'Temporary processing failure' }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
