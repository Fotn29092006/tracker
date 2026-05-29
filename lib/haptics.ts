// Haptic feedback with two backends, because iOS Safari/PWA ignores the
// Vibration API entirely:
//   • Android / Chrome  → navigator.vibrate(pattern)
//   • iOS 17.4+         → click a hidden <input type="checkbox" switch>; the
//                         system plays a light haptic on toggle (works in a
//                         standalone PWA). This is the trick the web-haptics
//                         skill is built around.
// No-op where neither is available. Calls must run inside a user gesture
// (they all originate from onClick/onChange handlers, so that's satisfied).

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

// Lazily-created hidden switch used for the iOS haptic trick.
let hapticLabel: HTMLLabelElement | null = null;
function iosTick() {
  if (typeof document === 'undefined') return;
  if (!hapticLabel) {
    const label = document.createElement('label');
    label.setAttribute('aria-hidden', 'true');
    // Must stay in the render tree (not display:none) for iOS to fire the
    // haptic — so hide it off-screen, transparent, non-interactive.
    label.style.cssText =
      'position:fixed;bottom:0;left:0;width:1px;height:1px;opacity:0;overflow:hidden;pointer-events:none;z-index:-2147483647;';
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.setAttribute('switch', ''); // iOS native switch control
    input.tabIndex = -1;
    label.appendChild(input);
    document.body.appendChild(label);
    hapticLabel = label;
  }
  // Clicking the label toggles the switch → iOS plays the system haptic.
  hapticLabel.click();
}

function buzz(pattern: number | number[]) {
  if (canVibrate) {
    try { navigator.vibrate(pattern); return; } catch { /* fall through to iOS */ }
  }
  try { iosTick(); } catch { /* unsupported — silent no-op */ }
}

export const haptics: Record<Kind, () => void> = {
  soft: () => buzz(PATTERNS.soft),
  tap: () => buzz(PATTERNS.tap),
  success: () => buzz(PATTERNS.success),
  warning: () => buzz(PATTERNS.warning),
  error: () => buzz(PATTERNS.error),
};
