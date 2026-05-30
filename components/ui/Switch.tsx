'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { spring } from '@/lib/motion';
import { cn } from '@/lib/utils';

// Toggle with our custom skin PLUS a transparent, real native
// <input type="checkbox" switch> overlaid on top. On iOS 17.4+ the native
// switch plays a HAPTIC when the user's finger actually toggles it — and after
// iOS 26.5 (which killed the programmatic label.click() trick) a real tap on a
// real native switch is the ONLY way left to get web haptics. The native
// control is invisible (opacity 0) so the user sees our skin but feels the
// system tick. appearance is left native (NOT appearance:none — that would
// disable the haptic). Falls back to a plain checkbox where `switch` is
// unsupported, still fully functional.
export function Switch({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label?: string;
}) {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => { ref.current?.setAttribute('switch', ''); }, []);

  return (
    <span className="relative inline-grid h-11 w-[58px] shrink-0 place-items-center">
      {/* Visual skin (decorative — the real control is the input below) */}
      <span
        aria-hidden
        className={cn(
          'relative h-[30px] w-[50px] rounded-full transition-colors duration-200',
          checked ? 'bg-[var(--accent)]' : 'bg-[var(--border-strong)]',
        )}
      >
        <motion.span
          animate={{ x: checked ? 20 : 0 }}
          transition={spring.snappy}
          className="absolute top-[3px] left-[3px] h-6 w-6 rounded-full bg-white shadow-[0_2px_6px_rgba(0,0,0,0.3)]"
        />
      </span>
      {/* Real native switch — transparent, fills the 44px hit zone, captures
          the tap so iOS fires the native haptic. */}
      <input
        ref={ref}
        type="checkbox"
        role="switch"
        aria-label={label}
        checked={checked}
        onChange={(e) => onChange(e.currentTarget.checked)}
        className="absolute inset-0 m-0 h-full w-full cursor-pointer opacity-0"
      />
    </span>
  );
}
