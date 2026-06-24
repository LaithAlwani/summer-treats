// Pickup-window time helpers. Windows are stored as 24h "HH:MM".

export type PickupWindow = { start: string; end: string };

// "13:00" -> "1:00 PM"
export function formatTime(hhmm: string): string {
  const [h, m] = hhmm.split(":").map(Number);
  if (Number.isNaN(h)) return hhmm;
  const period = h < 12 ? "AM" : "PM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m ?? 0).padStart(2, "0")} ${period}`;
}

// { start: "11:00", end: "13:00" } -> "11:00 AM – 1:00 PM"
export function formatWindow(w: PickupWindow): string {
  return `${formatTime(w.start)} – ${formatTime(w.end)}`;
}
