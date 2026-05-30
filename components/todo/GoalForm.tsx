'use client';

import { useEffect, useState } from 'react';
import { Sheet } from '@/components/ui/Sheet';
import { Field, Input, Textarea, Label } from '@/components/ui/Field';
import { Button } from '@/components/ui/Button';
import { DateField } from '@/components/ui/DateField';
import { useGoalMutations } from '@/hooks/useTodo';
import { useOverlays } from '@/components/ui/Overlays';
import type { Goal } from '@/lib/types';

export function GoalForm({
  open,
  onClose,
  goal,
}: {
  open: boolean;
  onClose: () => void;
  goal?: Goal | null;
}) {
  const { add, update } = useGoalMutations();
  const { toast } = useOverlays();
  const editing = !!goal;

  const [title, setTitle] = useState('');
  const [note, setNote] = useState('');
  const [target, setTarget] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setTitle(goal?.title ?? '');
    setNote(goal?.note ?? '');
    setTarget(goal?.target_date ?? null);
  }, [open, goal]);

  const busy = add.isPending || update.isPending;

  async function submit() {
    if (!title.trim()) return;
    try {
      if (editing && goal) {
        await update.mutateAsync({ id: goal.id, patch: { title: title.trim(), note: note || null, target_date: target } });
      } else {
        await add.mutateAsync({ title, note: note || null, target_date: target });
      }
      onClose();
    } catch {
      toast('Не удалось сохранить', 'error');
    }
  }

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={editing ? 'Цель' : 'Новая цель'}
      footer={<Button full size="lg" disabled={busy || !title.trim()} onClick={submit}>{editing ? 'Сохранить' : 'Создать'}</Button>}
    >
      <Field>
        <Input
          autoFocus placeholder="Например: выучить английский" value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); submit(); } }}
        />
      </Field>
      <Field label="Описание">
        <Textarea rows={2} placeholder="Зачем эта цель (необязательно)" value={note} onChange={(e) => setNote(e.target.value)} />
      </Field>
      <div>
        <Label>Дедлайн</Label>
        <DateField value={target} onChange={setTarget} />
      </div>
    </Sheet>
  );
}
