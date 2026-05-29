// Shared Framer Motion tokens — keeps transitions consistent and "native".
import type { Transition, Variants } from 'framer-motion';

export const spring = {
  soft:   { type: 'spring', stiffness: 320, damping: 34, mass: 0.9 } as Transition,
  snappy: { type: 'spring', stiffness: 480, damping: 36, mass: 0.8 } as Transition,
  sheet:  { type: 'spring', stiffness: 360, damping: 38, mass: 1 } as Transition,
  tab:    { type: 'spring', stiffness: 620, damping: 42 } as Transition,
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
