import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disable ESLint during builds for deployment
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Use standard output for Vercel deployment
  
  // Performance optimizations
  // experimental: {
  //   optimizeCss: true,
  // },
  // Compression
  compress: true,
  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
