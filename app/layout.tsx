import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import { Providers } from '@/components/providers';
import { ThemeProvider } from '@/components/theme-provider';
import { ServiceWorkerRegister } from '@/components/ServiceWorkerRegister';
import './globals.css';

export const metadata: Metadata = {
  title: 'Трекер',
  description: 'Задачи, финансы, тренировки.',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    // 'black-translucent' = the web view owns the FULL physical screen, edge to
    // edge, top to bottom. With opaque 'black'/'default', iOS in standalone on
    // Dynamic Island iPhones sizes the web view to (screen − safe-top) and
    // leaves a ~62px system band at the BOTTOM that lives OUTSIDE the web
    // viewport — so no shell height (dvh/svh/lvh) can ever fill it (that band
    // was the bottom gap). Going full-bleed removes the band; we inset content
    // ourselves via env(safe-area-inset-*). Trade-off: system status-bar text is
    // always light — a theme-aware top scrim (AppShell) keeps it legible.
    statusBarStyle: 'black-translucent',
    title: 'Трекер',
  },
  icons: { icon: '/icon', apple: '/apple-icon' },
  // Android/Chrome parity for the apple-* standalone hint above.
  other: { 'mobile-web-app-capable': 'yes' },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#0A0B0F',
};

// Anti-flash: set data-theme during HTML parse, before React hydrates, so the
// first paint already uses the right palette (no dark→light flicker).
const themeScript = `(function(){try{var m=localStorage.getItem('tracker-theme');var t;if(m==='light'||m==='dark'){t=m;}else if(m==='auto'){var h=new Date().getHours();t=(h>=7&&h<19)?'light':'dark';}else{t='dark';}document.documentElement.dataset.theme=t;document.documentElement.style.colorScheme=t;}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="ru"
      className={`${GeistSans.variable} ${GeistMono.variable}`}
      suppressHydrationWarning
    >
      <body suppressHydrationWarning>
        <Script id="theme-init" strategy="beforeInteractive">
          {themeScript}
        </Script>
        <Providers>
          <ThemeProvider>{children}</ThemeProvider>
        </Providers>
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
