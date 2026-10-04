"use client";

import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { FormSheet } from "@/components/admin/form-sheet";
import { ImagePicker } from "@/components/admin/image-picker";
import { PageHeader } from "@/components/admin/page-header";
import { MenuItemImage } from "@/components/site/menu-item-image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FormField, fieldAria } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { RequireAdmin } from "@/features/auth";
import { RequireOutlet } from "@/features/outlet";
import { useCategories, useCategoryCounts } from "@/features/menu";
import { usePick, useT } from "@/i18n";
import { toErrorMessage } from "@/lib/errors";
import {
  createCategory,
  deleteCategory,
  reorderCategories,
  updateCategory,
} from "@/services/categories";
import type { Category, OutletId } from "@/types";

type Draft = Omit<Category, "id" | "createdAt" | "updatedAt">;

function emptyDraft(sortOrder: number, outletId: OutletId): Draft {
  return {
    outletId,
    slug: "",
    name: { en: "", hi: "" },
    description: { en: "", hi: "" },
    image: "",
    sortOrder,
    isActive: true,
  };
}

function CategorySheet({
  category,
  nextSortOrder,
  outletId,
  open,
  onOpenChange,
}: {
  category: Category | null;
  nextSortOrder: number;
  outletId: OutletId;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const t = useT();
  const [draft, setDraft] = useState<Draft>(() => emptyDraft(nextSortOrder, outletId));
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (category) {
      const { id: _id, createdAt: _c, updatedAt: _u, ...rest } = category;
      setDraft(rest);
    } else {
      setDraft(emptyDraft(nextSortOrder, outletId));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, category?.id, outletId]);

  const patch = (next: Partial<Draft>) =>
    setDraft((current) => ({ ...current, ...next }));

  const save = async () => {
    setIsSaving(true);
    try {
      if (category) {
        await updateCategory(category.id, draft);
      } else {
        await createCategory(draft);
      }
      toast.success(category ? t.adm.common.saved : t.adm.common.created);
      onOpenChange(false);
    } catch (caught) {
      toast.error(toErrorMessage(caught));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <FormSheet
      open={open}
      onOpenChange={onOpenChange}
      title={category ? category.name.en : t.adm.categories.newCategory}
      submitLabel={category ? t.adm.common.save : t.adm.common.create}
      onSubmit={() => void save()}
      isSubmitting={isSaving}
      isSubmitDisabled={draft.name.en.trim().length === 0}
    >
      <div className="grid gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField id="cat-en" label={t.adm.categories.nameEn}>
            <Input
              {...fieldAria("cat-en")}
              value={draft.name.en}
              onChange={(event) =>
                patch({ name: { ...draft.name, en: event.target.value } })
              }
            />
          </FormField>
          <FormField id="cat-hi" label={t.adm.categories.nameHi}>
            <Input
              {...fieldAria("cat-hi")}
              value={draft.name.hi}
              onChange={(event) =>
                patch({ name: { ...draft.name, hi: event.target.value } })
              }
            />
          </FormField>
        </div>

        <FormField id="cat-desc-en" label={t.adm.categories.descEn}>
          <Textarea
            {...fieldAria("cat-desc-en")}
            rows={2}
            value={draft.description?.en ?? ""}
            onChange={(event) =>
              patch({
                description: {
                  en: event.target.value,
                  hi: draft.description?.hi ?? "",
                },
              })
            }
          />
        </FormField>
        <FormField id="cat-desc-hi" label={t.adm.categories.descHi}>
          <Textarea
            {...fieldAria("cat-desc-hi")}
            rows={2}
            value={draft.description?.hi ?? ""}
            onChange={(event) =>
              patch({
                description: {
                  en: draft.description?.en ?? "",
                  hi: event.target.value,
                },
              })
            }
          />
        </FormField>

        <div className="flex items-center gap-3">
          <Switch
            id="cat-active"
            checked={draft.isActive}
            onCheckedChange={(checked) => patch({ isActive: checked })}
          />
          <Label htmlFor="cat-active">{t.adm.common.active}</Label>
        </div>

        <div>
          <Label>{t.adm.menu.tabImages}</Label>
          <ImagePicker
            className="mt-1.5"
            value={draft.image ? [draft.image] : []}
            onChange={(images) => patch({ image: images[0] ?? "" })}
            uploadPrefix={`category-${draft.name.en || "new"}`}
            max={1}
          />
        </div>
      </div>
    </FormSheet>
  );
}

function CategoriesModule({ outletId }: { outletId: OutletId }) {
  const t = useT();
  const pick = usePick();
  const { data: categories, isLoading } = useCategories(outletId);
  const { data: counts } = useCategoryCounts(outletId);

  const [editing, setEditing] = useState<Category | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [deleting, setDeleting] = useState<Category | null>(null);

  const rows = categories ?? [];

  /**
   * Reorder with buttons rather than drag.
   *
   * Dragging needs a pointer and a steady hand; two buttons work with a
   * keyboard, on a phone, and for eight categories are honestly faster.
   */
  const move = async (index: number, direction: -1 | 1) => {
    const next = [...rows];
    const target = index + direction;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    try {
      await reorderCategories(next.map((category) => category.id));
      toast.success(t.adm.categories.reordered);
    } catch (caught) {
      toast.error(toErrorMessage(caught));
    }
  };

  const itemCount = (id: string) => counts?.[id] ?? 0;

  return (
    <>
      <PageHeader
        title={t.adm.categories.title}
        description={t.adm.categories.subtitle}
        actions={
          <Button
            size="sm"
            onClick={() => {
              setEditing(null);
              setIsSheetOpen(true);
            }}
          >
            <Plus aria-hidden="true" />
            {t.adm.categories.newCategory}
          </Button>
        }
      />

      {isLoading && <Skeleton className="h-64 w-full rounded-card" />}

      <ul className="grid gap-2 [&>li]:min-w-0">
        {rows.map((category, index) => (
          <li key={category.id}>
            <Card className="flex items-center gap-3 p-3">
              <MenuItemImage
                src={category.image}
                alt={pick(category.name)}
                sizes="56px"
                className="size-14 shrink-0 rounded-control"
              />

              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-ink">{pick(category.name)}</p>
                <p className="nums truncate text-xs text-ink-muted">
                  {t.adm.categories.itemCount(itemCount(category.id))} · {category.slug}
                </p>
              </div>

              {!category.isActive && (
                <Badge variant="muted">{t.adm.common.inactive}</Badge>
              )}

              <div className="flex shrink-0 items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label={t.adm.common.moveUp}
                  disabled={index === 0}
                  onClick={() => void move(index, -1)}
                >
                  <ChevronUp aria-hidden="true" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label={t.adm.common.moveDown}
                  disabled={index === rows.length - 1}
                  onClick={() => void move(index, 1)}
                >
                  <ChevronDown aria-hidden="true" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label={t.adm.common.edit}
                  onClick={() => {
                    setEditing(category);
                    setIsSheetOpen(true);
                  }}
                >
                  <Pencil aria-hidden="true" />
                </Button>
                <Button
                  variant="destructive-ghost"
                  size="icon-sm"
                  aria-label={t.adm.common.delete}
                  onClick={() => {
                    // Deleting a section with items would orphan them.
                    const count = itemCount(category.id);
                    if (count > 0) {
                      toast.error(t.adm.categories.deleteBlocked(count));
                      return;
                    }
                    setDeleting(category);
                  }}
                >
                  <Trash2 aria-hidden="true" />
                </Button>
              </div>
            </Card>
          </li>
        ))}
      </ul>

      <CategorySheet
        category={editing}
        nextSortOrder={rows.length + 1}
        outletId={outletId}
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
      />

      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
        title={deleting ? t.adm.common.deleteTitle(pick(deleting.name)) : ""}
        description={t.adm.common.deleteBody}
        confirmLabel={t.adm.common.delete}
        isDestructive
        successMessage={t.adm.common.deleted}
        onConfirm={async () => {
          if (deleting) await deleteCategory(deleting.id);
          setDeleting(null);
        }}
      />
    </>
  );
}

export default function AdminCategoriesPage() {
  return (
    <RequireAdmin permission="MENU">
      <RequireOutlet>
        {(outletId) => <CategoriesModule outletId={outletId} />}
      </RequireOutlet>
    </RequireAdmin>
  );
}
