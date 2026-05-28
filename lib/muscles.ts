import type { MuscleId } from './types';

export const MUSCLE_LABELS: Record<MuscleId, string> = {
  chest: 'Грудь',
  shoulders_front: 'Передние дельты',
  shoulders_rear: 'Задние дельты',
  biceps: 'Бицепс',
  triceps: 'Трицепс',
  forearms: 'Предплечья',
  traps: 'Трапеции',
  lats: 'Широчайшие',
  lower_back: 'Поясница',
  abs: 'Пресс',
  obliques: 'Косые',
  glutes: 'Ягодицы',
  quads: 'Квадрицепс',
  hamstrings: 'Бицепс бедра',
  calves: 'Икры',
};

// Weekly effective-set target per muscle that reads as "well trained".
export const WEEKLY_TARGET = 12;
