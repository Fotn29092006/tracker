'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus, Pencil, Trash2, Flag } from 'lucide-react';
import { Sheet } from '@/components/ui/Sheet';
import { Check } from '@/components/ui/Check';
import { ProgressBar } from '@/components/ui/Progress';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Field';
import { useOverlays } from '@/components/ui/Overlays';
import { useTaskMutations, useGoalMutations } from '@/hooks/useTodo';
import { cn, fmtDateLabel } from '@/lib/utils';
import type { GoalWithProgress, Task } from '@/lib/types';

export function GoalDetailSheet({
  goal,
  steps,
  onClose,
  onEdit,
}: {
  goal: GoalWithProgress | null;
  steps: Task[];
  onClose: () => void;
  onEdit: (g: GoalWithProgress) => void;
}) {
  const tasks = useTaskMutations();
  const goals = useGoalMutations();
  const { confirm, toast } = useOverlays();
  const [newStep, setNewStep] = useState('');

  if (!goal) return null;
  const ratio = goal.total ? goal.done / goal.total : 0;

  async function addStep() {
    const title = newStep.trim();
    if (!title || !goal) return;
    try {
      await tasks.add.mutateAsync({ title, goal_id: goal.id });
      setNewStep('');
    } catch { toast('Не удалось добавить', 'error'); }
  }

  async function removeGoal() {
    if (!goal) return;
    const ok = await confirm({
      title: 'Удалить цель?',
      message: 'Шаги этой цели тоже будут удалены.',
      danger: true,
      confirmLabel: 'Удалить',
    });
    if (!ok) return;
    try { await goals.remove.mutateAsync(goal.id); onClose(); }
    catch { toast('Не удалось удалить', 'error'); }
  }

  return (
    <Sheet open={!!goal} onClose={onClose} title="Цель">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-[20px] font-semibold leading-tight">{goal.title}</h3>
          {goal.note && <p className="mt-1 text-[14px] text-[var(--text-muted)]">{goal.note}</p>}
          {goal.target_date && (
            <span className="mt-1.5 inline-flex items-center gap-1 text-[12px] text-[var(--text-muted)]">
              <Flag size={13} /> до {fmtDateLabel(goal.target_date)}
            </span>
          )}
        </div>
        <div className="flex gap-1 shrink-0">
          <button onClick={() => onEdit(goal)} className="grid h-9 w-9 place-items-center rounded-full text-[var(--text-muted)] hover:bg-[var(--surface-alt)]">
            <Pencil size={16} />
          </button>
          <button onClick={removeGoal} className="grid h-9 w-9 place-items-center rounded-full text-[var(--negative)] hover:bg-[var(--negative-16)]">
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <div className="mt-4 mb-5">
        <div className="flex items-center justify-between mb-1.5 text-[13px]">
          <span className="text-[var(--text-muted)]">Прогресс</span>
          <span className="num font-semibold">{goal.done}/{goal.total}</span>
        </div>
        <ProgressBar value={ratio} />
      </div>

      <p className="text-[13px] font-medium text-[var(--text-muted)] mb-2">Шаги</p>
      <div className="space-y-1.5 mb-3">
        <AnimatePresence initial={false}>
          {steps.map((s) => (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 8 }}
              className="flex items-center gap-3 rounded-[var(--r-md)] bg-[var(--surface)] border border-[var(--border)] px-3 py-2.5"
            >
              <Check size={22} checked={!!s.done_at} onChange={() => tasks.toggle.mutate(s)} />
              <span className={cn('flex-1 text-[14px]', s.done_at ? 'line-through text-[var(--text-subtle)]' : 'text-[var(--text)]')}>
                {s.title}
              </span>
              <button onClick={() => tasks.remove.mutate(s.id)} className="text-[var(--text-subtle)] hover:text-[var(--negative)] p-1">
                <Trash2 size={15} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
        {steps.length === 0 && (
          <p className="text-[13px] text-[var(--text-subtle)] py-2">Пока нет шагов. Разбей цель на конкретные действия.</p>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Input
          placeholder="Новый шаг…"
          value={newStep}
          onChange={(e) => setNewStep(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addStep(); } }}
        />
        <Button size="md" disabled={!newStep.trim() || tasks.add.isPending} onClick={addStep} className="shrink-0 !px-3">
          <Plus size={20} />
        </Button>
      </div>
    </Sheet>
  );
}
