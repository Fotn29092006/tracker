'use client';

import { motion, type HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';
import { spring } from '@/lib/motion';
import { haptics } from '@/lib/haptics';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

const SIZES: Record<Size, string> = {
  sm: 'h-9 px-3.5 text-[13px] gap-1.5 rounded-[12px]',
  md: 'h-11 px-4 text-[15px] gap-2 rounded-[14px]',
  lg: 'h-[52px] px-5 text-[16px] gap-2 rounded-[16px]',
};

const VARIANTS: Record<Variant, string> = {
  primary: 'text-[var(--on-accent)] font-semibold shadow-[0_6px_20px_var(--accent-glow)]',
  secondary: 'bg-[var(--surface-raised)] text-[var(--text)] font-medium border border-[var(--border)]',
  ghost: 'text-[var(--text-muted)] font-medium hover:text-[var(--text)]',
  danger: 'bg-[var(--negative-16)] text-[var(--negative)] font-semibold',
};

export type ButtonProps = HTMLMotionProps<'button'> & {
  variant?: Variant;
  size?: Size;
  full?: boolean;
  haptic?: boolean;
};

export function Button({
  variant = 'primary',
  size = 'md',
  full,
  haptic = true,
  className,
  children,
  onClick,
  disabled,
  ...rest
}: ButtonProps) {
  return (
    <motion.button
      whileTap={disabled ? undefined : { scale: 0.96 }}
      transition={spring.snappy}
      onClick={(e) => {
        if (haptic && !disabled) haptics.tap();
        onClick?.(e);
      }}
      disabled={disabled}
      className={cn(
        'inline-flex items-center justify-center select-none transition-colors',
        'disabled:opacity-45 disabled:pointer-events-none',
        SIZES[size],
        VARIANTS[variant],
        full && 'w-full',
        className,
      )}
      style={variant === 'primary' ? { backgroundImage: 'var(--accent-grad)' } : undefined}
      {...rest}
    >
      {children}
    </motion.button>
  );
}
