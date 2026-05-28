'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { haptics } from '@/lib/haptics';
import { spring } from '@/lib/motion';

type Option<T extends string> = { value: T; label: React.ReactNode };

export function Segmented<T extends string>({
  options,
  value,
  onChange,
  className,
  id,
}: {
  options: Option<T>[];
  value: T;
  onChange: (v: T) => void;
  className?: string;
  id?: string;
}) {
  const layoutId = id ?? 'seg';
  return (
    <div className={cn('flex gap-1 p-1 rounded-[14px] bg-[var(--surface-alt)]', className)}>
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => { if (!active) { haptics.soft(); onChange(o.value); } }}
            className={cn(
              'relative flex-1 h-9 rounded-[10px] text-[14px] font-medium transition-colors',
              active ? 'text-[var(--text)]' : 'text-[var(--text-muted)]',
            )}
          >
            {active && (
              <motion.span
                layoutId={`${layoutId}-pill`}
                transition={spring.tab}
                className="absolute inset-0 rounded-[10px] bg-[var(--surface-raised)] shadow-[var(--shadow-sm)] border border-[var(--border)]"
              />
            )}
            <span className="relative z-10 px-2">{o.label}</span>
          </button>
        );
      })}
    </div>
  );
}
