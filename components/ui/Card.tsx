'use client';

import { motion, type HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';

type Props = HTMLMotionProps<'div'> & {
  raised?: boolean;
  pad?: boolean;
  interactive?: boolean;
};

export function Card({ raised, pad = true, interactive, className, children, ...rest }: Props) {
  return (
    <motion.div
      whileTap={interactive ? { scale: 0.985 } : undefined}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className={cn(
        'rounded-[var(--r-lg)] border border-[var(--border)]',
        raised ? 'bg-[var(--surface-raised)] shadow-[var(--shadow-md)]' : 'bg-[var(--surface)]',
        pad && 'p-4',
        interactive && 'cursor-pointer active:border-[var(--border-strong)]',
        className,
      )}
      {...rest}
    >
      {children}
    </motion.div>
  );
}
