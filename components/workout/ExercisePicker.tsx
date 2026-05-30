'use client';

import { useMemo, useState } from 'react';
import { Search, Plus, Check } from 'lucide-react';
import { Sheet } from '@/components/ui/Sheet';
import { Input } from '@/components/ui/Field';
import { Chip } from '@/components/ui/Pill';
import { Button } from '@/components/ui/Button';
import { useExercises } from '@/hooks/useWorkout';
import { MUSCLE_LABELS } from '@/lib/muscles';
import type { Exercise, ExerciseCategory, MuscleId } from '@/lib/types';
import { CustomExerciseForm } from './CustomExerciseForm';

const CATS: { value: ExerciseCategory | 'all'; label: string }[] = [
  { value: 'all', label: 'Все' },
  { value: 'push', label: 'Жим' },
  { value: 'pull', label: 'Тяга' },
  { value: 'legs', label: 'Ноги' },
  { value: 'core', label: 'Кор' },
  { value: 'compound', label: 'База' },
];

function primaryMuscle(ex: Exercise): string {
  const entries = Object.entries(ex.muscle_distribution) as [MuscleId, number][];
  if (!entries.length) return '';
  const top = entries.sort((a, b) => b[1] - a[1])[0][0];
  return MUSCLE_LABELS[top] ?? '';
}

export function ExercisePicker({
  open, onClose, onPick, alreadyAdded = new Set<string>(),
}: {
  open: boolean;
  onClose: () => void;
  onPick: (ex: Exercise) => void;
  alreadyAdded?: Set<string>;
}) {
  const { data: exercises = [] } = useExercises();
  const [q, setQ] = useState('');
  const [cat, setCat] = useState<ExerciseCategory | 'all'>('all');
  const [custom, setCustom] = useState(false);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return exercises.filter((e) => {
      if (cat !== 'all' && e.category !== cat) return false;
      if (query && !e.name.toLowerCase().includes(query)) return false;
      return true;
    });
  }, [exercises, q, cat]);

  return (
    <>
      <Sheet open={open} onClose={onClose} title="Добавить упражнение">
        <div className="relative mb-3">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-subtle)]" />
          <Input placeholder="Поиск…" value={q} onChange={(e) => setQ(e.target.value)} className="pl-10" />
        </div>

        <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-5 px-5 mb-3 pb-1">
          {CATS.map((c) => (
            <Chip key={c.value} active={cat === c.value} onClick={() => setCat(c.value)}>{c.label}</Chip>
          ))}
        </div>

        <button
          onClick={() => setCustom(true)}
          className="w-full flex items-center gap-3 rounded-[var(--r-md)] border border-dashed border-[var(--border-strong)] p-3 mb-3 text-[var(--accent)]"
        >
          <span className="grid h-9 w-9 place-items-center rounded-full bg-[var(--accent-12)]"><Plus size={18} /></span>
          <span className="text-[14px] font-medium">Своё упражнение</span>
        </button>

        <div className="space-y-1.5">
          {filtered.map((ex) => {
            const added = alreadyAdded.has(ex.id);
            return (
              <button
                key={ex.id}
                onClick={() => onPick(ex)}
                className="w-full text-left flex items-center gap-3 rounded-[var(--r-md)] bg-[var(--surface)] border border-[var(--border)] p-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-[15px] font-medium truncate">{ex.name}</p>
                  <p className="text-[12px] text-[var(--text-subtle)]">{primaryMuscle(ex)}{!ex.is_system && ' · своё'}</p>
                </div>
                <span className={added ? 'text-[var(--positive)]' : 'text-[var(--accent)]'}>
                  {added ? <Check size={20} /> : <Plus size={20} />}
                </span>
              </button>
            );
          })}
          {filtered.length === 0 && (
            <p className="text-[14px] text-[var(--text-subtle)] text-center py-6">Ничего не найдено</p>
          )}
        </div>
      </Sheet>

      <CustomExerciseForm open={custom} onClose={() => setCustom(false)} onCreated={(ex) => { setCustom(false); onPick(ex); }} />
    </>
  );
}
