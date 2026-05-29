'use client';

import { useCallback, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ListChecks, Target, ChevronDown } from 'lucide-react';
import { AppHeader } from '@/components/ui/AppHeader';
import { Segmented } from '@/components/ui/Segmented';
import { Fab } from '@/components/ui/Fab';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import { ProgressRing } from '@/components/ui/Progress';
import { SkeletonList } from '@/components/ui/Skeleton';
import { TabPanel } from '@/components/ui/TabPanel';
import { listContainer } from '@/lib/motion';
import { cn, fmtDateLabel, isPast, todayISO } from '@/lib/utils';
import { useTasks, useGoals, useTaskMutations } from '@/hooks/useTodo';
import { TaskRow } from './TaskRow';
import { TaskForm } from './TaskForm';
import { GoalForm } from './GoalForm';
import { GoalDetailSheet } from './GoalDetailSheet';
import type { Goal, GoalWithProgress, Task } from '@/lib/types';

type Tab = 'tasks' | 'goals';

export function TasksScreen() {
  const [tab, setTab] = useState<Tab>('tasks');
  const { data: tasks = [], isLoading } = useTasks();
  const { data: goals = [] } = useGoals();
  const { toggle, remove } = useTaskMutations();
  const toggleMutate = toggle.mutate;
  const removeMutate = remove.mutate;

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

  const openEditTask = useCallback((t: Task) => { setEditTask(t); setTaskForm(true); }, []);
  const handleToggle = useCallback((t: Task) => toggleMutate(t), [toggleMutate]);
  const handleDelete = useCallback((t: Task) => removeMutate(t.id), [removeMutate]);
  function openEditGoal(g: GoalWithProgress) { setOpenGoalId(null); setEditGoal(g); setGoalForm(true); }

  const openGoal = goals.find((g) => g.id === openGoalId) ?? null;
  const openGoalSteps = useMemo(
    () => (openGoalId ? tasks.filter((t) => t.goal_id === openGoalId) : []),
    [tasks, openGoalId],
  );

  return (
    <div>
      <AppHeader
        title="Задачи"
        subtitle={tab === 'tasks' ? `${activeCount} активных` : `${goals.length} целей`}
      />

      <Segmented<Tab>
        id="tasks-tab"
        className="mb-5"
        value={tab}
        onChange={setTab}
        options={[{ value: 'tasks', label: 'Задачи' }, { value: 'goals', label: 'Цели' }]}
      />

      <TabPanel key={tab}>
        {tab === 'tasks' ? (
          <div>
            {isLoading && tasks.length === 0 ? (
              <SkeletonList rows={5} />
            ) : !isLoading && activeCount === 0 && groups.done.length === 0 ? (
              <EmptyState
                icon={ListChecks}
                title="Задач пока нет"
                hint="Запиши, что нужно сделать — на сегодня, завтра или когда-нибудь."
                action={<Button onClick={() => { setEditTask(null); setTaskForm(true); }}>Добавить задачу</Button>}
              />
            ) : (
              <motion.div variants={listContainer} initial="hidden" animate="show" className="space-y-6">
                <Section title="Просрочено" tone="negative" tasks={groups.overdue} goalTitle={goalTitle} onToggle={handleToggle} onEdit={openEditTask} onDelete={handleDelete} />
                <Section title="Сегодня" tone="accent" tasks={groups.today} goalTitle={goalTitle} onToggle={handleToggle} onEdit={openEditTask} onDelete={handleDelete} />
                <Section title="Скоро" tasks={groups.upcoming} goalTitle={goalTitle} onToggle={handleToggle} onEdit={openEditTask} onDelete={handleDelete} />
                <Section title="Когда-нибудь" tasks={groups.someday} goalTitle={goalTitle} onToggle={handleToggle} onEdit={openEditTask} onDelete={handleDelete} />

                {groups.done.length > 0 && (
                  <div>
                    <button
                      onClick={() => setShowDone((s) => !s)}
                      className="flex items-center gap-1.5 text-[13px] font-medium text-[var(--text-muted)] mb-2"
                    >
                      <ChevronDown size={15} className={cn('transition-transform', showDone && 'rotate-180')} />
                      Выполнено · {groups.done.length}
                    </button>
                    <AnimatePresence initial={false}>
                      {showDone && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="space-y-2 overflow-hidden"
                        >
                          {groups.done.slice(0, 30).map((t) => (
                            <TaskRow key={t.id} task={t} goalTitle={goalTitle(t.goal_id)} onToggle={handleToggle} onEdit={openEditTask} onDelete={handleDelete} />
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
              <EmptyState
                icon={Target}
                title="Целей пока нет"
                hint="Большая цель — это набор шагов, который ты закрываешь в несколько заходов."
                action={<Button onClick={() => { setEditGoal(null); setGoalForm(true); }}>Создать цель</Button>}
              />
            ) : (
              <motion.div variants={listContainer} initial="hidden" animate="show" className="space-y-2.5">
                {goals.map((g) => (
                  <GoalCard key={g.id} goal={g} onOpen={() => setOpenGoalId(g.id)} />
                ))}
              </motion.div>
            )}
          </div>
        )}
      </TabPanel>

      <Fab onClick={() => {
        if (tab === 'tasks') { setEditTask(null); setTaskForm(true); }
        else { setEditGoal(null); setGoalForm(true); }
      }} />

      <TaskForm open={taskForm} onClose={() => setTaskForm(false)} task={editTask} goals={goals} />
      <GoalForm open={goalForm} onClose={() => setGoalForm(false)} goal={editGoal} />
      <GoalDetailSheet goal={openGoal} steps={openGoalSteps} onClose={() => setOpenGoalId(null)} onEdit={openEditGoal} />
    </div>
  );
}

function Section({
  title, tone, tasks, goalTitle, onToggle, onEdit, onDelete,
}: {
  title: string;
  tone?: 'negative' | 'accent';
  tasks: Task[];
  goalTitle: (id: string | null) => string | undefined;
  onToggle: (t: Task) => void;
  onEdit: (t: Task) => void;
  onDelete: (t: Task) => void;
}) {
  if (tasks.length === 0) return null;
  return (
    <div>
      <h2 className={cn(
        'text-[13px] font-semibold uppercase tracking-wide mb-2 px-1',
        tone === 'negative' ? 'text-[var(--negative)]' : tone === 'accent' ? 'text-[var(--accent)]' : 'text-[var(--text-subtle)]',
      )}>
        {title}
      </h2>
      <div className="space-y-2">
        {tasks.map((t) => (
          <TaskRow key={t.id} task={t} goalTitle={goalTitle(t.goal_id)} onToggle={onToggle} onEdit={onEdit} onDelete={onDelete} />
        ))}
      </div>
    </div>
  );
}

function GoalCard({ goal, onOpen }: { goal: GoalWithProgress; onOpen: () => void }) {
  const ratio = goal.total ? goal.done / goal.total : 0;
  const complete = goal.total > 0 && goal.done === goal.total;
  return (
    <motion.button
      variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}
      whileTap={{ scale: 0.985 }}
      onClick={onOpen}
      className="w-full text-left flex items-center gap-4 rounded-[var(--r-lg)] bg-[var(--surface)] border border-[var(--border)] p-4"
    >
      <ProgressRing value={ratio} size={52} stroke={5}>
        <span className="num text-[12px] font-semibold">{Math.round(ratio * 100)}</span>
      </ProgressRing>
      <div className="min-w-0 flex-1">
        <p className="text-[16px] font-semibold leading-tight truncate">{goal.title}</p>
        <p className="mt-0.5 text-[13px] text-[var(--text-muted)]">
          {goal.total === 0 ? 'Нет шагов' : `${goal.done} из ${goal.total} шагов`}
          {goal.target_date && ` · до ${fmtDateLabel(goal.target_date)}`}
        </p>
      </div>
      {complete && <span className="text-[var(--positive)] text-[13px] font-semibold shrink-0">Готово</span>}
    </motion.button>
  );
}
