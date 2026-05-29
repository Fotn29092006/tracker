'use client';

import { memo, useEffect, useRef, useState } from 'react';

// Per-digit tick (Nocturne+): each glyph slides in (tickIn keyframe) only when
// it changes — a crisp, premium readout for balances and weights. The wrapper
// carries the full value as aria-label; digits are aria-hidden so a screen
// reader announces the number once.
export const AnimatedNumber = memo(function AnimatedNumber({
  value,
  format,
  className,
}: {
  value: number;
  format: (n: number) => string;
  duration?: number; // kept for call-site compatibility; tick is fixed 240ms
  className?: string;
}) {
  const text = format(value);
  return (
    <span className={`num inline-flex ${className ?? ''}`} aria-label={text}>
      {text.split('').map((ch, i) => (
        <DigitSlot key={i} ch={ch} />
      ))}
    </span>
  );
});

function DigitSlot({ ch }: { ch: string }) {
  const [tick, setTick] = useState(0);
  const prev = useRef(ch);
  useEffect(() => {
    if (prev.current !== ch) {
      setTick((t) => t + 1);
      prev.current = ch;
    }
  }, [ch]);
  return (
    <span
      key={tick}
      aria-hidden
      className="inline-block"
      style={{ animation: 'tickIn 240ms var(--ease-out)', whiteSpace: 'pre' }}
    >
      {ch}
    </span>
  );
}
