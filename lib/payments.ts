import { createAdminClient } from '@/lib/supabase/admin';

type SuccessfulCharge = {
  reference: string;
  amountKobo: number;
  channel?: string | null;
  paidAt?: string | null;
};

export type ReconcileResult = 'confirmed' | 'already-processed' | 'unknown-reference' | 'amount-mismatch' | 'dates-unavailable';

/**
 * Marks a Paystack charge as paid and confirms its booking.
 * Safe to call repeatedly (webhook retries + client verify) for the same reference.
 */
export async function recordSuccessfulPayment(charge: SuccessfulCharge): Promise<ReconcileResult> {
  const admin = createAdminClient();

  const { data: payment, error } = await admin
    .from('payments')
    .select('id, status, booking:bookings(id, total_amount_ngn, payment_status)')
    .eq('paystack_reference', charge.reference)
    .maybeSingle();

  if (error) throw error;
  if (!payment) return 'unknown-reference';
  if (payment.status === 'success') return 'already-processed';

  const booking = Array.isArray(payment.booking) ? payment.booking[0] : payment.booking;
  if (!booking) return 'unknown-reference';

  const amountNgn = charge.amountKobo / 100;
  if (amountNgn < Number(booking.total_amount_ngn)) {
    await admin.from('payments').update({ status: 'failed', amount_ngn: amountNgn }).eq('id', payment.id);
    return 'amount-mismatch';
  }

  // Conditional update so concurrent webhook/verify calls only process once.
  const { data: updated, error: paymentError } = await admin
    .from('payments')
    .update({
      status: 'success',
      amount_ngn: amountNgn,
      channel: charge.channel || 'card',
      paid_at: charge.paidAt || new Date().toISOString(),
    })
    .eq('id', payment.id)
    .neq('status', 'success')
    .select('id');

  if (paymentError) throw paymentError;
  if (!updated?.length) return 'already-processed';

  const { error: bookingError } = await admin
    .from('bookings')
    .update({ payment_status: 'paid', status: 'confirmed', updated_at: new Date().toISOString() })
    .eq('id', booking.id);

  if (bookingError) {
    // 23P01: another booking was confirmed for overlapping dates first. Payment is kept
    // as paid so staff can move the guest or refund; the booking stays unconfirmed.
    if (bookingError.code === '23P01') {
      await admin.from('bookings').update({ payment_status: 'paid' }).eq('id', booking.id);
      console.error(`Payment ${charge.reference} succeeded but room dates are no longer available.`);
      return 'dates-unavailable';
    }
    throw bookingError;
  }

  return 'confirmed';
}
