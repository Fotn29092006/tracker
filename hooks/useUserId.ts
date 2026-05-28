'use client';

import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';

// Cached current user id — needed to stamp user_id on inserts (RLS columns
// are NOT NULL). Resolved once from the session, then served from cache.
export function useUserId(): string | undefined {
  const { data } = useQuery({
    queryKey: ['user-id'],
    queryFn: async () => {
      const supabase = createClient();
      const { data } = await supabase.auth.getUser();
      return data.user?.id ?? null;
    },
    staleTime: Infinity,
    gcTime: Infinity,
  });
  return data ?? undefined;
}
