'use client';

import { createBrowserClient } from '@supabase/ssr';
import { isSupabaseConfigured } from './config';

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder_anon_key';

export function createClient() {
  // Before keys are wired, fail network instantly so the UI can render with
  // empty data instead of hanging on requests to a placeholder host.
  return createBrowserClient(URL, KEY,
    isSupabaseConfigured
      ? undefined
      : { global: { fetch: () => Promise.reject(new Error('Supabase not configured')) } },
  );
}

// Resolve the signed-in user id from the locally-stored session — fast, no
// network round-trip, and always current. Used to stamp inserts so they never
// race the async `useUserId` query (which could otherwise send a null user_id
// right after a cold start and trip the NOT NULL / RLS check).
export async function getUserId(): Promise<string> {
  const { data } = await createClient().auth.getSession();
  const id = data.session?.user?.id;
  if (!id) throw new Error('Сессия не найдена — войдите снова');
  return id;
}
