// Haptic feedback.
//   • Android / Chrome → navigator.vibrate(pattern).
//   • iOS → there is NO usable programmatic haptic. navigator.vibrate is a
//     no-op, and the <input switch> + label.click() trick was PATCHED OUT in
//     iOS 26.5. The only haptic left fires from a REAL user tap on a native
//     <input type="checkbox" switch> — see components/ui/Switch.tsx. So on iOS
//     these calls are graceful no-ops by design.
// Must be called from inside a user gesture.

type Kind = 'soft' | 'tap' | 'success' | 'warning' | 'error';

const PATTERNS: Record<Kind, number | number[]> = {
  soft: 6,
  tap: 10,
  success: [10, 40, 12],
  warning: [8, 30, 8],
  error: 26,
};

const canVibrate =
  typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function';

function buzz(pattern: number | number[]) {
  if (!canVibrate) return; // iOS / unsupported — no-op
  try { navigator.vibrate(pattern); } catch { /* ignore */ }
}

export const haptics: Record<Kind, () => void> = {
  soft: () => buzz(PATTERNS.soft),
  tap: () => buzz(PATTERNS.tap),
  success: () => buzz(PATTERNS.success),
  warning: () => buzz(PATTERNS.warning),
  error: () => buzz(PATTERNS.error),
};
