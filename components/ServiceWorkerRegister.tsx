'use client';

import { useEffect } from 'react';

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;
    if (process.env.NODE_ENV !== 'production') return;

    // Auto-update: when a new SW takes control (it calls skipWaiting on
    // install), reload once so the freshly-deployed version lands immediately
    // instead of the user staring at a stale cached shell.
    let refreshing = false;
    const onControllerChange = () => {
      if (refreshing) return;
      refreshing = true;
      window.location.reload();
    };
    navigator.serviceWorker.addEventListener('controllerchange', onControllerChange);

    const register = () =>
      navigator.serviceWorker
        .register('/sw.js', { scope: '/' })
        .then((reg) => {
          // Proactively check for an update on each launch.
          reg.update().catch(() => {});
        })
        .catch(() => {});

    if (document.readyState === 'complete') register();
    else window.addEventListener('load', register, { once: true });

    return () => navigator.serviceWorker.removeEventListener('controllerchange', onControllerChange);
  }, []);
  return null;
}
