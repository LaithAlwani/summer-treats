import { addDays, prettyDate } from "./dates";
import { formatTime } from "./time";

export type OrderCutoff = { time: string; daysBefore: number };

export const DEFAULT_CUTOFF: OrderCutoff = { time: "18:00", daysBefore: 1 };

// The local instant after which ordering for `pickupDate` is closed.
export function orderCutoffAt(pickupDate: string, cutoff: OrderCutoff): Date {
  const [y, m, d] = pickupDate.split("-").map(Number);
  const [hh, mm] = cutoff.time.split(":").map(Number);
  const dt = new Date(y, m - 1, d, hh || 0, mm || 0, 0, 0);
  dt.setDate(dt.getDate() - (cutoff.daysBefore ?? 1));
  return dt;
}

// Uses the visitor's local clock (same locale as the shop for local customers).
export function isOrderingOpenForDate(
  pickupDate: string,
  cutoff: OrderCutoff,
  now: Date = new Date(),
): boolean {
  return now < orderCutoffAt(pickupDate, cutoff);
}

// e.g. "6:00 PM on Mon, Jun 23" — shown when a day's ordering has closed.
export function cutoffLabel(pickupDate: string, cutoff: OrderCutoff): string {
  const day = addDays(pickupDate, -(cutoff.daysBefore ?? 1));
  return `${formatTime(cutoff.time)} on ${prettyDate(day)}`;
}
