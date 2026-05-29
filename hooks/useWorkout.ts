'use client';

import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createClient, getUserId } from '@/lib/supabase/client';
import { addDaysISO } from '@/lib/utils';
import type { Exercise, MuscleId, PlanExercise, WorkoutSession, SessionExercise } from '@/lib/types';

const EXERCISES_KEY = ['exercises'];
const PLAN_KEY = ['plan'];
const SESSIONS_KEY = ['sessions'];

export type SessionWithExercises = WorkoutSession & { session_exercises: SessionExercise[] };

// ── Queries ──────────────────────────────────────────────
export function useExercises() {
  return useQuery({
    queryKey: EXERCISES_KEY,
    queryFn: async (): Promise<Exercise[]> => {
      const supabase = createClient();
      const { data, error } = await supabase.from('exercises').select('*').order('name');
      if (error) throw error;
      return data as Exercise[];
    },
    staleTime: 10 * 60_000,
  });
}

export function usePlan() {
  return useQuery({
    queryKey: PLAN_KEY,
    queryFn: async (): Promise<PlanExercise[]> => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('plan_exercises')
        .select('*')
        .order('day_of_week')
        .order('position');
      if (error) throw error;
      return data as PlanExercise[];
    },
  });
}

export function useSessions() {
  return useQuery({
    queryKey: SESSIONS_KEY,
    queryFn: async (): Promise<SessionWithExercises[]> => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('workout_sessions')
        .select('*, session_exercises(*)')
        .gte('performed_on', addDaysISO(-180))
        .order('performed_on', { ascending: false });
      if (error) throw error;
      return data as SessionWithExercises[];
    },
  });
}

// Effective-set volume per muscle over the last `windowDays`.
export function useMuscleVolume(windowDays = 7) {
  const { data: exercises = [] } = useExercises();
  const { data: sessions = [] } = useSessions();

  return useMemo(() => {
    const exMap = new Map(exercises.map((e) => [e.id, e]));
    const since = addDaysISO(-windowDays + 1);
    const volume = {} as Record<MuscleId, number>;
    for (const s of sessions) {
      if (s.performed_on < since) continue;
      for (const se of s.session_exercises) {
        const ex = exMap.get(se.exercise_id);
        if (!ex) continue;
        for (const [muscle, pct] of Object.entries(ex.muscle_distribution)) {
          const m = muscle as MuscleId;
          volume[m] = (volume[m] ?? 0) + se.sets * ((pct as number) / 100);
        }
      }
    }
    return volume;
  }, [exercises, sessions, windowDays]);
}

// ── Mutations ────────────────────────────────────────────
export function useWorkoutMutations() {
  const qc = useQueryClient();
  const supabase = createClient();
  const invPlan = () => qc.invalidateQueries({ queryKey: PLAN_KEY });
  const invSessions = () => qc.invalidateQueries({ queryKey: SESSIONS_KEY });

  const addPlanExercise = useMutation({
    mutationFn: async (input: { day_of_week: number; exercise_id: string; sets: number; reps: number; position: number }) => {
      const { error } = await supabase.from('plan_exercises').insert({ user_id: await getUserId(), ...input });
      if (error) throw error;
    },
    onSuccess: invPlan,
  });

  const updatePlanExercise = useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: Partial<PlanExercise> }) => {
      const { error } = await supabase.from('plan_exercises').update(patch).eq('id', id);
      if (error) throw error;
    },
    onSuccess: invPlan,
  });

  const removePlanExercise = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('plan_exercises').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: invPlan,
  });

  // One-tap "Готово": create a session for `date` and copy the day's plan.
  const completeDay = useMutation({
    mutationFn: async ({ day_of_week, date, planItems }: { day_of_week: number; date: string; planItems: PlanExercise[] }) => {
      const { data: session, error } = await supabase
        .from('workout_sessions')
        .insert({ user_id: await getUserId(), performed_on: date, day_of_week })
        .select('id')
        .single();
      if (error) throw error;
      if (planItems.length) {
        const rows = planItems.map((p) => ({ session_id: session.id, exercise_id: p.exercise_id, sets: p.sets, reps: p.reps }));
        const { error: e2 } = await supabase.from('session_exercises').insert(rows);
        if (e2) throw e2;
      }
      return session.id as string;
    },
    onSuccess: invSessions,
  });

  const removeSession = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('workout_sessions').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: invSessions,
  });

  const addCustomExercise = useMutation({
    mutationFn: async (input: { name: string; category: Exercise['category']; equipment: Exercise['equipment']; muscle_distribution: Exercise['muscle_distribution'] }) => {
      const { data, error } = await supabase
        .from('exercises')
        .insert({ user_id: await getUserId(), is_system: false, ...input, name: input.name.trim() })
        .select('id')
        .single();
      if (error) throw error;
      qc.invalidateQueries({ queryKey: EXERCISES_KEY });
      return data.id as string;
    },
  });

  return { addPlanExercise, updatePlanExercise, removePlanExercise, completeDay, removeSession, addCustomExercise };
}
