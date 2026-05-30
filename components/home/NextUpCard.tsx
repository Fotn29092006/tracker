'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ChevronRight, Flag, ListChecks, Dumbbell, Calendar, Sparkles, type LucideIcon } from 'lucide-react';
import { useTasks } from '@/hooks/useTodo';
import { usePlan, useSessions } from '@/hooks/useWorkout';
import { todayISO, isPast, fmtDateLabel } from '@/lib/utils';

// "Что дальше" — one semantic next-action card above the dashboard tiles.
// Priority: overdue → today's tasks → today's workout → upcoming → all-clear.
type Variant = {
  kind: string;
  color: string; // CSS var name incl. leading --
  label: string;
  icon: LucideIcon;
  title: string;
  meta?: string;
  href?: string;
  count?: number;
};

export function NextUpCard() {
  const { data: tasks = [] } = useTasks();
  const { data: plan = [] } = usePlan();
  const { data: sessions = [] } = useSessions();

  const today = todayISO();
  const todayDow = new Date().getDay();

  const v = useMemo<Variant>(() => {
    const overdue = tasks.filter((t) => !t.done_at && t.due_date && isPast(t.due_date));
    const todayTasks = tasks.filter((t) => !t.done_at && t.due_date === today);
    const todayPlan = plan.filter((p) => p.day_of_week === todayDow);
    const doneToday = sessions.some((s) => s.performed_on === today);
    const upcoming = tasks
      .filter((t) => !t.done_at && t.due_date && t.due_date > today)
      .sort((a, b) => a.due_date!.localeCompare(b.due_date!))[0];

    if (overdue.length) {
      return { kind: 'overdue', color: '--negative', label: 'Просрочено', icon: Flag, title: overdue[0].title, meta: fmtDateLabel(overdue[0].due_date!), href: '/tasks', count: overdue.length };
    }
    if (todayTasks.length) {
      return { kind: 'today', color: '--accent', label: 'Сегодня', icon: ListChecks, title: todayTasks[0].title, href: '/tasks', count: todayTasks.length };
    }
    if (todayPlan.length && !doneToday) {
      return { kind: 'workout', color: '--accent', label: 'Тренировка', icon: Dumbbell, title: `${todayPlan.length} упр. на сегодня`, meta: `${todayPlan.reduce((s, p) => s + (p.sets ?? 0), 0)} подходов`, href: '/workout' };
    }
    if (upcoming) {
      return { kind: 'upcoming', color: '--warning', label: 'Скоро', icon: Calendar, title: upcoming.title, meta: fmtDateLabel(upcoming.due_date!), href: '/tasks' };
    }
    return { kind: 'clear', color: '--positive', label: 'Свободно', icon: Sparkles, title: 'На сегодня всё чисто', meta: 'Можно отдыхать или взяться за цели' };
  }, [tasks, plan, sessions, today, todayDow]);

  const Icon = v.icon;
  const inner = (
    <motion.div
      whileTap={v.href ? { scale: 0.985 } : undefined}
      className="relative flex items-center gap-3.5 overflow-hidden rounded-[var(--r-lg)] border border-[var(--border)] bg-[var(--surface)] p-4"
    >
      <span className="absolute left-0 top-3 bottom-3 w-[3px] rounded-full" style={{ background: `var(${v.color})` }} />
      <span
        className="grid h-11 w-11 shrink-0 place-items-center rounded-[12px]"
        style={{ background: `color-mix(in oklab, var(${v.color}) 18%, transparent)`, color: `var(${v.color})` }}
      >
        <Icon size={20} aria-hidden />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <span className="text-[10px] font-semibold uppercase tracking-[0.14em]" style={{ color: `var(${v.color})` }}>
            {v.label}
          </span>
          {v.count && v.count > 1 ? (
            <span className="num text-[10px] text-[var(--text-subtle)]">+{v.count - 1} ещё</span>
          ) : null}
        </div>
        <div className="truncate text-[15px] font-semibold">{v.title}</div>
        {v.meta && <div className="num mt-0.5 text-[11px] text-[var(--text-subtle)]">{v.meta}</div>}
      </div>
      {v.href && <ChevronRight size={18} className="shrink-0 text-[var(--text-subtle)]" />}
    </motion.div>
  );

  return v.href ? <Link href={v.href} aria-label={`${v.label}: ${v.title}`}>{inner}</Link> : inner;
}
