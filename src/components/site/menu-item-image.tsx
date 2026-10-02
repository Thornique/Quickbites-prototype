"use client";

import Image from "next/image";
import { useResolvedImage } from "@/features/images";
import { isIdbImage } from "@/storage";
import { cn } from "@/lib/utils";

export interface MenuItemImageProps {
  src?: string;
  alt: string;
  /** Tailwind aspect class, e.g. "aspect-[4/3]". */
  className?: string;
  sizes: string;
  priority?: boolean;
  /** Shown under the monogram on the placeholder, e.g. the category name. */
  placeholderLabel?: string;
}

/**
 * Menu photography, or the brand placeholder when an item has none yet.
 *
 * Not every item was photographed (see public/images/TODO.md), and a broken
 * frame or a grey "no image" box would read as a bug. The placeholder is a
 * flat sand panel carrying the monogram, so a card without a photo looks like
 * branded packaging rather than a failure.
 */
export function MenuItemImage({
  src,
  alt,
  className,
  sizes,
  priority = false,
  placeholderLabel,
}: MenuItemImageProps) {
  const resolved = useResolvedImage(src);

  /*
    An admin upload lives in IndexedDB and resolves to an object URL, which
    next/image cannot optimise — those render through a plain <img>. Seed
    photos keep the optimised path.
  */
  if (resolved) {
    return (
      <div className={cn("relative overflow-hidden bg-sand-100", className)}>
        {isIdbImage(src ?? "") ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={resolved} alt={alt} className="absolute inset-0 size-full object-cover" />
        ) : (
          <Image
            src={resolved}
            alt={alt}
            fill
            sizes={sizes}
            priority={priority}
            className="object-cover"
          />
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative flex flex-col items-center justify-center gap-1.5 overflow-hidden",
        "bg-sand-100 text-center",
        className,
      )}
      role="img"
      aria-label={alt}
    >
      {/* Hairline frame, echoing the packaging sticker. */}
      <span
        aria-hidden="true"
        className="absolute inset-2 rounded-[6px] border border-dashed border-ink/10"
      />
      <span
        aria-hidden="true"
        className="text-display relative text-[clamp(1.25rem,4cqi,2rem)] leading-none text-brand/85"
      >
        QB
      </span>
      {placeholderLabel && (
        <span
          aria-hidden="true"
          className="relative max-w-[80%] truncate text-[0.625rem] font-semibold tracking-[0.1em] text-ink-muted/70 uppercase"
        >
          {placeholderLabel}
        </span>
      )}
    </div>
  );
}
