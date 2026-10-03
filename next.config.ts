import bundleAnalyzer from "@next/bundle-analyzer";
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

  /** gzip the HTML and JSON the standalone server sends on Render. */
  compress: true,

  /*
    Barrel files re-export everything, so importing one icon can pull the whole
    package into a page bundle. Next rewrites these imports to their deep paths
    at build time, which keeps lucide tree-shaken as the icon count grows.
  */
  experimental: {
    optimizePackageImports: ["lucide-react", "recharts", "date-fns"],
  },
};

/** `ANALYZE=true npm run build` writes the treemaps to .next/analyze. */
export default bundleAnalyzer({ enabled: process.env.ANALYZE === "true" })(
  nextConfig,
);
