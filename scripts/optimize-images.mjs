/**
 * Re-encodes everything in public/images as WebP, capped at 1600px wide.
 *
 * The stock photography was downloaded as JPEG at whatever size the source
 * served. WebP at quality 78 is visually indistinguishable here and roughly
 * a third smaller, which matters on the phone connections most Quick Bites
 * customers order from.
 *
 * Run it by hand after adding photography, then commit the result:
 *
 *   node scripts/optimize-images.mjs            # convert, keep originals
 *   node scripts/optimize-images.mjs --replace  # convert and delete the source
 *
 * It is deliberately NOT part of `npm run build`: the output is committed, so
 * rebuilding it on every deploy would only burn Render's build minutes.
 */
import { readdir, stat, unlink } from "node:fs/promises";
import { dirname, extname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const imagesDir = join(root, "public", "images");

const MAX_WIDTH = 1600;
const QUALITY = 78;
const SOURCES = new Set([".jpg", ".jpeg", ".png"]);

const replace = process.argv.includes("--replace");

/** Every source image under public/images, recursively. */
async function collect(dir) {
  const found = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) found.push(...(await collect(full)));
    else if (SOURCES.has(extname(entry.name).toLowerCase())) found.push(full);
  }
  return found;
}

const files = await collect(imagesDir);
if (files.length === 0) {
  console.log("[optimize-images] nothing to do — no JPEG or PNG under public/images");
  process.exit(0);
}

let before = 0;
let after = 0;

for (const file of files) {
  const target = file.replace(/\.(jpe?g|png)$/i, ".webp");
  const source = sharp(file);
  const { width = 0, height = 0 } = await source.metadata();

  const info = await source
    // withoutEnlargement keeps the already-small menu shots at their own size
    // rather than upscaling them into a bigger, blurrier file.
    .resize({ width: MAX_WIDTH, withoutEnlargement: true })
    .webp({ quality: QUALITY })
    .toFile(target);

  const originalSize = (await stat(file)).size;
  before += originalSize;
  after += info.size;

  const saved = Math.round((1 - info.size / originalSize) * 100);
  console.log(
    `${relative(root, target).padEnd(46)} ${width}x${height} -> ${info.width}x${info.height}  ` +
      `${kb(originalSize)} -> ${kb(info.size)} (${saved > 0 ? "-" : "+"}${Math.abs(saved)}%)`,
  );

  if (replace) await unlink(file);
}

console.log(
  `\n[optimize-images] ${files.length} images: ${kb(before)} -> ${kb(after)} ` +
    `(${Math.round((1 - after / before) * 100)}% smaller)` +
    (replace ? ", originals deleted" : ", originals kept — pass --replace to remove them"),
);

function kb(bytes) {
  return `${Math.round(bytes / 1024)}KB`;
}
