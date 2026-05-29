'use client';

import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ListChecks, Target, ChevronDown, Plus, CalendarDays, Bell } from 'lucide-react';
import { AppHeader } from '@/components/ui/AppHeader';
import { Button } from '@/components/ui/Button';
import { ProgressRing } from '@/components/ui/Progress';
import { SkeletonList } from '@/components/ui/Skeleton';
import { TabPanel } from '@/components/ui/TabPanel';
import { listContainer, listItem } from '@/lib/motion';
import { cn, fmtDateLabel, fmtTime, isPast, todayISO } from '@/lib/utils';
import { useTasks, useGoals, useTaskMutations } from '@/hooks/useTodo';
import { TaskForm } from '@/components/todo/TaskForm';
import { GoalForm } from '@/components/todo/GoalForm';
import { GoalDetailSheet } from '@/components/todo/GoalDetailSheet';
import { Check } from '@/components/ui/Check';
import { SwipeRow } from '@/components/ui/SwipeRow';
import type { Goal, GoalWithProgress, Task } from '@/lib/types';

type Tab = 'tasks' | 'goals';

export default function PrototypeTasksPage() {
  const [tab, setTab] = useState<Tab>('tasks');
  const { data: tasks = [], isLoading } = useTasks();
  const { data: goals = [] } = useGoals();
  const { toggle, remove } = useTaskMutations();

  const [taskForm, setTaskForm] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [goalForm, setGoalForm] = useState(false);
  const [editGoal, setEditGoal] = useState<Goal | null>(null);
  const [openGoalId, setOpenGoalId] = useState<string | null>(null);
  const [showDone, setShowDone] = useState(false);

  const goalTitle = useMemo(() => {
    const m = new Map(goals.map((g) => [g.id, g.title]));
    return (id: string | null) => (id ? m.get(id) : undefined);
  }, [goals]);

  const today = todayISO();
  const groups = useMemo(() => {
    const active = tasks.filter((t) => !t.done_at);
    const byDue = (a: Task, b: Task) =>
      (a.due_date ?? '9999').localeCompare(b.due_date ?? '9999') || a.position - b.position;
    return {
      overdue: active.filter((t) => t.due_date && isPast(t.due_date)).sort(byDue),
      today: active.filter((t) => t.due_date === today).sort(byDue),
      upcoming: active.filter((t) => t.due_date && t.due_date > today).sort(byDue),
      someday: active.filter((t) => !t.due_date).sort(byDue),
      done: tasks.filter((t) => t.done_at).sort((a, b) => (b.done_at ?? '').localeCompare(a.done_at ?? '')),
    };
  }, [tasks, today]);

  const activeCount = groups.overdue.length + groups.today.length + groups.upcoming.length + groups.someday.length;

  function openEditTask(t: Task) { setEditTask(t); setTaskForm(true); }
  function openEditGoal(g: GoalWithProgress) { setOpenGoalId(null); setEditGoal(g); setGoalForm(true); }

  const openGoal = goals.find((g) => g.id === openGoalId) ?? null;
  const openGoalSteps = useMemo(
    () => (openGoalId ? tasks.filter((t) => t.goal_id === openGoalId) : []),
    [tasks, openGoalId],
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <AppHeader
        title="Задачи"
        subtitle={tab === 'tasks' ? `${activeCount} активных` : `${goals.length} целей`}
        right={
          <button
            onClick={() => {
              if (tab === 'tasks') { setEditTask(null); setTaskForm(true); }
              else { setEditGoal(null); setGoalForm(true); }
            }}
            className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-2xl bg-gradient-to-r from-[var(--accent)] to-[var(--accent-cyan)] text-[var(--on-accent)] font-semibold text-sm shadow-md shadow-[var(--accent-glow)]/15 transition-transform hover:scale-105 active:scale-95"
          >
            <Plus size={16} />
            <span>Создать</span>
          </button>
        }
      />

      {/* Styled Segment Control */}
      <div className="relative flex p-1 rounded-2xl bg-[var(--surface-alt)] border border-[var(--border)]">
        {(['tasks', 'goals'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="relative flex-1 py-2 text-center text-sm font-semibold capitalize z-10 transition-colors"
            style={{ color: tab === t ? 'var(--text)' : 'var(--text-subtle)' }}
          >
            {tab === t && (
              <motion.span
                layoutId="active-tab"
                className="absolute inset-0 rounded-xl bg-[var(--surface)] border border-[var(--border-strong)] shadow-sm z-[-1]"
                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
              />
            )}
            {t === 'tasks' ? 'Задачи' : 'Цели'}
          </button>
        ))}
      </div>

      <TabPanel key={tab}>
        {tab === 'tasks' ? (
          <div className="space-y-6">
            {isLoading && tasks.length === 0 ? (
              <SkeletonList rows={5} />
            ) : !isLoading && activeCount === 0 && groups.done.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center p-12 border border-dashed border-[var(--border-strong)] rounded-3xl bg-[var(--surface)]/30">
                <span className="w-12 h-12 rounded-2xl bg-[var(--accent-08)] text-[var(--accent)] flex items-center justify-center mb-4">
                  <ListChecks size={24} />
                </span>
                <h3 className="text-lg font-bold">Список пуст</h3>
                <p className="text-sm text-[var(--text-muted)] max-w-xs mt-1">
                  Запишите, что нужно сделать на сегодня, завтра или когда-нибудь.
                </p>
                <Button 
                  className="mt-5" 
                  onClick={() => { setEditTask(null); setTaskForm(true); }}
                >
                  Добавить первую задачу
                </Button>
              </div>
            ) : (
              <motion.div variants={listContainer} initial="hidden" animate="show" className="space-y-6">
                <PrototypeSection title="Просрочено" tone="negative" tasks={groups.overdue} {...{ goalTitle, toggle, remove, openEditTask }} />
                <PrototypeSection title="Сегодня" tone="accent" tasks={groups.today} {...{ goalTitle, toggle, remove, openEditTask }} />
                <PrototypeSection title="Скоро" tasks={groups.upcoming} {...{ goalTitle, toggle, remove, openEditTask }} />
                <PrototypeSection title="Когда-нибудь" tasks={groups.someday} {...{ goalTitle, toggle, remove, openEditTask }} />

                {groups.done.length > 0 && (
                  <div className="pt-2">
                    <button
                      onClick={() => setShowDone((s) => !s)}
                      className="flex items-center gap-2 text-sm font-semibold text-[var(--text-muted)] hover:text-[var(--text)] transition-colors mb-3 px-1"
                    >
                      <ChevronDown size={16} className={cn('transition-transform duration-300', showDone && 'rotate-180')} />
                      <span>Выполнено ({groups.done.length})</span>
                    </button>
                    <AnimatePresence initial={false}>
                      {showDone && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="space-y-3 overflow-hidden"
                        >
                          {groups.done.slice(0, 30).map((t) => (
                            <PrototypeTaskRow 
                              key={t.id} 
                              task={t} 
                              goalTitle={goalTitle(t.goal_id)} 
                              onToggle={() => toggle.mutate(t)} 
                              onEdit={() => openEditTask(t)} 
                              onDelete={() => remove.mutate(t.id)} 
                            />
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </motion.div>
            )}
          </div>
        ) : (
          <div>
            {goals.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center p-12 border border-dashed border-[var(--border-strong)] rounded-3xl bg-[var(--surface)]/30">
                <span className="w-12 h-12 rounded-2xl bg-[var(--accent-08)] text-[var(--accent)] flex items-center justify-center mb-4">
                  <Target size={24} />
                </span>
                <h3 className="text-lg font-bold">Целей пока нет</h3>
                <p className="text-sm text-[var(--text-muted)] max-w-xs mt-1">
                  Большая цель — это набор шагов, который вы закрываете в несколько заходов.
                </p>
                <Button 
                  className="mt-5" 
                  onClick={() => { setEditGoal(null); setGoalForm(true); }}
                >
                  Создать первую цель
                </Button>
              </div>
            ) : (
              <motion.div variants={listContainer} initial="hidden" animate="show" className="space-y-3.5">
                {goals.map((g) => (
                  <PrototypeGoalCard key={g.id} goal={g} onOpen={() => setOpenGoalId(g.id)} />
                ))}
              </motion.div>
            )}
          </div>
        )}
      </TabPanel>

      <TaskForm open={taskForm} onClose={() => setTaskForm(false)} task={editTask} goals={goals} />
      <GoalForm open={goalForm} onClose={() => setGoalForm(false)} goal={editGoal} />
      <GoalDetailSheet goal={openGoal} steps={openGoalSteps} onClose={() => setOpenGoalId(null)} onEdit={openEditGoal} />
    </div>
  );
}

function PrototypeSection({
  title, tone, tasks, goalTitle, toggle, remove, openEditTask,
}: {
  title: string;
  tone?: 'negative' | 'accent';
  tasks: Task[];
  goalTitle: (id: string | null) => string | undefined;
  toggle: ReturnType<typeof useTaskMutations>['toggle'];
  remove: ReturnType<typeof useTaskMutations>['remove'];
  openEditTask: (t: Task) => void;
}) {
  if (tasks.length === 0) return null;
  return (
    <div className="space-y-3">
      <h2 className={cn(
        'text-xs font-bold uppercase tracking-wider px-1',
        tone === 'negative' ? 'text-[var(--negative)]' : tone === 'accent' ? 'text-[var(--accent)]' : 'text-[var(--text-subtle)]',
      )}>
        {title}
      </h2>
      <div className="space-y-3">
        {tasks.map((t) => (
          <PrototypeTaskRow 
            key={t.id} 
            task={t} 
            goalTitle={goalTitle(t.goal_id)} 
            onToggle={() => toggle.mutate(t)} 
            onEdit={() => openEditTask(t)} 
            onDelete={() => remove.mutate(t.id)} 
          />
        ))}
      </div>
    </div>
  );
}

function PrototypeTaskRow({
  task,
  goalTitle,
  onToggle,
  onEdit,
  onDelete,
}: {
  task: Task;
  goalTitle?: string;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const done = !!task.done_at;
  const overdue = !done && task.due_date && isPast(task.due_date);
  const dueToday = !done && task.due_date === todayISO();

  return (
    <motion.div variants={listItem} layout>
      <SwipeRow onDelete={onDelete}>
        <div
          onClick={onEdit}
          className="group relative flex items-start gap-4 bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--border-strong)] rounded-2xl p-4 cursor-pointer shadow-sm hover:shadow transition-all overflow-hidden"
        >
          <div className="absolute top-0 left-0 bottom-0 w-1 bg-gradient-to-b from-[var(--accent)] to-[var(--accent-cyan)] opacity-0 group-hover:opacity-100 transition-opacity" />
          
          <div className="pt-0.5" onClick={(e) => e.stopPropagation()}>
            <Check checked={done} onChange={onToggle} />
          </div>
          <div className="min-w-0 flex-1">
            <p className={cn(
              'text-[15px] font-medium leading-snug', 
              done ? 'line-through text-[var(--text-subtle)]' : 'text-[var(--text)]'
            )}>
              {task.title}
            </p>
            {task.note && !done && (
              <p className="mt-1 text-[13px] text-[var(--text-muted)] line-clamp-1">{task.note}</p>
            )}
            {(task.due_date || task.reminder_at || goalTitle) && (
              <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1">
                {task.due_date && (
                  <span className={cn(
                    'inline-flex items-center gap-1.5 text-xs font-semibold px-2 py-0.5 rounded-lg',
                    overdue 
                      ? 'text-[var(--negative)] bg-[var(--negative-08)]' 
                      : dueToday 
                        ? 'text-[var(--accent)] bg-[var(--accent-08)]' 
                        : 'text-[var(--text-muted)] bg-[var(--surface-alt)]',
                  )}>
                    <CalendarDays size={12} />
                    {fmtDateLabel(task.due_date)}
                  </span>
                )}
                {task.reminder_at && (
                  <span className="inline-flex items-center gap-1.5 text-xs text-[var(--text-muted)] bg-[var(--surface-alt)] px-2 py-0.5 rounded-lg">
                    <Bell size={12} />
                    {fmtTime(task.reminder_at)}
                  </span>
                )}
                {goalTitle && (
                  <span className="inline-flex items-center gap-1.5 text-xs text-[var(--text-subtle)] truncate max-w-[140px] bg-[var(--surface-alt)] px-2 py-0.5 rounded-lg">
                    <Target size={12} />
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
}

function PrototypeGoalCard({ goal, onOpen }: { goal: GoalWithProgress; onOpen: () => void }) {
  const ratio = goal.total ? goal.done / goal.total : 0;
  const complete = goal.total > 0 && goal.done === goal.total;
  return (
    <motion.div
      variants={listItem}
      whileTap={{ scale: 0.985 }}
      onClick={onOpen}
      className="group relative w-full text-left flex items-center gap-5 rounded-2xl bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--border-strong)] p-5 shadow-sm hover:shadow transition-all cursor-pointer overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--accent-glow)]/5 rounded-full blur-3xl -mr-10 -mt-10 opacity-0 group-hover:opacity-100 transition-opacity" />

      <ProgressRing value={ratio} size={56} stroke={5.5}>
        <span className="num text-[13px] font-bold">{Math.round(ratio * 100)}</span>
      </ProgressRing>
      <div className="min-w-0 flex-1">
        <p className="text-[16px] font-bold leading-tight truncate group-hover:text-[var(--accent)] transition-colors">{goal.title}</p>
        <p className="mt-1 text-[13px] text-[var(--text-muted)] font-medium">
          {goal.total === 0 ? 'Нет шагов' : `${goal.done} из ${goal.total} шагов`}
          {goal.target_date && ` · до ${fmtDateLabel(goal.target_date)}`}
        </p>
      </div>
      {complete ? (
        <span className="text-[var(--positive)] text-[12px] font-bold uppercase tracking-wider bg-[var(--positive-08)] border border-[var(--positive-16)] px-2.5 py-1 rounded-lg shrink-0">
          Готово
        </span>
      ) : (
        <ChevronDown size={18} className="text-[var(--text-subtle)] group-hover:translate-x-1 transition-transform -rotate-90" />
      )}
    </motion.div>
  );
}
