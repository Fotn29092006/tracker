import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion'],
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      // Supabase Storage public URLs for progress photos.
      { protocol: 'https', hostname: '*.supabase.co' },
    ],
  },
};

export default nextConfig;
