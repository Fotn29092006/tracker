'use client';

import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { ease } from '@/lib/motion';

export function EmptyState({
  icon: Icon,
  title,
  hint,
  action,
}: {
  icon: LucideIcon;
  title: string;
  hint?: string;
  action?: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: ease.out }}
      className="flex flex-col items-center text-center px-8 py-16"
    >
      <div className="grid h-16 w-16 place-items-center rounded-[20px] bg-[var(--surface-alt)] text-[var(--text-subtle)] mb-4">
        <Icon size={28} strokeWidth={1.75} />
      </div>
      <p className="text-[16px] font-semibold text-[var(--text)]">{title}</p>
      {hint && <p className="mt-1 text-[14px] text-[var(--text-muted)] max-w-[260px]">{hint}</p>}
      {action && <div className="mt-5">{action}</div>}
    </motion.div>
  );
}
