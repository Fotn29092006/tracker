'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { TabBar } from '@/components/nav/TabBar';
import { SwipeNav } from '@/components/nav/SwipeNav';
import { Sidebar } from '@/components/nav/Sidebar';
import { OverlaysProvider } from '@/components/ui/Overlays';
import { ReminderWatcher } from '@/components/ReminderWatcher';
import { LockGate } from '@/components/lock/LockGate';
import { AuthGuard } from '@/components/AuthGuard';
import { Fab } from '@/components/ui/Fab';
import { QuickCreate } from '@/components/QuickCreate';

// App-shell layout — NATURAL document scroll (not a locked fixed-inset frame).
//
// Why this shape: on iOS standalone the content/visual viewport (innerHeight)
// is ~62px SHORTER than the physical screen (measured: 894 vs 956). A locked
// `fixed inset-0` / `height:100lvh` frame with an in-flow bottom bar therefore
// parked the bar at 894 — leaving the 62px bottom gap. A `position: fixed;
// bottom: 0` bar instead anchors to the FULL layout viewport, i.e. the true
// physical bottom (956). So the page scrolls naturally and the TabBar is fixed
// to the bottom. This mirrors the sibling posuda PWA, which has no gap.
export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [quickOpen, setQuickOpen] = useState(false);
  // One universal "+" for the whole app (quick-capture hub). Profile has no
  // quick-create, so the FAB is hidden there.
  const showFab = pathname !== '/profile';

  return (
    <OverlaysProvider>
      <AuthGuard>
        <LockGate>
          <ReminderWatcher />
          <div className="min-h-[100dvh] bg-[var(--bg)] lg:flex">
            <Sidebar />
            <main className="flex-1 min-w-0">
              <div className="mx-auto w-full max-w-[640px] px-4 pt-[max(var(--sat),16px)] pb-[calc(92px+var(--sab))]">
                <SwipeNav>{children}</SwipeNav>
              </div>
            </main>
          </div>
          <TabBar />
          {showFab && <Fab onClick={() => setQuickOpen(true)} />}
          <QuickCreate open={quickOpen} onClose={() => setQuickOpen(false)} />
        </LockGate>
      </AuthGuard>
    </OverlaysProvider>
  );
}
