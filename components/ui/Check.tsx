'use client';

import { motion } from 'framer-motion';
import { Check as CheckIcon } from 'lucide-react';
import { haptics } from '@/lib/haptics';
import { cn } from '@/lib/utils';

// Animated circular checkbox.
export function Check({
  checked,
  onChange,
  size = 26,
}: {
  checked: boolean;
  onChange: () => void;
  size?: number;
}) {
  return (
    <motion.button
      type="button"
      aria-pressed={checked}
      aria-label={checked ? 'Снять отметку' : 'Выполнить'}
      whileTap={{ scale: 0.82 }}
      transition={{ type: 'spring', stiffness: 500, damping: 24 }}
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); haptics.success(); onChange(); }}
      style={{ width: size, height: size }}
      className={cn(
        'relative shrink-0 grid place-items-center rounded-full border-2 transition-colors',
        // Invisible ≥44px hit area (WCAG 2.5.5 / HIG) without changing the
        // visual size — the ::before extends the button's clickable box.
        "before:absolute before:content-[''] before:-inset-[11px]",
        checked ? 'border-transparent text-[var(--on-accent)]' : 'border-[var(--border-strong)] text-transparent',
      )}
    >
      {checked && (
        <motion.span
          layoutId={undefined}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 500, damping: 22 }}
          className="absolute inset-0 rounded-full"
          style={{ backgroundImage: 'var(--accent-grad)' }}
        />
      )}
      <motion.span
        initial={false}
        animate={{ scale: checked ? 1 : 0, opacity: checked ? 1 : 0 }}
        transition={{ duration: 0.15 }}
        className="relative"
      >
        <CheckIcon size={size * 0.56} strokeWidth={3.5} />
      </motion.span>
    </motion.button>
  );
}
