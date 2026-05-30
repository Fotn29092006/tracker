'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { User } from 'lucide-react';
import { NAV_ITEMS, isActive } from './navItems';
import { navDirection } from '@/lib/navDirection';
import { haptics } from '@/lib/haptics';

// Floating pill nav (Nocturne+). The active tab expands from a circular icon
// into an icon+label pill; one shared layoutId springs the highlight between
// tabs. Solid --surface-raised background (NO backdrop-filter, per CLAUDE.md).
// position: fixed bottom keeps it pinned to the real screen bottom on iOS
// standalone (see AppShell rationale). Profile is the 6th tab here.
const TAB_ITEMS = [...NAV_ITEMS, { href: '/profile', label: 'Профиль', icon: User }];

export function TabBar() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Основная навигация"
      className="lg:hidden fixed inset-x-3 z-40 mx-auto flex max-w-[460px] items-center justify-between rounded-full border border-[var(--border)] bg-[var(--surface-raised)] p-1.5"
      style={{ bottom: 'calc(14px + var(--sab))', boxShadow: 'var(--shadow-md)' }}
    >
      {TAB_ITEMS.map((item, i) => {
        const active = isActive(pathname, item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-label={item.label}
            aria-current={active ? 'page' : undefined}
            onClick={() => {
              haptics.soft();
              // Slide the next screen in toward the tapped tab.
              const from = TAB_ITEMS.findIndex((t) => isActive(pathname, t.href));
              if (from !== -1 && from !== i) navDirection.set(i > from ? 1 : -1);
            }}
            className="relative flex h-11 min-w-[44px] items-center justify-center rounded-full"
            style={{ flex: active ? '0 1 auto' : '1 1 0' }}
          >
            {active && (
              <motion.span
                layoutId="tabbar-pill"
                transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                className="absolute inset-0 rounded-full"
                style={{ backgroundImage: 'var(--accent-grad)' }}
              />
            )}
            <span
              className="relative z-10 flex items-center gap-1.5 px-3"
              style={{ color: active ? 'var(--on-accent)' : 'var(--text-muted)' }}
            >
              <Icon size={20} aria-hidden />
              {active && (
                <span className="text-[13px] font-semibold whitespace-nowrap">{item.label}</span>
              )}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
