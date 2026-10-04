/**
 * Presentation-only formatting helpers. Kept free of React and Supabase so
 * they can be unit tested in isolation.
 */

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const WEEK = 7 * DAY;

/** `fmtTime` — compact relative time: `just now`, `5m ago`, `3h ago`, `12 Feb`. */
export function fmtTime(iso: string | null | undefined, now: number = Date.now()): string {
  if (!iso) return '';
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return '';

  const diff = Math.max(0, now - then);
  if (diff < MINUTE) return 'just now';
  if (diff < HOUR) return `${Math.floor(diff / MINUTE)}m ago`;
  if (diff < DAY) return `${Math.floor(diff / HOUR)}h ago`;
  if (diff < WEEK) return `${Math.floor(diff / DAY)}d ago`;
  return new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
}

/** Long form used for receipts and purchase history. */
export function fmtDate(iso: string | null | undefined): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
}

export function fmtDateTime(iso: string | null | undefined): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return `${d.toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })}, ${d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}`;
}

/** `KSh 12,400` — Kenyan Shilling, no decimals unless there are sen. */
export function formatKsh(amount: number | null | undefined, opts?: { compact?: boolean }): string {
  if (amount == null || Number.isNaN(amount)) return 'KSh 0';
  const value = Math.round(amount);
  if (opts?.compact && Math.abs(value) >= 1000) {
    const k = value / 1000;
    return `KSh ${Number.isInteger(k) ? k : k.toFixed(1)}k`;
  }
  return `KSh ${value.toLocaleString('en-KE')}`;
}

export function pluralise(count: number, singular: string, plural = `${singular}s`): string {
  return `${count} ${count === 1 ? singular : plural}`;
}

/** `Good morning` / `Good afternoon` / `Good evening` from the device clock. */
export function greetingForDate(now: number = Date.now()): string {
  const hour = new Date(now).getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}