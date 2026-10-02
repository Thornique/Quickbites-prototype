"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useSessionUser } from "@/features/auth";
import { useNotificationCopy, useT } from "@/i18n";
import { listSync } from "@/services/notifications";
import { subscribe } from "@/storage";
import type { AppNotification } from "@/types";
import { useNotificationPreferences } from "./index";

/** Short two-tone chime, synthesised so no audio file ships. */
function playChime(): void {
  try {
    const Ctx =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.15, ctx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.45);
    gain.connect(ctx.destination);

    for (const [freq, start] of [
      [880, 0],
      [1320, 0.12],
    ] as const) {
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.value = freq;
      osc.connect(gain);
      osc.start(ctx.currentTime + start);
      osc.stop(ctx.currentTime + start + 0.18);
    }
    window.setTimeout(() => void ctx.close(), 800);
  } catch {
    // Audio is a nicety; never let it break the page.
  }
}

/**
 * Watches for notifications arriving for the signed-in user and surfaces them
 * as toasts, an optional chime and — when the tab is hidden — a browser
 * notification.
 *
 * Mounted once in the root layout. It tracks ids it has already announced, so
 * re-reads caused by cross-tab sync never re-announce the same row.
 */
export function NotificationWatcher() {
  const t = useT();
  const router = useRouter();
  const user = useSessionUser();
  const copyFor = useNotificationCopy();
  const { preferences, update } = useNotificationPreferences();

  const seenRef = useRef<Set<string> | null>(null);
  const canPlaySoundRef = useRef(false);
  const [askBrowser, setAskBrowser] = useState(false);

  /*
    Browsers refuse audio until the user has interacted with the page, so the
    chime stays disarmed until the first real interaction.
  */
  useEffect(() => {
    const arm = () => {
      canPlaySoundRef.current = true;
    };
    window.addEventListener("pointerdown", arm, { once: true });
    window.addEventListener("keydown", arm, { once: true });
    return () => {
      window.removeEventListener("pointerdown", arm);
      window.removeEventListener("keydown", arm);
    };
  }, []);

  const announce = useCallback(
    (notification: AppNotification) => {
      const { title, body } = copyFor(notification.type, notification.params);
      const isHigh = notification.priority === "high";

      toast[isHigh ? "warning" : "message"](title, {
        description: body,
        // High-priority alerts stay until dismissed; the rest time out.
        duration: isHigh ? Infinity : 6000,
        action: notification.link
          ? {
              label: t.common.show,
              onClick: () => router.push(notification.link!),
            }
          : undefined,
      });

      if (isHigh && preferences.soundEnabled && canPlaySoundRef.current) playChime();

      if (
        preferences.browserEnabled &&
        typeof Notification !== "undefined" &&
        Notification.permission === "granted" &&
        document.visibilityState === "hidden"
      ) {
        try {
          new Notification(title, { body, tag: notification.id });
        } catch {
          // Unsupported on some mobile browsers; the toast already covered it.
        }
      }
    },
    [
      copyFor,
      preferences.browserEnabled,
      preferences.soundEnabled,
      router,
      t.common.show,
    ],
  );

  // Watch for new rows.
  useEffect(() => {
    if (!user) {
      seenRef.current = null;
      return;
    }

    const check = () => {
      const rows = listSync(user.id, { limit: 30 });
      // First pass only records what already exists — arriving at a page with
      // ten unread notifications must not fire ten toasts.
      if (seenRef.current === null) {
        seenRef.current = new Set(rows.map((n) => n.id));
        return;
      }
      for (const notification of [...rows].reverse()) {
        if (seenRef.current.has(notification.id)) continue;
        seenRef.current.add(notification.id);
        if (!notification.readAt) announce(notification);
      }
    };

    check();
    return subscribe(check, ["notifications"]);
  }, [user, announce]);

  // Unread high-priority alerts belong in the tab title.
  const { data: unreadHigh } = useUnreadHigh(user?.id);
  useEffect(() => {
    const base = document.title.replace(/^\(\d+\)\s*/, "");
    document.title = unreadHigh > 0 ? `(${unreadHigh}) ${base}` : base;
  }, [unreadHigh]);

  /*
    Ask for browser permission only once the reader has actually received
    something — never on first load, which browsers and people both dislike.
  */
  useEffect(() => {
    if (!user || preferences.browserEnabled) return;
    if (typeof Notification === "undefined") return;
    if (Notification.permission !== "default") return;
    if (listSync(user.id, { unreadOnly: true }).length === 0) return;
    const timer = window.setTimeout(() => setAskBrowser(true), 4000);
    return () => window.clearTimeout(timer);
  }, [user, preferences.browserEnabled]);

  useEffect(() => {
    if (!askBrowser) return;
    const id = toast(t.notifications.enableBrowser, {
      description: t.notifications.enableBrowserBody,
      duration: Infinity,
      action: {
        label: t.notifications.allow,
        onClick: () => {
          void Notification.requestPermission().then((result) => {
            update({ browserEnabled: result === "granted" });
            if (result === "denied") toast.error(t.notifications.browserBlocked);
          });
        },
      },
      cancel: { label: t.notifications.notNow, onClick: () => undefined },
    });
    setAskBrowser(false);
    return () => {
      toast.dismiss(id);
    };
  }, [askBrowser, t, update]);

  return null;
}

/** Unread high-priority count, polled through the sync channel. */
function useUnreadHigh(userId?: string): { data: number } {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!userId) {
      setCount(0);
      return;
    }
    const read = () =>
      setCount(
        listSync(userId, { unreadOnly: true }).filter((n) => n.priority === "high")
          .length,
      );
    read();
    return subscribe(read, ["notifications"]);
  }, [userId]);

  return { data: count };
}
