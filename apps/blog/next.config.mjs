import path from 'path';
import createNextIntlPlugin from 'next-intl/plugin';
import bundleAnalyzer from '@next/bundle-analyzer';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  outputFileTracingRoot: path.join(import.meta.dirname, '../../'),
  outputFileTracingIncludes: {
    '/*': ['./content/**/*', './messages/**/*'],
  },
  transpilePackages: ['@mumak/ui'],
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i.scdn.co',
      },
    ],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
  },
  compress: true,
  poweredByHeader: false,
  experimental: {
    optimizePackageImports: ['next-mdx-remote-client', '@mumak/ui'],
  },
};

export default withBundleAnalyzer(withNextIntl(nextConfig));
