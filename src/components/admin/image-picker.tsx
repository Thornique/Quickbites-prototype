"use client";

import { useRef, useState } from "react";
import { ImagePlus, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useResolvedImage } from "@/features/images";
import { useT } from "@/i18n";
import { toErrorMessage } from "@/lib/errors";
import { deleteUploadedImage, isIdbImage, storeUploadedImage } from "@/storage";
import { cn } from "@/lib/utils";

/**
 * Photographs that ship with the prototype.
 *
 * Hard-coded rather than read from disk: there is no server to list a directory,
 * and these are the files in public/images. New uploads go to IndexedDB, so this
 * list only ever grows when the repo does.
 */
const LIBRARY = [
  "/images/menu/chicken-cheese-burger.webp",
  "/images/menu/crispy-chicken-burger.webp",
  "/images/menu/veg-grilled-sandwich.webp",
  "/images/menu/chicken-tikka-sandwich.webp",
  "/images/menu/club-sandwich.webp",
  "/images/menu/margherita-pizza.webp",
  "/images/menu/farmhouse-pizza.webp",
  "/images/menu/classic-fries.webp",
  "/images/menu/peri-peri-fries.webp",
  "/images/menu/cold-coffee.webp",
  "/images/menu/cappuccino.webp",
  "/images/menu/chocolate-shake.webp",
  "/images/menu/brownie-sundae.webp",
  "/images/hero/burger-combo.webp",
  "/images/hero/pizza-night.webp",
  "/images/hero/shakes.webp",
  "/images/gallery/burger-board.webp",
  "/images/gallery/cafe-counter.webp",
  "/images/gallery/cafe-dining.webp",
  "/images/gallery/cafe-interior.webp",
  "/images/gallery/cafe-seating.webp",
  "/images/gallery/coffee-moment.webp",
  "/images/gallery/dessert-cups.webp",
  "/images/gallery/donuts.webp",
];

/** One thumbnail that can show either a seed path or an uploaded blob. */
function Thumb({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  const resolved = useResolvedImage(src);

  if (!resolved) {
    return (
      <span
        className={cn(
          "flex items-center justify-center bg-sand-100 text-xs text-ink-muted",
          className,
        )}
      >
        QB
      </span>
    );
  }
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={resolved} alt={alt} className={cn("object-cover", className)} />;
}

export interface ImagePickerProps {
  /** Current selection, in display order. The first is the card image. */
  value: string[];
  onChange: (next: string[]) => void;
  /** Uploads are keyed by this prefix so they can be told apart later. */
  uploadPrefix: string;
  /** 1 for a banner or a category, more for a menu item's gallery. */
  max?: number;
  className?: string;
}

/**
 * Pick from the shipped photo library, or upload a file.
 *
 * Uploads are compressed to WebP under 200 KB and stored in IndexedDB by
 * storage/images.ts; only the `idb:` key is ever written to localStorage, so a
 * few uploads cannot eat the demo's storage budget.
 */
export function ImagePicker({
  value,
  onChange,
  uploadPrefix,
  max = 4,
  className,
}: ImagePickerProps) {
  const t = useT();
  const fileRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const toggle = (src: string) => {
    if (value.includes(src)) {
      onChange(value.filter((item) => item !== src));
      return;
    }
    if (value.length >= max) {
      // Replacing the last one beats refusing silently at the limit.
      onChange([...value.slice(0, max - 1), src]);
      return;
    }
    onChange([...value, src]);
  };

  const upload = async (file: File) => {
    setIsUploading(true);
    try {
      const key = await storeUploadedImage(file, `${uploadPrefix}-${Date.now()}`);
      onChange(value.length >= max ? [...value.slice(0, max - 1), key] : [...value, key]);
      toast.success(t.adm.images.uploaded);
    } catch (caught) {
      toast.error(toErrorMessage(caught));
    } finally {
      setIsUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const remove = async (src: string) => {
    onChange(value.filter((item) => item !== src));
    // An upload nothing points at is dead weight in IndexedDB.
    if (isIdbImage(src)) await deleteUploadedImage(src);
  };

  return (
    <div className={cn("grid gap-3", className)}>
      {/* What is selected, in order. */}
      <div>
        <p className="text-xs font-semibold text-ink">
          {t.adm.images.selected(value.length, max)}
        </p>
        {value.length === 0 ? (
          <p className="mt-1.5 rounded-control border border-dashed border-hairline px-3 py-4 text-center text-xs text-ink-muted">
            {t.adm.images.none}
          </p>
        ) : (
          <ul className="mt-1.5 flex flex-wrap gap-2">
            {value.map((src, index) => (
              <li key={src} className="relative">
                <Thumb
                  src={src}
                  alt=""
                  className="size-20 rounded-control border border-hairline"
                />
                {index === 0 && (
                  <Badge variant="default" className="absolute -top-1.5 -left-1.5">
                    {t.adm.images.cardImage}
                  </Badge>
                )}
                <button
                  type="button"
                  onClick={() => void remove(src)}
                  aria-label={t.adm.images.remove}
                  className="absolute -top-1.5 -right-1.5 inline-flex size-6 items-center justify-center rounded-full bg-danger text-white shadow-card transition-colors hover:bg-[#a71f1f] focus-visible:ring-2 focus-visible:ring-danger"
                >
                  <Trash2 size={12} aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Upload. */}
      <div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void upload(file);
          }}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isUploading}
          onClick={() => fileRef.current?.click()}
        >
          <Upload aria-hidden="true" />
          {isUploading ? t.adm.images.uploading : t.adm.images.upload}
        </Button>
        <p className="mt-1 text-xs text-ink-muted">{t.adm.images.uploadHint}</p>
      </div>

      {/* The shipped library. */}
      <div>
        <p className="flex items-center gap-1.5 text-xs font-semibold text-ink">
          <ImagePlus size={13} aria-hidden="true" />
          {t.adm.images.library}
        </p>
        <ul className="mt-1.5 grid max-h-56 grid-cols-4 gap-2 overflow-y-auto rounded-control border border-hairline p-2 sm:grid-cols-6">
          {LIBRARY.map((src) => {
            const isPicked = value.includes(src);
            return (
              <li key={src}>
                <button
                  type="button"
                  onClick={() => toggle(src)}
                  aria-pressed={isPicked}
                  className={cn(
                    "block w-full overflow-hidden rounded-control border-2 transition-colors",
                    "focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-1",
                    isPicked ? "border-brand" : "border-transparent hover:border-hairline",
                  )}
                >
                  <Thumb src={src} alt="" className="aspect-square w-full" />
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
