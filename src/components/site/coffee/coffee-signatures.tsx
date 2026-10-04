"use client";

import { useRef } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { MenuItemImage } from "@/components/site/menu-item-image";
import { Container } from "@/components/ui/container";
import { Skeleton } from "@/components/ui/skeleton";
import { useAddToCart } from "@/features/menu/add-to-cart";
import { useBestsellers } from "@/features/menu";
import { useOutletId } from "@/features/outlet";
import { usePick, useT } from "@/i18n";
import { formatPrice } from "@/lib/format";

/**
 * "Signatures" — the drinks the counter is known for.
 *
 * A scroll-snapping rail rather than the restaurant's dense grid: a coffee
 * menu is short enough that the house drinks deserve to be looked at one at a
 * time, which is how every specialty bar lays out its board.
 */
export function CoffeeSignatures() {
  const t = useT();
  const pick = usePick();
  const outletId = useOutletId();
  const { data: items, isLoading } = useBestsellers(outletId, 8);
  const { requestAdd, isOrderingDisabled } = useAddToCart();
  const railRef = useRef<HTMLUListElement>(null);

  const scrollBy = (direction: 1 | -1) => {
    const rail = railRef.current;
    if (!rail) return;
    rail.scrollBy({ left: direction * rail.clientWidth * 0.8, behavior: "smooth" });
  };

  return (
    <section className="py-12 sm:py-16">
      <Container>
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="coffee-eyebrow text-brand">{t.coffeeHome.signaturesEyebrow}</p>
            <h2 className="coffee-display mt-1.5 text-3xl text-ink sm:text-4xl">
              {t.coffeeHome.signaturesTitle}
            </h2>
            <p className="measure mt-2 text-sm text-ink-muted">
              {t.coffeeHome.signaturesBody}
            </p>
          </div>

          <div className="hidden shrink-0 gap-2 sm:flex">
            {[
              { dir: -1 as const, Icon: ChevronLeft, label: t.categories.scrollLeft },
              { dir: 1 as const, Icon: ChevronRight, label: t.categories.scrollRight },
            ].map(({ dir, Icon, label }) => (
              <button
                key={dir}
                type="button"
                onClick={() => scrollBy(dir)}
                aria-label={label}
                className="inline-flex size-10 items-center justify-center rounded-full border border-hairline bg-surface text-ink transition-colors hover:border-brand hover:text-brand focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
              >
                <Icon size={18} strokeWidth={1.75} aria-hidden="true" />
              </button>
            ))}
          </div>
        </div>

        <ul
          ref={railRef}
          className="snap-rail -mx-4 mt-7 flex gap-4 overflow-x-auto px-4 pb-2"
        >
          {isLoading &&
            Array.from({ length: 4 }).map((_, i) => (
              <li key={i} className="w-[16rem] shrink-0">
                <Skeleton className="h-72 w-full rounded-card" />
              </li>
            ))}

          {(items ?? []).map((item) => (
            <li key={item.id} className="w-[16rem] shrink-0 sm:w-[17rem]">
              <article className="group h-full overflow-hidden rounded-card border border-hairline bg-surface shadow-card transition-shadow duration-200 hover:shadow-pop">
                <Link
                  href={`/menu/${item.slug}`}
                  className="block overflow-hidden focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-inset"
                >
                  <MenuItemImage
                    src={item.images[0]}
                    alt={pick(item.name)}
                    sizes="(max-width: 640px) 70vw, 17rem"
                    className="aspect-[4/3] transition-transform duration-300 ease-out group-hover:scale-[1.04] motion-reduce:transform-none"
                  />
                </Link>

                <div className="flex flex-col gap-2 p-4">
                  <Link
                    href={`/menu/${item.slug}`}
                    className="coffee-display text-lg text-ink transition-colors hover:text-brand focus-visible:ring-2 focus-visible:ring-brand"
                  >
                    {pick(item.name)}
                  </Link>
                  <p className="clamp-2 text-sm text-ink-muted">
                    {pick(item.description)}
                  </p>

                  <div className="mt-1 flex items-center justify-between gap-3">
                    <span className="nums rounded-pill bg-brand/10 px-2.5 py-1 text-sm font-bold text-brand">
                      {formatPrice(item.price)}
                    </span>

                    <button
                      type="button"
                      onClick={() => requestAdd(item)}
                      disabled={isOrderingDisabled || !item.isAvailable}
                      aria-label={`${t.menuCard.add} ${pick(item.name)}`}
                      className="inline-flex size-10 items-center justify-center rounded-full bg-brand text-white transition-colors hover:bg-brand-hover focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <Plus size={18} strokeWidth={2.25} aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </article>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
