"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { ImageOff } from "lucide-react";
import { Container } from "@/components/ui/container";
import { EmptyState } from "@/components/ui/empty-state";
import { SectionHeading } from "@/components/ui/section-heading";
import { Skeleton } from "@/components/ui/skeleton";
import { useGallery } from "@/features/content";
import { useOutletId } from "@/features/outlet";
import { usePick, useT } from "@/i18n";
import { cn } from "@/lib/utils";
import type { GalleryCategory } from "@/types";
/*
  The lightbox is a full-screen dialog that only exists after somebody clicks a
  photo, so it has no business in the gallery's first load.
*/
const Lightbox = dynamic(() => import("./_lightbox").then((m) => m.Lightbox), {
  ssr: false,
});

type Filter = GalleryCategory | "ALL";

export function GalleryGrid() {
  const t = useT();
  const pick = usePick();
  const [filter, setFilter] = useState<Filter>("ALL");
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const { data: images, isLoading } = useGallery(useOutletId());

  const filters: Array<{ value: Filter; label: string }> = [
    { value: "ALL", label: t.gallery.filterAll },
    { value: "FOOD", label: t.gallery.filterFood },
    { value: "CAFE", label: t.gallery.filterCafe },
    { value: "EVENTS", label: t.gallery.filterEvents },
  ];

  const shown = useMemo(
    () =>
      (images ?? []).filter((image) => filter === "ALL" || image.category === filter),
    [images, filter],
  );

  const lightboxItems = shown.map((image) => ({
    id: image.id,
    src: image.src,
    alt: pick(image.alt),
  }));

  return (
    <Container className="py-10 sm:py-14">
      <SectionHeading
        as="h1"
        size="lg"
        eyebrow={t.gallery.eyebrow}
        title={t.gallery.title}
        description={t.gallery.description}
      />

      {/* Filter chips — pill radius is reserved for exactly this. */}
      <div
        role="tablist"
        aria-label={t.gallery.eyebrow}
        className="mt-6 flex flex-wrap gap-2"
      >
        {filters.map((option) => {
          const isActive = filter === option.value;
          return (
            <button
              key={option.value}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => {
                setFilter(option.value);
                setOpenIndex(null);
              }}
              className={cn(
                "rounded-pill border px-4 py-2 text-sm font-semibold transition-colors",
                isActive
                  ? "border-brand bg-brand text-white"
                  : "border-hairline bg-surface text-ink-muted hover:border-ink-muted hover:text-ink",
              )}
            >
              {option.label}
            </button>
          );
        })}
      </div>

      {isLoading && (
        <div className="mt-8 columns-2 gap-4 lg:columns-3 [&>*]:mb-4">
          {Array.from({ length: 9 }).map((_, i) => (
            <Skeleton
              key={i}
              className={cn("w-full rounded-card", i % 3 === 1 ? "h-64" : "h-44")}
            />
          ))}
        </div>
      )}

      {!isLoading && shown.length === 0 && (
        <EmptyState
          className="mt-8"
          icon={ImageOff}
          title={t.gallery.empty}
          description={t.gallery.emptyBody}
        />
      )}

      {/*
        CSS columns rather than a grid: a masonry wall of mixed portrait and
        landscape shots should not leave gaps, and this needs no measuring.
      */}
      {shown.length > 0 && (
        <div className="mt-8 columns-2 gap-4 lg:columns-3 [&>*]:mb-4">
          {shown.map((image, index) => (
            <button
              key={image.id}
              type="button"
              onClick={() => setOpenIndex(index)}
              aria-label={t.gallery.open(pick(image.alt))}
              className="group relative block w-full break-inside-avoid overflow-hidden rounded-card border border-hairline bg-sand-100 focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
            >
              <Image
                src={image.src}
                alt={pick(image.alt)}
                width={600}
                height={index % 3 === 1 ? 800 : 450}
                sizes="(min-width: 1024px) 32vw, 48vw"
                className="h-auto w-full object-cover transition-transform duration-200 ease-out group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
              />
              <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/80 to-transparent p-3 text-left text-xs font-medium text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                {pick(image.alt)}
              </span>
            </button>
          ))}
        </div>
      )}

      <Lightbox
        items={lightboxItems}
        index={openIndex}
        onClose={() => setOpenIndex(null)}
        onIndexChange={setOpenIndex}
      />
    </Container>
  );
}
