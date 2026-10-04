"use client";

import { Check, ChevronDown, Coffee, Store, UtensilsCrossed } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { usePick, useT } from "@/i18n";
import { OUTLET_LIST } from "@/lib/outlets";
import { cn } from "@/lib/utils";
import type { OutletId, OutletScope } from "@/types";
import { OUTLET_SCOPE_ALL } from "@/types";
import { useAdminOutlet } from "./use-admin-outlet";

const ICONS = { restaurant: UtensilsCrossed, coffee: Coffee } as const;

/**
 * Restaurant / Coffee / All, in the admin topbar.
 *
 * A dropdown rather than the storefront's segmented control: there are three
 * choices here, the panel's topbar is already crowded, and the current scope
 * is the thing that has to stay readable at a glance.
 *
 * An assigned admin gets their outlet's name as plain text — there is nothing
 * for them to choose, and a disabled control would only invite a click.
 */
export function AdminOutletSwitcher({ className }: { className?: string }) {
  const t = useT();
  const pick = usePick();
  const { scope, isAll, canSwitch, lockedOutlet, setScope } = useAdminOutlet();

  if (!canSwitch && lockedOutlet) {
    const Icon = ICONS[lockedOutlet.id];
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 rounded-pill border border-hairline bg-sand-50 px-2.5 py-1",
          "text-xs font-semibold whitespace-nowrap text-ink",
          className,
        )}
      >
        <Icon size={14} strokeWidth={1.75} aria-hidden="true" />
        <span className="sr-only">{t.adm.outlet.workingAt}: </span>
        {pick(lockedOutlet.name)}
      </span>
    );
  }

  const currentIcon = isAll ? Store : ICONS[scope as OutletId];
  const CurrentIcon = currentIcon;
  const currentLabel = isAll
    ? t.adm.outlet.allOutlets
    : pick(OUTLET_LIST.find((o) => o.id === scope)!.shortName);

  const options: Array<{ value: OutletScope; label: string; icon: typeof Store }> = [
    ...OUTLET_LIST.map((outlet) => ({
      value: outlet.id as OutletScope,
      label: pick(outlet.name),
      icon: ICONS[outlet.id],
    })),
    { value: OUTLET_SCOPE_ALL, label: t.adm.outlet.allOutlets, icon: Store },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          /*
            The label has to carry the current scope: aria-label replaces the
            visible text, so "Outlet" alone would announce the control without
            ever saying which outlet is selected.
          */
          aria-label={`${t.adm.outlet.switcherLabel}: ${currentLabel}`}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-control border border-hairline bg-surface px-2.5 py-1.5",
            "text-sm font-semibold whitespace-nowrap text-ink transition-colors",
            "hover:border-brand/40 focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-1",
            className,
          )}
        >
          <CurrentIcon size={16} strokeWidth={1.75} aria-hidden="true" />
          <span className="max-w-28 truncate">{currentLabel}</span>
          <ChevronDown size={14} strokeWidth={2} aria-hidden="true" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuLabel className="normal-case">
          {t.adm.outlet.switcherLabel}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {options.map((option) => {
          const Icon = option.icon;
          const isActive = option.value === scope;
          return (
            <DropdownMenuItem
              key={option.value}
              onSelect={() => setScope(option.value)}
              className="justify-between"
            >
              <span className="inline-flex items-center gap-2">
                <Icon size={15} strokeWidth={1.75} aria-hidden="true" />
                {option.label}
              </span>
              {option.value === OUTLET_SCOPE_ALL ? (
                isActive ? (
                  <Check size={15} strokeWidth={2} aria-hidden="true" />
                ) : (
                  <Badge variant="muted">{t.adm.outlet.combined}</Badge>
                )
              ) : (
                isActive && <Check size={15} strokeWidth={2} aria-hidden="true" />
              )}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
