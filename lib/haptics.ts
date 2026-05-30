// Haptic feedback.
//   • Telegram Mini App → REAL native haptics via Telegram.WebApp.HapticFeedback.
//     This is the only way to get a true tactile "tick" on iOS from web code —
//     the same trick the posuda app rides. Works because Telegram's native app
//     provides the bridge (like a native wrapper would).
//   • Android / Chrome (plain web) → navigator.vibrate.
//   • iOS standalone PWA → no usable haptic exists (vibrate is a no-op, the
//     <input switch> trick was patched out in iOS 26.5) → graceful no-op.
// Must be called from inside a user gesture.

type Kind = 'soft' | 'tap' | 'success' | 'warning' | 'error';

const VIBRATE: Record<Kind, number | number[]> = {
  soft: 6,
  tap: 10,
  success: [10, 40, 12],
  warning: [8, 30, 8],
  error: 26,
};

// Telegram Mini App haptics. Returns true if it fired (so we don't double-buzz).
function telegramHaptic(kind: Kind): boolean {
  if (typeof window === 'undefined') return false;
  const hf = (window as unknown as { Telegram?: { WebApp?: { HapticFeedback?: {
    impactOccurred?: (s: string) => void;
    notificationOccurred?: (s: string) => void;
  } } } }).Telegram?.WebApp?.HapticFeedback;
  if (!hf) return false;
  try {
    if (kind === 'success' || kind === 'warning' || kind === 'error') {
      hf.notificationOccurred?.(kind);
    } else {
      hf.impactOccurred?.(kind === 'soft' ? 'light' : 'medium');
    }
    return true;
  } catch {
    return false;
  }
}

const canVibrate =
  typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function';

function fire(kind: Kind) {
  if (telegramHaptic(kind)) return; // real native tick inside Telegram
  if (!canVibrate) return; // iOS PWA — no-op by design
  try { navigator.vibrate(VIBRATE[kind]); } catch { /* ignore */ }
}

export const haptics: Record<Kind, () => void> = {
  soft: () => fire('soft'),
  tap: () => fire('tap'),
  success: () => fire('success'),
  warning: () => fire('warning'),
  error: () => fire('error'),
};
