'use client';

import { useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus, Minus, Trash2, Check, Camera, RotateCcw } from 'lucide-react';
import { AppHeader } from '@/components/ui/AppHeader';
import { Segmented } from '@/components/ui/Segmented';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/Progress';
import { TabPanel } from '@/components/ui/TabPanel';
import { Skeleton } from '@/components/ui/Skeleton';
import { useOverlays } from '@/components/ui/Overlays';
import { haptics } from '@/lib/haptics';
import { todayISO, addDaysISO, WEEKDAYS_FULL, WEEK_ORDER, fmtDateLabel } from '@/lib/utils';
import { MUSCLE_LABELS, WEEKLY_TARGET } from '@/lib/muscles';
import {
  useExercises, usePlan, useSessions, useMuscleVolume, useWorkoutMutations,
} from '@/hooks/useWorkout';
import { ExercisePicker } from './ExercisePicker';
import { BodyEntryForm } from '@/components/body/BodyEntryForm';
import type { Exercise, MuscleId, PlanExercise } from '@/lib/types';

// The muscle-map SVG (~120 path strings) is a heavy client-only leaf behind the
// "Обзор" tab — split it out of the first-load bundle. The skeleton reserves its
// height so there is no layout shift.
const BodyFigure = dynamic(() => import('./BodyFigure').then((m) => m.BodyFigure), {
  ssr: false,
  loading: () => <Skeleton className="rounded-[var(--r-xl)]" style={{ height: 420 }} />,
});

type Tab = 'overview' | 'plan';

