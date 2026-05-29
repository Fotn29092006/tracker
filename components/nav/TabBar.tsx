'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { NAV_ITEMS, isActive } from './navItems';
import { haptics } from '@/lib/haptics';
import { spring } from '@/lib/motion';
import { cn } from '@/lib/utils';

// Mobile bottom navigation — glassy bar, animated active dot.
export function TabBar() {
  const pathname = usePathname();
  return (
    <nav
      className="lg:hidden shrink-0 border-t border-[var(--border)] bg-[var(--bg-elev)]"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
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
