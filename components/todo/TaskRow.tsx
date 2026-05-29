'use client';

import { memo } from 'react';
import { motion } from 'framer-motion';
import { Bell, CalendarDays, Target } from 'lucide-react';
import { Check } from '@/components/ui/Check';
import { SwipeRow } from '@/components/ui/SwipeRow';
import { listItem } from '@/lib/motion';
import { cn, fmtDateLabel, fmtTime, isPast, todayISO } from '@/lib/utils';
import type { Task } from '@/lib/types';

export const TaskRow = memo(function TaskRow({
  task,
  goalTitle,
  onToggle,
  onEdit,
  onDelete,
}: {
  task: Task;
  goalTitle?: string;
  onToggle: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}) {
  const done = !!task.done_at;
  const overdue = !done && task.due_date && isPast(task.due_date);
  const dueToday = !done && task.due_date === todayISO();

  return (
    <motion.div variants={listItem} layout>
      <SwipeRow onDelete={() => onDelete(task)}>
        <div
          onClick={() => onEdit(task)}
          className="flex items-start gap-3 bg-[var(--surface)] border border-[var(--border)] rounded-[var(--r-lg)] p-3.5 cursor-pointer active:bg-[var(--surface-alt)] transition-colors"
        >
          <div className="pt-0.5">
            <Check checked={done} onChange={() => onToggle(task)} />
          </div>
          <div className="min-w-0 flex-1">
            <p className={cn('text-[15px] leading-snug', done ? 'line-through text-[var(--text-subtle)]' : 'text-[var(--text)]')}>
              {task.title}
            </p>
            {task.note && !done && (
              <p className="mt-0.5 text-[13px] text-[var(--text-muted)] line-clamp-1">{task.note}</p>
            )}
            {(task.due_date || task.reminder_at || goalTitle) && (
              <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
                {task.due_date && (
                  <span className={cn(
                    'inline-flex items-center gap-1 text-[12px] font-medium',
                    overdue ? 'text-[var(--negative)]' : dueToday ? 'text-[var(--accent)]' : 'text-[var(--text-muted)]',
                  )}>
                    <CalendarDays size={13} />
                    {fmtDateLabel(task.due_date)}
                  </span>
                )}
                {task.reminder_at && (
                  <span className="inline-flex items-center gap-1 text-[12px] text-[var(--text-muted)]">
                    <Bell size={13} />
                    {fmtTime(task.reminder_at)}
                  </span>
                )}
                {goalTitle && (
                  <span className="inline-flex items-center gap-1 text-[12px] text-[var(--text-subtle)] truncate max-w-[140px]">
                    <Target size={13} />
                    {goalTitle}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </SwipeRow>
    </motion.div>
  );
});
