'use client';

import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { haptics } from '@/lib/haptics';

// Floating action button — pinned bottom-right, above the tab bar.
export function Fab({ onClick, label = 'Добавить' }: { onClick: () => void; label?: string }) {
  return (
    <motion.button
      aria-label={label}
      onClick={() => { haptics.tap(); onClick(); }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      whileTap={{ scale: 0.9 }}
      className="fixed right-5 z-30 grid h-14 w-14 place-items-center rounded-full text-[var(--on-accent)] shadow-[0_8px_24px_var(--accent-glow)]"
      style={{
        backgroundImage: 'var(--accent-grad)',
        // Sit above the floating pill nav (pill bottom 14 + ~56 tall + gap).
        bottom: 'calc(env(safe-area-inset-bottom, 0px) + 86px)',
      }}
    >
      <Plus size={26} strokeWidth={2.5} />
    </motion.button>
  );
}
