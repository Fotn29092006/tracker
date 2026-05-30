'use client';

import { useEffect, useState } from 'react';
import { Pin, Trash2 } from 'lucide-react';
import { Sheet } from '@/components/ui/Sheet';
import { Input, Textarea } from '@/components/ui/Field';
import { Button } from '@/components/ui/Button';
import { useOverlays } from '@/components/ui/Overlays';
import { useNoteMutations } from '@/hooks/useNotes';
import { cn } from '@/lib/utils';
import { NOTE_TONES, NOTE_COLOR_ORDER } from './noteColors';
import type { Note, NoteColor } from '@/lib/types';

export function NoteForm({ open, onClose, note }: { open: boolean; onClose: () => void; note?: Note | null }) {
  const { add, update, remove } = useNoteMutations();
  const { toast, confirm } = useOverlays();
  const editing = !!note;

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [pinned, setPinned] = useState(false);
  const [color, setColor] = useState<NoteColor>('plain');

  useEffect(() => {
    if (!open) return;
    setTitle(note?.title ?? '');
    setBody(note?.body ?? '');
    setPinned(note?.pinned ?? false);
    setColor(note?.color ?? 'plain');
  }, [open, note]);

  const busy = add.isPending || update.isPending;
  const canSave = !!title.trim() || !!body.trim();

  async function submit() {
    if (!canSave) { onClose(); return; }
    try {
      if (editing && note) {
        await update.mutateAsync({ id: note.id, patch: { title: title.trim() || 'Без названия', body: body || null, pinned, color } });
      } else {
        const id = await add.mutateAsync({ title: title.trim() || 'Без названия', body: body || null, color });
        if (pinned) await update.mutateAsync({ id, patch: { pinned: true } });
      }
      onClose();
    } catch { toast('Не удалось сохранить', 'error'); }
  }

  async function del() {
    if (!note) return;
    const ok = await confirm({ title: 'Удалить заметку?', danger: true, confirmLabel: 'Удалить' });
    if (!ok) return;
    try { await remove.mutateAsync(note.id); onClose(); }
    catch { toast('Не удалось удалить', 'error'); }
  }

  return (
    <Sheet
      open={open} onClose={onClose}
      title={editing ? 'Заметка' : 'Новая заметка'}
      footer={<Button full size="lg" disabled={busy || !canSave} onClick={submit}>Сохранить</Button>}
    >
      <div className="flex items-center gap-2 mb-3">
        <Input autoFocus placeholder="Заголовок" value={title} onChange={(e) => setTitle(e.target.value)} className="text-[17px] font-semibold" />
        <button
          onClick={() => setPinned((p) => !p)}
          className={cn('grid h-11 w-11 shrink-0 place-items-center rounded-[14px] border transition-colors', pinned ? 'bg-[var(--accent-12)] text-[var(--accent)] border-[var(--accent-30)]' : 'text-[var(--text-muted)] border-[var(--border)]')}
          aria-label="Закрепить"
        >
          <Pin size={18} className={pinned ? 'fill-current' : ''} />
        </button>
      </div>
      <Textarea rows={8} placeholder="Текст заметки…" value={body} onChange={(e) => setBody(e.target.value)} />

      <div className="mt-3 flex items-center gap-2">
        <span className="mr-1 text-[13px] text-[var(--text-muted)]">Цвет</span>
        {NOTE_COLOR_ORDER.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setColor(c)}
            aria-label={`Цвет ${c}`}
            className={cn('grid h-8 w-8 place-items-center rounded-full border-2 transition-transform active:scale-90', color === c ? 'border-[var(--text)]' : 'border-transparent')}
          >
            <span
              className="h-5 w-5 rounded-full"
              style={{ background: NOTE_TONES[c].dot, border: c === 'plain' ? '1.5px solid var(--border-strong)' : 'none' }}
            />
          </button>
        ))}
      </div>

      {editing && (
        <button onClick={del} className="mt-3 flex items-center gap-2 text-[14px] text-[var(--negative)] font-medium">
          <Trash2 size={16} /> Удалить
        </button>
      )}
    </Sheet>
  );
}
