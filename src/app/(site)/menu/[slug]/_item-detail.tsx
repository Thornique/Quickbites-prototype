"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, SearchX } from "lucide-react";
import { toast } from "sonner";
import { MenuItemImage } from "@/components/site/menu-item-image";
import { StoreClosedBanner } from "@/components/site/store-closed-banner";
import { useBottomBarSpace } from "@/components/site/use-bottom-bar-space";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { EmptyState } from "@/components/ui/empty-state";
import { Label } from "@/components/ui/label";
import { Price } from "@/components/ui/price";
import { QuantityStepper } from "@/components/ui/quantity-stepper";
import { Skeleton } from "@/components/ui/skeleton";
import { Tag } from "@/components/ui/tag";
import { Textarea } from "@/components/ui/textarea";
import { VegMark } from "@/components/ui/veg-mark";
import { useCategories, useMenuItem } from "@/features/menu";
import { useOpenState } from "@/features/settings";
import { usePick, useT } from "@/i18n";
import { MAX_ITEM_NOTE_LENGTH } from "@/lib/constants";
import { formatPrice } from "@/lib/format";
import { priceLine } from "@/lib/pricing";
import { buildCartLine } from "@/services/cart-pricing";
import { useCartStore } from "@/store/cart";
import { cn } from "@/lib/utils";
import { OptionGroups } from "./_option-groups";

/**
 * Full item page. Shares the option logic and the pricing function with the
 * customise sheet, so the price quoted here and in the sheet cannot diverge.
 */
