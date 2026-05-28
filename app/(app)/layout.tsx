import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { AppShell } from '@/components/AppShell';

export const dynamic = 'force-dynamic';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  // Before keys are wired, render the shell so the UI is previewable locally.
  if (!isSupabaseConfigured) return <AppShell name="Гость">{children}</AppShell>;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/sign-in');

  const { data: profile } = await supabase
    .from('profiles')
    .select('name')
    .eq('id', user.id)
    .maybeSingle();

  const name = profile?.name || user.email?.split('@')[0] || '';

  return <AppShell name={name}>{children}</AppShell>;
}
