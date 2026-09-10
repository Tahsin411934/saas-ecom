import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "admin.onehaatbd.com",
        pathname: "/storage/**",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "8000",
        pathname: "/storage/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "8000",
        pathname: "/storage/**",
      },
      {
        protocol: "https",
        hostname: "**.cloudfront.net",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "**.onehaatbd.com",
        pathname: "/**",
      },
      {
        // Legacy backend host (migrated to admin.onehaatbd.com) — kept so any
        // stale URL that slips through does not crash the image optimizer.
        protocol: "https",
        hostname: "pos.aftsoftandlimited.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "onehaatbd.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "via.placeholder.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "picsum.photos",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "picsum.photos",
        pathname: "/**",
      },
    ],
    formats: ["image/avif", "image/webp"],
    deviceSizes: [480, 640, 768, 1024, 1280, 1536],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    minimumCacheTTL: 0,
  },
  reactStrictMode: true,
  compress: true,
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-DNS-Prefetch-Control", value: "on" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
          { key: "Referrer-Policy", value: "origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
        ],
      },
      {
        source: "/images/(.*)",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
      {
        source: "/fonts/(.*)",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
    ];
  },
  poweredByHeader: false,
  async rewrites() {
    return [
      // Sitemap product chunks: /sitemap/products-0.xml → /sitemap-chunk/0.
      // Turbopack does not match dynamic route segments whose URL segment
      // contains a dot, so chunk files are rewritten to a dot-free internal
      // route. afterFiles (array form) keeps /sitemap.xml and
      // /sitemap/static.xml — real filesystem routes — matching first.
      {
        source: "/sitemap/products-:num(\\d+).xml",
        destination: "/sitemap-chunk/:num",
      },
    ];
  },
};

export default nextConfig;