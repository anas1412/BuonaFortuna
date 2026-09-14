import { ConvexError } from 'convex/values';

export function fmtDate(ms: number) {
  return new Intl.DateTimeFormat('fr-TN', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(ms);
}

/** Convex errors carry a French message in `data`; anything else gets a generic one. */
export function errorMessage(e: unknown, fallback = 'Une erreur est survenue.') {
  if (e instanceof ConvexError) return String(e.data);
  if (e instanceof Error && e.message) return e.message;
  return fallback;
}

/** "68,5" or "68" typed in DT → millimes. Null when it isn't a number. */
export function dinarsToMillimes(input: string): number | null {
  const n = Number(input.replace(',', '.').trim());
  if (!Number.isFinite(n) || n < 0) return null;
  return Math.round(n * 1000);
}

export function millimesToDinars(m: number | undefined | null): string {
  if (m === undefined || m === null) return '';
  const d = m / 1000;
  return Number.isInteger(d) ? String(d) : d.toFixed(3).replace(/0+$/, '').replace('.', ',');
}
