"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useT } from "@/i18n";
import { toErrorMessage } from "@/lib/errors";

export interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  /** Extra fields — a reason box, an amount — rendered above the buttons. */
  children?: React.ReactNode;
  confirmLabel: string;
  cancelLabel?: string;
  /** Solid red button for anything that cannot be undone. */
  isDestructive?: boolean;
  /** Blocks confirmation while a required field is empty. */
  isConfirmDisabled?: boolean;
  /** Resolves on success; a throw keeps the dialog open and shows the message. */
  onConfirm: () => Promise<unknown>;
  /** Toast shown after a successful confirm. */
  successMessage?: string;
}

/**
 * One dialog for every "are you sure" in the admin panel.
 *
 * It owns the pending state and the error toast, so callers never leave a
 * half-finished action on screen: the dialog closes only once the service has
 * actually accepted the change.
 */
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  confirmLabel,
  cancelLabel,
  isDestructive = false,
  isConfirmDisabled = false,
  onConfirm,
  successMessage,
}: ConfirmDialogProps) {
  const t = useT();
  const [isWorking, setIsWorking] = useState(false);

  const confirm = async () => {
    setIsWorking(true);
    try {
      await onConfirm();
      if (successMessage) toast.success(successMessage);
      onOpenChange(false);
    } catch (caught) {
      toast.error(toErrorMessage(caught));
    } finally {
      setIsWorking(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(next) => !isWorking && onOpenChange(next)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        {children}

        <DialogFooter>
          <Button
            variant="outline"
            disabled={isWorking}
            onClick={() => onOpenChange(false)}
          >
            {cancelLabel ?? t.adm.confirm.cancel}
          </Button>
          <Button
            variant={isDestructive ? "destructive" : "default"}
            disabled={isWorking || isConfirmDisabled}
            onClick={() => void confirm()}
          >
            {isWorking ? t.adm.confirm.working : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
