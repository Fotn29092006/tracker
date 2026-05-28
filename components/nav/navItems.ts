import { LayoutGrid, ListChecks, Wallet, Dumbbell, StickyNote, type LucideIcon } from 'lucide-react';

export type NavItem = { href: string; label: string; icon: LucideIcon };

// Primary destinations shown in the tab bar / sidebar.
// Profile is reached via the avatar in the home header (and sidebar footer).
export const NAV_ITEMS: NavItem[] = [
  { href: '/', label: 'Главная', icon: LayoutGrid },
  { href: '/tasks', label: 'Задачи', icon: ListChecks },
  { href: '/finance', label: 'Финансы', icon: Wallet },
  { href: '/workout', label: 'Тренировки', icon: Dumbbell },
  { href: '/notes', label: 'Заметки', icon: StickyNote },
];

export function isActive(pathname: string, href: string): boolean {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(`${href}/`);
}
