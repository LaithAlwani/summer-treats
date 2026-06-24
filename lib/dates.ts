// Small date helpers. Everything is keyed off a local "YYYY-MM-DD" string so
// the public menu, schedule, and orders all line up on the same calendar day.

export function toISODate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function todayISO(): string {
  return toISODate(new Date());
}

export function addDays(isoDate: string, days: number): string {
  const [y, m, d] = isoDate.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + days);
  return toISODate(date);
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function parts(isoDate: string) {
  const [y, m, d] = isoDate.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function weekdayShort(isoDate: string): string {
  return WEEKDAYS[parts(isoDate).getDay()];
}

export function weekdayLong(isoDate: string): string {
  return [
    "Sunday", "Monday", "Tuesday", "Wednesday",
    "Thursday", "Friday", "Saturday",
  ][parts(isoDate).getDay()];
}

// e.g. "Wed, Jun 24"
export function prettyDate(isoDate: string): string {
  const date = parts(isoDate);
  return `${WEEKDAYS[date.getDay()]}, ${MONTHS[date.getMonth()]} ${date.getDate()}`;
}

// e.g. "Wednesday, June 24" — for the order summary.
export function prettyDateLong(isoDate: string): string {
  const longMonths = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];
  const date = parts(isoDate);
  return `${weekdayLong(isoDate)}, ${longMonths[date.getMonth()]} ${date.getDate()}`;
}
