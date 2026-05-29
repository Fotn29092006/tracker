'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { NAV_ITEMS, isActive } from './navItems';
import { haptics } from '@/lib/haptics';
import { spring } from '@/lib/motion';
import { cn } from '@/lib/utils';

// Mobile bottom navigation — animated active dot.
// Background is var(--bg) (NOT --bg-elev) ON PURPOSE: on iOS the standalone
// web view is ~62px shorter than the screen (innerHeight 894 vs 956), and that
// strip below the web view is painted by <meta theme-color>, which we keep at
// var(--bg). Matching the bar to --bg makes that strip blend into the bar — no
// visible seam/gap. A lighter --bg-elev bar would re-expose the seam. The top
// hairline keeps the bar visually distinct from the scrolling content.
export function TabBar() {
  const pathname = usePathname();
  return (
    <nav
      className="lg:hidden shrink-0 border-t border-[var(--border)] bg-[var(--bg)]"
      style={{ paddingBottom: 'var(--sab)' }}
    >
      <ul className="flex items-stretch h-[58px] max-w-[560px] mx-auto">
        {NAV_ITEMS.map((item) => {
          const active = isActive(pathname, item.href);
          const Icon = item.icon;
          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                onClick={() => haptics.soft()}
                className="relative h-full flex flex-col items-center justify-center gap-1"
              >
                <span className="relative">
                  {active && (
                    <motion.span
                      layoutId="tab-glow"
                      transition={spring.tab}
                      className="absolute -inset-x-3 -inset-y-2 rounded-full bg-[var(--accent-12)]"
                    />
                  )}
                  <Icon
                    size={23}
                    strokeWidth={active ? 2.4 : 2}
                    className={cn('relative transition-colors', active ? 'text-[var(--accent)]' : 'text-[var(--text-subtle)]')}
                  />
                </span>
                <span className={cn('text-[10.5px] font-medium transition-colors', active ? 'text-[var(--accent)]' : 'text-[var(--text-subtle)]')}>
                  {item.label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
