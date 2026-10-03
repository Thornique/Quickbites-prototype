"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ExternalLink, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { FormSheet } from "@/components/admin/form-sheet";
import { ImagePicker } from "@/components/admin/image-picker";
import { Button } from "@/components/ui/button";
import { FormField, fieldAria } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useInventory } from "@/features/inventory";
import { useCategories } from "@/features/menu";
import { usePick, useT } from "@/i18n";
import { toErrorMessage } from "@/lib/errors";
import { createMenuItem, updateMenuItem } from "@/services/menu";
import { MENU_ITEM_TAGS, type MenuItem, type MenuItemTag } from "@/types";
import { cn } from "@/lib/utils";
import { OptionGroupsEditor } from "./_option-groups";

/** Mirrors the English name until an admin types their own. */
function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

type Draft = Omit<MenuItem, "id" | "createdAt" | "updatedAt">;

function emptyDraft(categoryId: string): Draft {
  return {
    slug: "",
    categoryId,
    name: { en: "", hi: "" },
    description: { en: "", hi: "" },
    price: 0,
    isVeg: true,
    tags: [],
    images: [],
    prepMinutes: 8,
    isAvailable: true,
    stockItemLinks: [],
    optionGroups: [],
    popularity: 0,
    sortOrder: 99,
  };
}

/**
 * Create or edit a menu item.
 *
 * Four tabs because the four jobs are genuinely separate — wording, pictures,
 * choices, and what it eats out of stock — and a single column of thirty fields
 * is how a demo goes wrong. Nothing is written until Save, so an abandoned draft
 * never reaches the customer menu.
 */
