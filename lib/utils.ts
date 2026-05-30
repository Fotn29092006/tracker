// Small dependency-free helpers shared across the app.

/** Conditionally join class names. */
export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

// ── Money ────────────────────────────────────────────────
const CURRENCY_SYMBOL: Record<string, string> = {
  KZT: '₸', USD: '$', EUR: '€', RUB: '₽', GBP: '£',
};

export function currencySymbol(code: string): string {
  return CURRENCY_SYMBOL[code] ?? code;
}

/** "12 500" — grouped, no decimals unless fractional. */
export function fmtAmount(n: number): string {
  // Guard against a corrupt cached value painting "не число"/"∞" in a balance.
  if (!Number.isFinite(n)) return '0';
  const abs = Math.abs(n);
  const hasFraction = Math.round(abs * 100) % 100 !== 0;
  return new Intl.NumberFormat('ru-RU', {
    minimumFractionDigits: hasFraction ? 2 : 0,
    maximumFractionDigits: 2,
  }).format(n);
}

/** "12 500 ₸" */
export function fmtMoney(n: number, currency = 'KZT'): string {
  return `${fmtAmount(n)} ${currencySymbol(currency)}`;
}

/** "+12 500 ₸" / "−12 500 ₸" with explicit sign. */
export function fmtSigned(n: number, currency = 'KZT'): string {
  const sign = n > 0 ? '+' : n < 0 ? '−' : '';
  return `${sign}${fmtMoney(Math.abs(n), currency)}`;
}

// ── Dates (local, ISO yyyy-mm-dd) ────────────────────────
export function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export const todayISO = () => toISODate(new Date());

export function addDaysISO(n: number, from = new Date()): string {
  const d = new Date(from);
  d.setDate(d.getDate() + n);
  return toISODate(d);
}

export const tomorrowISO = () => addDaysISO(1);

/** Parse an ISO date as a *local* date (avoids UTC off-by-one). */
export function parseISODate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function dayOfWeek(iso: string): number {
  return parseISODate(iso).getDay();
}

/** Localised relative-ish label: Сегодня / Завтра / Вчера / "5 июн". */
export function fmtDateLabel(iso: string): string {
  const today = todayISO();
  if (iso === today) return 'Сегодня';
  if (iso === tomorrowISO()) return 'Завтра';
  if (iso === addDaysISO(-1)) return 'Вчера';
  const d = parseISODate(iso);
  const sameYear = d.getFullYear() === new Date().getFullYear();
  return d.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
    ...(sameYear ? {} : { year: 'numeric' }),
  });
}

export function fmtMonthYear(iso: string): string {
  return parseISODate(iso).toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' });
}

export function fmtTime(isoDateTime: string): string {
  return new Date(isoDateTime).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
}

export const WEEKDAYS_SHORT = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
export const WEEKDAYS_FULL = [
  'Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота',
];
/** Monday-first order of weekday indices for UI rows. */
export const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0];

export function isPast(iso: string): boolean {
  return iso < todayISO();
}

export function uid(): string {
  return (globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`);
}

export function clamp(n: number, min: number, max: number): number {
  return Math.min(Math.max(n, min), max);
}
