'use client';

import { useEffect } from 'react';

// Lock the document scroll while an overlay is open, so the page behind can't
// scroll or rubber-band on iOS (a classic "web, not app" leak). Mirrors the
// lock the Sheet already does; shared so lightbox/confirm get it too.
export function useScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) return;
    const el = document.documentElement;
    const prev = el.style.overflow;
    el.style.overflow = 'hidden';
    return () => { el.style.overflow = prev; };
  }, [active]);
}
