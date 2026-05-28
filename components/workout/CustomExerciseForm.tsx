'use client';

import { useEffect, useState } from 'react';
import { Sheet } from '@/components/ui/Sheet';
import { Field, Input, Label } from '@/components/ui/Field';
import { Button } from '@/components/ui/Button';
import { Segmented } from '@/components/ui/Segmented';
import { Chip } from '@/components/ui/Pill';
import { useOverlays } from '@/components/ui/Overlays';
import { useWorkoutMutations } from '@/hooks/useWorkout';
import { MUSCLE_LABELS } from '@/lib/muscles';
import type { Exercise, ExerciseCategory, Equipment, MuscleId } from '@/lib/types';

const CATS: { value: ExerciseCategory; label: string }[] = [
  { value: 'push', label: 'Жим' },
  { value: 'pull', label: 'Тяга' },
  { value: 'legs', label: 'Ноги' },
  { value: 'core', label: 'Кор' },
  { value: 'compound', label: 'База' },
  { value: 'cardio', label: 'Кардио' },
];

const EQUIP: { value: Equipment; label: string }[] = [
  { value: 'bodyweight', label: 'Свой вес' },
  { value: 'barbell', label: 'Штанга' },
  { value: 'dumbbell', label: 'Гантели' },
  { value: 'machine', label: 'Тренажёр' },
  { value: 'cable', label: 'Блок' },
  { value: 'kettlebell', label: 'Гиря' },
  { value: 'other', label: 'Другое' },
];

const MUSCLES = Object.keys(MUSCLE_LABELS) as MuscleId[];

export function CustomExerciseForm({
  open, onClose, onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: (ex: Exercise) => void;
}) {
  const { addCustomExercise } = useWorkoutMutations();
  const { toast } = useOverlays();

  const [name, setName] = useState('');
  const [category, setCategory] = useState<ExerciseCategory>('push');
  const [equipment, setEquipment] = useState<Equipment>('bodyweight');
  const [muscles, setMuscles] = useState<Set<MuscleId>>(new Set());

  useEffect(() => {
    if (!open) return;
    setName(''); setCategory('push'); setEquipment('bodyweight'); setMuscles(new Set());
  }, [open]);

  const toggleMuscle = (m: MuscleId) => {
    setMuscles((prev) => {
      const next = new Set(prev);
      if (next.has(m)) next.delete(m); else next.add(m);
      return next;
    });
  };

  async function submit() {
    if (!name.trim() || muscles.size === 0) return;
    // First selected muscle weighted as primary; rest split the remainder.
    const ids = [...muscles];
    const dist: Partial<Record<MuscleId, number>> = {};
    if (ids.length === 1) {
      dist[ids[0]] = 100;
    } else {
      const primary = 50;
      const rest = Math.round((100 - primary) / (ids.length - 1));
      ids.forEach((m, i) => { dist[m] = i === 0 ? primary : rest; });
    }
    try {
      const id = await addCustomExercise.mutateAsync({ name, category, equipment, muscle_distribution: dist });
      onCreated({
        id, user_id: null, name: name.trim(), category, equipment,
        muscle_distribution: dist, is_system: false, created_at: new Date().toISOString(),
      });
    } catch {
      toast('Не удалось создать', 'error');
    }
  }

  return (
    <Sheet
      open={open} onClose={onClose} title="Своё упражнение"
      footer={<Button full size="lg" disabled={addCustomExercise.isPending || !name.trim() || muscles.size === 0} onClick={submit}>Создать</Button>}
    >
      <Field label="Название">
        <Input autoFocus placeholder="Например: Отжимания на кольцах" value={name} onChange={(e) => setName(e.target.value)} />
      </Field>

      <div className="mb-3.5">
        <Label>Тип</Label>
        <div className="flex flex-wrap gap-2">
          {CATS.map((c) => <Chip key={c.value} active={category === c.value} onClick={() => setCategory(c.value)}>{c.label}</Chip>)}
        </div>
      </div>

      <div className="mb-3.5">
        <Label>Снаряд</Label>
        <div className="flex flex-wrap gap-2">
          {EQUIP.map((e) => <Chip key={e.value} active={equipment === e.value} onClick={() => setEquipment(e.value)}>{e.label}</Chip>)}
        </div>
      </div>

      <div className="mb-2">
        <Label>Какие мышцы работают (первая — основная)</Label>
        <div className="flex flex-wrap gap-2">
          {MUSCLES.map((m) => <Chip key={m} active={muscles.has(m)} onClick={() => toggleMuscle(m)}>{MUSCLE_LABELS[m]}</Chip>)}
        </div>
      </div>
    </Sheet>
  );
}
