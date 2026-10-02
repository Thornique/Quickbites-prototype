"use client";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useT } from "@/i18n";
import { cn } from "@/lib/utils";

export interface FormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  /** Omit for a read-only sheet such as the order detail. */
  submitLabel?: string;
  onSubmit?: () => void;
  isSubmitting?: boolean;
  isSubmitDisabled?: boolean;
  /** Extra buttons on the left of the footer — Print KOT, Print bill. */
  secondaryActions?: React.ReactNode;
  width?: "md" | "lg";
}

/**
 * Side sheet for admin create/edit forms and detail views.
 *
 * A sheet rather than a dialog: admin records are long, and the list behind
 * stays visible, so it is obvious which row is being edited. The body scrolls
 * while the header and footer stay put, because the save button must never be
 * somewhere off-screen.
 */
export function FormSheet({
  open,
  onOpenChange,
  title,
  description,
  children,
  submitLabel,
  onSubmit,
  isSubmitting = false,
  isSubmitDisabled = false,
  secondaryActions,
  width = "md",
}: FormSheetProps) {
  const t = useT();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className={cn(
          "flex w-full flex-col gap-0 p-0",
          width === "lg" ? "sm:max-w-2xl" : "sm:max-w-lg",
        )}
      >
        <SheetHeader className="border-b border-hairline px-5 py-4">
          <SheetTitle>{title}</SheetTitle>
          {description && <SheetDescription>{description}</SheetDescription>}
        </SheetHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">{children}</div>

        {(submitLabel || secondaryActions) && (
          <SheetFooter className="flex-row items-center justify-between gap-3 border-t border-hairline px-5 py-4">
            <div className="flex flex-wrap gap-2">{secondaryActions}</div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                disabled={isSubmitting}
                onClick={() => onOpenChange(false)}
              >
                {t.common.close}
              </Button>
              {submitLabel && (
                <Button
                  disabled={isSubmitting || isSubmitDisabled}
                  onClick={onSubmit}
                >
                  {isSubmitting ? t.adm.confirm.working : submitLabel}
                </Button>
              )}
            </div>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}
