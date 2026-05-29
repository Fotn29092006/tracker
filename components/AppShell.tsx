'use client';

import { TabBar } from '@/components/nav/TabBar';
import { Sidebar } from '@/components/nav/Sidebar';
import { OverlaysProvider } from '@/components/ui/Overlays';
import { ReminderWatcher } from '@/components/ReminderWatcher';
import { LockGate } from '@/components/lock/LockGate';
import { AuthGuard } from '@/components/AuthGuard';

// App-shell layout: a full-screen flex frame where ONLY the inner <main>
// scrolls; the bottom TabBar is an in-flow flex item (never position:fixed, so
// it can't mis-paint on iOS). Height is pinned to the LARGE viewport (100lvh)
// — on Dynamic Island iPhones in standalone, `dvh`/`fixed inset-0` report
// ~62px short (the island area), leaving a gap below the bar; `lvh` is the
// full physical screen height, so the bar reaches the very bottom.
export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <OverlaysProvider>
      <AuthGuard>
        <LockGate>
          <ReminderWatcher />
          <div
            className="fixed top-0 inset-x-0 flex overflow-hidden bg-[var(--bg)]"
            style={{ height: '100lvh' }}
          >
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