export function MenuItemSheet({
  item,
  open,
  onOpenChange,
}: {
  /** null = create. */
  item: MenuItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const t = useT();
  const pick = usePick();
  const { data: categories } = useCategories();
  const { data: inventory } = useInventory();

  const [draft, setDraft] = useState<Draft>(() => emptyDraft(""));
  const [slugTouched, setSlugTouched] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [tab, setTab] = useState("basics");

  // Reload the draft whenever the sheet opens on a different row.
  useEffect(() => {
    if (!open) return;
    setTab("basics");
    setSlugTouched(!!item);
    if (item) {
      const { id: _id, createdAt: _c, updatedAt: _u, ...rest } = item;
      setDraft(rest);
    } else {
      setDraft(emptyDraft(categories?.[0]?.id ?? ""));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, item?.id]);

  /*
    The categories arrive a tick after the sheet opens, so a new item can start
    with no category and an un-saveable form. Backfill the first one as soon as
    the list is there.
  */
  useEffect(() => {
    if (!open || item) return;
    const first = categories?.[0]?.id;
    if (first) {
      setDraft((current) => (current.categoryId ? current : { ...current, categoryId: first }));
    }
  }, [open, item, categories]);

  const patch = (next: Partial<Draft>) => setDraft((current) => ({ ...current, ...next }));

  const setNameEn = (value: string) =>
    setDraft((current) => ({
      ...current,
      name: { ...current.name, en: value },
      slug: slugTouched ? current.slug : slugify(value),
    }));

  const toggleTag = (tag: MenuItemTag) =>
    patch({
      tags: draft.tags.includes(tag)
        ? draft.tags.filter((item) => item !== tag)
        : [...draft.tags, tag],
    });

  const canSave =
    draft.name.en.trim().length > 0 && draft.price > 0 && draft.categoryId.length > 0;

  const save = async () => {
    setIsSaving(true);
    try {
      if (item) {
        await updateMenuItem(item.id, draft);
        toast.success(t.adm.common.saved);
      } else {
        await createMenuItem(draft);
        toast.success(t.adm.menu.createdToast(draft.name.en));
      }
      onOpenChange(false);
    } catch (caught) {
      toast.error(toErrorMessage(caught));
    } finally {
      setIsSaving(false);
    }
  };

  const availableStock = (inventory ?? []).filter(
    (stock) => !draft.stockItemLinks.some((link) => link.inventoryItemId === stock.id),
  );

  return (
    <FormSheet
      open={open}
      onOpenChange={onOpenChange}
      title={item ? item.name.en : t.adm.menu.newItem}
      description={item ? t.adm.common.edit : t.adm.common.create}
      width="lg"
      submitLabel={item ? t.adm.common.save : t.adm.common.create}
      onSubmit={() => void save()}
      isSubmitting={isSaving}
      isSubmitDisabled={!canSave}
      secondaryActions={
        item && (
          <Button asChild variant="outline" size="sm">
            <Link href={`/menu/${item.slug}`} target="_blank">
              {t.adm.common.viewOnSite}
              <ExternalLink aria-hidden="true" />
            </Link>
          </Button>
        )
      }
    >
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="w-full">
          <TabsTrigger value="basics">{t.adm.menu.tabBasics}</TabsTrigger>
          <TabsTrigger value="images">{t.adm.menu.tabImages}</TabsTrigger>
          <TabsTrigger value="options">{t.adm.menu.tabOptions}</TabsTrigger>
          <TabsTrigger value="stock">{t.adm.menu.tabStock}</TabsTrigger>
        </TabsList>

        <TabsContent value="basics" className="mt-4 grid gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField id="mi-name-en" label={t.adm.menu.nameEn}>
              <Input
                {...fieldAria("mi-name-en")}
                value={draft.name.en}
                onChange={(event) => setNameEn(event.target.value)}
              />
            </FormField>
            <FormField id="mi-name-hi" label={t.adm.menu.nameHi}>
              <Input
                {...fieldAria("mi-name-hi")}
                value={draft.name.hi}
                onChange={(event) =>
                  patch({ name: { ...draft.name, hi: event.target.value } })
                }
              />
            </FormField>
          </div>

          <FormField id="mi-desc-en" label={t.adm.menu.descEn}>
            <Textarea
              {...fieldAria("mi-desc-en")}
              rows={2}
              value={draft.description.en}
              onChange={(event) =>
                patch({ description: { ...draft.description, en: event.target.value } })
              }
            />
          </FormField>
          <FormField id="mi-desc-hi" label={t.adm.menu.descHi}>
            <Textarea
              {...fieldAria("mi-desc-hi")}
              rows={2}
              value={draft.description.hi}
              onChange={(event) =>
                patch({ description: { ...draft.description, hi: event.target.value } })
              }
            />
          </FormField>

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField id="mi-category" label={t.adm.menu.category}>
              <Select
                value={draft.categoryId}
                onValueChange={(value) => patch({ categoryId: value })}
              >
                <SelectTrigger id="mi-category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(categories ?? []).map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {pick(category.name)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>

            <div className="flex items-center gap-3 pt-6">
              <Switch
                id="mi-veg"
                checked={draft.isVeg}
                onCheckedChange={(checked) => patch({ isVeg: checked })}
              />
              <Label htmlFor="mi-veg">{t.adm.menu.veg}</Label>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <FormField id="mi-price" label={t.adm.menu.price}>
              <Input
                {...fieldAria("mi-price")}
                type="number"
                min={0}
                value={draft.price}
                onChange={(event) => patch({ price: Number(event.target.value) })}
                className="nums"
              />
            </FormField>
            <FormField
              id="mi-compare"
              label={t.adm.menu.compareAt}
              hint={t.adm.menu.compareAtHint}
            >
              <Input
                {...fieldAria("mi-compare", undefined, t.adm.menu.compareAtHint)}
                type="number"
                min={0}
                value={draft.compareAtPrice ?? ""}
                onChange={(event) =>
                  patch({
                    compareAtPrice: event.target.value
                      ? Number(event.target.value)
                      : undefined,
                  })
                }
                className="nums"
              />
            </FormField>
            <FormField id="mi-prep" label={t.adm.menu.prepMinutes}>
              <Input
                {...fieldAria("mi-prep")}
                type="number"
                min={1}
                value={draft.prepMinutes}
                onChange={(event) => patch({ prepMinutes: Number(event.target.value) })}
                className="nums"
              />
            </FormField>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <FormField id="mi-calories" label={t.adm.menu.calories}>
              <Input
                {...fieldAria("mi-calories")}
                type="number"
                min={0}
                value={draft.calories ?? ""}
                onChange={(event) =>
                  patch({
                    calories: event.target.value ? Number(event.target.value) : undefined,
                  })
                }
                className="nums"
              />
            </FormField>
            <FormField id="mi-sort" label={t.adm.menu.sortOrder}>
              <Input
                {...fieldAria("mi-sort")}
                type="number"
                value={draft.sortOrder}
                onChange={(event) => patch({ sortOrder: Number(event.target.value) })}
                className="nums"
              />
            </FormField>
            <FormField
              id="mi-slug"
              label={t.adm.menu.slug}
              hint={t.adm.menu.slugHint}
            >
              <Input
                {...fieldAria("mi-slug", undefined, t.adm.menu.slugHint)}
                value={draft.slug}
                onChange={(event) => {
                  setSlugTouched(true);
                  patch({ slug: event.target.value });
                }}
              />
            </FormField>
          </div>

          <div>
            <Label>{t.adm.menu.tags}</Label>
            <div className="mt-1.5 flex flex-wrap gap-2">
              {MENU_ITEM_TAGS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  aria-pressed={draft.tags.includes(tag)}
                  className={cn(
                    "rounded-pill border px-3 py-1.5 text-xs font-semibold transition-colors",
                    draft.tags.includes(tag)
                      ? "border-brand bg-brand text-white"
                      : "border-hairline bg-surface text-ink-muted hover:border-ink-muted",
                  )}
                >
                  {t.adm.menu.tagLabels[tag]}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Switch
              id="mi-available"
              checked={draft.isAvailable}
              onCheckedChange={(checked) =>
                patch({
                  isAvailable: checked,
                  unavailableReason: checked ? undefined : "MANUAL",
                })
              }
            />
            <Label htmlFor="mi-available">{t.adm.menu.colAvailable}</Label>
          </div>
        </TabsContent>

        <TabsContent value="images" className="mt-4">
          <ImagePicker
            value={draft.images}
            onChange={(images) => patch({ images })}
            uploadPrefix={`item-${draft.slug || "new"}`}
            max={4}
          />
        </TabsContent>

        <TabsContent value="options" className="mt-4">
          <OptionGroupsEditor
            groups={draft.optionGroups}
            onChange={(optionGroups) => patch({ optionGroups })}
          />
        </TabsContent>

        <TabsContent value="stock" className="mt-4 grid gap-3">
          <div>
            <p className="text-sm font-semibold text-ink">{t.adm.menu.stockLinks}</p>
            <p className="mt-0.5 text-xs text-ink-muted">{t.adm.menu.stockLinksHint}</p>
          </div>

          {draft.stockItemLinks.length === 0 && (
            <p className="rounded-control border border-dashed border-hairline px-3 py-4 text-sm text-ink-muted">
              {t.adm.menu.noStockLinks}
            </p>
          )}

          <ul className="grid gap-2 [&>li]:min-w-0">
            {draft.stockItemLinks.map((link) => {
              const stock = (inventory ?? []).find(
                (entry) => entry.id === link.inventoryItemId,
              );
              return (
                <li key={link.inventoryItemId} className="flex items-end gap-2">
                  <div className="min-w-0 flex-1">
                    <Label className="text-xs">{stock?.name ?? link.inventoryItemId}</Label>
                    <p className="nums mt-1 text-xs text-ink-muted">
                      {stock ? `${stock.qty} ${stock.unit}` : ""}
                    </p>
                  </div>
                  <div className="grid w-28 gap-1.5">
                    <Label
                      htmlFor={`link-${link.inventoryItemId}`}
                      className="text-xs"
                    >
                      {t.adm.menu.quantityPerUnit}
                    </Label>
                    <Input
                      id={`link-${link.inventoryItemId}`}
                      type="number"
                      min={0}
                      step="any"
                      value={link.quantityPerUnit}
                      onChange={(event) =>
                        patch({
                          stockItemLinks: draft.stockItemLinks.map((entry) =>
                            entry.inventoryItemId === link.inventoryItemId
                              ? { ...entry, quantityPerUnit: Number(event.target.value) }
                              : entry,
                          ),
                        })
                      }
                      className="nums h-9"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="destructive-ghost"
                    size="icon-sm"
                    aria-label={t.adm.common.delete}
                    onClick={() =>
                      patch({
                        stockItemLinks: draft.stockItemLinks.filter
                          ((entry) => entry.inventoryItemId !== link.inventoryItemId),
                      })
                    }
                  >
                    <Trash2 aria-hidden="true" />
                  </Button>
                </li>
              );
            })}
          </ul>

          {availableStock.length > 0 && (
            <div className="flex items-end gap-2">
              <div className="min-w-0 flex-1">
                <Label htmlFor="mi-add-stock">{t.adm.menu.addStockLink}</Label>
                <Select
                  value=""
                  onValueChange={(value) =>
                    patch({
                      stockItemLinks: [
                        ...draft.stockItemLinks,
                        { inventoryItemId: value, quantityPerUnit: 1 },
                      ],
                    })
                  }
                >
                  <SelectTrigger id="mi-add-stock" className="mt-1.5">
                    <SelectValue placeholder={t.adm.menu.addStockLink} />
                  </SelectTrigger>
                  <SelectContent>
                    {availableStock.map((stock) => (
                      <SelectItem key={stock.id} value={stock.id}>
                        {stock.name} ({stock.unit})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Plus
                size={16}
                aria-hidden="true"
                className="mb-3 shrink-0 text-ink-muted"
              />
            </div>
          )}
        </TabsContent>
      </Tabs>
    </FormSheet>
  );
}
