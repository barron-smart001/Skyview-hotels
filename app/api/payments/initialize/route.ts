import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { email, amount, bookingReference, metadata } = await request.json();

    if (!email || !amount) {
      return NextResponse.json({ error: 'Email and amount are required' }, { status: 400 });
    }

    const paystackSecret = process.env.PAYSTACK_SECRET_KEY;
    const amountInKobo = Math.round(Number(amount) * 100);

    if (paystackSecret && !paystackSecret.includes('your-secret-key')) {
      const res = await fetch('https://api.paystack.co/transaction/initialize', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${paystackSecret}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          amount: amountInKobo,
          reference: bookingReference || `SKV-PAY-${Date.now()}`,
          callback_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/bookings`,
          metadata: metadata || {},
          currency: 'NGN',
          channels: ['card', 'bank', 'ussd', 'qr', 'mobile_money', 'bank_transfer'],
        }),
      });

      const data = await res.json();
      return NextResponse.json(data);
    }

    // Direct mock response when testing without live secret key
    const ref = bookingReference || `SKV-PAY-${Math.floor(100000 + Math.random() * 900000)}`;
    return NextResponse.json({
      status: true,
      message: 'Authorization URL created (Development Simulation)',
      data: {
        authorization_url: `https://checkout.paystack.com/simulate?ref=${ref}`,
        access_code: `mock_${Date.now()}`,
        reference: ref,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Payment initialization failed' }, { status: 500 });
  }
}
