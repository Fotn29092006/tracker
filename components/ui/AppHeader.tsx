'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ease } from '@/lib/motion';
import { cn } from '@/lib/utils';

// Large, editorial screen header — sticky like a native title bar. A hairline
// fades in only once the header is "stuck" (content scrolling underneath),
// detected with an IntersectionObserver sentinel (no scroll listeners). `right`
// holds an action (button/avatar).
export function AppHeader({
  title,
  subtitle,
  right,
}: {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
}) {
  const [stuck, setStuck] = useState(false);
  const sentinel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = sentinel.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(([e]) => setStuck(!e.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <>
      <div ref={sentinel} aria-hidden className="h-px -mb-px" />
      <header
        className={cn(
          'sticky top-0 z-20 -mx-4 mb-1 flex items-end justify-between gap-3 bg-[var(--bg)] px-4 pb-3 pt-[max(var(--sat),14px)] transition-colors duration-200',
          stuck ? 'border-b border-[var(--hairline)]' : 'border-b border-transparent',
        )}
      >
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
    </>
  );
}
