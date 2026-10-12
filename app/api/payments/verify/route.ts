import { NextResponse } from 'next/server';
import { getPaystackSecret, isProduction } from '@/lib/env';
import { recordSuccessfulPayment } from '@/lib/payments';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const reference = searchParams.get('reference')?.trim();

    if (!reference || reference.length > 100) {
      return NextResponse.json({ error: 'Transaction reference is required' }, { status: 400 });
    }

    const paystackSecret = getPaystackSecret();

    if (!paystackSecret) {
      if (isProduction) {
        return NextResponse.json({ error: 'Payment verification is not available right now.' }, { status: 503 });
      }
      return NextResponse.json({
        status: true,
        message: 'Verification successful (Development Simulation)',
        data: { status: 'success', reference, currency: 'NGN' },
      });
    }

    const res = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
      headers: { Authorization: `Bearer ${paystackSecret}` },
      signal: AbortSignal.timeout(15_000),
    });
    const data = await res.json();

    if (!res.ok || !data?.status) {
      return NextResponse.json({ status: false, error: data?.message || 'Transaction could not be verified' }, { status: 404 });
    }

    const charge = data.data;
    // Reconcile here too, so bookings confirm even if the webhook is delayed.
    const outcome = charge.status === 'success'
      ? await recordSuccessfulPayment({
          reference: charge.reference,
          amountKobo: charge.amount,
          channel: charge.channel,
          paidAt: charge.paid_at,
        })
      : null;

    // Return only what the client needs, not Paystack's full customer/authorization payload.
    return NextResponse.json({
      status: true,
      data: {
        status: charge.status,
        reference: charge.reference,
        amount: charge.amount,
        currency: charge.currency,
        bookingOutcome: outcome,
      },
    });
  } catch (error) {
    console.error('Payment verification failed:', error);
    return NextResponse.json({ error: 'Payment verification failed' }, { status: 500 });
  }
}
