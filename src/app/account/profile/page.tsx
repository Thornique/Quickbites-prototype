"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { LanguageToggle } from "@/components/site/language-toggle";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FormField, fieldAria } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { useSession } from "@/features/auth";
import { NotificationPreferences } from "@/features/notifications";
import { useT } from "@/i18n";
import { toErrorMessage } from "@/lib/errors";
import { changePassword, updateProfile } from "@/services/auth";
import { useSessionStore } from "@/store/session";

export default function AccountProfilePage() {
  const t = useT();
  const { user } = useSession();
  const refresh = useSessionStore((s) => s.refresh);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [isChanging, setIsChanging] = useState(false);

  useEffect(() => {
    if (!user) return;
    setName(user.name);
    setPhone(user.phone);
  }, [user]);

  const saveDetails = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSaving(true);
    try {
      await updateProfile({ name, phone });
      await refresh();
      toast.success(t.profile.saved);
    } catch (caught) {
      toast.error(toErrorMessage(caught));
    } finally {
      setIsSaving(false);
    }
  };

  const savePassword = async (event: React.FormEvent) => {
    event.preventDefault();
    setPasswordError(null);
    setIsChanging(true);
    try {
      await changePassword(currentPassword, newPassword);
      setCurrentPassword("");
      setNewPassword("");
      toast.success(t.profile.passwordChanged);
    } catch (caught) {
      setPasswordError(toErrorMessage(caught));
    } finally {
      setIsChanging(false);
    }
  };

  return (
    <div className="max-w-xl">
      <h1 className="text-display text-3xl text-ink uppercase sm:text-4xl">
        {t.profile.title}
      </h1>

      <Card className="mt-6 p-5">
        <h2 className="text-sm font-semibold text-ink">{t.profile.details}</h2>
        <form onSubmit={saveDetails} className="mt-4 grid gap-4">
          <FormField id="pf-name" label={t.checkout.name}>
            <Input
              {...fieldAria("pf-name")}
              value={name}
              onChange={(event) => setName(event.target.value)}
              autoComplete="name"
            />
          </FormField>
          <FormField id="pf-phone" label={t.checkout.phone}>
            <Input
              {...fieldAria("pf-phone")}
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              type="tel"
              inputMode="numeric"
              maxLength={10}
              autoComplete="tel-national"
            />
          </FormField>
          <Button type="submit" disabled={isSaving} className="justify-self-start">
            {t.profile.save}
          </Button>
        </form>
      </Card>

      <Card className="mt-5 p-5">
        <h2 className="text-sm font-semibold text-ink">{t.profile.changePassword}</h2>
        <form onSubmit={savePassword} className="mt-4 grid gap-4">
          <FormField id="pf-current" label={t.profile.currentPassword}>
            <PasswordInput
              {...fieldAria("pf-current")}
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
              autoComplete="current-password"
            />
          </FormField>
          <FormField
            id="pf-new"
            label={t.profile.newPassword}
            error={passwordError ?? undefined}
            hint={t.auth.passwordPlaceholder}
          >
            <PasswordInput
              {...fieldAria("pf-new", passwordError ?? undefined, t.auth.passwordPlaceholder)}
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              autoComplete="new-password"
            />
          </FormField>
          <Button
            type="submit"
            variant="outline"
            disabled={isChanging || !currentPassword || !newPassword}
            className="justify-self-start"
          >
            {t.profile.updatePassword}
          </Button>
        </form>
      </Card>

      <Card className="mt-5 p-5">
        <h2 className="text-sm font-semibold text-ink">{t.profile.language}</h2>
        <p className="mt-1 text-xs text-ink-muted">{t.profile.languageHint}</p>
        <LanguageToggle className="mt-3" />
      </Card>

      <NotificationPreferences className="mt-5" />
    </div>
  );
}
