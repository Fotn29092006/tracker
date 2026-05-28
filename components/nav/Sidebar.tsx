'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { User } from 'lucide-react';
import { NAV_ITEMS, isActive } from './navItems';
import { spring } from '@/lib/motion';
import { cn } from '@/lib/utils';

// Desktop left rail. Profile lives in the footer.
export function Sidebar({ name }: { name: string }) {
  const pathname = usePathname();
  const items = [...NAV_ITEMS, { href: '/profile', label: 'Профиль', icon: User }];
  return (
    <aside className="hidden lg:flex flex-col w-[248px] shrink-0 border-r border-[var(--border)] bg-[var(--bg-elev)] h-dvh sticky top-0 px-3 py-5">
      <div className="flex items-center gap-2.5 px-3 mb-7">
        <span className="grid h-9 w-9 place-items-end justify-center gap-[3px] rounded-[12px] pb-2" style={{ backgroundImage: 'var(--accent-grad)' }}>
          <span className="flex items-end gap-[2px]">
            <i className="block w-[3px] h-2 rounded-sm bg-[#07101F]" />
            <i className="block w-[3px] h-3 rounded-sm bg-[#07101F]" />
            <i className="block w-[3px] h-4 rounded-sm bg-[#07101F]" />
          </span>
        </span>
        <span className="text-[17px] font-semibold tracking-tight">Трекер</span>
      </div>

      <nav className="flex-1">
        <ul className="space-y-1">
          {items.map((item) => {
            const active = isActive(pathname, item.href);
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'relative flex items-center gap-3 px-3 h-11 rounded-[13px] text-[15px] font-medium transition-colors',
                    active ? 'text-[var(--text)]' : 'text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface-alt)]',
                  )}
                >
                  {active && (
                    <motion.span
                      layoutId="rail-active"
                      transition={spring.tab}
                      className="absolute inset-0 rounded-[13px] bg-[var(--accent-12)] border border-[var(--accent-30)]"
                    />
                  )}
                  <Icon size={20} className={cn('relative', active && 'text-[var(--accent)]')} />
                  <span className="relative">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <Link
        href="/profile"
        className="flex items-center gap-3 px-3 h-12 rounded-[13px] hover:bg-[var(--surface-alt)] transition-colors"
      >
        <span className="grid h-8 w-8 place-items-center rounded-full bg-[var(--surface-raised)] text-[var(--text-muted)] text-[13px] font-semibold">
          {(name || '?').slice(0, 1).toUpperCase()}
        </span>
        <span className="text-[14px] font-medium text-[var(--text)] truncate">{name || 'Профиль'}</span>
      </Link>
    </aside>
  );
}
