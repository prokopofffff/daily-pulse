import type { Report } from "@/lib/types";

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

const DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

const LONG_DOW = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

const LONG_MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

/**
 * Parse an ISO date-string ("2026-07-01") into a UTC-safe Date so day-of-week
 * math stays deterministic regardless of the runtime timezone.
 */
function parseISODate(iso: string): Date {
  const datePart = iso.slice(0, 10);
  const [y, m, d] = datePart.split("-").map((n) => Number.parseInt(n, 10));
  return new Date(Date.UTC(y, (m || 1) - 1, d || 1));
}

/** "Jul 1" style short date chip. */
export function formatShortDate(iso: string): string {
  const dt = parseISODate(iso);
  return `${MONTHS[dt.getUTCMonth()]} ${dt.getUTCDate()}`;
}

/** "Wed" day-of-week label. */
export function formatDow(iso: string): string {
  return DOW[parseISODate(iso).getUTCDay()];
}

/** "Wednesday, July 1, 2026" long date for the detail view. */
export function formatLongDate(iso: string): string {
  const dt = parseISODate(iso);
  const longDow = LONG_DOW[dt.getUTCDay()];
  const longMonth = LONG_MONTHS[dt.getUTCMonth()];
  return `${longDow}, ${longMonth} ${dt.getUTCDate()}, ${dt.getUTCFullYear()}`;
}

/**
 * Whether a report metric is "inverted" — a higher value is worse, so its delta
 * pill should flip up/down coloring (e.g. support tickets).
 */
export function isInvertedMetric(label: string): boolean {
  return label.toLowerCase().includes("ticket");
}

export const PERIOD_LABEL: Record<Report["period"], string> = {
  daily: "Daily",
  weekly: "Weekly",
  monthly: "Monthly",
};
