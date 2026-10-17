import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amount);
}


const HOTEL_TIME_ZONE = "Africa/Lagos";

/** Time of day in hotel-local time, e.g. "2:15 PM". Returns "" for missing values. */
export function formatTime(value: string | null | undefined): string {
  if (!value) return "";
  return new Date(value).toLocaleTimeString("en-NG", { hour: "numeric", minute: "2-digit", timeZone: HOTEL_TIME_ZONE });
}

/** Date and time in hotel-local time, e.g. "17 Oct 2026, 2:15 PM". */
export function formatDateTime(value: string | null | undefined): string {
  if (!value) return "";
  return new Date(value).toLocaleString("en-NG", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit", timeZone: HOTEL_TIME_ZONE });
}
