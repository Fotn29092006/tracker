'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { useUserId } from './useUserId';
import type { Goal, GoalWithProgress, Task } from '@/lib/types';

const TASKS_KEY = ['tasks'];
const GOALS_KEY = ['goals'];

// ── Queries ──────────────────────────────────────────────
export function useTasks() {
  return useQuery({
    queryKey: TASKS_KEY,
    queryFn: async (): Promise<Task[]> => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('position', { ascending: true })
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data as Task[];
    },
  });
}

export function useGoals() {
  const tasksQ = useTasks();
  const goalsQ = useQuery({
    queryKey: GOALS_KEY,
    queryFn: async (): Promise<Goal[]> => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Goal[];
    },
  });

  const tasks = tasksQ.data ?? [];
  const goals: GoalWithProgress[] = (goalsQ.data ?? []).map((g) => {
    const steps = tasks.filter((t) => t.goal_id === g.id);
    return { ...g, total: steps.length, done: steps.filter((t) => t.done_at).length };
  });

  return { ...goalsQ, data: goals };
}

// ── Mutations ────────────────────────────────────────────
export type NewTask = {
  title: string;
  note?: string | null;
  due_date?: string | null;
  reminder_at?: string | null;
  goal_id?: string | null;
};

export function useTaskMutations() {
  const qc = useQueryClient();
  const userId = useUserId();
  const supabase = createClient();
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: TASKS_KEY });
    qc.invalidateQueries({ queryKey: GOALS_KEY });
  };

  const add = useMutation({
    mutationFn: async (input: NewTask) => {
      const { error } = await supabase.from('tasks').insert({
        user_id: userId,
        title: input.title.trim(),
        note: input.note ?? null,
        due_date: input.due_date ?? null,
        reminder_at: input.reminder_at ?? null,
        goal_id: input.goal_id ?? null,
      });
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: Partial<Task> }) => {
      const { error } = await supabase.from('tasks').update(patch).eq('id', id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  const toggle = useMutation({
    mutationFn: async (task: Task) => {
      const { error } = await supabase
        .from('tasks')
        .update({ done_at: task.done_at ? null : new Date().toISOString() })
        .eq('id', task.id);
      if (error) throw error;
    },
    onMutate: async (task: Task) => {
      await qc.cancelQueries({ queryKey: TASKS_KEY });
      const prev = qc.getQueryData<Task[]>(TASKS_KEY);
      qc.setQueryData<Task[]>(TASKS_KEY, (old) =>
        (old ?? []).map((t) =>
          t.id === task.id ? { ...t, done_at: t.done_at ? null : new Date().toISOString() } : t,
        ),
      );
      return { prev };
    },
    onError: (_e, _v, ctx) => { if (ctx?.prev) qc.setQueryData(TASKS_KEY, ctx.prev); },
    onSettled: invalidate,
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('tasks').delete().eq('id', id);
      if (error) throw error;
    },
    onMutate: async (id: string) => {
      await qc.cancelQueries({ queryKey: TASKS_KEY });
      const prev = qc.getQueryData<Task[]>(TASKS_KEY);
      qc.setQueryData<Task[]>(TASKS_KEY, (old) => (old ?? []).filter((t) => t.id !== id));
      return { prev };
    },
    onError: (_e, _v, ctx) => { if (ctx?.prev) qc.setQueryData(TASKS_KEY, ctx.prev); },
    onSettled: invalidate,
  });

  return { add, update, toggle, remove };
}

export type NewGoal = { title: string; note?: string | null; target_date?: string | null };

export function useGoalMutations() {
  const qc = useQueryClient();
  const userId = useUserId();
  const supabase = createClient();
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: GOALS_KEY });
    qc.invalidateQueries({ queryKey: TASKS_KEY });
  };

  const add = useMutation({
    mutationFn: async (input: NewGoal) => {
      const { data, error } = await supabase.from('goals').insert({
        user_id: userId,
        title: input.title.trim(),
        note: input.note ?? null,
        target_date: input.target_date ?? null,
      }).select('id').single();
      if (error) throw error;
      return data.id as string;
    },
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: Partial<Goal> }) => {
      const { error } = await supabase.from('goals').update(patch).eq('id', id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('goals').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  return { add, update, remove };
}
