"use client";

import * as React from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useT } from "@/i18n";
import { cn } from "@/lib/utils";

/**
 * Password field with a reveal toggle. The toggle is a real button inside the
 * field so it is reachable by keyboard, and its label changes with its state
 * rather than staying a static "toggle password".
 */
export const PasswordInput = React.forwardRef<
  HTMLInputElement,
  Omit<React.ComponentProps<"input">, "type">
>(function PasswordInput({ className, ...props }, ref) {
  const t = useT();
  const [isVisible, setIsVisible] = React.useState(false);

  return (
    <div className="relative">
      <Input
        {...props}
        ref={ref}
        type={isVisible ? "text" : "password"}
        className={cn("pr-11", className)}
      />
      <button
        type="button"
        onClick={() => setIsVisible((visible) => !visible)}
        aria-label={isVisible ? t.auth.hidePassword : t.auth.showPassword}
        aria-pressed={isVisible}
        className={cn(
          "absolute inset-y-0 right-0 inline-flex w-10 items-center justify-center",
          "rounded-r-control text-ink-muted transition-colors",
          "hover:text-ink focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-inset",
        )}
      >
        {isVisible ? (
          <EyeOff size={18} strokeWidth={1.75} aria-hidden="true" />
        ) : (
          <Eye size={18} strokeWidth={1.75} aria-hidden="true" />
        )}
      </button>
    </div>
  );
});
