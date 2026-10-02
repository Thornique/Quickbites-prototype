import { Flame, Settings2, Sparkles, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

/** Marketing/metadata labels that appear on menu items. */
export type TagKind = "bestseller" | "new" | "spicy" | "customisable" | "combo";

const TAG_STYLES: Record<
  TagKind,
  { label: string; className: string; Icon: typeof Flame }
> = {
  bestseller: {
    label: "Bestseller",
    className: "bg-mustard/18 text-mustard-dark",
    Icon: TrendingUp,
  },
  new: {
    label: "New",
    className: "bg-brand/10 text-brand",
    Icon: Sparkles,
  },
  spicy: {
    label: "Spicy",
    className: "bg-nonveg/10 text-nonveg",
    Icon: Flame,
  },
  customisable: {
    label: "Customisable",
    className: "bg-sand-100 text-ink-muted",
    Icon: Settings2,
  },
  combo: {
    label: "Combo",
    className: "bg-veg/10 text-veg",
    Icon: Sparkles,
  },
};

export const TAG_KINDS = Object.keys(TAG_STYLES) as TagKind[];

export interface TagProps {
  kind: TagKind;
  /** Overrides the default English label — used for the Hindi dictionary. */
  label?: string;
  /** Hide the icon in very dense layouts (mobile menu rows). */
  iconless?: boolean;
  className?: string;
}

/**
 * Small pill that signals why an item is worth noticing. Pill radius is
 * allowed here: per the brief it is reserved for chips and tags.
 */
export function Tag({ kind, label, iconless = false, className }: TagProps) {
  const { label: defaultLabel, className: kindClass, Icon } = TAG_STYLES[kind];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-pill px-2 py-0.5 text-[0.6875rem] font-bold tracking-wide uppercase",
        kindClass,
        className,
      )}
    >
      {!iconless && <Icon size={12} strokeWidth={2.25} aria-hidden="true" />}
      {label ?? defaultLabel}
    </span>
  );
}
