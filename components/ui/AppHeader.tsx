'use client';

import { motion } from 'framer-motion';
import { ease } from '@/lib/motion';

// Large, editorial screen header. `right` holds an action (button/avatar).
export function AppHeader({
  title,
  subtitle,
  right,
}: {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
}) {
  return (
    <header className="flex items-end justify-between gap-3 pt-2 pb-5">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.36, ease: ease.out }}
        className="min-w-0"
      >
        {subtitle && (
          <p className="text-[13px] font-medium text-[var(--text-subtle)] mb-0.5">{subtitle}</p>
        )}
        <h1 className="text-[30px] leading-none font-bold tracking-[-0.02em] truncate">{title}</h1>
      </motion.div>
      {right && <div className="shrink-0 pb-1">{right}</div>}
    </header>
  );
}
