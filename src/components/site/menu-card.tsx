"use client";

import Link from "next/link";
import { Minus, Plus } from "lucide-react";
import { MenuItemImage } from "@/components/site/menu-item-image";
import { Price } from "@/components/ui/price";
import { Tag } from "@/components/ui/tag";
import { VegMark } from "@/components/ui/veg-mark";
import { useCartLinesFor } from "@/features/cart";
import { useAddToCart } from "@/features/menu/add-to-cart";
import { usePick, useT } from "@/i18n";
import { useCartStore } from "@/store/cart";
import { cn } from "@/lib/utils";
import type { MenuItem } from "@/types";

export interface MenuCardProps {
  item: MenuItem;
  /** Shown on the placeholder when the item has no photo. */
  categoryName?: string;
  /**
   * `card` is the 4:3 tile used by the bestsellers rail.
   * `responsive` is the menu listing: a dense row on mobile, a tile from 640px.
   */
  layout?: "card" | "responsive";
  /** Overrides the default add behaviour. */
  onAdd?: (item: MenuItem) => void;
  priority?: boolean;
  className?: string;
}

/**
 * The menu item card, shared by the home bestsellers rail and the full menu.
 *
 * One markup tree serves both layouts. Rendering a separate mobile list and
 * desktop grid would double the DOM and make a screen reader announce every
 * item on the menu twice.
 */
