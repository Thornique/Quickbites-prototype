"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useT } from "@/i18n";
import { useNotificationPreferences } from "./index";

/**
 * Sound and browser-notification toggles. Turning browser notifications on
 * requests permission there and then — the switch reflects the real browser
 * state afterwards rather than pretending it was granted.
 */
export function NotificationPreferences({ className }: { className?: string }) {
  const t = useT();
  const { preferences, update } = useNotificationPreferences();
  const [sound, setSound] = useState(preferences.soundEnabled);
  const [browser, setBrowser] = useState(preferences.browserEnabled);

  const supportsBrowser = typeof window !== "undefined" && "Notification" in window;

  const handleBrowser = async (next: boolean) => {
    if (!next) {
      setBrowser(false);
      update({ browserEnabled: false });
      return;
    }
    if (!supportsBrowser) {
      toast.error(t.notifications.browserBlocked);
      return;
    }
    const result = await Notification.requestPermission();
    const granted = result === "granted";
    setBrowser(granted);
    update({ browserEnabled: granted });
    if (!granted) toast.error(t.notifications.browserBlocked);
  };

  return (
    <Card className={className}>
      <div className="p-5">
        <h2 className="text-sm font-semibold text-ink">
          {t.notifications.preferences}
        </h2>

        <div className="mt-4 grid gap-4">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <Label htmlFor="notify-sound" className="font-normal">
                {t.notifications.sound}
              </Label>
              <p className="mt-0.5 text-xs text-ink-muted">
                {t.notifications.soundHint}
              </p>
            </div>
            <Switch
              id="notify-sound"
              checked={sound}
              onCheckedChange={(next) => {
                setSound(next);
                update({ soundEnabled: next });
              }}
            />
          </div>

          <div className="flex items-start justify-between gap-4 border-t border-hairline pt-4">
            <div className="min-w-0">
              <Label htmlFor="notify-browser" className="font-normal">
                {t.notifications.browser}
              </Label>
              <p className="mt-0.5 text-xs text-ink-muted">
                {supportsBrowser
                  ? t.notifications.browserHint
                  : t.notifications.browserBlocked}
              </p>
            </div>
            <Switch
              id="notify-browser"
              checked={browser}
              disabled={!supportsBrowser}
              onCheckedChange={(next) => void handleBrowser(next)}
            />
          </div>
        </div>
      </div>
    </Card>
  );
}
