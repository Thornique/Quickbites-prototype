import { del, get, keys, set } from "idb-keyval";
import { AppError } from "@/lib/errors";
import { IDB_IMAGE_PREFIX } from "./keys";

/**
 * Admin-uploaded images live in IndexedDB, not localStorage: a handful of
 * data URLs would exhaust the ~5MB localStorage budget that the seeded demo
 * data also has to fit in. localStorage only ever stores the `idb:` key.
 */

const MAX_BYTES = 200 * 1024;
const MAX_EDGE = 1280;

export function isIdbImage(src: string): boolean {
  return src.startsWith(IDB_IMAGE_PREFIX);
}

function toIdbKey(id: string): string {
  return `${IDB_IMAGE_PREFIX}${id}`;
}

/**
 * Downscale and re-encode to WebP until the result fits the budget.
 * Returns the stored key, which is what belongs in a MenuItem.images entry.
 */
export async function storeUploadedImage(file: File, id: string): Promise<string> {
  const blob = await compressToWebp(file);
  if (blob.size > MAX_BYTES) {
    throw new AppError(
      "VALIDATION",
      "That image is too large even after compression. Try a smaller or simpler picture.",
    );
  }

  const key = toIdbKey(id);
  try {
    await set(key, blob);
  } catch {
    throw new AppError(
      "STORAGE_FULL",
      "Browser storage is full. Remove some uploaded images before adding more.",
    );
  }
  return key;
}

/** Resolve a stored key to an object URL. Callers must revoke it when done. */
export async function getUploadedImageUrl(key: string): Promise<string | null> {
  if (!isIdbImage(key)) return key;
  const blob = await get<Blob>(key);
  return blob ? URL.createObjectURL(blob) : null;
}

export async function deleteUploadedImage(key: string): Promise<void> {
  if (isIdbImage(key)) await del(key);
}

/** Total bytes held in the image store, shown on the dev data screen. */
export async function getUploadedImageFootprint(): Promise<{
  count: number;
  bytes: number;
}> {
  const all = await keys();
  const imageKeys = all.filter(
    (k): k is string => typeof k === "string" && isIdbImage(k),
  );
  let bytes = 0;
  for (const key of imageKeys) {
    const blob = await get<Blob>(key);
    if (blob) bytes += blob.size;
  }
  return { count: imageKeys.length, bytes };
}

/** Draw the image to a canvas at a capped size and encode as WebP. */
async function compressToWebp(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new AppError("VALIDATION", "Could not read that image.");
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  // Step the quality down until it fits, rather than guessing once.
  for (const quality of [0.82, 0.7, 0.58, 0.45]) {
    const blob = await canvasToBlob(canvas, quality);
    if (blob.size <= MAX_BYTES) return blob;
  }
  return canvasToBlob(canvas, 0.35);
}

function canvasToBlob(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) =>
        blob
          ? resolve(blob)
          : reject(new AppError("VALIDATION", "Could not encode that image.")),
      "image/webp",
      quality,
    );
  });
}
