'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { StickyNote, Pin, Search } from 'lucide-react';
import { AppHeader } from '@/components/ui/AppHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { listContainer, listItem } from '@/lib/motion';
import { fmtDateLabel } from '@/lib/utils';
import { useNotes } from '@/hooks/useNotes';
import { NoteForm } from './NoteForm';
import { NOTE_TONES } from './noteColors';
import type { Note } from '@/lib/types';

export function NotesScreen() {
  const { data: notes = [], isLoading } = useNotes();
  const [form, setForm] = useState(false);
  const [edit, setEdit] = useState<Note | null>(null);
  const [query, setQuery] = useState('');

  function open(n: Note) { setEdit(n); setForm(true); }

  const q = query.trim().toLowerCase();
  const filtered = useMemo(
    () => (q ? notes.filter((n) => `${n.title} ${n.body ?? ''}`.toLowerCase().includes(q)) : notes),
    [notes, q],
  );
  const pinned = filtered.filter((n) => n.pinned);
  const rest = filtered.filter((n) => !n.pinned);

  return (
    <div>
      <AppHeader title="Заметки" subtitle={notes.length ? `${notes.length}` : undefined} />

      {notes.length > 0 && (
        <div className="relative mb-4">
          <Search size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-subtle)]" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Поиск по заметкам"
            className="w-full rounded-[var(--r-md)] border border-[var(--border)] bg-[var(--input)] py-2.5 pl-10 pr-3.5 text-[15px] outline-none transition-colors focus:border-[var(--accent)]"
          />
        </div>
      )}

      {isLoading && notes.length === 0 ? (
        <div className="grid grid-cols-2 gap-2.5">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="rounded-[var(--r-md)]" style={{ height: 96 + (i % 3) * 28 }} />
          ))}
        </div>
      ) : !isLoading && notes.length === 0 ? (
        <EmptyState
          icon={StickyNote}
          title="Заметок пока нет"
          hint="Быстрые мысли, списки, всё что угодно."
          action={<Button onClick={() => { setEdit(null); setForm(true); }}>Добавить заметку</Button>}
        />
      ) : filtered.length === 0 ? (
        <EmptyState icon={Search} title="Ничего не найдено" hint="Попробуй другой запрос." />
      ) : (
        <div className="space-y-5">
          {pinned.length > 0 && <Section title="Закреплённые" notes={pinned} onOpen={open} />}
          {rest.length > 0 && <Section title={pinned.length > 0 ? 'Все заметки' : undefined} notes={rest} onOpen={open} />}
        </div>
      )}

      <NoteForm open={form} onClose={() => setForm(false)} note={edit} />
    </div>
  );
}

function Section({ title, notes, onOpen }: { title?: string; notes: Note[]; onOpen: (n: Note) => void }) {
  return (
    <div>
      {title && (
        <p className="mb-2 px-1 text-[13px] font-semibold uppercase tracking-wide text-[var(--text-subtle)]">{title}</p>
      )}
      <motion.div variants={listContainer} initial="hidden" animate="show" className="grid grid-cols-2 gap-2.5">
        {notes.map((n) => {
          const tone = NOTE_TONES[n.color] ?? NOTE_TONES.plain;
          return (
            <motion.button
              key={n.id}
              variants={listItem}
              whileTap={{ scale: 0.97 }}
              onClick={() => onOpen(n)}
              className="flex min-h-[96px] flex-col rounded-[var(--r-md)] border p-3.5 text-left"
              style={{ background: tone.bg, borderColor: tone.border }}
            >
              <div className="flex items-start justify-between gap-1">
                <p className="text-[15px] font-semibold leading-snug line-clamp-2">{n.title || 'Без названия'}</p>
                {n.pinned && <Pin size={14} className="mt-0.5 shrink-0 fill-current text-[var(--accent)]" />}
              </div>
              {n.body && (
                <p className="mt-1 flex-1 whitespace-pre-wrap text-[13px] text-[var(--text-muted)] line-clamp-5">{n.body}</p>
              )}
              <p className="mt-2 text-[11px] text-[var(--text-subtle)]">{fmtDateLabel(n.updated_at.slice(0, 10))}</p>
            </motion.button>
          );
        })}
      </motion.div>
    </div>
  );
}
