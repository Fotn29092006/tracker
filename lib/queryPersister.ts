// Offline-first persister for React Query — saves the QueryCache +
// MutationCache to IndexedDB so the UI is instant on cold start and
// mutations queued offline replay when the network returns.

import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { get, set, del } from 'idb-keyval';

// Bump when the cached data shape changes in a breaking way.
const STORAGE_KEY = 'tracker-rq-v1';

const idbStorage = {
  getItem: async (key: string): Promise<string | null> => (await get<string>(key)) ?? null,
  setItem: async (key: string, value: string): Promise<void> => { await set(key, value); },
  removeItem: async (key: string): Promise<void> => { await del(key); },
};

export const queryPersister = createAsyncStoragePersister({
  storage: idbStorage,
  key: STORAGE_KEY,
  throttleTime: 1000,
});
