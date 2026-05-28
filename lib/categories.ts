import {
  Utensils, Coffee, Car, Home, Phone, HeartPulse, Shirt, Gamepad2,
  Repeat, GraduationCap, Gift, Wallet, Briefcase, Laptop, RotateCcw,
  ShoppingBag, type LucideIcon,
} from 'lucide-react';

export const EXPENSE_CATEGORIES = [
  'Еда', 'Кафе', 'Транспорт', 'Жильё', 'Связь', 'Здоровье',
  'Одежда', 'Покупки', 'Развлечения', 'Подписки', 'Образование', 'Подарки', 'Другое',
] as const;

export const INCOME_CATEGORIES = [
  'Зарплата', 'Фриланс', 'Подарок', 'Возврат', 'Другое',
] as const;

const ICONS: Record<string, LucideIcon> = {
  'Еда': Utensils, 'Кафе': Coffee, 'Транспорт': Car, 'Жильё': Home,
  'Связь': Phone, 'Здоровье': HeartPulse, 'Одежда': Shirt, 'Покупки': ShoppingBag,
  'Развлечения': Gamepad2, 'Подписки': Repeat, 'Образование': GraduationCap, 'Подарки': Gift,
  'Зарплата': Briefcase, 'Фриланс': Laptop, 'Подарок': Gift, 'Возврат': RotateCcw,
};

export function categoryIcon(category: string | null): LucideIcon {
  if (!category) return Wallet;
  return ICONS[category] ?? Wallet;
}

// Distinct preset colours for accounts (Kaspi/Halyk/…).
export const ACCOUNT_COLORS = [
  '#5B8CFF', '#46E0D0', '#FF6B7A', '#FFB454', '#A78BFA', '#34D399', '#F472B6', '#22D3EE',
];
