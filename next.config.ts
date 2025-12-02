import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  // Silence Turbopack complaining about existing webpack config; we still rely on webpack override for Clerk externals.
  turbopack: {},
  typescript: {
    // ⚠️ Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    ignoreBuildErrors: true,
  },
  webpack: (config) => {
    config.externals.push({
      '@clerk/nextjs/server': 'commonjs @clerk/nextjs/server',
    });
    return config;
  },
};

export default nextConfig;
