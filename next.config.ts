import { createRequire } from "node:module";
import { join } from "node:path";
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

/**
 * `ANALYZE=true npm run build` writes the treemaps to .next/analyze.
 *
 * @next/bundle-analyzer is a devDependency, so it is absent whenever the host
 * installs production deps only (Render sets NODE_ENV=production). A top-level
 * import would then crash the build while loading this file, so the package is
 * required lazily and only when the treemaps were actually asked for.
 */
type ConfigWrapper = (config: NextConfig) => NextConfig;
type BundleAnalyzer = (options: { enabled: boolean }) => ConfigWrapper;

function withBundleAnalyzer(config: NextConfig): NextConfig {
  if (process.env.ANALYZE !== "true") return config;

  const require = createRequire(join(process.cwd(), "next.config.ts"));
  const bundleAnalyzer = require("@next/bundle-analyzer") as BundleAnalyzer;
  return bundleAnalyzer({ enabled: true })(config);
}

export default withBundleAnalyzer(nextConfig);
