'use client';

import { useEffect } from 'react';

// Dual-mode: tracker stays a normal PWA, but when it's opened INSIDE Telegram as
// a Mini App we load Telegram's SDK and go full-screen. That unlocks the native
// host — real haptics (see lib/haptics.ts), native back-swipe, Telegram's
// optimized webview — i.e. the "feels like a real app" layer a bare iOS PWA
// can't reach. Outside Telegram this is a no-op (no external script loaded), so
// the offline-first PWA is unaffected.
export function TelegramInit() {
  useEffect(() => {
    const w = window as unknown as {
      TelegramWebviewProxy?: unknown;
      Telegram?: { WebApp?: { ready?: () => void; expand?: () => void } };
    };
    const inTelegram =
      !!w.TelegramWebviewProxy ||
      /tgWebApp/i.test(window.location.hash) ||
      /tgWebApp/i.test(window.location.search);
    if (!inTelegram) return;

    const init = () => {
      const wa = w.Telegram?.WebApp;
      try { wa?.ready?.(); wa?.expand?.(); } catch { /* ignore */ }
    };

    if (w.Telegram?.WebApp) { init(); return; }

    const s = document.createElement('script');
    s.src = 'https://telegram.org/js/telegram-web-app.js';
    s.async = true;
    s.onload = init;
    document.head.appendChild(s);
  }, []);

  return null;
}
