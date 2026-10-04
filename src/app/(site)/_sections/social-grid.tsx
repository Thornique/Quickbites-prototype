"use client";

import Image from "next/image";
import { InstagramIcon } from "@/components/site/social-icons";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { Skeleton } from "@/components/ui/skeleton";
import { useGallery } from "@/features/content";
import { useOutletId } from "@/features/outlet";
import { usePick, useT } from "@/i18n";
import { STORE } from "@/lib/constants";

/**
 * Instagram-style grid fed from the gallery collection, so the admin controls
 * it from the Content module rather than it being a real social embed (which
 * would be an external API call, and the brief rules those out).
 */
export function SocialGrid() {
  const t = useT();
  const pick = usePick();
  const outletId = useOutletId();
  const { data: images, isLoading } = useGallery(outletId);

  const tiles = images?.slice(0, 8);

  return (
    <section className="bg-surface py-12 sm:py-16">
      <Container>
        <SectionHeading
          eyebrow={t.social.eyebrow}
          title={t.social.title}
          description={t.social.description}
          action={
            <a
              href={STORE.social.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-control border border-hairline px-3 py-2 text-sm font-semibold text-ink transition-colors hover:border-brand hover:text-brand focus-visible:ring-2 focus-visible:ring-brand"
            >
              <InstagramIcon size={16} />
              {t.social.follow}
            </a>
          }
        />

        <ul className="mt-7 grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
          {isLoading &&
            Array.from({ length: 8 }).map((_, i) => (
              <li key={i}>
                <Skeleton className="aspect-square w-full rounded-card" />
              </li>
            ))}

          {tiles?.map((image) => (
            <li key={image.id}>
              <a
                href={STORE.social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={t.social.openPost(pick(image.alt))}
                className="group relative block aspect-square overflow-hidden rounded-card border border-hairline focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
              >
                <Image
                  src={image.src}
                  alt=""
                  fill
                  sizes="(max-width: 640px) 48vw, 23vw"
                  className="object-cover transition-transform duration-200 ease-out group-hover:scale-105 motion-reduce:group-hover:scale-100"
                />
                <span className="absolute inset-0 flex items-center justify-center bg-ink/0 text-white opacity-0 transition-all duration-150 group-hover:bg-ink/35 group-hover:opacity-100">
                  <InstagramIcon size={22} />
                </span>
              </a>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
