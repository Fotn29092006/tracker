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
const CACHE = 'tracker-shell-v28';
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
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
          return res;
        })
        .catch(() => caches.match(req).then((m) => m || caches.match('/'))),
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
