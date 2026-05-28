'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { useUserId } from './useUserId';
import { uid } from '@/lib/utils';
import type { BodyEntry } from '@/lib/types';

const BODY_KEY = ['body-entries'];

export function useBodyEntries() {
  return useQuery({
    queryKey: BODY_KEY,
    queryFn: async (): Promise<BodyEntry[]> => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('body_entries')
        .select('*')
        .order('recorded_on', { ascending: false });
      if (error) throw error;
      return data as BodyEntry[];
    },
  });
}

export function useBodyMutations() {
  const qc = useQueryClient();
  const userId = useUserId();
  const supabase = createClient();
  const inv = () => qc.invalidateQueries({ queryKey: BODY_KEY });

  /** Upload a progress photo to Storage, return its public URL. */
  async function uploadPhoto(file: File): Promise<string> {
    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const path = `${userId}/${uid()}.${ext}`;
    const { error } = await supabase.storage.from('progress').upload(path, file, {
      cacheControl: '3600', upsert: false, contentType: file.type || 'image/jpeg',
    });
    if (error) throw error;
    return supabase.storage.from('progress').getPublicUrl(path).data.publicUrl;
  }

  const add = useMutation({
    mutationFn: async (input: { recorded_on: string; weight_kg: number | null; photo_url: string | null; note: string | null }) => {
      const { error } = await supabase.from('body_entries').insert({ user_id: userId, ...input });
      if (error) throw error;
    },
    onSuccess: inv,
  });

  const update = useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: Partial<BodyEntry> }) => {
      const { error } = await supabase.from('body_entries').update(patch).eq('id', id);
      if (error) throw error;
    },
    onSuccess: inv,
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('body_entries').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: inv,
  });

  return { add, update, remove, uploadPhoto };
}
