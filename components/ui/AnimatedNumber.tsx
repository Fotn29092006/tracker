'use client';

import { useEffect, useRef } from 'react';
import { animate } from 'framer-motion';

// Counts from the previous value to the new one. On first mount it counts up
// from 0 — a subtle, premium touch for balances and weights. Writes
// textContent directly so it doesn't re-render the tree each frame.
export function AnimatedNumber({
  value,
  format,
  duration = 0.7,
  className,
}: {
  value: number;
  format: (n: number) => string;
  duration?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  // Seed with the initial value so the first render (incl. cached navigation)
  // shows it instantly — we only animate on *changes*, e.g. 0→real on first
  // data load, or when the balance updates while the screen is open. This
  // avoids a gratuitous count-up every time you revisit a screen.
  const prev = useRef(value);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const from = prev.current;
    prev.current = value;
    if (from === value) { node.textContent = format(value); return; }
    const controls = animate(from, value, {
      duration,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => { node.textContent = format(v); },
    });
    return () => controls.stop();
  }, [value, format, duration]);

  return <span ref={ref} className={className}>{format(value)}</span>;
}
