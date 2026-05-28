'use client';

import { TabBar } from '@/components/nav/TabBar';
import { Sidebar } from '@/components/nav/Sidebar';
import { OverlaysProvider } from '@/components/ui/Overlays';
import { ReminderWatcher } from '@/components/ReminderWatcher';
import { LockGate } from '@/components/lock/LockGate';
import { AuthGuard } from '@/components/AuthGuard';

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <OverlaysProvider>
      <AuthGuard>
        <LockGate>
          <ReminderWatcher />
          <div className="flex min-h-dvh">
            <Sidebar />
            <main className="flex-1 min-w-0">
              <div
                className="mx-auto w-full max-w-[640px] px-4 pt-[max(env(safe-area-inset-top),16px)]"
                style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 84px)' }}
              >
                {children}
              </div>
            </main>
          </div>
          <TabBar />
        </LockGate>
      </AuthGuard>
    </OverlaysProvider>
  );
}
