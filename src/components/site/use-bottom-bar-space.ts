"use client";

import { useEffect } from "react";

/**
 * Reserves vertical space for a sticky bottom bar.
 *
 * Sets `--mobile-bar-height` on the document root, which is what the floating
 * contact buttons offset themselves by. It has to be the root: custom
 * properties inherit downward, so setting it on the bar itself is invisible to
 * the FAB, which is a sibling several levels away.
 *
 * Step 6's sticky cart bar will use the same hook, so the two bars and the
 * FAB can never stack on top of each other.
 */
export function useBottomBarSpace(height: string | null): void {
  useEffect(() => {
    if (!height) return;
    const root = document.documentElement;
    root.style.setProperty("--mobile-bar-height", height);
    return () => {
      root.style.removeProperty("--mobile-bar-height");
    };
  }, [height]);
}
