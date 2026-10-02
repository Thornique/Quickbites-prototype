"use client";

import { useEffect, useMemo, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { DataTable, type AdminColumn } from "@/components/admin/data-table";
import { FormSheet } from "@/components/admin/form-sheet";
import { PageHeader } from "@/components/admin/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Textarea } from "@/components/ui/textarea";
import { RequireAdmin } from "@/features/auth";
import { useCoupons } from "@/features/coupons";
import { useCategories } from "@/features/menu";
import { usePick, useT } from "@/i18n";
import { toErrorMessage } from "@/lib/errors";
import { formatDate, formatPrice } from "@/lib/format";
import { couponState, createCoupon, deleteCoupon, updateCoupon } from "@/services/coupons";
import type { Coupon, CouponType } from "@/types";
import { cn } from "@/lib/utils";

/** The basket the preview quotes against. */
const PREVIEW_BASKET = 400;

type Draft = Omit<Coupon, "id" | "createdAt" | "updatedAt" | "usedCount">;

function toDateInput(iso: string): string {
  return iso.slice(0, 10);
}

function emptyDraft(): Draft {
  const today = new Date();
  const inAMonth = new Date(today);
  inAMonth.setMonth(inAMonth.getMonth() + 1);
  return {
    code: "",
    description: { en: "", hi: "" },
    type: "PERCENT",
    value: 10,
    minOrder: 199,
    maxDiscount: 100,
    validFrom: today.toISOString(),
    validTo: inAMonth.toISOString(),
    usageLimit: 500,
    perUserLimit: 1,
    categoryIds: [],
    isActive: true,
  };
}

/** What a coupon takes off a basket of a given size. */
function discountOn(draft: Draft, basket: number): number {
  if (basket < draft.minOrder) return 0;
  if (draft.type === "FLAT") return Math.min(draft.value, basket);
  const raw = Math.round((basket * draft.value) / 100);
  return draft.maxDiscount ? Math.min(raw, draft.maxDiscount) : raw;
}

function CouponSheet({
  coupon,
  open,
  onOpenChange,
}: {
  coupon: Coupon | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const t = useT();
  const pick = usePick();
  const { data: categories } = useCategories();
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (coupon) {
      const { id: _id, createdAt: _c, updatedAt: _u, usedCount: _n, ...rest } = coupon;
      setDraft(rest);
    } else {
      setDraft(emptyDraft());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, coupon?.id]);

  const patch = (next: Partial<Draft>) => setDraft((current) => ({ ...current, ...next }));

  const saving = discountOn(draft, PREVIEW_BASKET);

  const save = async () => {
    setIsSaving(true);
    try {
      if (coupon) {
        await updateCoupon(coupon.id, draft);
      } else {
        await createCoupon(draft);
      }
      toast.success(coupon ? t.adm.common.saved : t.adm.common.created);
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
      title={coupon ? coupon.code : t.adm.coupons.newCoupon}
      submitLabel={coupon ? t.adm.common.save : t.adm.common.create}
      onSubmit={() => void save()}
      isSubmitting={isSaving}
      isSubmitDisabled={draft.code.trim().length === 0 || draft.value <= 0}
    >
      <div className="grid gap-4">
        <FormField id="cp-code" label={t.adm.coupons.code} hint={t.adm.coupons.codeHint}>
          <Input
            {...fieldAria("cp-code", undefined, t.adm.coupons.codeHint)}
            value={draft.code}
            onChange={(event) => patch({ code: event.target.value.toUpperCase() })}
            className="nums font-semibold"
          />
        </FormField>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField id="cp-desc-en" label={t.adm.coupons.descEn}>
            <Textarea
              {...fieldAria("cp-desc-en")}
              rows={2}
              value={draft.description.en}
              onChange={(event) =>
                patch({ description: { ...draft.description, en: event.target.value } })
              }
            />
          </FormField>
          <FormField id="cp-desc-hi" label={t.adm.coupons.descHi}>
            <Textarea
              {...fieldAria("cp-desc-hi")}
              rows={2}
              value={draft.description.hi}
              onChange={(event) =>
                patch({ description: { ...draft.description, hi: event.target.value } })
              }
            />
          </FormField>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <FormField id="cp-type" label={t.adm.coupons.type}>
            <Select
              value={draft.type}
              onValueChange={(value) => patch({ type: value as CouponType })}
            >
              <SelectTrigger id="cp-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PERCENT">{t.adm.coupons.percent}</SelectItem>
                <SelectItem value="FLAT">{t.adm.coupons.flat}</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
          <FormField id="cp-value" label={t.adm.coupons.value}>
            <Input
              {...fieldAria("cp-value")}
              type="number"
              min={1}
              max={draft.type === "PERCENT" ? 100 : undefined}
              value={draft.value}
              onChange={(event) => patch({ value: Number(event.target.value) })}
              className="nums"
            />
          </FormField>
          {draft.type === "PERCENT" && (
            <FormField
              id="cp-max"
              label={t.adm.coupons.maxDiscount}
              hint={t.adm.coupons.maxDiscountHint}
            >
              <Input
                {...fieldAria("cp-max", undefined, t.adm.coupons.maxDiscountHint)}
                type="number"
                min={0}
                value={draft.maxDiscount ?? ""}
                onChange={(event) =>
                  patch({
                    maxDiscount: event.target.value
                      ? Number(event.target.value)
                      : undefined,
                  })
                }
                className="nums"
              />
            </FormField>
          )}
        </div>

        {/* The question an admin actually has. */}
        <Card
          className={cn(
            "p-3",
            saving > 0 ? "border-veg/25 bg-veg/5" : "border-hairline bg-sand-50",
          )}
        >
          <p className="text-xs font-bold tracking-wide text-ink-muted uppercase">
            {t.adm.coupons.preview}
          </p>
          <p className="mt-1 text-sm text-ink">
            {saving > 0
              ? t.adm.coupons.previewOn(
                  formatPrice(PREVIEW_BASKET),
                  formatPrice(saving),
                )
              : t.adm.coupons.previewNoSaving(formatPrice(PREVIEW_BASKET))}
          </p>
        </Card>

        <div className="grid gap-4 sm:grid-cols-3">
          <FormField id="cp-min" label={t.adm.coupons.minOrder}>
            <Input
              {...fieldAria("cp-min")}
              type="number"
              min={0}
              value={draft.minOrder}
              onChange={(event) => patch({ minOrder: Number(event.target.value) })}
              className="nums"
            />
          </FormField>
          <FormField id="cp-limit" label={t.adm.coupons.usageLimit}>
            <Input
              {...fieldAria("cp-limit")}
              type="number"
              min={1}
              value={draft.usageLimit}
              onChange={(event) => patch({ usageLimit: Number(event.target.value) })}
              className="nums"
            />
          </FormField>
          <FormField id="cp-peruser" label={t.adm.coupons.perUserLimit}>
            <Input
              {...fieldAria("cp-peruser")}
              type="number"
              min={1}
              value={draft.perUserLimit}
              onChange={(event) => patch({ perUserLimit: Number(event.target.value) })}
              className="nums"
            />
          </FormField>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField id="cp-from" label={t.adm.coupons.validFrom}>
            <Input
              {...fieldAria("cp-from")}
              type="date"
              value={toDateInput(draft.validFrom)}
              onChange={(event) =>
                patch({ validFrom: new Date(`${event.target.value}T00:00:00`).toISOString() })
              }
            />
          </FormField>
          <FormField id="cp-to" label={t.adm.coupons.validTo}>
            <Input
              {...fieldAria("cp-to")}
              type="date"
              value={toDateInput(draft.validTo)}
              onChange={(event) =>
                patch({ validTo: new Date(`${event.target.value}T23:59:59`).toISOString() })
              }
            />
          </FormField>
        </div>

        <div>
          <Label>{t.adm.coupons.categories}</Label>
          <p className="mt-0.5 text-xs text-ink-muted">{t.adm.coupons.categoriesHint}</p>
          <ul className="mt-2 grid gap-1.5 sm:grid-cols-2">
            {(categories ?? []).map((category) => (
              <li key={category.id} className="flex items-center gap-2">
                <Checkbox
                  id={`cp-cat-${category.id}`}
                  checked={draft.categoryIds.includes(category.id)}
                  onCheckedChange={(checked) =>
                    patch({
                      categoryIds: checked
                        ? [...draft.categoryIds, category.id]
                        : draft.categoryIds.filter((id) => id !== category.id),
                    })
                  }
                />
                <Label htmlFor={`cp-cat-${category.id}`} className="font-normal">
                  {pick(category.name)}
                </Label>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex items-center gap-3">
          <Switch
            id="cp-active"
            checked={draft.isActive}
            onCheckedChange={(checked) => patch({ isActive: checked })}
          />
          <Label htmlFor="cp-active">{t.adm.common.active}</Label>
        </div>
      </div>
    </FormSheet>
  );
}

function CouponsModule() {
  const t = useT();
  const { data: coupons, isLoading } = useCoupons();
  const [editing, setEditing] = useState<Coupon | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [deleting, setDeleting] = useState<Coupon | null>(null);

  const rows = useMemo(() => coupons ?? [], [coupons]);

  const stateTone = (coupon: Coupon) => {
    switch (couponState(coupon)) {
      case "ACTIVE":
        return "veg" as const;
      case "SCHEDULED":
        return "secondary" as const;
      case "EXPIRED":
        return "muted" as const;
      case "EXHAUSTED":
        return "warning" as const;
      default:
        return "outline" as const;
    }
  };

  const columns: AdminColumn<Coupon>[] = [
    {
      id: "code",
      header: t.adm.coupons.colCode,
      sortValue: (coupon) => coupon.code,
      searchValue: (coupon) => `${coupon.code} ${coupon.description.en}`,
      cell: (coupon) => (
        <span className="block min-w-0">
          <span className="nums font-semibold text-ink">{coupon.code}</span>
          <span className="block truncate text-xs text-ink-muted">
            {coupon.description.en}
          </span>
        </span>
      ),
    },
    {
      id: "type",
      header: t.adm.coupons.colType,
      sortValue: (coupon) => coupon.value,
      cell: (coupon) => (
        <span className="nums text-ink">
          {coupon.type === "PERCENT"
            ? `${coupon.value}%`
            : formatPrice(coupon.value)}
          <span className="block text-xs text-ink-muted">
            {t.adm.coupons.minOrder}: {formatPrice(coupon.minOrder)}
          </span>
        </span>
      ),
    },
    {
      id: "usage",
      header: t.adm.coupons.colUsage,
      sortValue: (coupon) => coupon.usedCount / Math.max(1, coupon.usageLimit),
      cell: (coupon) => {
        const percent = Math.round(
          (coupon.usedCount / Math.max(1, coupon.usageLimit)) * 100,
        );
        return (
          <span className="block w-28">
            <span className="nums text-xs text-ink">
              {t.adm.coupons.usageOf(coupon.usedCount, coupon.usageLimit)}
            </span>
            <span className="mt-1 block h-1.5 overflow-hidden rounded-pill bg-sand-100">
              <span
                className={cn(
                  "block h-full rounded-pill",
                  percent >= 100 ? "bg-warning" : "bg-brand",
                )}
                style={{ width: `${Math.min(100, percent)}%` }}
              />
            </span>
          </span>
        );
      },
    },
    {
      id: "validity",
      header: t.adm.coupons.colValidity,
      sortValue: (coupon) => Date.parse(coupon.validTo),
      cell: (coupon) => (
        <span className="nums text-xs text-ink-muted">
          {formatDate(coupon.validFrom)} – {formatDate(coupon.validTo)}
        </span>
      ),
    },
    {
      id: "state",
      header: t.adm.common.status,
      sortValue: (coupon) => couponState(coupon),
      cell: (coupon) => (
        <Badge variant={stateTone(coupon)}>
          {t.adm.coupons.state[couponState(coupon)]}
        </Badge>
      ),
    },
    {
      id: "active",
      interactive: true,
      header: t.adm.common.active,
      cell: (coupon) => (
        <Switch
          checked={coupon.isActive}
          aria-label={`${coupon.code} — ${t.adm.common.active}`}
          onCheckedChange={(checked) => {
            void updateCoupon(coupon.id, { isActive: checked }).catch((error) =>
              toast.error(toErrorMessage(error)),
            );
          }}
        />
      ),
    },
    {
      id: "actions",
      interactive: true,
      header: "",
      className: "w-10",
      cell: (coupon) => (
        <div className="flex justify-end">
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={t.adm.common.edit}
            onClick={() => {
              setEditing(coupon);
              setIsSheetOpen(true);
            }}
          >
            <Pencil aria-hidden="true" />
          </Button>
          <Button
            variant="destructive-ghost"
            size="icon-sm"
            aria-label={t.adm.common.delete}
            onClick={() => setDeleting(coupon)}
          >
            <Trash2 aria-hidden="true" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title={t.adm.coupons.title}
        description={t.adm.coupons.subtitle}
        actions={
          <Button
            size="sm"
            onClick={() => {
              setEditing(null);
              setIsSheetOpen(true);
            }}
          >
            <Plus aria-hidden="true" />
            {t.adm.coupons.newCoupon}
          </Button>
        }
      />

      <DataTable
        data={rows}
        columns={columns}
        getRowId={(coupon) => coupon.id}
        isLoading={isLoading}
        searchPlaceholder={t.adm.coupons.colCode}
        csvName="coupons"
        toCsvRow={(coupon) => ({
          code: coupon.code,
          type: coupon.type,
          value: coupon.value,
          minOrder: coupon.minOrder,
          used: coupon.usedCount,
          limit: coupon.usageLimit,
          from: formatDate(coupon.validFrom),
          to: formatDate(coupon.validTo),
          state: couponState(coupon),
        })}
        renderCard={(coupon) => (
          <Card className="p-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="nums font-semibold text-ink">{coupon.code}</p>
                <p className="truncate text-xs text-ink-muted">
                  {coupon.description.en}
                </p>
              </div>
              <Badge variant={stateTone(coupon)}>
                {t.adm.coupons.state[couponState(coupon)]}
              </Badge>
            </div>
            <p className="nums mt-2 text-sm text-ink">
              {coupon.type === "PERCENT" ? `${coupon.value}%` : formatPrice(coupon.value)}{" "}
              · {t.adm.coupons.usageOf(coupon.usedCount, coupon.usageLimit)}
            </p>
          </Card>
        )}
      />

      <CouponSheet coupon={editing} open={isSheetOpen} onOpenChange={setIsSheetOpen} />

      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
        title={deleting ? t.adm.common.deleteTitle(deleting.code) : ""}
        description={t.adm.common.deleteBody}
        confirmLabel={t.adm.common.delete}
        isDestructive
        successMessage={t.adm.common.deleted}
        onConfirm={async () => {
          if (deleting) await deleteCoupon(deleting.id);
          setDeleting(null);
        }}
      />
    </>
  );
}

export default function AdminCouponsPage() {
  return (
    <RequireAdmin permission="COUPONS">
      <CouponsModule />
    </RequireAdmin>
  );
}
