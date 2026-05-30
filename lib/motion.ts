// Shared Framer Motion tokens — keeps transitions consistent and "native".
import type { Transition, Variants } from 'framer-motion';

// Calm, low-overshoot springs. Kept gentle on purpose — stiff springs read as
// "jerky/abrupt"; we lean toward smooth deceleration (closer to a CSS ease-out)
// and reserve springs for small tactile feedback.
export const spring = {
  soft:   { type: 'spring', stiffness: 300, damping: 32, mass: 0.9 } as Transition,
  snappy: { type: 'spring', stiffness: 420, damping: 32, mass: 0.85 } as Transition,
  sheet:  { type: 'spring', stiffness: 340, damping: 36, mass: 1 } as Transition,
  tab:    { type: 'spring', stiffness: 300, damping: 30 } as Transition,
};

export const ease = {
  out: [0.22, 1, 0.36, 1] as [number, number, number, number],
  inOut: [0.65, 0, 0.35, 1] as [number, number, number, number],
};

// List reveal — intentionally instant. The single screen-level fade
// (app/(app)/template.tsx) is the only entrance; staggering each row on top of
// it stacked 2–3 animations and read as "choppy". Kept as no-op variants so
// screens can keep using `variants={listItem}` without churn (and still attach
// their own whileTap, etc.).
export const listContainer: Variants = { hidden: {}, show: {} };
export const listItem: Variants = { hidden: { opacity: 1 }, show: { opacity: 1 } };

// Press feedback for interactive cards/buttons.
export const pressable = {
  whileTap: { scale: 0.97 },
  transition: spring.snappy,
};
