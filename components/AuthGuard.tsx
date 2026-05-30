'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { Splash } from '@/components/ui/Splash';

// Client-side auth gate. Keeps navigation a pure SPA (no per-route server
// round-trip), so screen-to-screen is instant. Data is still protected by
// Supabase RLS. Renders nothing until the session is known to avoid a flash
// of the app for signed-out users.
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(!isSupabaseConfigured);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    const supabase = createClient();
    let active = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      if (data.session) setReady(true);
      else router.replace('/sign-in');
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) router.replace('/sign-in');
    });

    return () => { active = false; sub.subscription.unsubscribe(); };
  }, [router]);

  // Splash (not null) while the session resolves → seamless with the restore
  // splash, no blank frame before content.
  if (!ready) return <Splash />;
  return <>{children}</>;
}
