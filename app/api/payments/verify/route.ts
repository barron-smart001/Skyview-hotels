import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const reference = searchParams.get('reference');

    if (!reference) {
      return NextResponse.json({ error: 'Transaction reference is required' }, { status: 400 });
    }

    const paystackSecret = process.env.PAYSTACK_SECRET_KEY;

    if (paystackSecret && !paystackSecret.includes('your-secret-key')) {
      const res = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${paystackSecret}`,
        },
      });

      const data = await res.json();
      return NextResponse.json(data);
    }

    // Direct mock simulation
    return NextResponse.json({
      status: true,
      message: 'Verification successful (Development Simulation)',
      data: {
        status: 'success',
        reference,
        amount: 28000000,
        currency: 'NGN',
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Payment verification failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
