'use client';

import { motion } from 'framer-motion';

// Enter-only tab content. Keyed by the parent (`<TabPanel key={tab}>`), so
// switching tabs swaps instantly and the new panel fades in — no exit delay
// (unlike AnimatePresence mode="wait", which waited ~300ms before showing
// the next tab and made switching feel sluggish).
export function TabPanel({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
