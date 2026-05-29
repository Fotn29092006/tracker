// Minimal service worker — offline shell, network-first navigation,
// stale-while-revalidate for static assets (so CSS/JS updates land next load).
// Bump CACHE on a breaking shell/layout change to force installed PWAs to drop
// stale cached assets (activate wipes any cache name != CACHE). v2: app-shell
// layout rewrite (in-flow bottom nav). v8: full-bleed PWA shell — black-
// translucent status bar + fixed inset-0 frame (kills the iOS bottom band).
// v9: centralised safe-area vars, dropped minimal-ui, /shelltest harness.
// v10: on-device Diagnostics back in Profile (auto-expanded verdict).
// v11: REAL fix — iOS web view is 62px short of the screen (unfixable height);
// the strip below is theme-color (=--bg), so the tab bar is now --bg too → the
// seam blends away. Bar colour = page bg, distinguished only by its top hairline.
const CACHE = 'tracker-shell-v11';
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
