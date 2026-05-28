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

// Staggered list reveal — apply `listContainer` to the wrapper and
// `listItem` to each child.
export const listContainer: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.04, delayChildren: 0.02 } },
};

export const listItem: Variants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.32, ease: ease.out } },
};

// Press feedback for interactive cards/buttons.
export const pressable = {
  whileTap: { scale: 0.97 },
  transition: spring.snappy,
};
