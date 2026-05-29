'use client';

import { TabBar } from '@/components/nav/TabBar';
import { Sidebar } from '@/components/nav/Sidebar';
import { OverlaysProvider } from '@/components/ui/Overlays';
import { ReminderWatcher } from '@/components/ReminderWatcher';
import { LockGate } from '@/components/lock/LockGate';
import { AuthGuard } from '@/components/AuthGuard';

// App-shell layout: a full-screen flex frame where ONLY the inner <main>
// scrolls; the bottom TabBar is an in-flow flex item (never position:fixed, so
// it can't mis-paint on iOS). The frame is pinned to all four viewport edges
// with `fixed inset-0` — no viewport-unit height to guess. Paired with the
// 'black-translucent' status bar (app/layout.tsx) the web view spans the entire
// physical screen, so inset-0 reaches the true top AND bottom; the TabBar's own
// env(safe-area-inset-bottom) padding clears the home indicator. No system
// band, no bottom gap.
export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <OverlaysProvider>
      <AuthGuard>
        <LockGate>
          <ReminderWatcher />
          {/* Status-bar legibility: 'black-translucent' forces light system
              text; this theme-aware scrim (transparent in dark, a soft fade in
              light) keeps the clock/battery readable over the page background.
              pointer-events-none + top-only, so it never blocks taps. */}
          <div
            aria-hidden
            className="pointer-events-none fixed inset-x-0 top-0 z-[60]"
            style={{ height: 'var(--sat)', background: 'var(--statusbar-scrim)' }}
          />
          <div className="fixed inset-0 flex overflow-hidden bg-[var(--bg)]">
            <Sidebar />
            <div className="flex-1 min-w-0 flex flex-col">
              <main
                id="app-scroll"
                className="flex-1 overflow-y-auto overscroll-contain"
              >
                <div className="mx-auto w-full max-w-[640px] px-4 pt-[max(var(--sat),16px)] pb-24">
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
