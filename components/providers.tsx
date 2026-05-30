'use client';

import { QueryClient, onlineManager } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { MotionConfig } from 'framer-motion';
import { useEffect, useState } from 'react';
import { queryPersister } from '@/lib/queryPersister';

// Offline-first wiring:
//  • networkMode 'offlineFirst' → queries serve cache immediately and
//    mutations pause (not fail) when offline, replaying on reconnect.
//  • PersistQueryClientProvider hydrates the cache from IndexedDB before
//    children render → instant UI on cold start.
export function Providers({ children }: { children: React.ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Single-writer offline-first PWA: this device is the only mutator
            // and every mutation invalidates its keys, so a long staleTime just
            // avoids needless background refetch→cache-swap→re-render flashes on
            // tab-return. refetchOnReconnect:true (not 'always') respects it, so
            // a flaky mobile connection doesn't trigger refetch storms.
            staleTime: 5 * 60_000,
            gcTime: 24 * 60 * 60_000,
            refetchOnWindowFocus: false,
            refetchOnReconnect: true,
            retry: 1,
            networkMode: 'offlineFirst',
          },
          mutations: {
            retry: 3,
            networkMode: 'offlineFirst',
          },
        },
      }),
  );

  useEffect(() => {
    const unsub = onlineManager.subscribe((online) => {
      if (online) client.resumePausedMutations().catch(() => {});
    });
    return unsub;
  }, [client]);

  return (
    <PersistQueryClientProvider
      client={client}
      persistOptions={{
        persister: queryPersister,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        dehydrateOptions: {
          shouldDehydrateMutation: (m) => m.state.status !== 'error',
        },
      }}
    >
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </PersistQueryClientProvider>
  );
}
