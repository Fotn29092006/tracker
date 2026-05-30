'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createClient, getUserId } from '@/lib/supabase/client';
import { uid } from '@/lib/utils';
import type { Profile } from '@/lib/types';

const PROFILE_KEY = ['profile'];

export function useProfile() {
  return useQuery({
    queryKey: PROFILE_KEY,
    queryFn: async (): Promise<Profile | null> => {
      // Read with the reliable session id (getUserId, local — no network), NOT
      // useUserId()/auth.getUser(): in a standalone PWA getUser() can resolve
      // to undefined, and with `enabled: !!userId` the profile query then NEVER
      // ran — so writes landed in the DB but the screen never re-read them
      // ("saved, but nothing there"). Only the profile read was id-gated; the
      // other modules read via RLS without an id, which is why they worked.
      const supabase = createClient();
      const userId = await getUserId();
      const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
      if (error) throw error;
      return data as Profile | null;
    },
  });
}

export function useProfileMutations() {
  const qc = useQueryClient();
  const supabase = createClient();

  const update = useMutation({
    mutationFn: async (patch: Partial<Profile>) => {
      // Reliable getUserId() (useUserId() can be null on a cold start, which
      // was the original save bug). UPDATE the existing (trigger-created) row —
      // needs only the UPDATE policy; a blanket upsert would require an INSERT
      // policy that profiles may not have. INSERT only if no row matched.
      const uid = await getUserId();
      const upd = await supabase.from('profiles').update(patch).eq('id', uid).select('id');
      if (upd.error) throw upd.error;
      if (!upd.data || upd.data.length === 0) {
        const ins = await supabase.from('profiles').insert({ id: uid, ...patch });
        if (ins.error) throw ins.error;
      }
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

  /** Upload an avatar image to the `progress` bucket, return its public URL. */
  async function uploadAvatar(file: File): Promise<string> {
    const ownerId = await getUserId();
    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const path = `${ownerId}/avatar-${uid()}.${ext}`;
    const { error } = await supabase.storage.from('progress').upload(path, file, {
      cacheControl: '3600', upsert: true, contentType: file.type || 'image/jpeg',
    });
    if (error) throw error;
    return supabase.storage.from('progress').getPublicUrl(path).data.publicUrl;
  }

  return { update, uploadAvatar };
}
