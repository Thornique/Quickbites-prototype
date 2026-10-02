"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { FormField, fieldAria } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { useSession } from "@/features/auth";
import { useT } from "@/i18n";
import { toErrorMessage } from "@/lib/errors";
import { signUpSchema, type SignUpValues } from "@/lib/validation";
import { useSessionStore } from "@/store/session";

function safeNext(next: string | null): string {
  if (!next || !next.startsWith("/") || next.startsWith("//")) return "/account";
  return next;
}

export function SignupForm() {
  const t = useT();
  const router = useRouter();
  const searchParams = useSearchParams();
  const signUp = useSessionStore((s) => s.signUp);
  const { user, isReady } = useSession();
  const [formError, setFormError] = useState<string | null>(null);

  const next = safeNext(searchParams.get("next"));

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema(t)),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
    },
  });

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
      await signUp({
        name: values.name,
        email: values.email,
        phone: values.phone,
        password: values.password,
      });
      toast.success(t.auth.accountCreated);
      router.replace(next);
    } catch (error) {
      setFormError(toErrorMessage(error));
    }
  });

  return (
    <div>
      <h1 className="text-display text-3xl text-ink uppercase">{t.auth.signupTitle}</h1>
      <p className="mt-2 text-sm text-ink-muted">{t.auth.signupSubtitle}</p>

      <form onSubmit={onSubmit} noValidate className="mt-7 grid gap-4">
        <FormField id="name" label={t.auth.name} error={errors.name?.message}>
          <Input
            {...register("name")}
            {...fieldAria("name", errors.name?.message)}
            autoComplete="name"
            placeholder={t.auth.namePlaceholder}
          />
        </FormField>

        <FormField id="email" label={t.auth.email} error={errors.email?.message}>
          <Input
            {...register("email")}
            {...fieldAria("email", errors.email?.message)}
            type="email"
            autoComplete="email"
            placeholder={t.auth.emailPlaceholder}
          />
        </FormField>

        <FormField id="phone" label={t.auth.phone} error={errors.phone?.message}>
          <Input
            {...register("phone")}
            {...fieldAria("phone", errors.phone?.message)}
            type="tel"
            inputMode="numeric"
            maxLength={10}
            autoComplete="tel-national"
            placeholder={t.auth.phonePlaceholder}
          />
        </FormField>

        <FormField
          id="password"
          label={t.auth.password}
          error={errors.password?.message}
          hint={t.auth.passwordPlaceholder}
        >
          <PasswordInput
            {...register("password")}
            {...fieldAria(
              "password",
              errors.password?.message,
              t.auth.passwordPlaceholder,
            )}
            autoComplete="new-password"
          />
        </FormField>

        <FormField
          id="confirmPassword"
          label={t.auth.confirmPassword}
          error={errors.confirmPassword?.message}
        >
          <PasswordInput
            {...register("confirmPassword")}
            {...fieldAria("confirmPassword", errors.confirmPassword?.message)}
            autoComplete="new-password"
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
          {isSubmitting ? t.auth.creatingAccount : t.auth.signupCta}
        </Button>
      </form>

      <p className="mt-5 text-center text-sm text-ink-muted">
        {t.auth.haveAccount}{" "}
        <Link
          href={`/login?next=${encodeURIComponent(next)}`}
          className="font-semibold text-brand underline decoration-brand/30 underline-offset-4 hover:decoration-brand"
        >
          {t.auth.signInInstead}
        </Link>
      </p>
    </div>
  );
}