export function ItemDetail({ slug }: { slug: string }) {
  const t = useT();
  const pick = usePick();
  const router = useRouter();
  const addLine = useCartStore((s) => s.addLine);

  const { data: item, isLoading, error } = useMenuItem(slug);
  const { data: categories } = useCategories();
  const { data: openState } = useOpenState();

  const [selected, setSelected] = useState<string[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [activeImage, setActiveImage] = useState(0);

  // Lift the floating contact buttons clear of the sticky add bar.
  useBottomBarSpace("4.75rem");

  // Pre-select the first available choice in each required single-select group.
  useEffect(() => {
    if (!item) return;
    const defaults: string[] = [];
    for (const group of item.optionGroups) {
      if (group.type === "single" && group.isRequired) {
        const first = group.options.find((option) => option.isAvailable);
        if (first) defaults.push(first.id);
      }
    }
    setSelected(defaults);
  }, [item]);

  const priced = useMemo(() => {
    if (!item) return null;
    try {
      return priceLine(buildCartLine(item, selected, quantity, notes));
    } catch {
      return null;
    }
  }, [item, selected, quantity, notes]);

  const isOrderingDisabled =
    !!openState && !(openState.isOpen && openState.acceptingOrders);

  if (isLoading) {
    return (
      <Container className="py-10">
        <Skeleton className="aspect-[4/3] w-full rounded-card sm:aspect-[16/9]" />
        <Skeleton className="mt-6 h-9 w-2/3" />
        <Skeleton className="mt-3 h-4 w-full" />
      </Container>
    );
  }

  // An item the admin renamed or removed since the page was built.
  if (error || !item) {
    return (
      <Container className="py-16">
        <EmptyState
          icon={SearchX}
          title={t.item.notFoundTitle}
          description={t.item.notFoundBody}
          action={
            <Button asChild>
              <Link href="/menu">{t.item.backToMenu}</Link>
            </Button>
          }
        />
      </Container>
    );
  }

  const name = pick(item.name);
  const category = categories?.find((c) => c.id === item.categoryId);
  const isSoldOut = !item.isAvailable;
  const isBlocked = isSoldOut || isOrderingDisabled;

  const handleAdd = () => {
    setFormError(null);
    try {
      addLine(buildCartLine(item, selected, quantity, notes));
      toast.success(t.item.addedToCart(name), {
        action: { label: t.cart.viewCart, onClick: () => router.push("/cart") },
      });
    } catch (caught) {
      setFormError(
        caught instanceof Error ? caught.message : t.common.somethingWentWrong,
      );
    }
  };

  return (
    <>
      <Container className="py-6 sm:py-10">
        <Link
          href="/menu"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-muted transition-colors hover:text-brand"
        >
          <ArrowLeft size={16} aria-hidden="true" />
          {t.item.backToMenu}
        </Link>

        <div className="mt-5 grid gap-8 lg:grid-cols-2">
          <div>
            <MenuItemImage
              src={item.images[activeImage]}
              alt={name}
              placeholderLabel={category ? pick(category.name) : undefined}
              priority
              sizes="(max-width: 1024px) 100vw, 560px"
              className="@container aspect-[4/3] w-full rounded-card"
            />
            {item.images.length > 1 && (
              <ul
                aria-label={t.item.gallery}
                className="mt-3 flex gap-2 overflow-x-auto"
              >
                {item.images.map((image, index) => (
                  <li key={image}>
                    <button
                      type="button"
                      onClick={() => setActiveImage(index)}
                      aria-current={index === activeImage ? "true" : undefined}
                      className={cn(
                        "size-16 overflow-hidden rounded-control border-2 transition-colors",
                        index === activeImage ? "border-brand" : "border-hairline",
                      )}
                    >
                      <MenuItemImage
                        src={image}
                        alt=""
                        sizes="64px"
                        className="@container size-full"
                      />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <StoreClosedBanner className="mb-5" />

            <div className="flex items-start gap-2.5">
              <VegMark isVeg={item.isVeg} size="lg" className="mt-1.5" />
              <h1 className="text-display text-3xl text-ink uppercase sm:text-4xl">
                {name}
              </h1>
            </div>

            {item.tags.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {item.tags.map((tag) => (
                  <Tag key={tag} kind={tag} />
                ))}
              </div>
            )}

            <p className="measure mt-4 text-base text-ink-muted">
              {pick(item.description)}
            </p>

            <p className="nums mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-ink-muted">
              <Price value={item.price} compareAt={item.compareAtPrice} size="xl" />
              {item.calories && <span>· {t.menuCard.calories(item.calories)}</span>}
            </p>

            {isSoldOut && (
              <p className="mt-4 inline-flex rounded-pill bg-ink px-3 py-1 text-xs font-bold tracking-wide text-white uppercase">
                {t.menuCard.soldOut}
              </p>
            )}

            <div className="mt-7">
              <OptionGroups
                item={item}
                selected={selected}
                onChange={(next) => {
                  setSelected(next);
                  setFormError(null);
                }}
                onError={setFormError}
              />
            </div>

            <div className="mt-6 grid gap-1.5">
              <Label htmlFor="detail-notes">{t.customise.notes}</Label>
              <Textarea
                id="detail-notes"
                value={notes}
                maxLength={MAX_ITEM_NOTE_LENGTH}
                onChange={(event) => setNotes(event.target.value)}
                placeholder={t.customise.notesPlaceholder}
                rows={2}
              />
              <p className="nums text-right text-xs text-ink-muted">
                {t.customise.notesCount(notes.length, MAX_ITEM_NOTE_LENGTH)}
              </p>
            </div>

            <div className="mt-6 flex items-center gap-3">
              <span className="sr-only">{t.item.quantity}</span>
              <QuantityStepper
                value={quantity}
                onChange={setQuantity}
                itemLabel={name}
              />
            </div>

            {formError && (
              <p role="alert" className="mt-4 text-sm font-medium text-danger">
                {formError}
              </p>
            )}
          </div>
        </div>
      </Container>

      {/* Sticky add bar; useBottomBarSpace keeps the FAB clear of it. */}
      <div className="sticky bottom-0 z-30 border-t border-hairline bg-surface py-3">
        <Container className="flex items-center gap-4">
          <div className="hidden min-w-0 flex-1 sm:block">
            <p className="truncate text-sm font-semibold text-ink">{name}</p>
            <p className="text-xs text-ink-muted">{t.menu.resultCount(quantity)}</p>
          </div>
          <Button
            size="lg"
            className="w-full sm:w-auto"
            disabled={isBlocked}
            onClick={handleAdd}
          >
            {isSoldOut
              ? t.menuCard.soldOut
              : t.item.addToCart(formatPrice(priced?.lineTotal ?? item.price))}
          </Button>
        </Container>
      </div>
    </>
  );
}
