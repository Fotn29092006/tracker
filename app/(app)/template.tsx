'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';

// One calm, single entrance per screen. Opacity-only on purpose:
//  • no transform → `position: fixed` descendants (the FAB) stay anchored to
//    the viewport instead of to this wrapper (a transformed ancestor would
//    re-root fixed positioning and make the FAB jump/misplace).
//  • avoids stacking with list/tab animations, which read as "choppy".
// Also resets the app scroll container to top on each route change (the
// container persists across navigations in the app-shell layout).
export default function Template({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    document.getElementById('app-scroll')?.scrollTo({ top: 0 });
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.16, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
}
