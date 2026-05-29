'use client';

import { useEffect, useState } from 'react';
import { ListChecks, SlidersHorizontal } from 'lucide-react';
import { Sheet } from '@/components/ui/Sheet';
import { Input } from '@/components/ui/Field';
import { Button } from '@/components/ui/Button';
import { useOverlays } from '@/components/ui/Overlays';
import { useTaskMutations } from '@/hooks/useTodo';
import { parseQuickTask } from '@/lib/parseQuickTask';
import { fmtDateLabel, todayISO } from '@/lib/utils';

const CHIPS = ['сегодня', 'завтра', 'на неделе', '🔥 срочно', '#работа'];

// Smart bottom-sheet for quick task entry. Built on our Sheet (drag-dismiss +
// focus trap + safe area). Parses date/time/#tag/🔥 from the text live; tag and
// priority — for which the tasks table has no columns — are folded into `note`.
export function TaskQuickAdd({
  open,
  onClose,
  onAdvanced,
}: {
  open: boolean;
  onClose: () => void;
  onAdvanced?: () => void;
}) {
  const [text, setText] = useState('');
  const { add } = useTaskMutations();
  const { toast } = useOverlays();

  useEffect(() => { if (open) setText(''); }, [open]);

  const parsed = parseQuickTask(text);
  const pills = [
    parsed.due && `📅 ${fmtDateLabel(parsed.due)}`,
    parsed.time && `⏰ ${parsed.time}`,
    parsed.tag && `# ${parsed.tag}`,
    parsed.priority === 'high' && '🔥 срочно',
  ].filter(Boolean) as string[];

  async function save() {
    if (!parsed.cleanTitle) return;
    const note =
      [parsed.tag && `#${parsed.tag}`, parsed.priority === 'high' && '🔥 срочно']
        .filter(Boolean)
        .join(' ') || null;
    const reminder_at = parsed.time
      ? new Date(`${parsed.due ?? todayISO()}T${parsed.time}`).toISOString()
      : null;
    try {
      await add.mutateAsync({ title: parsed.cleanTitle, note, due_date: parsed.due ?? null, reminder_at });
      onClose();
    } catch {
      toast('Не удалось сохранить', 'error');
    }
  }

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Новая задача"
      footer={
        <div className="flex gap-2">
          <Button variant="secondary" aria-label="Расширенно" onClick={() => { onClose(); onAdvanced?.(); }}>
            <SlidersHorizontal size={18} />
          </Button>
          <Button full size="lg" disabled={!parsed.cleanTitle || add.isPending} onClick={save}>
            Сохранить
          </Button>
        </div>
      }
    >
      <div className="mb-3 flex items-center gap-2.5">
        <span className="grid h-9 w-9 place-items-center rounded-[12px] bg-[var(--accent-12)] text-[var(--accent)]">
          <ListChecks size={18} />
        </span>
        <span className="text-[11px] uppercase tracking-[0.12em] text-[var(--text-subtle)]">смарт-ввод</span>
      </div>

      <Input
        autoFocus
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); save(); } }}
        placeholder="напр. позвонить маме завтра в 18:00 #семья"
      />

      {pills.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {pills.map((h) => (
            <span key={h} className="rounded-full bg-[var(--accent-12)] px-2.5 py-0.5 text-[11px] font-semibold text-[var(--accent)]">
              {h}
            </span>
          ))}
        </div>
      )}

      <div className="mt-3 flex flex-wrap gap-1.5">
        {CHIPS.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setText((t) => `${t} ${c}`.trim())}
            className="rounded-full border border-[var(--border)] bg-[var(--surface-alt)] px-3 py-1.5 text-[12px] text-[var(--text-muted)] active:scale-95 transition-transform"
          >
            {c}
          </button>
        ))}
      </div>
    </Sheet>
  );
}
