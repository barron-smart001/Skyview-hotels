import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get('x-paystack-signature');
    const secret = process.env.PAYSTACK_SECRET_KEY;

    // Verify webhook signature
    if (secret && signature) {
      const hash = crypto.createHmac('sha512', secret).update(rawBody).digest('hex');
      if (hash !== signature) {
        return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 401 });
      }
    }

    const event = JSON.parse(rawBody);

    if (event.event === 'charge.success') {
      const { reference, amount, channel } = event.data;
      const amountInNaira = amount / 100;

      try {
        const supabase = await createClient();
        
        // Record payment
        await supabase.from('payments').insert([
          {
            paystack_reference: reference,
            amount_ngn: amountInNaira,
            channel: channel || 'card',
            currency: 'NGN',
            status: 'success',
            paid_at: new Date().toISOString(),
          }
        ]);

        // Update corresponding booking
        await supabase
          .from('bookings')
          .update({ payment_status: 'paid', status: 'confirmed' })
          .eq('booking_reference', reference);
      } catch (dbErr) {
        console.error('Database update error on webhook:', dbErr);
      }
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Webhook handler failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