export function WorkoutScreen() {
  const { data: exercises = [], isLoading: exLoading } = useExercises();
  const { data: plan = [], isLoading: planLoading } = usePlan();
  const { data: sessions = [], isLoading: sessionsLoading } = useSessions();
  const volume = useMuscleVolume(7);
  const { addPlanExercise, updatePlanExercise, removePlanExercise, completeDay, removeSession } = useWorkoutMutations();
  const { toast, confirm } = useOverlays();

  const [tab, setTab] = useState<Tab>('overview');
  const [view, setView] = useState<'front' | 'back'>('front');
  const [muscle, setMuscle] = useState<MuscleId | null>(null);
  const [pickerDay, setPickerDay] = useState<number | null>(null);
  const [bodyForm, setBodyForm] = useState(false);

  const exMap = useMemo(() => new Map(exercises.map((e) => [e.id, e])), [exercises]);
  const today = todayISO();
  const todayDow = new Date().getDay();
  const todayPlan = useMemo(() => plan.filter((p) => p.day_of_week === todayDow), [plan, todayDow]);
  const doneToday = sessions.some((s) => s.performed_on === today);
  const weekCount = useMemo(() => {
    const since = addDaysISO(-6);
    return sessions.filter((s) => s.performed_on >= since).length;
  }, [sessions]);

  async function onComplete() {
    if (doneToday) return;
    haptics.success();
    try {
      await completeDay.mutateAsync({ day_of_week: todayDow, date: today, planItems: todayPlan });
      toast('Тренировка засчитана 💪', 'success');
    } catch {
      toast('Не удалось сохранить', 'error');
    }
  }

  async function onUndo() {
    const s = sessions.find((x) => x.performed_on === today);
    if (!s) return;
    const ok = await confirm({ title: 'Отменить тренировку?', message: 'Сегодняшняя запись удалится.', danger: true, confirmLabel: 'Отменить' });
    if (!ok) return;
    try { await removeSession.mutateAsync(s.id); }
    catch { toast('Не удалось отменить', 'error'); }
  }

  function onPick(ex: Exercise) {
    if (pickerDay === null) return;
    const count = plan.filter((p) => p.day_of_week === pickerDay).length;
    addPlanExercise.mutate({ day_of_week: pickerDay, exercise_id: ex.id, sets: 3, reps: 10, position: count });
  }

  const firstLoad = (exLoading || planLoading || sessionsLoading)
    && exercises.length === 0 && plan.length === 0 && sessions.length === 0;

  if (firstLoad) {
    return (
      <div>
        <AppHeader title="Тренировки" />
        <Skeleton className="mb-5" style={{ height: 44 }} />
        <Skeleton className="rounded-[var(--r-xl)] mb-4" style={{ height: 180 }} />
        <Skeleton className="rounded-[var(--r-xl)]" style={{ height: 420 }} />
      </div>
    );
  }

  return (
    <div>
      <AppHeader title="Тренировки" subtitle={`${weekCount} за неделю`} right={
        <button onClick={() => setBodyForm(true)} className="grid h-10 w-10 place-items-center rounded-full bg-[var(--surface-alt)] text-[var(--text-muted)]" aria-label="Вес и фото">
          <Camera size={18} />
        </button>
      } />

      <Segmented<Tab>
        id="wk-tab" className="mb-5" value={tab} onChange={setTab}
        options={[{ value: 'overview', label: 'Обзор' }, { value: 'plan', label: 'План' }]}
      />

      <TabPanel key={tab} className="space-y-4">
        {tab === 'overview' ? (
          <>
            {/* Today */}
            <div className="rounded-[var(--r-xl)] border border-[var(--border)] bg-[var(--surface)] p-5">
              <div className="flex items-center justify-between mb-1">
                <p className="text-[13px] text-[var(--text-muted)]">Сегодня · {WEEKDAYS_FULL[todayDow]}</p>
                {doneToday && (
                  <button onClick={onUndo} className="inline-flex items-center gap-1 text-[12px] text-[var(--text-subtle)]"><RotateCcw size={13} /> отменить</button>
                )}
              </div>

              {todayPlan.length === 0 ? (
                <div className="py-4">
                  <p className="text-[17px] font-semibold">День отдыха</p>
                  <p className="text-[14px] text-[var(--text-muted)] mt-0.5">На этот день нет упражнений. Добавь их во вкладке «План».</p>
                </div>
              ) : (
                <>
                  <div className="space-y-1.5 my-3">
                    {todayPlan.map((p) => (
                      <div key={p.id} className="flex items-center justify-between">
                        <span className="text-[15px]">{exMap.get(p.exercise_id)?.name ?? '—'}</span>
                        <span className="num text-[13px] text-[var(--text-muted)]">{p.sets}×{p.reps}</span>
                      </div>
                    ))}
                  </div>
                  {doneToday ? (
                    <div className="flex items-center justify-center gap-2 h-[52px] rounded-[16px] bg-[var(--positive-16)] text-[var(--positive)] font-semibold">
                      <Check size={20} /> Выполнено
                    </div>
                  ) : (
                    <Button full size="lg" onClick={onComplete} disabled={completeDay.isPending}>Готово</Button>
                  )}
                </>
              )}
            </div>

            {/* Body figure */}
            <div className="rounded-[var(--r-xl)] border border-[var(--border)] bg-[var(--surface)] p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[15px] font-semibold">Нагрузка за 7 дней</p>
                <Segmented
                  id="wk-view" className="w-[150px]" value={view} onChange={setView}
                  options={[{ value: 'front', label: 'Спереди' }, { value: 'back', label: 'Сзади' }]}
                />
              </div>
              <BodyFigure view={view} volume={volume} selected={muscle} onSelect={setMuscle} />

              <AnimatePresence>
                {muscle ? (
                  <motion.div
                    key={muscle}
                    initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                    className="mt-3 rounded-[14px] bg-[var(--surface-alt)] p-3.5"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[15px] font-semibold">{MUSCLE_LABELS[muscle]}</span>
                      <span className="num text-[13px] text-[var(--text-muted)]">
                        {(volume[muscle] ?? 0).toFixed(1)} / {WEEKLY_TARGET} подх.
                      </span>
                    </div>
                    <ProgressBar value={(volume[muscle] ?? 0) / WEEKLY_TARGET} tone={(volume[muscle] ?? 0) > WEEKLY_TARGET * 1.25 ? 'warning' : 'accent'} />
                  </motion.div>
                ) : (
                  <p className="mt-3 text-center text-[13px] text-[var(--text-subtle)]">Нажми на мышцу, чтобы увидеть нагрузку</p>
                )}
              </AnimatePresence>
            </div>

            {/* Recent */}
            {sessions.length > 0 && (
              <div className="rounded-[var(--r-xl)] border border-[var(--border)] bg-[var(--surface)] p-5">
                <p className="text-[15px] font-semibold mb-3">Последние тренировки</p>
                <div className="space-y-2">
                  {sessions.slice(0, 6).map((s) => (
                    <div key={s.id} className="flex items-center justify-between text-[14px]">
                      <span className="text-[var(--text)]">{fmtDateLabel(s.performed_on)} · {WEEKDAYS_FULL[s.day_of_week]}</span>
                      <span className="text-[var(--text-subtle)]">{s.session_exercises.length} упр.</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <>
            {WEEK_ORDER.map((dow) => {
              const items = plan.filter((p) => p.day_of_week === dow);
              return (
                <PlanDay
                  key={dow}
                  dow={dow}
                  items={items}
                  exMap={exMap}
                  isToday={dow === todayDow}
                  onAdd={() => setPickerDay(dow)}
                  onUpdate={(id, patch) => updatePlanExercise.mutate({ id, patch })}
                  onRemove={(id) => removePlanExercise.mutate(id)}
                />
              );
            })}
          </>
        )}
      </TabPanel>

      <ExercisePicker open={pickerDay !== null} onClose={() => setPickerDay(null)} onPick={onPick} />
      <BodyEntryForm open={bodyForm} onClose={() => setBodyForm(false)} />
    </div>
  );
}

function PlanDay({
  dow, items, exMap, isToday, onAdd, onUpdate, onRemove,
}: {
  dow: number;
  items: PlanExercise[];
  exMap: Map<string, Exercise>;
  isToday: boolean;
  onAdd: () => void;
  onUpdate: (id: string, patch: Partial<PlanExercise>) => void;
  onRemove: (id: string) => void;
}) {
  return (
    <div className="rounded-[var(--r-lg)] border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--hairline)]">
        <div className="flex items-center gap-2">
          <span className="text-[15px] font-semibold">{WEEKDAYS_FULL[dow]}</span>
          {isToday && <span className="text-[11px] font-semibold text-[var(--accent)] bg-[var(--accent-12)] rounded-full px-2 py-0.5">сегодня</span>}
        </div>
        <button onClick={onAdd} className="inline-flex items-center gap-1 text-[13px] font-medium text-[var(--accent)]">
          <Plus size={16} /> упражнение
        </button>
      </div>

      {items.length === 0 ? (
        <p className="px-4 py-4 text-[13px] text-[var(--text-subtle)]">Нет упражнений — день отдыха</p>
      ) : (
        <div className="divide-y divide-[var(--hairline)]">
          {items.map((p) => (
            <div key={p.id} className="flex items-center gap-2 px-4 py-2.5">
              <span className="flex-1 text-[14px] truncate">{exMap.get(p.exercise_id)?.name ?? '—'}</span>
              <Stepper label="подх" value={p.sets} min={1} onChange={(v) => onUpdate(p.id, { sets: v })} />
              <span className="text-[var(--text-subtle)] text-[13px]">×</span>
              <Stepper label="повт" value={p.reps} min={0} onChange={(v) => onUpdate(p.id, { reps: v })} />
              <button onClick={() => onRemove(p.id)} className="ml-1 text-[var(--text-subtle)] hover:text-[var(--negative)] p-1">
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Stepper({ value, min, onChange, label }: { value: number; min: number; onChange: (v: number) => void; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <button onClick={() => { haptics.soft(); onChange(Math.max(min, value - 1)); }} className="grid h-7 w-7 place-items-center rounded-full bg-[var(--surface-alt)] text-[var(--text-muted)] active:bg-[var(--surface-raised)]" aria-label={`${label} меньше`}>
        <Minus size={14} />
      </button>
      <span className="num text-[14px] font-semibold w-5 text-center tabular-nums">{value}</span>
      <button onClick={() => { haptics.soft(); onChange(value + 1); }} className="grid h-7 w-7 place-items-center rounded-full bg-[var(--surface-alt)] text-[var(--text-muted)] active:bg-[var(--surface-raised)]" aria-label={`${label} больше`}>
        <Plus size={14} />
      </button>
    </div>
  );
}
