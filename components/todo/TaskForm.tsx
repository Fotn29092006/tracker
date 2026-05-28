'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Sheet } from '@/components/ui/Sheet';
import { Field, Input, Textarea, Label } from '@/components/ui/Field';
import { Button } from '@/components/ui/Button';
import { Switch } from '@/components/ui/Switch';
import { DateField } from '@/components/ui/DateField';
import { Chip } from '@/components/ui/Pill';
import { useTaskMutations } from '@/hooks/useTodo';
import { useOverlays } from '@/components/ui/Overlays';
import { requestNotificationPermission } from '@/lib/notify';
import type { Task, GoalWithProgress } from '@/lib/types';

function localDatetimeValue(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function TaskForm({
  open,
  onClose,
  task,
  defaultGoalId,
  goals = [],
}: {
  open: boolean;
  onClose: () => void;
  task?: Task | null;
  defaultGoalId?: string | null;
  goals?: GoalWithProgress[];
}) {
  const { add, update } = useTaskMutations();
  const { toast } = useOverlays();
  const editing = !!task;

  const [title, setTitle] = useState('');
  const [note, setNote] = useState('');
  const [due, setDue] = useState<string | null>(null);
  const [reminderOn, setReminderOn] = useState(false);
  const [reminderAt, setReminderAt] = useState('');
  const [goalId, setGoalId] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setTitle(task?.title ?? '');
    setNote(task?.note ?? '');
    setDue(task?.due_date ?? (task ? null : null));
    setReminderOn(!!task?.reminder_at);
    setReminderAt(localDatetimeValue(task?.reminder_at ?? null));
    setGoalId(task?.goal_id ?? defaultGoalId ?? null);
  }, [open, task, defaultGoalId]);

  const busy = add.isPending || update.isPending;

  async function submit() {
    if (!title.trim()) return;
    const reminder_at = reminderOn && reminderAt ? new Date(reminderAt).toISOString() : null;
    try {
      if (editing && task) {
        await update.mutateAsync({
          id: task.id,
          patch: { title: title.trim(), note: note || null, due_date: due, reminder_at, goal_id: goalId },
        });
      } else {
        await add.mutateAsync({ title, note: note || null, due_date: due, reminder_at, goal_id: goalId });
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
      title={editing ? 'Задача' : 'Новая задача'}
      footer={
        <Button full size="lg" disabled={busy || !title.trim()} onClick={submit}>
          {editing ? 'Сохранить' : 'Добавить'}
        </Button>
      }
    >
      <Field>
        <Input
          autoFocus
          placeholder="Что нужно сделать?"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit(); } }}
        />
      </Field>

      <Field label="Заметка">
        <Textarea rows={2} placeholder="Детали (необязательно)" value={note} onChange={(e) => setNote(e.target.value)} />
      </Field>

      <div className="mb-3.5">
        <Label>Срок</Label>
        <DateField value={due} onChange={setDue} />
      </div>

      <div className="mb-3.5 flex items-center justify-between">
        <Label>Напомнить</Label>
        <Switch checked={reminderOn} onChange={(v) => {
          setReminderOn(v);
          if (v) {
            requestNotificationPermission();
            if (!reminderAt) {
              const base = due ? new Date(`${due}T09:00`) : new Date(Date.now() + 60 * 60 * 1000);
              setReminderAt(localDatetimeValue(base.toISOString()));
            }
          }
        }} />
      </div>
      <AnimatePresence initial={false}>
        {reminderOn && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-3.5 overflow-hidden"
          >
            <input
              type="datetime-local"
              value={reminderAt}
              onChange={(e) => setReminderAt(e.target.value)}
              className="w-full rounded-[12px] bg-[var(--input)] border border-[var(--border)] px-3.5 py-2.5 text-[15px] outline-none focus:border-[var(--accent)]"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {goals.length > 0 && (
        <div className="mb-2">
          <Label>Цель</Label>
          <div className="flex flex-wrap gap-2">
            <Chip active={goalId === null} onClick={() => setGoalId(null)}>Без цели</Chip>
            {goals.map((g) => (
              <Chip key={g.id} active={goalId === g.id} onClick={() => setGoalId(g.id)}>{g.title}</Chip>
            ))}
          </div>
        </div>
      )}
    </Sheet>
  );
}
