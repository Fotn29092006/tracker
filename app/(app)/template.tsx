'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { navDirection } from '@/lib/navDirection';
import { scrollMemory } from '@/lib/scrollMemory';
import { ease } from '@/lib/motion';

// One calm entrance per screen. Slides IN the direction of navigation when a
// swipe / tab tap set a direction (navDirection), else a plain fade (dir 0).
// A transform here is safe: every `position: fixed` element (FAB, TabBar,
// sheets, overlays, lightbox) lives in the AppShell or a Portal — OUTSIDE this
// wrapper — so the transform can't re-root any of them. Reading the direction
// once on mount (useState initializer) and resetting it in the effect keeps a
// later plain <Link> nav on a clean fade.
export default function Template({ children }: { children: React.ReactNode }) {
  const [enterX] = useState(() => navDirection.get());
  const pathname = usePathname();

  useEffect(() => {
    navDirection.set(0);
    // Restore where the user last was on this tab (native tab apps remember);
    // keep saving as they scroll so a later return lands in the same place.
    window.scrollTo({ top: scrollMemory.get(pathname) });
    const onScroll = () => scrollMemory.save(pathname, window.scrollY);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [pathname]);

  return (
    <motion.div
      initial={{ opacity: 0, x: enterX }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.34, ease: ease.out }}
    >
      {children}
    </motion.div>
  );
}
