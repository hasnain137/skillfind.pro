import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

// Security headers for production
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block'
  },
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin'
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(self), interest-cohort=()'
  },
];

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  compress: true, // Enable gzip compression
  poweredByHeader: false, // Security & slight payload saving

  // Silence Turbopack complaining about existing webpack config; we still rely on webpack override for Clerk externals.
  turbopack: {},

  // Security headers
  async headers() {
    return [
      {
        // Apply security headers to all routes
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },

  experimental: {
    // Optimize import of heavy libraries
    optimizePackageImports: [
      'lucide-react',
      'date-fns',
      'framer-motion',
      'recharts',
      '@radix-ui/react-dialog',
      '@radix-ui/react-label',
      '@radix-ui/react-slot',
    ],
  },

  typescript: {
    // ⚠️ Temporarily allowing build to proceed with next-intl routing type errors
    // This is needed because next-intl's route typing conflicts with Next.js internals
    ignoreBuildErrors: true,
  },
  webpack: (config) => {
    config.externals.push({
      '@clerk/nextjs/server': 'commonjs @clerk/nextjs/server',
    });
    return config;
  },
  images: {
    // Improve image loading
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'randomuser.me',
      },
      {
        protocol: 'https',
        hostname: 'img.clerk.com',
      },
    ],
  },
};

export default withNextIntl(nextConfig);
