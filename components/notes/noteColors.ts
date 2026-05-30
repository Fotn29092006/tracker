import type { NoteColor } from '@/lib/types';

// Mood palette for notes — soft bg + slightly stronger border, drawn from the
// existing tokens. `dot` is the solid swatch colour used in the picker.
export const NOTE_TONES: Record<NoteColor, { bg: string; border: string; dot: string }> = {
  plain: { bg: 'var(--surface)', border: 'var(--border)', dot: 'var(--text-subtle)' },
  accent: { bg: 'var(--accent-08)', border: 'var(--accent-20)', dot: 'var(--accent)' },
  positive: { bg: 'rgba(63,211,126,0.08)', border: 'rgba(63,211,126,0.22)', dot: 'var(--positive)' },
  warning: { bg: 'rgba(255,180,84,0.08)', border: 'rgba(255,180,84,0.22)', dot: 'var(--warning)' },
};

export const NOTE_COLOR_ORDER: NoteColor[] = ['plain', 'accent', 'positive', 'warning'];
