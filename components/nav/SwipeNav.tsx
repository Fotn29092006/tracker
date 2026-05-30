'use client';

import { useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { NAV_ITEMS } from './navItems';
import { navDirection } from '@/lib/navDirection';
import { haptics } from '@/lib/haptics';

// Horizontal swipe to move between the main tabs (like a native pager). The five
// primary destinations only — Profile is reached via its avatar, not the swipe.
const ORDER = NAV_ITEMS.map((n) => n.href);

// A gesture is a tab-swipe only if it's a fast, clearly-horizontal flick that
// did NOT start inside something that owns horizontal gestures (a horizontally
// scrollable strip, or a row marked [data-noswipe] like swipe-to-delete).
const MIN_DX = 70;
const H_RATIO = 1.7;
const MAX_MS = 700;

export function SwipeNav({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const start = useRef<{ x: number; y: number; t: number; skip: boolean } | null>(null);

  function onTouchStart(e: React.TouchEvent) {
    if (e.touches.length !== 1) { start.current = null; return; }
    const t = e.touches[0];
    start.current = { x: t.clientX, y: t.clientY, t: Date.now(), skip: shouldSkip(e.target as Element | null) };
  }

  function onTouchEnd(e: React.TouchEvent) {
    const s = start.current;
    start.current = null;
    if (!s || s.skip) return;
    const idx = ORDER.indexOf(pathname);
    if (idx === -1) return; // not on a swipeable tab (e.g. /profile)

    const t = e.changedTouches[0];
    const dx = t.clientX - s.x;
    const dy = t.clientY - s.y;
    if (Math.abs(dx) < MIN_DX) return;
    if (Math.abs(dx) < Math.abs(dy) * H_RATIO) return; // too vertical → it's a scroll
    if (Date.now() - s.t > MAX_MS) return; // too slow → not a flick

    const step = dx < 0 ? 1 : -1; // swipe left → next tab
    const next = ORDER[idx + step];
    if (!next) return;

    navDirection.set(step);
    haptics.soft();
    router.push(next);
  }

  return (
    <div onTouchStart={onTouchStart} onTouchEnd={onTouchEnd} className="min-h-[70dvh]">
      {children}
    </div>
  );
}

// Walk up from the touch target: bail if inside a [data-noswipe] region or a
// genuinely horizontally-scrollable element (so those keep their own gesture).
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