export function MenuCard({
  item,
  categoryName,
  layout = "card",
  onAdd,
  priority = false,
  className,
}: MenuCardProps) {
  const t = useT();
  const pick = usePick();

  const isCoffee = item.outletId === "coffee";
  const { requestAdd, openCustomise, isOrderingDisabled } = useAddToCart();
  const { quantity, lastLineKey } = useCartLinesFor(item.outletId, item.id);
  const setQuantity = useCartStore((s) => s.setQuantity);

  const name = pick(item.name);
  const description = pick(item.description);
  const isSoldOut = !item.isAvailable;
  const isBlocked = isSoldOut || isOrderingDisabled;
  const hasOptions = item.optionGroups.length > 0;
  const isResponsive = layout === "responsive";

  // "Customisable" is derived from the item, so it never goes stale.
  const visibleTags = item.tags.filter((tag) => tag !== "customisable").slice(0, 2);

  const handleAdd = () => {
    if (isBlocked) return;
    if (onAdd) {
      onAdd(item);
      return;
    }
    requestAdd(item);
  };

  /*
    Once in the cart the button becomes a stepper. For an item with options
    "+" reopens the sheet rather than silently repeating the last choice, and
    "−" acts on the most recently added line.
  */
  const handleIncrease = () => {
    if (isBlocked) return;
    if (hasOptions) {
      openCustomise(item);
      return;
    }
    handleAdd();
  };

  const handleDecrease = () => {
    if (!lastLineKey) return;
    const line = useCartStore
      .getState()
      .carts[item.outletId].lines.find((l) => l.lineKey === lastLineKey);
    if (line) setQuantity(lastLineKey, line.quantity - 1);
  };

  const action =
    quantity > 0 && !isBlocked ? (
      <div className="inline-flex shrink-0 items-center rounded-control border border-brand bg-brand text-white">
        <button
          type="button"
          onClick={handleDecrease}
          aria-label={`${name}: −1`}
          className="inline-flex size-9 items-center justify-center rounded-l-control transition-colors hover:bg-brand-hover focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
        >
          <Minus size={16} strokeWidth={2.5} aria-hidden="true" />
        </button>
        <span className="nums min-w-7 text-center text-sm font-bold">{quantity}</span>
        <button
          type="button"
          onClick={handleIncrease}
          aria-label={`${name}: +1`}
          className="inline-flex size-9 items-center justify-center rounded-r-control transition-colors hover:bg-brand-hover focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
        >
          <Plus size={16} strokeWidth={2.5} aria-hidden="true" />
        </button>
      </div>
    ) : (
      <button
        type="button"
        disabled={isBlocked}
        onClick={handleAdd}
        aria-label={`${t.menuCard.add} ${name}`}
        className={cn(
          "inline-flex shrink-0 items-center justify-center gap-1 border text-sm font-semibold transition-colors",
          "focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2",
          /*
            Coffee drops the word: a round "+" beside a price chip is the
            specialty-bar idiom, and the accessible name still says "Add
            <item>". Sold-out stays a labelled pill in both outlets, because
            a struck-through "+" would say nothing.
          */
          isCoffee && !isSoldOut
            ? "size-10 rounded-full"
            : "h-9 rounded-control px-3",
          isBlocked
            ? "cursor-not-allowed border-hairline bg-sand-100 text-ink-muted/60"
            : "border-brand bg-brand text-white hover:bg-brand-hover",
        )}
      >
        {isSoldOut ? (
          t.menuCard.soldOut
        ) : (
          <>
            <Plus size={16} strokeWidth={2.5} aria-hidden="true" />
            {!isCoffee && t.menuCard.add}
          </>
        )}
      </button>
    );

  return (
    <article
      className={cn(
        "group relative overflow-hidden rounded-card border border-hairline bg-surface",
        isCoffee &&
          "shadow-card transition-shadow duration-200 hover:shadow-pop",
        isSoldOut && "opacity-70",
        isResponsive
          ? "grid grid-cols-[6.5rem_1fr] gap-3 p-3 sm:grid-cols-1 sm:gap-0 sm:p-0"
          : "flex h-full flex-col",
        className,
      )}
    >
      <div className={cn("relative", isResponsive && "self-start sm:self-auto")}>
        <MenuItemImage
          src={item.images[0]}
          alt={name}
          placeholderLabel={categoryName}
          priority={priority}
          sizes={
            isResponsive
              ? "(max-width: 640px) 104px, (max-width: 1024px) 45vw, 300px"
              : "(max-width: 640px) 70vw, (max-width: 1024px) 40vw, 300px"
          }
          className={cn(
            "@container w-full",
            isResponsive
              ? "aspect-square rounded-control sm:aspect-[4/3] sm:rounded-none"
              : "aspect-[4/3]",
            isCoffee &&
              "transition-transform duration-300 ease-out group-hover:scale-[1.05] motion-reduce:transform-none",
          )}
        />
        {visibleTags.length > 0 && (
          <div
            className={cn(
              "flex flex-wrap gap-1.5",
              isResponsive
                ? "mt-2 sm:absolute sm:top-2.5 sm:left-2.5 sm:mt-0"
                : "absolute top-2.5 left-2.5",
            )}
          >
            {visibleTags.map((tag) => (
              <Tag key={tag} kind={tag} iconless={isResponsive} />
            ))}
          </div>
        )}
        {isSoldOut && (
          <div className="absolute inset-0 flex items-center justify-center rounded-control bg-surface/70 sm:rounded-none">
            <span className="rounded-pill bg-ink px-2.5 py-1 text-[0.625rem] font-bold tracking-wide text-white uppercase sm:px-3 sm:text-xs">
              {t.menuCard.soldOut}
            </span>
          </div>
        )}
      </div>

      <div
        className={cn(
          "flex min-w-0 flex-col",
          isResponsive ? "sm:p-3.5" : "flex-1 p-3.5",
        )}
      >
        <div className="flex items-start gap-2">
          <VegMark isVeg={item.isVeg} size="sm" className="mt-1" />
          <h3
            className={cn(
              "min-w-0 flex-1 leading-snug text-ink",
              isCoffee
                ? "coffee-display text-lg"
                : "text-base font-semibold",
            )}
          >
            <Link href={`/menu/${item.slug}`} className="hover:text-brand">
              {name}
            </Link>
          </h3>
        </div>

        <p className="clamp-2 mt-1 text-sm text-ink-muted">{description}</p>

        <p className="mt-1.5 text-xs text-ink-muted">
          {item.calories ? t.menuCard.calories(item.calories) : null}
          {item.calories && hasOptions ? " · " : null}
          {hasOptions ? t.menuCard.customisable : null}
        </p>

        <div className="mt-auto flex items-end justify-between gap-2 pt-3">
          {isCoffee ? (
            <span className="nums rounded-pill bg-brand/10 px-2.5 py-1 text-sm font-bold text-brand">
              <Price value={item.price} compareAt={item.compareAtPrice} />
            </span>
          ) : (
            <Price value={item.price} compareAt={item.compareAtPrice} size="lg" />
          )}
          {action}
        </div>
      </div>
    </article>
  );
}
