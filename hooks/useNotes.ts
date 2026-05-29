'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createClient, getUserId } from '@/lib/supabase/client';
import type { Note } from '@/lib/types';

const NOTES_KEY = ['notes'];

export function useNotes() {
  return useQuery({
    queryKey: NOTES_KEY,
    queryFn: async (): Promise<Note[]> => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .order('pinned', { ascending: false })
        .order('updated_at', { ascending: false });
      if (error) throw error;
      return data as Note[];
    },
  });
}

export function useNoteMutations() {
  const qc = useQueryClient();
  const supabase = createClient();
  const inv = () => qc.invalidateQueries({ queryKey: NOTES_KEY });

  const add = useMutation({
    mutationFn: async (input: { title: string; body: string | null }) => {
      const { data, error } = await supabase.from('notes')
        .insert({ user_id: await getUserId(), title: input.title.trim(), body: input.body })
        .select('id').single();
      if (error) throw error;
      return data.id as string;
    },
    onSuccess: inv,
  });

  const update = useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: Partial<Note> }) => {
      const { error } = await supabase.from('notes').update(patch).eq('id', id);
      if (error) throw error;
    },
    onSuccess: inv,
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('notes').delete().eq('id', id);
      if (error) throw error;
    },
    onMutate: async (id: string) => {
      await qc.cancelQueries({ queryKey: NOTES_KEY });
      const prev = qc.getQueryData<Note[]>(NOTES_KEY);
      qc.setQueryData<Note[]>(NOTES_KEY, (old) => (old ?? []).filter((n) => n.id !== id));
      return { prev };
    },
    onError: (_e, _v, ctx) => { if (ctx?.prev) qc.setQueryData(NOTES_KEY, ctx.prev); },
    onSettled: inv,
  });

  return { add, update, remove };
}
