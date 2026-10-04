"use client";

import { useEffect, useState } from "react";
import { History, PackagePlus, Pencil, Plus, SlidersHorizontal } from "lucide-react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { DataTable, type AdminColumn } from "@/components/admin/data-table";
import { FormSheet } from "@/components/admin/form-sheet";
import { PageHeader } from "@/components/admin/page-header";
import { StatCard } from "@/components/admin/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FormField, fieldAria } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RequireAdmin } from "@/features/auth";
import { RequireOutlet } from "@/features/outlet";
import {
  useInventory,
  useInventoryValuation,
  useStockMovements,
} from "@/features/inventory";
import { useT } from "@/i18n";
import { toErrorMessage } from "@/lib/errors";
import { formatDateTime, formatPrice } from "@/lib/format";
import {
  adjustStock,
  createInventoryItem,
  stockIn,
  stockStatus,
  updateInventoryItem,
} from "@/services/inventory";
import {
  INVENTORY_UNITS,
  type InventoryItem,
  type InventoryUnit,
  type OutletId,
} from "@/types";

type Draft = Omit<InventoryItem, "id" | "createdAt" | "updatedAt">;

const emptyDraft = (outletId: OutletId): Draft => ({
  outletId,
  name: "",
  unit: "pcs",
  qty: 0,
  lowStockThreshold: 10,
  costPerUnit: 0,
  category: "",
});

