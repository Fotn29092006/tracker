'use client';

import { motion, type HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';
import { haptics } from '@/lib/haptics';

type Props = HTMLMotionProps<'button'> & {
  label: string;
  active?: boolean;
  size?: number;
};

export function IconButton({ label, active, size = 44, className, onClick, children, ...rest }: Props) {
  return (
    <motion.button
      aria-label={label}
      whileTap={{ scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 500, damping: 28 }}
      onClick={(e) => { haptics.soft(); onClick?.(e); }}
      style={{ width: size, height: size }}
      className={cn(
        'inline-flex items-center justify-center rounded-full shrink-0 transition-colors',
        active
          ? 'bg-[var(--accent-12)] text-[var(--accent)]'
          : 'text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface-alt)]',
        className,
      )}
      {...rest}
    >
      {children}
    </motion.button>
  );
}
