import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Трекер',
    short_name: 'Трекер',
    description: 'Задачи, финансы, тренировки.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    // No 'minimal-ui' fallback: it can make the UA reserve space for a slim
    // toolbar (a phantom bottom strip), which is exactly the gap we're killing.
    display_override: ['standalone'],
    orientation: 'portrait',
    background_color: '#0A0B0F',
    theme_color: '#0A0B0F',
    lang: 'ru',
    categories: ['productivity', 'lifestyle', 'finance'],
    icons: [
      { src: '/icon', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icon', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
      { src: '/apple-icon', sizes: '180x180', type: 'image/png', purpose: 'any' },
    ],
  };
}
