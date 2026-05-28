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
  const prev = useRef(0);

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
