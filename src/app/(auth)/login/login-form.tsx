"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { DemoAccounts } from "@/components/site/demo-accounts";
import { Button } from "@/components/ui/button";
import { FormField, fieldAria } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { useSession, useSessionActions } from "@/features/auth";
import { useT } from "@/i18n";
import { toErrorMessage } from "@/lib/errors";
import { signInSchema, type SignInValues } from "@/lib/validation";

/** Only allow same-site relative paths back, never an absolute URL. */
function safeNext(next: string | null): string {
  if (!next || !next.startsWith("/") || next.startsWith("//")) return "/account";
  return next;
}

export function LoginForm() {
  const t = useT();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signIn } = useSessionActions();
  const { user, isReady } = useSession();
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

  // Already signed in — do not make them log in twice.
  useEffect(() => {
    if (isReady && user) router.replace(next);
  }, [isReady, user, next, router]);

  // A submit error stops applying the moment the user edits the form.
  useEffect(() => {
    const subscription = watch(() => setFormError(null));
    return () => subscription.unsubscribe();
  }, [watch]);

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      const signedIn = await signIn(values.email, values.password);
      toast.success(t.auth.welcomeBack(signedIn.name));
      router.replace(next);
    } catch (error) {
      setFormError(toErrorMessage(error));
    }
  });

  return (
    <div>
      <h1 className="text-display text-3xl text-ink uppercase">{t.auth.loginTitle}</h1>
      <p className="mt-2 text-sm text-ink-muted">{t.auth.loginSubtitle}</p>

      <form onSubmit={onSubmit} noValidate className="mt-7 grid gap-4">
        <FormField id="email" label={t.auth.email} error={errors.email?.message}>
          <Input
            {...register("email")}
            {...fieldAria("email", errors.email?.message)}
            type="email"
            autoComplete="email"
            placeholder={t.auth.emailPlaceholder}
          />
        </FormField>

        <FormField
          id="password"
          label={t.auth.password}
          error={errors.password?.message}
        >
          <PasswordInput
            {...register("password")}
            {...fieldAria("password", errors.password?.message)}
            autoComplete="current-password"
          />
        </FormField>

        {formError && (
          <p
            role="alert"
            className="rounded-control border border-danger/30 bg-danger/10 px-3 py-2.5 text-sm font-medium text-danger"
          >
            {formError}
          </p>
        )}

        <Button type="submit" size="lg" disabled={isSubmitting} className="mt-1 w-full">
          {isSubmitting ? t.auth.signingIn : t.auth.loginCta}
        </Button>
      </form>

      <p className="mt-5 text-center text-sm text-ink-muted">
        {t.auth.noAccount}{" "}
        <Link
          href={`/signup?next=${encodeURIComponent(next)}`}
          className="font-semibold text-brand underline decoration-brand/30 underline-offset-4 hover:decoration-brand"
        >
          {t.auth.createOne}
        </Link>
      </p>

      <DemoAccounts
        className="mt-7"
        show={["customer", "admin", "superAdmin"]}
        onFill={(email, password) => {
          setValue("email", email, { shouldValidate: true });
          setValue("password", password, { shouldValidate: true });
          setFormError(null);
        }}
      />
    </div>
  );
}
