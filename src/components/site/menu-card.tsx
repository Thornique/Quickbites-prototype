"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { MenuItemImage } from "@/components/site/menu-item-image";
import { Price } from "@/components/ui/price";
import { Tag } from "@/components/ui/tag";
import { VegMark } from "@/components/ui/veg-mark";
import { usePick, useT } from "@/i18n";
import { cn } from "@/lib/utils";
import type { MenuItem } from "@/types";

export interface MenuCardProps {
  item: MenuItem;
  /** Shown on the placeholder when the item has no photo. */
  categoryName?: string;
  /**
   * `grid` is the 4:3 card used on the menu grid and the bestsellers rail;
   * `row` is the dense image-left layout for the mobile menu list.
   */
  layout?: "grid" | "row";
  /** Step 5 passes the real handler; until then Add is visual only. */
  onAdd?: (item: MenuItem) => void;
  priority?: boolean;
  className?: string;
}

/**
 * The menu item card, shared by the home bestsellers rail and the full menu.
 * Everything a customer decides on is here: veg mark, tags, price (with any
 * strike-through), calories, and whether it is actually available.
 */
export function MenuCard({
  item,
  categoryName,
  layout = "grid",
  onAdd,
  priority = false,
  className,
}: MenuCardProps) {
  const t = useT();
  const pick = usePick();

  const name = pick(item.name);
  const description = pick(item.description);
  const isSoldOut = !item.isAvailable;
  // "Customisable" is derived from the item, so it never goes stale.
  const visibleTags = item.tags.filter((tag) => tag !== "customisable").slice(0, 2);

  const AddButton = (
    <button
      type="button"
      disabled={isSoldOut}
      onClick={() => onAdd?.(item)}
      aria-label={`${t.menuCard.add} ${name}`}
      className={cn(
        "inline-flex shrink-0 items-center justify-center gap-1 rounded-control border font-semibold transition-colors",
        "focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2",
        layout === "grid" ? "h-9 px-3 text-sm" : "h-9 px-3 text-sm",
        isSoldOut
          ? "cursor-not-allowed border-hairline bg-sand-100 text-ink-muted/60"
          : "border-brand bg-brand text-white hover:bg-brand-hover",
      )}
    >
      {isSoldOut ? (
        t.menuCard.soldOut
      ) : (
        <>
          <Plus size={16} strokeWidth={2.5} aria-hidden="true" />
          {t.menuCard.add}
        </>
      )}
    </button>
  );

  if (layout === "row") {
    return (
      <article
        className={cn(
          "relative flex gap-3 rounded-card border border-hairline bg-surface p-3",
          isSoldOut && "opacity-60",
          className,
        )}
      >
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <VegMark isVeg={item.isVeg} size="sm" />
            {visibleTags.map((tag) => (
              <Tag key={tag} kind={tag} iconless />
            ))}
          </div>
          <h3 className="mt-1.5 text-base font-semibold text-ink">
            <Link href={`/menu/${item.slug}`} className="hover:text-brand">
              {name}
            </Link>
          </h3>
          <p className="clamp-2 mt-0.5 text-sm text-ink-muted">{description}</p>
          <div className="mt-2 flex items-center gap-2">
            <Price value={item.price} compareAt={item.compareAtPrice} size="sm" />
            {item.optionGroups.length > 0 && (
              <span className="text-xs text-ink-muted">
                · {t.menuCard.customisable}
              </span>
            )}
          </div>
        </div>

        <div className="flex w-24 shrink-0 flex-col items-center gap-2">
          <MenuItemImage
            src={item.images[0]}
            alt={name}
            placeholderLabel={categoryName}
            sizes="96px"
            className="@container aspect-square w-full rounded-control"
          />
          {AddButton}
        </div>
      </article>
    );
  }

  return (
    <article
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-card border border-hairline bg-surface",
        "transition-colors hover:border-ink/20",
        isSoldOut && "opacity-70",
        className,
      )}
    >
      <div className="relative">
        <MenuItemImage
          src={item.images[0]}
          alt={name}
          placeholderLabel={categoryName}
          priority={priority}
          sizes="(max-width: 640px) 70vw, (max-width: 1024px) 40vw, 300px"
          className="@container aspect-[4/3] w-full"
        />
        <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5">
          {visibleTags.map((tag) => (
            <Tag key={tag} kind={tag} />
          ))}
        </div>
        {isSoldOut && (
          <div className="absolute inset-0 flex items-center justify-center bg-surface/70">
            <span className="rounded-pill bg-ink px-3 py-1 text-xs font-bold tracking-wide text-white uppercase">
              {t.menuCard.soldOut}
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-3.5">
        <div className="flex items-start gap-2">
          <VegMark isVeg={item.isVeg} className="mt-0.5" />
          <h3 className="flex-1 text-base leading-snug font-semibold text-ink">
            <Link href={`/menu/${item.slug}`} className="hover:text-brand">
              {name}
            </Link>
          </h3>
        </div>

        <p className="clamp-2 mt-1.5 text-sm text-ink-muted">{description}</p>

        <p className="mt-2 text-xs text-ink-muted">
          {item.calories ? t.menuCard.calories(item.calories) : null}
          {item.calories && item.optionGroups.length > 0 ? " · " : null}
          {item.optionGroups.length > 0 ? t.menuCard.customisable : null}
        </p>

        <div className="mt-auto flex items-end justify-between gap-2 pt-3">
          <Price value={item.price} compareAt={item.compareAtPrice} size="lg" />
          {AddButton}
        </div>
      </div>
    </article>
  );
}
