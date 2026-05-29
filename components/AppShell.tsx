'use client';

import { TabBar } from '@/components/nav/TabBar';
import { Sidebar } from '@/components/nav/Sidebar';
import { OverlaysProvider } from '@/components/ui/Overlays';
import { ReminderWatcher } from '@/components/ReminderWatcher';
import { LockGate } from '@/components/lock/LockGate';
import { AuthGuard } from '@/components/AuthGuard';

// App-shell layout: a fixed-height (h-dvh) flex frame where ONLY the inner
// <main> scrolls. The bottom TabBar is a normal in-flow flex item, never
// position:fixed — so it can't mis-paint / "jump then settle" on iOS (the
// classic fixed-bar bug). Sidebar replaces the tab bar on desktop.
export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <OverlaysProvider>
      <AuthGuard>
        <LockGate>
          <ReminderWatcher />
          <div className="flex h-dvh overflow-hidden bg-[var(--bg)]">
            <Sidebar />
            <div className="flex-1 min-w-0 flex flex-col">
              <main
                id="app-scroll"
                className="flex-1 overflow-y-auto overscroll-contain"
              >
                <div className="mx-auto w-full max-w-[640px] px-4 pt-[max(env(safe-area-inset-top),16px)] pb-24">
                  {children}
                </div>
              </main>
              <TabBar />
            </div>
          </div>
        </LockGate>
      </AuthGuard>
    </OverlaysProvider>
  );
}