/** Create or edit the stock record itself. */
function StockItemSheet({
  item,
  outletId,
  open,
  onOpenChange,
}: {
  item: InventoryItem | null;
  outletId: OutletId;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const t = useT();
  const [draft, setDraft] = useState<Draft>(() => emptyDraft(outletId));
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (item) {
      const { id: _id, createdAt: _c, updatedAt: _u, ...rest } = item;
      setDraft(rest);
    } else {
      setDraft(emptyDraft(outletId));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, item?.id]);

  const patch = (next: Partial<Draft>) =>
    setDraft((current) => ({ ...current, ...next }));

  const save = async () => {
    setIsSaving(true);
    try {
      if (item) {
        await updateInventoryItem(item.id, draft);
      } else {
        await createInventoryItem(draft);
      }
      toast.success(item ? t.adm.common.saved : t.adm.common.created);
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
      title={item ? item.name : t.adm.inventory.newItem}
      submitLabel={item ? t.adm.common.save : t.adm.common.create}
      onSubmit={() => void save()}
      isSubmitting={isSaving}
      isSubmitDisabled={draft.name.trim().length === 0}
    >
      <div className="grid gap-4">
        <FormField id="inv-name" label={t.adm.inventory.name}>
          <Input
            {...fieldAria("inv-name")}
            value={draft.name}
            onChange={(event) => patch({ name: event.target.value })}
          />
        </FormField>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField id="inv-category" label={t.adm.inventory.category}>
            <Input
              {...fieldAria("inv-category")}
              value={draft.category}
              placeholder="Bakery"
              onChange={(event) => patch({ category: event.target.value })}
            />
          </FormField>
          <FormField id="inv-unit" label={t.adm.inventory.unit}>
            <Select
              value={draft.unit}
              onValueChange={(value) => patch({ unit: value as InventoryUnit })}
            >
              <SelectTrigger id="inv-unit">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {INVENTORY_UNITS.map((unit) => (
                  <SelectItem key={unit} value={unit}>
                    {unit}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <FormField id="inv-qty" label={t.adm.inventory.qty}>
            <Input
              {...fieldAria("inv-qty")}
              type="number"
              step="any"
              value={draft.qty}
              onChange={(event) => patch({ qty: Number(event.target.value) })}
              className="nums"
            />
          </FormField>
          <FormField id="inv-threshold" label={t.adm.inventory.threshold}>
            <Input
              {...fieldAria("inv-threshold")}
              type="number"
              step="any"
              value={draft.lowStockThreshold}
              onChange={(event) =>
                patch({ lowStockThreshold: Number(event.target.value) })
              }
              className="nums"
            />
          </FormField>
          <FormField id="inv-cost" label={t.adm.inventory.costPerUnit}>
            <Input
              {...fieldAria("inv-cost")}
              type="number"
              step="any"
              value={draft.costPerUnit}
              onChange={(event) => patch({ costPerUnit: Number(event.target.value) })}
              className="nums"
            />
          </FormField>
        </div>
      </div>
    </FormSheet>
  );
}

/** Movement history for one stock item. */
function HistorySheet({
  item,
  open,
  onOpenChange,
}: {
  item: InventoryItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const t = useT();
  const { data: movements } = useStockMovements(item?.id);

  return (
    <FormSheet
      open={open}
      onOpenChange={onOpenChange}
      title={item ? item.name : ""}
      description={t.adm.inventory.history}
    >
      {(movements ?? []).length === 0 ? (
        <p className="text-sm text-ink-muted">{t.adm.inventory.noHistory}</p>
      ) : (
        <ol className="grid gap-2.5 [&>li]:min-w-0">
          {(movements ?? []).map((movement) => (
            <li
              key={movement.id}
              className="flex items-start justify-between gap-3 border-b border-hairline pb-2 last:border-0"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium text-ink">
                  {t.adm.inventory.movementType[movement.type]}
                </p>
                <p className="nums mt-0.5 text-xs text-ink-muted">
                  {formatDateTime(movement.at)}
                  {movement.orderId ? ` · ${movement.orderId}` : ""}
                </p>
                {movement.reason && (
                  <p className="mt-0.5 text-xs text-ink-muted">{movement.reason}</p>
                )}
              </div>
              <div className="shrink-0 text-right">
                <p
                  className={
                    movement.quantity >= 0
                      ? "nums text-sm font-semibold text-veg-dark"
                      : "nums text-sm font-semibold text-danger"
                  }
                >
                  {movement.quantity > 0 ? "+" : ""}
                  {movement.quantity}
                </p>
                <p className="nums text-xs text-ink-muted">
                  {t.adm.inventory.balanceAfter}: {movement.balanceAfter}
                </p>
              </div>
            </li>
          ))}
        </ol>
      )}
    </FormSheet>
  );
}

function InventoryModule({ outletId }: { outletId: OutletId }) {
  const t = useT();
  const { data: items, isLoading } = useInventory(outletId);
  const { data: valuation } = useInventoryValuation(outletId);

  const [editing, setEditing] = useState<InventoryItem | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [historyItem, setHistoryItem] = useState<InventoryItem | null>(null);
  const [stockInItem, setStockInItem] = useState<InventoryItem | null>(null);
  const [adjustItem, setAdjustItem] = useState<InventoryItem | null>(null);
  const [quantity, setQuantity] = useState(0);
  const [reason, setReason] = useState("");

  const statusTone = (item: InventoryItem) => {
    const status = stockStatus(item);
    return status === "OUT" ? "danger" : status === "LOW" ? "warning" : "veg";
  };

  const columns: AdminColumn<InventoryItem>[] = [
    {
      id: "name",
      header: t.adm.inventory.colItem,
      sortValue: (item) => item.name,
      searchValue: (item) => `${item.name} ${item.category}`,
      cell: (item) => (
        <span className="block min-w-0">
          <span className="truncate font-medium text-ink">{item.name}</span>
          <span className="block text-xs text-ink-muted">{item.category}</span>
        </span>
      ),
    },
    {
      id: "qty",
      header: t.adm.inventory.colQty,
      align: "right",
      sortValue: (item) => item.qty,
      cell: (item) => (
        <span className="nums font-semibold text-ink">
          {item.qty} {item.unit}
        </span>
      ),
    },
    {
      id: "threshold",
      header: t.adm.inventory.colThreshold,
      align: "right",
      sortValue: (item) => item.lowStockThreshold,
      cell: (item) => (
        <span className="nums text-ink-muted">{item.lowStockThreshold}</span>
      ),
    },
    {
      id: "status",
      header: t.adm.common.status,
      sortValue: (item) => stockStatus(item),
      cell: (item) => (
        <Badge variant={statusTone(item)}>
          {t.adm.inventory.status[stockStatus(item)]}
        </Badge>
      ),
    },
    {
      id: "cost",
      header: t.adm.inventory.colCost,
      align: "right",
      sortValue: (item) => item.costPerUnit,
      cell: (item) => (
        <span className="nums text-ink-muted">{formatPrice(item.costPerUnit)}</span>
      ),
    },
    {
      id: "value",
      header: t.adm.inventory.colValue,
      align: "right",
      sortValue: (item) => item.qty * item.costPerUnit,
      cell: (item) => (
        <span className="nums text-ink">
          {formatPrice(Math.round(item.qty * item.costPerUnit))}
        </span>
      ),
    },
    {
      id: "actions",
      interactive: true,
      header: "",
      className: "w-36",
      cell: (item) => (
        <div className="flex justify-end gap-0.5">
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={t.adm.inventory.stockIn}
            onClick={() => {
              setQuantity(0);
              setReason("");
              setStockInItem(item);
            }}
          >
            <PackagePlus aria-hidden="true" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={t.adm.inventory.adjust}
            onClick={() => {
              setQuantity(0);
              setReason("");
              setAdjustItem(item);
            }}
          >
            <SlidersHorizontal aria-hidden="true" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={t.adm.inventory.history}
            onClick={() => setHistoryItem(item)}
          >
            <History aria-hidden="true" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={t.adm.common.edit}
            onClick={() => {
              setEditing(item);
              setIsSheetOpen(true);
            }}
          >
            <Pencil aria-hidden="true" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title={t.adm.inventory.title}
        description={t.adm.inventory.subtitle}
        actions={
          <Button
            size="sm"
            onClick={() => {
              setEditing(null);
              setIsSheetOpen(true);
            }}
          >
            <Plus aria-hidden="true" />
            {t.adm.inventory.newItem}
          </Button>
        }
      />

      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <StatCard
          label={t.adm.inventory.valuation}
          value={formatPrice(valuation ?? 0)}
          isLoading={isLoading}
        />
        <StatCard
          label={t.adm.inventory.status.LOW}
          value={(items ?? []).filter((item) => stockStatus(item) === "LOW").length}
          tone={
            (items ?? []).some((item) => stockStatus(item) === "LOW")
              ? "warning"
              : undefined
          }
          isLoading={isLoading}
        />
        <StatCard
          label={t.adm.inventory.status.OUT}
          value={(items ?? []).filter((item) => stockStatus(item) === "OUT").length}
          tone={
            (items ?? []).some((item) => stockStatus(item) === "OUT")
              ? "danger"
              : undefined
          }
          isLoading={isLoading}
        />
      </div>

      <DataTable
        data={items ?? []}
        columns={columns}
        getRowId={(item) => item.id}
        isLoading={isLoading}
        searchPlaceholder={t.adm.inventory.colItem}
        csvName="inventory"
        pageSize={25}
        toCsvRow={(item) => ({
          name: item.name,
          group: item.category,
          qty: item.qty,
          unit: item.unit,
          threshold: item.lowStockThreshold,
          status: stockStatus(item),
          costPerUnit: item.costPerUnit,
          value: Math.round(item.qty * item.costPerUnit),
        })}
        renderCard={(item) => (
          <Card className="p-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate font-medium text-ink">{item.name}</p>
                <p className="text-xs text-ink-muted">{item.category}</p>
              </div>
              <Badge variant={statusTone(item)}>
                {t.adm.inventory.status[stockStatus(item)]}
              </Badge>
            </div>
            <p className="nums mt-2 text-sm text-ink">
              {item.qty} {item.unit} · {formatPrice(item.costPerUnit)}
            </p>
          </Card>
        )}
      />

      <StockItemSheet
        item={editing}
        outletId={outletId}
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
      />
      <HistorySheet
        item={historyItem}
        open={!!historyItem}
        onOpenChange={(open) => !open && setHistoryItem(null)}
      />

      {/* Stock in: a positive delivery. */}
      <ConfirmDialog
        open={!!stockInItem}
        onOpenChange={(open) => !open && setStockInItem(null)}
        title={t.adm.inventory.stockInTitle}
        description={stockInItem?.name}
        confirmLabel={t.adm.inventory.stockIn}
        isConfirmDisabled={quantity <= 0}
        onConfirm={async () => {
          if (!stockInItem) return;
          await stockIn(stockInItem.id, quantity, reason || undefined);
          toast.success(t.adm.inventory.stockedIn(quantity, stockInItem.name));
          setStockInItem(null);
        }}
      >
        <div className="grid gap-3">
          <FormField id="si-qty" label={t.adm.inventory.quantity}>
            <Input
              {...fieldAria("si-qty")}
              type="number"
              min={0}
              step="any"
              value={quantity}
              autoFocus
              onChange={(event) => setQuantity(Number(event.target.value))}
              className="nums w-32"
            />
          </FormField>
          <FormField
            id="si-reason"
            label={`${t.adm.common.reason} (${t.common.optional})`}
          >
            <Input
              {...fieldAria("si-reason")}
              value={reason}
              onChange={(event) => setReason(event.target.value)}
            />
          </FormField>
        </div>
      </ConfirmDialog>

      {/* Adjust: signed, with a reason, for wastage or a recount. */}
      <ConfirmDialog
        open={!!adjustItem}
        onOpenChange={(open) => !open && setAdjustItem(null)}
        title={t.adm.inventory.adjustTitle}
        description={adjustItem?.name}
        confirmLabel={t.adm.inventory.adjust}
        isConfirmDisabled={quantity === 0 || reason.trim().length === 0}
        onConfirm={async () => {
          if (!adjustItem) return;
          await adjustStock(
            adjustItem.id,
            quantity,
            reason,
            quantity < 0 ? "WASTAGE" : "CORRECTION",
          );
          toast.success(t.adm.inventory.adjusted(adjustItem.name));
          setAdjustItem(null);
        }}
      >
        <div className="grid gap-3">
          <p className="text-sm text-ink-muted">{t.adm.inventory.adjustHint}</p>
          <FormField id="adj-qty" label={t.adm.inventory.quantity}>
            <Input
              {...fieldAria("adj-qty")}
              type="number"
              step="any"
              value={quantity}
              autoFocus
              onChange={(event) => setQuantity(Number(event.target.value))}
              className="nums w-32"
            />
          </FormField>
          <FormField id="adj-reason" label={t.adm.common.reason}>
            <Input
              {...fieldAria("adj-reason")}
              value={reason}
              onChange={(event) => setReason(event.target.value)}
            />
          </FormField>
        </div>
      </ConfirmDialog>
    </>
  );
}

export default function AdminInventoryPage() {
  return (
    <RequireAdmin permission="INVENTORY">
      <RequireOutlet>
        {(outletId) => <InventoryModule outletId={outletId} />}
      </RequireOutlet>
    </RequireAdmin>
  );
}
