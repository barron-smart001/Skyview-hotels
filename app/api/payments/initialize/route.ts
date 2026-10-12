import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getAppUrl, getPaystackSecret, isProduction, isSupabaseAdminConfigured } from '@/lib/env';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    const bookingReference = typeof body?.bookingReference === 'string' ? body.bookingReference.trim() : '';

    if (!bookingReference) {
      return NextResponse.json({ error: 'A booking reference is required' }, { status: 400 });
    }

    const paystackSecret = getPaystackSecret();

    if (!paystackSecret || !isSupabaseAdminConfigured()) {
      if (isProduction) {
        return NextResponse.json({ error: 'Online payments are not available right now.' }, { status: 503 });
      }
      // Local development without credentials.
      return NextResponse.json({
        status: true,
        message: 'Authorization URL created (Development Simulation)',
        data: {
          authorization_url: `https://checkout.paystack.com/simulate?ref=${encodeURIComponent(bookingReference)}`,
          access_code: `mock_${Date.now()}`,
          reference: bookingReference,
        },
      });
    }

    const admin = createAdminClient();

    // Amount and email always come from the stored booking, never from the client.
    const { data: booking, error } = await admin
      .from('bookings')
      .select('id, user_id, guest_email, total_amount_ngn, status, payment_status')
      .eq('booking_reference', bookingReference)
      .maybeSingle();

    if (error) throw error;
    if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    if (booking.status === 'cancelled' || booking.payment_status !== 'pending') {
      return NextResponse.json({ error: 'This booking is not awaiting payment.' }, { status: 409 });
    }

    // Paystack references must be unique per attempt, so retries get a fresh suffix.
    const paystackReference = `${bookingReference}-${crypto.randomUUID().slice(0, 8)}`;

    const { error: paymentError } = await admin.from('payments').insert({
      booking_id: booking.id,
      user_id: booking.user_id,
      paystack_reference: paystackReference,
      amount_ngn: booking.total_amount_ngn,
      currency: 'NGN',
      status: 'pending',
      paid_at: null,
    });
    if (paymentError) throw paymentError;

    const res = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${paystackSecret}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: booking.guest_email,
        amount: Math.round(Number(booking.total_amount_ngn) * 100),
        reference: paystackReference,
        callback_url: `${getAppUrl()}/bookings`,
        metadata: { booking_reference: bookingReference },
        currency: 'NGN',
        channels: ['card', 'bank', 'ussd', 'qr', 'mobile_money', 'bank_transfer'],
      }),
      signal: AbortSignal.timeout(15_000),
    });

    const data = await res.json();
    if (!res.ok || !data?.status) {
      console.error('Paystack initialize failed:', data?.message);
      return NextResponse.json({ error: 'Payment could not be started. Please try again.' }, { status: 502 });
    }

    return NextResponse.json({
      status: true,
      data: {
        authorization_url: data.data.authorization_url,
        access_code: data.data.access_code,
        reference: paystackReference,
      },
    });
  } catch (error) {
    console.error('Payment initialization failed:', error);
    return NextResponse.json({ error: 'Payment initialization failed' }, { status: 500 });
  }
}
