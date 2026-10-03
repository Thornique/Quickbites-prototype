"use client";

import { useState } from "react";
import { ChevronDown, FlaskConical } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DEMO_ACCOUNTS } from "@/data/seed/users";
import { useT } from "@/i18n";
import { cn } from "@/lib/utils";

export interface DemoAccount {
  key: "superAdmin" | "admin" | "customer";
  label: string;
  email: string;
  password: string;
}

export interface DemoAccountsProps {
  /** Which seeded logins to offer — admin pages hide the customer one. */
  show: Array<DemoAccount["key"]>;
  /** Fills the form with the chosen credentials. */
  onFill: (email: string, password: string) => void;
  /** `dark` is for the admin sign-in page's ink background. */
  tone?: "light" | "dark";
  className?: string;
}

/**
 * Collapsible helper listing the seeded credentials, with one-click fill.
 * Labelled as prototype-only so nobody mistakes these for real accounts.
 */
export function DemoAccounts({
  show,
  onFill,
  tone = "light",
  className,
}: DemoAccountsProps) {
  const isDark = tone === "dark";
  const t = useT();
  const [isOpen, setIsOpen] = useState(false);
  const [filledKey, setFilledKey] = useState<string | null>(null);

  const LABELS: Record<DemoAccount["key"], string> = {
    superAdmin: t.demo.superAdmin,
    admin: t.demo.admin,
    customer: t.demo.customer,
  };

  const accounts: DemoAccount[] = show.map((key) => ({
    key,
    label: LABELS[key],
    email: DEMO_ACCOUNTS[key].email,
    password: DEMO_ACCOUNTS[key].password,
  }));

  const handleFill = (account: DemoAccount) => {
    onFill(account.email, account.password);
    setFilledKey(account.key);
  };

  return (
    <div
      className={cn(
        "overflow-hidden rounded-card border border-dashed",
        isDark ? "border-white/20 bg-white/5" : "border-hairline bg-sand-50",
        className,
      )}
    >
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
        className={cn(
          "flex w-full items-center gap-2.5 px-4 py-3 text-left transition-colors",
          isDark ? "hover:bg-white/10" : "hover:bg-sand-100",
        )}
      >
        <FlaskConical
          size={18}
          aria-hidden="true"
          className={cn("shrink-0", isDark ? "text-white/60" : "text-ink-muted")}
        />
        <span
          className={cn(
            "flex-1 text-sm font-semibold",
            isDark ? "text-white" : "text-ink",
          )}
        >
          {t.demo.title}
        </span>
        <ChevronDown
          size={18}
          aria-hidden="true"
          className={cn(
            "shrink-0 transition-transform duration-150",
            isDark ? "text-white/60" : "text-ink-muted",
            isOpen && "rotate-180",
          )}
        />
      </button>

      {isOpen && (
        <div
          className={cn(
            "border-t px-4 pt-3 pb-4",
            isDark ? "border-white/15" : "border-hairline",
          )}
        >
          <p className={cn("text-xs", isDark ? "text-white/60" : "text-ink-muted")}>
            {t.demo.subtitle}
          </p>
          <ul className="mt-3 space-y-2">
            {accounts.map((account) => (
              <li
                key={account.key}
                className={cn(
                  "flex flex-wrap items-center gap-x-3 gap-y-1.5 rounded-control border px-3 py-2",
                  isDark ? "border-white/15 bg-white/5" : "border-hairline bg-surface",
                )}
              >
                <Badge variant="muted">{account.label}</Badge>
                <span
                  className={cn(
                    "nums min-w-0 flex-1 text-xs break-all",
                    isDark ? "text-white/85" : "text-ink",
                  )}
                >
                  {account.email} · {account.password}
                </span>
                <button
                  type="button"
                  onClick={() => handleFill(account)}
                  className="shrink-0 rounded-control px-2 py-1 text-xs font-semibold text-brand transition-colors hover:bg-brand/10 focus-visible:ring-2 focus-visible:ring-brand"
                >
                  {filledKey === account.key ? t.demo.filled : t.demo.fill}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
