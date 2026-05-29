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
    // 'black' = opaque dark status bar with the web view below it (white system
    // text reads on our dark top). The bottom gap is NOT a status-bar problem —
    // it's solved in the layout: the TabBar is position:fixed bottom:0, which
    // reaches the true physical screen bottom regardless of status-bar style.
    // Mirrors the working sibling PWA (posuda, which uses natural scroll + a
    // fixed bottom bar).
    statusBarStyle: 'black',
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
const themeScript = `(function(){try{var m=localStorage.getItem('tracker-theme');var t;if(m==='light'||m==='dark'){t=m;}else if(m==='auto'){var h=new Date().getHours();t=(h>=7&&h<19)?'light':'dark';}else{t='dark';}document.documentElement.dataset.theme=t;document.documentElement.style.colorScheme=t;var mc=document.querySelector('meta[name="theme-color"]');if(mc){mc.setAttribute('content',t==='light'?'#F5F6FA':'#0A0B0F');}}catch(e){}})();`;

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
