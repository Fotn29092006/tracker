'use client';

import { cn } from '@/lib/utils';
import { haptics } from '@/lib/haptics';

type Tone = 'neutral' | 'accent' | 'positive' | 'negative' | 'warning';

const TONES: Record<Tone, string> = {
  neutral: 'bg-[var(--surface-alt)] text-[var(--text-muted)]',
  accent: 'bg-[var(--accent-12)] text-[var(--accent)]',
  positive: 'bg-[var(--positive-16)] text-[var(--positive)]',
  negative: 'bg-[var(--negative-16)] text-[var(--negative)]',
  warning: 'bg-[var(--warning-12)] text-[var(--warning)]',
};

export function Pill({
  children,
  tone = 'neutral',
  className,
}: {
  children: React.ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[12px] font-medium', TONES[tone], className)}>
      {children}
    </span>
  );
}

/** Selectable chip — used in filter strips and pickers. */
export function Chip({
  children,
  active,
  onClick,
  className,
}: {
  children: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={() => { haptics.soft(); onClick?.(); }}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-3.5 h-9 text-[14px] font-medium whitespace-nowrap transition-colors border',
        active
          ? 'bg-[var(--accent-12)] text-[var(--accent)] border-[var(--accent-30)]'
          : 'bg-[var(--surface)] text-[var(--text-muted)] border-[var(--border)]',
        className,
      )}
    >
      {children}
    </button>
  );
}
