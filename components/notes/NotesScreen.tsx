'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { StickyNote, Pin } from 'lucide-react';
import { AppHeader } from '@/components/ui/AppHeader';
import { Fab } from '@/components/ui/Fab';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import { listContainer, listItem } from '@/lib/motion';
import { fmtDateLabel } from '@/lib/utils';
import { useNotes } from '@/hooks/useNotes';
import { NoteForm } from './NoteForm';
import type { Note } from '@/lib/types';

export function NotesScreen() {
  const { data: notes = [], isLoading } = useNotes();
  const [form, setForm] = useState(false);
  const [edit, setEdit] = useState<Note | null>(null);

  function open(n: Note) { setEdit(n); setForm(true); }

  return (
    <div>
      <AppHeader title="Заметки" subtitle={notes.length ? `${notes.length}` : undefined} />

      {!isLoading && notes.length === 0 ? (
        <EmptyState
          icon={StickyNote}
          title="Заметок пока нет"
          hint="Быстрые мысли, списки, всё что угодно."
          action={<Button onClick={() => { setEdit(null); setForm(true); }}>Добавить заметку</Button>}
        />
      ) : (
        <motion.div variants={listContainer} initial="hidden" animate="show" className="grid grid-cols-2 gap-2.5">
          {notes.map((n) => (
            <motion.button
              key={n.id}
              variants={listItem}
              whileTap={{ scale: 0.97 }}
              onClick={() => open(n)}
              className="text-left rounded-[var(--r-md)] bg-[var(--surface)] border border-[var(--border)] p-3.5 min-h-[96px] flex flex-col"
            >
              <div className="flex items-start justify-between gap-1">
                <p className="text-[15px] font-semibold leading-snug line-clamp-2">{n.title || 'Без названия'}</p>
                {n.pinned && <Pin size={14} className="shrink-0 mt-0.5 text-[var(--accent)] fill-current" />}
              </div>
              {n.body && <p className="mt-1 text-[13px] text-[var(--text-muted)] line-clamp-4 flex-1 whitespace-pre-wrap">{n.body}</p>}
              <p className="mt-2 text-[11px] text-[var(--text-subtle)]">{fmtDateLabel(n.updated_at.slice(0, 10))}</p>
            </motion.button>
          ))}
        </motion.div>
      )}

      <Fab onClick={() => { setEdit(null); setForm(true); }} />
      <NoteForm open={form} onClose={() => setForm(false)} note={edit} />
    </div>
  );
}
