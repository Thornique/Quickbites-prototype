import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * Standalone output bundles a minimal server into .next/standalone so the
   * VPS deployment in step 15 can run it under PM2 without node_modules.
   */
  output: "standalone",

  /**
   * All imagery is served from /public, so no remote patterns are configured.
   * AVIF/WebP keep the large food photography light on mobile data.
   */
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [360, 414, 640, 768, 1024, 1240, 1600],
    imageSizes: [64, 96, 128, 200, 256, 384],
  },

  /** Fail the production build on type or lint errors rather than shipping them. */
  typescript: { ignoreBuildErrors: false },
  eslint: { ignoreDuringBuilds: false },

  /** Prototype has no backend, so there is nothing to proxy or rewrite. */
  poweredByHeader: false,
  reactStrictMode: true,
};

export default nextConfig;
