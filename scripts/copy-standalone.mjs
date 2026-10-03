/**
 * Next's `output: "standalone"` build writes a self-contained server to
 * `.next/standalone`, but it deliberately leaves out two things: the static
 * chunks and anything in `public`. Without them the server boots and then
 * serves a page with no CSS, no JS and no images.
 *
 * Copying them in is the documented final step. `fs.cpSync` is used rather
 * than a shell `cp -r` so the same command works on Windows (where we build
 * locally) and on Linux (where Render builds).
 *
 * Run by `npm run build:render`, after `next build`.
 */
import { cpSync, existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const standalone = join(root, ".next", "standalone");

if (!existsSync(standalone)) {
  console.error(
    "[copy-standalone] .next/standalone is missing. Run `next build` first, " +
      'and check that next.config.ts still sets output: "standalone".',
  );
  process.exit(1);
}

/** [what we are copying, from, to] */
const copies = [
  ["public", join(root, "public"), join(standalone, "public")],
  [".next/static", join(root, ".next", "static"), join(standalone, ".next", "static")],
];

for (const [label, from, to] of copies) {
  if (!existsSync(from)) {
    console.error(`[copy-standalone] ${label} not found at ${from}`);
    process.exit(1);
  }
  cpSync(from, to, { recursive: true });
  console.log(`[copy-standalone] ${label} -> ${to.replace(root, ".")}`);
}

console.log("[copy-standalone] done. Start with: node .next/standalone/server.js");
