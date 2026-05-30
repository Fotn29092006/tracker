import type { NoteColor } from '@/lib/types';

// Mood palette for notes — soft bg + slightly stronger border, drawn from the
// existing tokens. `dot` is the solid swatch colour used in the picker.
export const NOTE_TONES: Record<NoteColor, { bg: string; border: string; dot: string }> = {
  plain: { bg: 'var(--surface)', border: 'var(--border)', dot: 'var(--text-subtle)' },
  accent: { bg: 'var(--accent-08)', border: 'var(--accent-20)', dot: 'var(--accent)' },
  positive: { bg: 'var(--positive-08)', border: 'var(--positive-16)', dot: 'var(--positive)' },
  warning: { bg: 'var(--warning-12)', border: 'var(--warning-20)', dot: 'var(--warning)' },
};

export const NOTE_COLOR_ORDER: NoteColor[] = ['plain', 'accent', 'positive', 'warning'];
