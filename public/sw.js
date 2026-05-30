// Minimal service worker — offline shell, network-first navigation,
// stale-while-revalidate for static assets (so CSS/JS updates land next load).
// Bump CACHE on a breaking shell/layout change to force installed PWAs to drop
// stale cached assets (activate wipes any cache name != CACHE). v2: app-shell
// layout rewrite (in-flow bottom nav). v8: full-bleed PWA shell — black-
// translucent status bar + fixed inset-0 frame (kills the iOS bottom band).
// v9: centralised safe-area vars, dropped minimal-ui, /shelltest harness.
// v10: on-device Diagnostics back in Profile (auto-expanded verdict).
// v11: bar colour-matched the off-screen strip (interim).
// v12: REAL fix — natural document scroll + TabBar position:fixed bottom:0
// (reaches the true physical bottom on iOS standalone, like the posuda PWA).
// Status bar back to 'black'; bar restored to --bg-elev.
// v13: removed the temporary Diagnostics block + /shelltest harness.
// v14: UI/UX P1 — a11y + 44px tap targets (Check/Switch/IconButton hit areas,
// nav aria-current, sheet dialog semantics + focus trap, label contrast AA).
// v15: UI/UX P2 — haptics that actually fire on iOS (hidden <input switch>
// trick; vibrate is a no-op there), swipe-to-arm tick, destructive warning buzz.
// v16: UI/UX P3 step 1 — responsive Sparkline + 14-day spend trend on the
// Finance dashboard card.
// v17: haptics reality check — iOS 26.5 patched the programmatic switch trick,
// so Switch is now a real native <input switch> under our skin (real-tap haptic
// is the only method left); dropped the dead programmatic hack from haptics.ts.
// v18: UI/UX P3 step 2 — day-progress bar on the Tasks dashboard card.
// v19: UI/UX P4 perf — progress bar animates transform(scaleX) not width;
// TaskRow memoised with stable handlers (no re-render storm on the task list).
// v20: Nocturne+ redesign batch 1 — floating-pill TabBar (6 tabs incl Profile),
// global motion keyframes, content/FAB spacing for the floating bar.
// v21: redesign batch 2 — NextUpCard on Home + per-digit AnimatedNumber.
// v22: redesign batch 3 — TaskQuickAdd smart-input sheet (parser:
// date/time/#tag/🔥) wired to the Home + Tasks FAB; advanced opens full form.
// v23: fix profile save (upsert + getUserId, was a no-op UPDATE on a missing
// row / cold-start userId); redesign #5 — SpendingWheel on Finance + larger hero.
// v24: redesign #8 (part) — profile photo avatar upload (72px, camera badge),
// stored in the progress bucket; needs the avatar_url column (migration 0003).
// v25: redesign #7 — Notes mood colours (migration 0004 color column), pinned
// section, search; note creation tolerates the pre-migration state.
// v26: profile save hardened — UPDATE existing row (+ insert fallback) instead
// of upsert (which needs an INSERT policy profiles may lack); clearer avatar
// error pointing at the avatar_url migration.
// v27: explicit success/error toast on profile save (name/height) — confirms
// the write and surfaces any real error (DB verified fine; UPDATE fix in v26).
// v28: REAL profile bug — useProfile read was gated on useUserId()/getUser()
// which returns undefined in standalone PWA, so the query never ran and saved
// data never displayed. Read now uses the reliable session id (getUserId).
// v29: avatar cropper — pan + zoom in a circle, exports a framed JPEG.
// v30: redesign #9 — LockScreen with 88px avatar + greeting; PIN dots glow.
// v31: native-feel polish — no long-press callout, no accidental text-select on
// the chrome (inputs keep selection), no overscroll rubber-band on either axis.
// v32: deep perf pass 1 (audit-driven) — staleTime 5m + refetchOnReconnect:true
// (no refetch storms / tab-return flashes), memoised Overlays value + useAccounts
// /useGoals derivations (kills app-wide + balance-flip re-renders), dropped
// framer `layout` from task/goal rows (no FLIP per mutation), removed muscle-
// panel mode=wait lag, deleted dead useUserId.
// v33: deep perf pass 2 — code-split BodyFigure + AvatarCropper (next/dynamic),
// optimise Supabase avatar/progress images (drop unoptimized), SWR navigation
// for instant cold launch.
// v34: launch splash gate — hold a logo splash until the idb cache restores,
// so cold launch is splash -> content (no empty -> skeleton -> data flash).
// v35: deep perf pass 3 — synchronous gates: AuthGuard shows the splash (not a
// blank frame) while the session resolves; LockGate seeds `locked` from
// localStorage in the initializer + renders ONLY the lock (no flash of app
// content before the PIN screen on cold start).
// v36: universal "+" quick-create hub — one floating FAB (in AppShell) opens a
// sheet to add Расход/Доход/Задача/Заметка/Тренировка as small animated blocks,
// no page nav; per-screen FABs removed (goals/debts/savings get inline + rows).
// Swipe between the main tabs (SwipeNav) + direction-aware page slide.
// v37: polish pass (audit-driven). 1/ correctness: light-theme tokens (logo bars,
// spending wheel, note tints), no silent failures (try/catch+toast on every
// delete/contribute/settle/undo), guards (pending, empty name, NaN fmtAmount).
// 2/ motion: springs unified to tokens (Button/Check/Fab/TabBar/hero), debt-
// settle + account balances animate, lightbox/PIN easing tokenized. 3/ visual:
// Profile cold-start skeleton + section-header style; chip name truncation.
// v38: polish pass 2 — quick-hub blocks spring on press + success toasts after
// each quick add; sparkline trend draws in (pathLength); workout-plan mutations
// surface errors; EmptyState + goal-step radii tokenized.
// v39: native-feel pass (skill-driven: vercel react-best-practices + web-design
// + cloudflare web-perf + fixing-motion-performance). Sticky title header
// (IntersectionObserver hairline); fluid hero numbers (clamp); UI chrome is
// non-selectable / no long-press magnifier (note bodies opt back in); overlays
// lock background scroll (useScrollLock); dropped backdrop-blur; 44px stepper
// hit areas; responsive notes grid. Perf: ReminderWatcher interval no longer
// recreated per task mutation; memoised Home + NextUpCard derivations;
// optimizePackageImports += @tanstack.
// v40: learned from the posuda app (calm CSS ease-out timing, no stiff springs).
// Swipe between tabs now FOLLOWS THE FINGER (drag pager: page tracks the touch,
// rubber-bands at the ends, commits or springs back on release) instead of an
// instant jump. Softened motion everywhere (sheet open is a 0.3s ease-out tween,
// tab pill spring 620->340) so opening the quick-hub / switching tabs feels
// smooth, not abrupt.
const CACHE = 'tracker-shell-v40';
const SHELL = ['/', '/sign-in', '/manifest.webmanifest'];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL).catch(() => {})));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))),
    ),
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/auth/')) return;

  if (req.mode === 'navigate') {
    // Stale-while-revalidate: serve the cached shell instantly (instant cold
    // launch), revalidate in the background. The cache is wiped on every CACHE
    // bump (activate), so a deploy can't serve a stale shell; the SW
    // controllerchange reload lands the fresh version.
    event.respondWith(
      caches.match(req).then((cached) => {
        const network = fetch(req)
          .then((res) => {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
            return res;
          })
          .catch(() => cached || caches.match('/'));
        return cached || network;
      }),
    );
    return;
  }

  if (url.pathname.startsWith('/_next/static') || /\.(png|jpg|svg|webp|ico|woff2?|css|js)$/.test(url.pathname)) {
    event.respondWith(
      caches.match(req).then((cached) => {
        const network = fetch(req)
          .then((res) => {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
            return res;
          })
          .catch(() => cached);
        return cached || network;
      }),
    );
  }
});
