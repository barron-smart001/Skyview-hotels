export type BookingInput = {
  roomId: string;
  checkIn: string;
  checkOut: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  guestsCount: number;
  specialRequests: string | null;
  nights: number;
};

type ValidationResult = { ok: true; data: BookingInput } | { ok: false; error: string };

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_NIGHTS = 60;
const DAY_MS = 86_400_000;

function text(value: unknown, maxLength: number) {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : '';
}

function parseDate(value: string) {
  if (!DATE_PATTERN.test(value)) return null;
  const date = new Date(`${value}T00:00:00Z`);
  // Reject rolled-over dates such as 2026-02-31.
  return Number.isNaN(date.valueOf()) || date.toISOString().slice(0, 10) !== value ? null : date;
}

export function validateBookingInput(body: unknown): ValidationResult {
  if (!body || typeof body !== 'object') return { ok: false, error: 'Invalid booking request.' };
  const input = body as Record<string, unknown>;

  const roomId = text(input.roomId, 64);
  const checkIn = text(input.checkIn, 10);
  const checkOut = text(input.checkOut, 10);
  const guestName = text(input.guestName, 120);
  const guestEmail = text(input.guestEmail, 254).toLowerCase();
  const guestPhone = text(input.guestPhone, 32);
  const specialRequests = text(input.specialRequests, 1000) || null;

  if (!roomId || !checkIn || !checkOut || !guestName || !guestEmail || !guestPhone) {
    return { ok: false, error: 'Missing required booking information' };
  }
  if (!EMAIL_PATTERN.test(guestEmail)) {
    return { ok: false, error: 'Please enter a valid email address.' };
  }

  const checkInDate = parseDate(checkIn);
  const checkOutDate = parseDate(checkOut);
  if (!checkInDate || !checkOutDate || checkOutDate <= checkInDate) {
    return { ok: false, error: 'Check-out date must be after check-in date' };
  }

  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  // Allow one day of slack so guests in timezones ahead of UTC can book "today".
  if (checkInDate.valueOf() < today.valueOf() - DAY_MS) {
    return { ok: false, error: 'Check-in date cannot be in the past.' };
  }

  const nights = Math.round((checkOutDate.valueOf() - checkInDate.valueOf()) / DAY_MS);
  if (nights > MAX_NIGHTS) {
    return { ok: false, error: `Stays longer than ${MAX_NIGHTS} nights must be arranged with reservations directly.` };
  }

  const guestsCount = Number(input.guestsCount);
  if (!Number.isInteger(guestsCount) || guestsCount < 1) {
    return { ok: false, error: 'Please select a valid number of guests.' };
  }

  return {
    ok: true,
    data: { roomId, checkIn, checkOut, guestName, guestEmail, guestPhone, guestsCount, specialRequests, nights },
  };
}

export function generateBookingReference() {
  // 8 random base-36 chars ≈ 2.8 trillion combinations, so collisions are negligible at any realistic volume.
  const bytes = crypto.getRandomValues(new Uint8Array(8));
  const code = Array.from(bytes, (byte) => (byte % 36).toString(36)).join('').toUpperCase();
  return `SKV-${code}-NG`;
}
