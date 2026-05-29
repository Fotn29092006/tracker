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
const CACHE = 'tracker-shell-v16';
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
