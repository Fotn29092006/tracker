'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { navDirection } from '@/lib/navDirection';
import { ease } from '@/lib/motion';

// One calm entrance per screen. Slides IN the direction of navigation when a
// swipe / tab tap set a direction (navDirection), else a plain fade (dir 0).
// A transform here is safe: every `position: fixed` element (FAB, TabBar,
// sheets, overlays, lightbox) lives in the AppShell or a Portal — OUTSIDE this
// wrapper — so the transform can't re-root any of them. Reading the direction
// once on mount (useState initializer) and resetting it in the effect keeps a
// later plain <Link> nav on a clean fade.
export default function Template({ children }: { children: React.ReactNode }) {
  const [dir] = useState(() => navDirection.get());

  useEffect(() => {
    navDirection.set(0);
    // Natural document scroll now (the shell is no longer a locked scroller).
    window.scrollTo({ top: 0 });
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, x: dir * 22 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.22, ease: ease.out }}
    >
      {children}
    </motion.div>
  );
}
