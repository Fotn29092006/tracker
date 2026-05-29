'use client';

import { motion } from 'framer-motion';
import { haptics } from '@/lib/haptics';
import { spring } from '@/lib/motion';
import { cn } from '@/lib/utils';

export function Switch({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => { haptics.soft(); onChange(!checked); }}
      className={cn(
        'relative h-[30px] w-[50px] rounded-full transition-colors shrink-0',
        // Extend the tap target to ≥44px tall without resizing the track.
        "before:absolute before:content-[''] before:-inset-y-2 before:-inset-x-1",
        checked ? 'bg-[var(--accent)]' : 'bg-[var(--border-strong)]',
      )}
    >
      <motion.span
        animate={{ x: checked ? 20 : 0 }}
        transition={spring.snappy}
        className="absolute top-[3px] left-[3px] h-6 w-6 rounded-full bg-white shadow-[0_2px_6px_rgba(0,0,0,0.3)]"
      />
    </button>
  );
}
