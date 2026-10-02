"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { DemoAccounts } from "@/components/site/demo-accounts";
import { LanguageToggle } from "@/components/site/language-toggle";
import { Button } from "@/components/ui/button";
import { FormField, fieldAria } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { useSession } from "@/features/auth";
import { useT } from "@/i18n";
import { toErrorMessage } from "@/lib/errors";
import { signInSchema, type SignInValues } from "@/lib/validation";
import { useSessionStore } from "@/store/session";

function safeNext(next: string | null): string {
  if (!next || !next.startsWith("/admin")) return "/admin";
  return next;
}

export function AdminLoginForm() {
  const t = useT();
  const router = useRouter();
  const searchParams = useSearchParams();
  const signInAsAdmin = useSessionStore((s) => s.signInAsAdmin);
  const { user, isReady, isAdmin } = useSession();
  const [formError, setFormError] = useState<string | null>(null);

  const next = safeNext(searchParams.get("next"));

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<SignInValues>({
    resolver: zodResolver(signInSchema(t)),
    defaultValues: { email: "", password: "" },
  });

  // An admin who is already signed in should go straight through.
  useEffect(() => {
    if (isReady && user && isAdmin) router.replace(next);
  }, [isReady, user, isAdmin, next, router]);

  // A submit error stops applying the moment the user edits the form.
  useEffect(() => {
    const subscription = watch(() => setFormError(null));
    return () => subscription.unsubscribe();
  }, [watch]);

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      const admin = await signInAsAdmin(values.email, values.password);
      toast.success(t.auth.welcomeBack(admin.name));
      router.replace(next);
    } catch (error) {
      // Covers "no admin access", "not active" and wrong credentials, each
      // phrased by the service so the reason is never guessed at here.
      setFormError(toErrorMessage(error));
    }
  });

  return (
    <div className="flex min-h-dvh flex-col bg-ink">
      <header className="border-b border-white/10">
        <div className="mx-auto flex h-16 w-full max-w-[26rem] items-center justify-between gap-4 px-4">
          <span className="text-display text-xl text-white uppercase">Quick Bites</span>
          <LanguageToggle tone="dark" />
        </div>
      </header>

      <main className="flex flex-1 items-start justify-center px-4 py-10 sm:items-center">
        <div className="w-full max-w-[26rem]">
          <span className="inline-flex size-11 items-center justify-center rounded-control bg-brand text-white">
            <ShieldCheck size={22} strokeWidth={1.75} aria-hidden="true" />
          </span>
          <h1 className="text-display mt-4 text-3xl text-white uppercase">
            {t.auth.adminTitle}
          </h1>
          <p className="mt-2 text-sm text-white/70">{t.auth.adminSubtitle}</p>

          <form onSubmit={onSubmit} noValidate className="mt-7 grid gap-4">
            <FormField
              id="admin-email"
              label={t.auth.email}
              error={errors.email?.message}
              className="[&_label]:text-white/80"
            >
              <Input
                {...register("email")}
                {...fieldAria("admin-email", errors.email?.message)}
                type="email"
                autoComplete="email"
                placeholder={t.auth.emailPlaceholder}
                className="border-white/15 bg-white/5 text-white placeholder:text-white/55"
              />
            </FormField>

            <FormField
              id="admin-password"
              label={t.auth.password}
              error={errors.password?.message}
              className="[&_label]:text-white/80"
            >
              <PasswordInput
                {...register("password")}
                {...fieldAria("admin-password", errors.password?.message)}
                autoComplete="current-password"
                className="border-white/15 bg-white/5 text-white placeholder:text-white/55"
              />
            </FormField>

            {formError && (
              <p
                role="alert"
                className="rounded-control border border-danger/40 bg-danger/15 px-3 py-2.5 text-sm font-medium text-white"
              >
                {formError}
              </p>
            )}

            <Button
              type="submit"
              size="lg"
              disabled={isSubmitting}
              className="mt-1 w-full"
            >
              {isSubmitting ? t.auth.signingIn : t.auth.adminCta}
            </Button>
          </form>

          <DemoAccounts
            className="mt-7"
            tone="dark"
            show={["superAdmin", "admin"]}
            onFill={(email, password) => {
              setValue("email", email, { shouldValidate: true });
              setValue("password", password, { shouldValidate: true });
              setFormError(null);
            }}
          />

          <p className="mt-7 text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-sm text-white/70 transition-colors hover:text-white"
            >
              <ArrowLeft size={16} aria-hidden="true" />
              {t.auth.backToSite}
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
