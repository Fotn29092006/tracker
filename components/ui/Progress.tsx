'use client';

import { motion } from 'framer-motion';
import { clamp } from '@/lib/utils';
import { spring } from '@/lib/motion';

export function ProgressBar({
  value, // 0..1
  tone = 'accent',
  height = 8,
}: {
  value: number;
  tone?: 'accent' | 'positive' | 'warning';
  height?: number;
}) {
  const pct = clamp(value, 0, 1) * 100;
  const bg =
    tone === 'positive' ? 'var(--positive)' : tone === 'warning' ? 'var(--warning)' : 'var(--accent-grad)';
  return (
    <div className="w-full rounded-full bg-[var(--surface-alt)] overflow-hidden" style={{ height }}>
      <motion.div
        className="h-full rounded-full"
        style={{ backgroundImage: tone === 'accent' ? bg : undefined, background: tone !== 'accent' ? bg : undefined }}
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={spring.soft}
      />
    </div>
  );
}

export function ProgressRing({
  value, // 0..1
  size = 56,
  stroke = 6,
  children,
}: {
  value: number;
  size?: number;
  stroke?: number;
  children?: React.ReactNode;
}) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const pct = clamp(value, 0, 1);
  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--surface-alt)" strokeWidth={stroke} />
        <motion.circle
          cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke="var(--accent)" strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ * (1 - pct) }}
          transition={spring.soft}
        />
      </svg>
      {children && <div className="absolute inset-0 grid place-items-center">{children}</div>}
    </div>
  );
}
