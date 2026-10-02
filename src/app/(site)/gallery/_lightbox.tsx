"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useT } from "@/i18n";

export interface LightboxItem {
  id: string;
  src: string;
  alt: string;
}

/**
 * Full-screen photo viewer.
 *
 * Deliberately not the Dialog primitive: this needs the whole viewport, an
 * image that is allowed to decide its own aspect ratio, and arrow-key and
 * swipe navigation, all of which fight the dialog's padded card.
 */
export function Lightbox({
  items,
  index,
  onClose,
  onIndexChange,
}: {
  items: LightboxItem[];
  /** null while closed. */
  index: number | null;
  onClose: () => void;
  onIndexChange: (index: number) => void;
}) {
  const t = useT();
  const closeRef = useRef<HTMLButtonElement>(null);
  const touchStartX = useRef<number | null>(null);
  const [restoreFocusTo, setRestoreFocusTo] = useState<HTMLElement | null>(null);

  const isOpen = index !== null;
  const current = isOpen ? items[index] : undefined;

  const step = (delta: number) => {
    if (index === null || items.length === 0) return;
    onIndexChange((index + delta + items.length) % items.length);
  };

  // Keyboard: Escape closes, arrows move. Focus goes to the close button so
  // the viewer is reachable without a mouse and gives focus back on close.
  useEffect(() => {
    if (!isOpen) return;
    setRestoreFocusTo(document.activeElement as HTMLElement | null);
    closeRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowRight") step(1);
      if (event.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKeyDown);

    // The page behind must not scroll while the viewer is up.
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, index, items.length]);

  useEffect(() => {
    if (!isOpen && restoreFocusTo) {
      restoreFocusTo.focus();
      setRestoreFocusTo(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  if (!isOpen || !current) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={current.alt}
      className="fixed inset-0 z-100 flex flex-col bg-ink/95"
      onTouchStart={(event) => {
        touchStartX.current = event.touches[0].clientX;
      }}
      onTouchEnd={(event) => {
        if (touchStartX.current === null) return;
        const delta = event.changedTouches[0].clientX - touchStartX.current;
        if (Math.abs(delta) > 50) step(delta < 0 ? 1 : -1);
        touchStartX.current = null;
      }}
    >
      <div className="flex items-center justify-between gap-4 px-4 py-3">
        <p className="nums text-sm text-white/75">
          {t.gallery.counter(index + 1, items.length)}
        </p>
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label={t.gallery.close}
          className="inline-flex size-10 items-center justify-center rounded-control text-white/80 transition-colors hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-white"
        >
          <X size={22} strokeWidth={1.75} aria-hidden="true" />
        </button>
      </div>

      <div className="relative flex-1">
        <Image
          key={current.id}
          src={current.src}
          alt={current.alt}
          fill
          sizes="100vw"
          className="object-contain"
        />
      </div>

      <div className="flex items-center justify-between gap-4 px-4 py-4">
        <button
          type="button"
          onClick={() => step(-1)}
          aria-label={t.gallery.previous}
          className="inline-flex size-12 items-center justify-center rounded-control border border-white/20 text-white/85 transition-colors hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white"
        >
          <ChevronLeft size={24} strokeWidth={1.75} aria-hidden="true" />
        </button>

        <p className="min-w-0 flex-1 truncate text-center text-sm text-white/85">
          {current.alt}
        </p>

        <button
          type="button"
          onClick={() => step(1)}
          aria-label={t.gallery.next}
          className="inline-flex size-12 items-center justify-center rounded-control border border-white/20 text-white/85 transition-colors hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white"
        >
          <ChevronRight size={24} strokeWidth={1.75} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
