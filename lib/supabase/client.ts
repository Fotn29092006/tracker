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
