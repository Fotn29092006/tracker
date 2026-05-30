'use client';

import { useEffect, useLayoutEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { NAV_ITEMS } from './navItems';
import { navDirection } from '@/lib/navDirection';
import { haptics } from '@/lib/haptics';

// Horizontal swipe between the main tabs — the page tracks the finger (like a
// native pager) and commits or springs back on release. The five primary
// destinations only; Profile is reached via its avatar.
const ORDER = NAV_ITEMS.map((n) => n.href);

// Don't start a horizontal drag until the gesture is clearly horizontal, so
// vertical scrolling stays native and untouched.
const DECIDE = 10; // px before we commit to a direction
const H_RATIO = 1.2; // |dx| must beat |dy| by this to count as horizontal
const COMMIT_FRACTION = 0.26; // dragged past this fraction of width → navigate
const COMMIT_VELOCITY = 0.4; // or flicked faster than this (px/ms)
const SETTLE = 'transform 0.44s cubic-bezier(0.22,1,0.36,1)'; // gentle spring-back

// SSR-safe layout effect (avoids the new page painting at the old drag offset).
const useIsoLayout = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

export function SwipeNav({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const ref = useRef<HTMLDivElement>(null);
  const idxRef = useRef(ORDER.indexOf(pathname));
  idxRef.current = ORDER.indexOf(pathname);

  // The drag transform lives on a persistent element (this wrapper survives
  // navigations), so reset it to 0 the instant a new route mounts — before
  // paint — otherwise the incoming page would inherit the leftover offset.
  useIsoLayout(() => {
    const el = ref.current;
    if (el) { el.style.transition = 'none'; el.style.transform = 'translateX(0)'; el.style.willChange = 'auto'; }
  }, [pathname]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let startX = 0, startY = 0, dx = 0, t0 = 0;
    let active = false, decided = false, horizontal = false;

    const onStart = (e: TouchEvent) => {
      // Not on a pager route (e.g. /profile), multi-touch, or inside a region
      // that owns horizontal gestures → ignore.
      if (idxRef.current === -1 || e.touches.length !== 1 || shouldSkip(e.target as Element | null)) { active = false; return; }
      const t = e.touches[0];
      startX = t.clientX; startY = t.clientY; dx = 0; t0 = Date.now();
      active = true; decided = false; horizontal = false;
      el.style.transition = 'none';
    };

    const onMove = (e: TouchEvent) => {
      if (!active) return;
      const t = e.touches[0];
      const ddx = t.clientX - startX;
      const ddy = t.clientY - startY;

      if (!decided) {
        if (Math.abs(ddx) < DECIDE && Math.abs(ddy) < DECIDE) return;
        decided = true;
        horizontal = Math.abs(ddx) > Math.abs(ddy) * H_RATIO;
        if (!horizontal) { active = false; return; } // it's a vertical scroll
        el.style.willChange = 'transform';
      }

      e.preventDefault(); // we own this gesture now — stop scroll / native back
      dx = ddx;
      const idx = idxRef.current;
      // Rubber-band when there's no tab to go to in that direction.
      const blocked = (dx > 0 && idx <= 0) || (dx < 0 && idx >= ORDER.length - 1);
      const eff = blocked ? dx * 0.25 : dx;
      el.style.transform = `translateX(${eff}px)`;
    };

    const onEnd = () => {
      if (!active) return;
      active = false;
      if (!horizontal) return;
      const idx = idxRef.current;
      const w = el.clientWidth || window.innerWidth;
      const velocity = Math.abs(dx) / Math.max(Date.now() - t0, 1);
      const dir = dx < 0 ? 1 : -1;
      const target = ORDER[idx + dir];
      const commit = !!target && (Math.abs(dx) > w * COMMIT_FRACTION || velocity > COMMIT_VELOCITY);

      if (commit) {
        navDirection.set(dir);
        haptics.soft();
        // Leave the page at the drag offset; the iso-layout reset swaps it for
        // the incoming page (which slides in via the route template).
        router.push(target);
      } else {
        // Spring back to rest.
        el.style.transition = SETTLE;
        el.style.transform = 'translateX(0)';
        el.style.willChange = 'auto';
      }
    };

    el.addEventListener('touchstart', onStart, { passive: true });
    el.addEventListener('touchmove', onMove, { passive: false });
    el.addEventListener('touchend', onEnd, { passive: true });
    el.addEventListener('touchcancel', onEnd, { passive: true });
    return () => {
      el.removeEventListener('touchstart', onStart);
      el.removeEventListener('touchmove', onMove);
      el.removeEventListener('touchend', onEnd);
      el.removeEventListener('touchcancel', onEnd);
    };
  }, [router]);

  return (
    <div ref={ref} className="min-h-[70dvh]">
      {children}
    </div>
  );
}

// Bail if the touch started inside a [data-noswipe] region (swipe-to-delete
// rows) or a genuinely horizontally-scrollable element (account strip, etc.).
function shouldSkip(el: Element | null): boolean {
  let node: Element | null = el;
  while (node && node !== document.body) {
    if (node.hasAttribute?.('data-noswipe')) return true;
    if (node.scrollWidth > node.clientWidth + 4) {
      const ox = getComputedStyle(node).overflowX;
      if (ox === 'auto' || ox === 'scroll') return true;
    }
    node = node.parentElement;
  }
  return false;
}
