"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FormField, fieldAria } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useSession } from "@/features/auth";
import { useOutletId } from "@/features/outlet";
import { useT } from "@/i18n";
import { toErrorMessage } from "@/lib/errors";
import { enquirySchema, type EnquiryValues } from "@/lib/validation";
import { createEnquiry } from "@/services/enquiries";
import { ENQUIRY_SUBJECTS, type EnquirySubject } from "@/types";

export interface EnquiryFormProps {
  /** Preselects the dropdown — /services passes the card's subject. */
  defaultSubject?: EnquirySubject;
  title?: string;
  description?: string;
  className?: string;
}

/**
 * The one enquiry form, used by /contact and by the "Enquire" buttons on
 * /services. It writes through services/enquiries.ts, which raises the admin
 * notification — nothing here knows about notifications.
 *
 * A signed-in customer gets their name, phone and email filled in; they can
 * still change them, because the person ordering for the office is not always
 * the one who signed up.
 */
export function EnquiryForm({
  defaultSubject = "PARTY_ORDER",
  title,
  description,
  className,
}: EnquiryFormProps) {
  const t = useT();
  const { user } = useSession();
  const outletId = useOutletId();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = useForm<EnquiryValues>({
    resolver: zodResolver(enquirySchema(t)),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      subject: defaultSubject,
      message: "",
    },
  });

  // Keep the dropdown in step when a different service card opens the form.
  useEffect(() => {
    setValue("subject", defaultSubject);
  }, [defaultSubject, setValue]);

  useEffect(() => {
    if (!user) return;
    setValue("name", user.name);
    setValue("phone", user.phone);
    setValue("email", user.email);
  }, [user, setValue]);

  const subject = watch("subject");

  const onSubmit = handleSubmit(async (values) => {
    try {
      // The enquiry lands in the inbox of whichever outlet is being browsed.
      await createEnquiry({ ...values, outletId });
      toast.success(t.contact.sent, { description: t.contact.sentBody });
    } catch (caught) {
      toast.error(toErrorMessage(caught));
      throw caught;
    }
  });

  if (isSubmitSuccessful) {
    return (
      <Card className={className}>
        <div className="flex flex-col items-center px-6 py-10 text-center">
          <span className="inline-flex size-12 items-center justify-center rounded-full bg-veg/10 text-veg-dark">
            <CheckCircle2 size={26} strokeWidth={1.75} aria-hidden="true" />
          </span>
          <p className="mt-4 text-base font-semibold text-ink">{t.contact.sent}</p>
          <p className="measure mt-1.5 text-sm text-ink-muted">{t.contact.sentBody}</p>
          <Button
            variant="outline"
            className="mt-6"
            onClick={() =>
              reset({
                name: user?.name ?? "",
                phone: user?.phone ?? "",
                email: user?.email ?? "",
                subject: defaultSubject,
                message: "",
              })
            }
          >
            {t.contact.sendAnother}
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <div className="p-5 sm:p-6">
        <h2 className="text-display text-xl text-ink uppercase">
          {title ?? t.contact.formTitle}
        </h2>
        {description && <p className="mt-1.5 text-sm text-ink-muted">{description}</p>}

        <form onSubmit={onSubmit} className="mt-5 grid gap-4" noValidate>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              id="enq-name"
              label={t.contact.name}
              error={errors.name?.message}
            >
              <Input
                {...fieldAria("enq-name", errors.name?.message)}
                {...register("name")}
                autoComplete="name"
              />
            </FormField>
            <FormField
              id="enq-phone"
              label={t.contact.phone}
              error={errors.phone?.message}
            >
              <Input
                {...fieldAria("enq-phone", errors.phone?.message)}
                {...register("phone")}
                type="tel"
                inputMode="numeric"
                maxLength={10}
                autoComplete="tel-national"
              />
            </FormField>
          </div>

          <FormField
            id="enq-email"
            label={t.contact.email}
            error={errors.email?.message}
          >
            <Input
              {...fieldAria("enq-email", errors.email?.message)}
              {...register("email")}
              type="email"
              autoComplete="email"
            />
          </FormField>

          <FormField id="enq-subject" label={t.contact.subject}>
            <Select
              value={subject}
              onValueChange={(value) => setValue("subject", value as EnquirySubject)}
            >
              <SelectTrigger id="enq-subject" aria-label={t.contact.subject}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ENQUIRY_SUBJECTS.map((option) => (
                  <SelectItem key={option} value={option}>
                    {t.contact.subjects[option]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>

          <FormField
            id="enq-message"
            label={t.contact.message}
            error={errors.message?.message}
          >
            <Textarea
              {...fieldAria("enq-message", errors.message?.message)}
              {...register("message")}
              rows={4}
              maxLength={600}
              placeholder={t.contact.messagePlaceholder}
            />
          </FormField>

          <Button type="submit" disabled={isSubmitting} className="justify-self-start">
            {t.contact.send}
          </Button>
        </form>
      </div>
    </Card>
  );
}
