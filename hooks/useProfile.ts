'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { useUserId } from './useUserId';
import type { Profile } from '@/lib/types';

const PROFILE_KEY = ['profile'];

export function useProfile() {
  const userId = useUserId();
  return useQuery({
    queryKey: PROFILE_KEY,
    enabled: !!userId,
    queryFn: async (): Promise<Profile | null> => {
      const supabase = createClient();
      const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
      if (error) throw error;
      return data as Profile | null;
    },
  });
}

export function useProfileMutations() {
  const qc = useQueryClient();
  const userId = useUserId();
  const supabase = createClient();

  const update = useMutation({
    mutationFn: async (patch: Partial<Profile>) => {
      const { error } = await supabase.from('profiles').update(patch).eq('id', userId);
      if (error) throw error;
    },
    onMutate: async (patch) => {
      await qc.cancelQueries({ queryKey: PROFILE_KEY });
      const prev = qc.getQueryData<Profile>(PROFILE_KEY);
      if (prev) qc.setQueryData<Profile>(PROFILE_KEY, { ...prev, ...patch });
      return { prev };
    },
    onError: (_e, _v, ctx) => { if (ctx?.prev) qc.setQueryData(PROFILE_KEY, ctx.prev); },
    onSettled: () => qc.invalidateQueries({ queryKey: PROFILE_KEY }),
  });

  return { update };
}
