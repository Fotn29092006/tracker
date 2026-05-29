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
            staleTime: 60_000,
            gcTime: 24 * 60 * 60_000,
            refetchOnWindowFocus: false,
            refetchOnReconnect: 'always',
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
