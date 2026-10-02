"use client";

import { useEffect, useState } from "react";
import { getUploadedImageUrl, isIdbImage } from "@/storage";

/**
 * Resolves an image reference to something an <img> can load.
 *
 * Seed photos are plain paths under /public and pass straight through. An
 * admin upload is an `idb:` key pointing at a blob in IndexedDB, which has to
 * become an object URL first — and be revoked again, or every re-render of a
 * menu grid leaks a few hundred kilobytes.
 *
 * Returns undefined while an upload is still loading, which callers treat the
 * same as "no image" and show the branded placeholder for.
 */
export function useResolvedImage(src?: string): string | undefined {
  const [resolved, setResolved] = useState<string | undefined>(
    src && !isIdbImage(src) ? src : undefined,
  );

  useEffect(() => {
    if (!src) {
      setResolved(undefined);
      return;
    }
    if (!isIdbImage(src)) {
      setResolved(src);
      return;
    }

    let objectUrl: string | null = null;
    let cancelled = false;

    void getUploadedImageUrl(src).then((url) => {
      if (cancelled) {
        if (url) URL.revokeObjectURL(url);
        return;
      }
      objectUrl = url;
      setResolved(url ?? undefined);
    });

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [src]);

  return resolved;
}
