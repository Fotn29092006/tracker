'use client';

import { motion } from 'framer-motion';

// Re-mounts on every route change → gives each screen a quick, consistent
// entrance so navigation feels smooth instead of a hard cut.
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
