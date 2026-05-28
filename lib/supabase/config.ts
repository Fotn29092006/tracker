// True once real Supabase env vars are set. Until then (e.g. first local run
// before keys are added) we skip auth gating so the UI is still viewable.
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured =
  !!SUPABASE_URL && !SUPABASE_URL.includes('placeholder') &&
  !!SUPABASE_ANON_KEY && !SUPABASE_ANON_KEY.includes('placeholder');
