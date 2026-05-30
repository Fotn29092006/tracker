'use client';

import { useEffect, useRef, useState } from 'react';
import { hasPin } from '@/lib/lock';
import { LockScreen } from './LockScreen';

// Locks on cold start and after the app has been backgrounded for a while.
const GRACE_MS = 30_000;

export function LockGate({ children }: { children: React.ReactNode }) {
  // hasPin() reads localStorage synchronously. LockGate only renders on the
  // client (AuthGuard returns a splash on the server / pre-session), so seeding
  // `locked` in the initializer is safe and avoids painting the app for a frame
  // before the lock drops.
  const [locked, setLocked] = useState(() => hasPin());
  const hiddenAt = useRef<number | null>(null);

  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') {
        hiddenAt.current = Date.now();
      } else {
        if (hasPin() && hiddenAt.current && Date.now() - hiddenAt.current > GRACE_MS) {
          setLocked(true);
        }
        hiddenAt.current = null;
      }
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);

  // Render ONLY the lock when locked — never paint the app underneath (privacy +
  // no flash of content before the lock on cold start).
  if (locked) return <LockScreen onUnlock={() => setLocked(false)} />;
  return <>{children}</>;
}
