// Web-only haptics via the Vibration API. No-op on desktop / unsupported
// browsers (iOS Safari currently ignores navigator.vibrate, but calling it
// is harmless and future-proof). Keep patterns short and subtle.

type Kind = 'soft' | 'tap' | 'success' | 'warning' | 'error';

const PATTERNS: Record<Kind, number | number[]> = {
  soft: 6,
  tap: 10,
  success: [10, 40, 12],
  warning: [8, 30, 8],
  error: 26,
};

function buzz(pattern: number | number[]) {
  if (typeof navigator === 'undefined' || typeof navigator.vibrate !== 'function') return;
  try { navigator.vibrate(pattern); } catch { /* unsupported */ }
}

export const haptics: Record<Kind, () => void> = {
  soft: () => buzz(PATTERNS.soft),
  tap: () => buzz(PATTERNS.tap),
  success: () => buzz(PATTERNS.success),
  warning: () => buzz(PATTERNS.warning),
  error: () => buzz(PATTERNS.error),
};
