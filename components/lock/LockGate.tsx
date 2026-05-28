'use client';

import { useEffect, useRef, useState } from 'react';
import { hasPin } from '@/lib/lock';
import { LockScreen } from './LockScreen';

// Locks on cold start and after the app has been backgrounded for a while.
const GRACE_MS = 30_000;

export function LockGate({ children }: { children: React.ReactNode }) {
  const [locked, setLocked] = useState(false);
  const [ready, setReady] = useState(false);
  const hiddenAt = useRef<number | null>(null);

  useEffect(() => {
    setLocked(hasPin());
    setReady(true);
  }, []);

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

  return (
    <>
      {children}
      {ready && locked && <LockScreen onUnlock={() => setLocked(false)} />}
    </>
  );
}
