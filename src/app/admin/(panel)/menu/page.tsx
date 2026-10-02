"use client";

import { useMemo, useState } from "react";
import { Copy, MoreVertical, Package, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { DataTable, type AdminColumn } from "@/components/admin/data-table";
import { PageHeader } from "@/components/admin/page-header";
import { MenuItemImage } from "@/components/site/menu-item-image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { VegMark } from "@/components/ui/veg-mark";
import { RequireAdmin } from "@/features/auth";
import { useCategories, useMenu } from "@/features/menu";
import { usePick, useT } from "@/i18n";
import { toErrorMessage } from "@/lib/errors";
import { formatPrice } from "@/lib/format";
import {
  deleteMenuItem,
  duplicateMenuItem,
  setMenuItemAvailability,
} from "@/services/menu";
import type { MenuItem } from "@/types";
import { MenuItemSheet } from "./_item-sheet";

const ALL = "ALL";

function MenuModule() {
  const t = useT();
  const pick = usePick();
  const { data: items, isLoading } = useMenu({ includeUnavailable: true });
  const { data: categories } = useCategories();

  const [categoryId, setCategoryId] = useState<string>(ALL);
  const [editing, setEditing] = useState<MenuItem | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [deleting, setDeleting] = useState<MenuItem | null>(null);

  const rows = useMemo(
    () =>
      (items ?? []).filter((item) => categoryId === ALL || item.categoryId === categoryId),
    [items, categoryId],
  );

  const categoryName = (id: string) => {
    const category = (categories ?? []).find((entry) => entry.id === id);
    return category ? pick(category.name) : "—";
  };

  const openCreate = () => {
    setEditing(null);
    setIsSheetOpen(true);
  };

  const openEdit = (item: MenuItem) => {
    setEditing(item);
    setIsSheetOpen(true);
  };

  const toggleAvailability = async (item: MenuItem, next: boolean) => {
    try {
      await setMenuItemAvailability(item.id, next);
      toast.success(
        next
          ? t.adm.menu.availabilityOn(pick(item.name))
          : t.adm.menu.availabilityOff(pick(item.name)),
      );
    } catch (caught) {
      toast.error(toErrorMessage(caught));
    }
  };

  const duplicate = async (item: MenuItem) => {
    try {
      await duplicateMenuItem(item.id);
      toast.success(t.adm.common.duplicated);
    } catch (caught) {
      toast.error(toErrorMessage(caught));
    }
  };

  /** Everything in the current filter, in one go. */
  const bulkAvailability = async (next: boolean) => {
    try {
      for (const item of rows) {
        if (item.isAvailable !== next) await setMenuItemAvailability(item.id, next);
      }
      toast.success(t.adm.menu.bulkDone(rows.length));
    } catch (caught) {
      toast.error(toErrorMessage(caught));
    }
  };

  const rowMenu = (item: MenuItem) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-sm" aria-label={t.adm.common.actions}>
          <MoreVertical aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onSelect={() => openEdit(item)}>
          <Pencil aria-hidden="true" />
          {t.adm.common.edit}
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => void duplicate(item)}>
          <Copy aria-hidden="true" />
          {t.adm.common.duplicate}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onSelect={() => setDeleting(item)}>
          <Trash2 aria-hidden="true" />
          {t.adm.common.delete}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  const columns: AdminColumn<MenuItem>[] = [
    {
      id: "image",
      header: t.adm.menu.colImage,
      className: "w-14",
      cell: (item) => (
        <MenuItemImage
          src={item.images[0]}
          alt={pick(item.name)}
          sizes="48px"
          className="size-12 rounded-control"
        />
      ),
    },
    {
      id: "name",
      header: t.adm.menu.colName,
      sortValue: (item) => item.name.en,
      searchValue: (item) =>
        `${item.name.en} ${item.name.hi} ${item.description.en} ${item.slug}`,
      cell: (item) => (
        <span className="block min-w-0">
          <span className="flex items-center gap-1.5">
            <VegMark isVeg={item.isVeg} size="sm" />
            <span className="truncate font-medium text-ink">{pick(item.name)}</span>
          </span>
          <span className="mt-0.5 flex flex-wrap items-center gap-1">
            {item.stockItemLinks.length > 0 && (
              <Badge variant="outline">
                <Package aria-hidden="true" />
                {t.adm.menu.stockLinked(item.stockItemLinks.length)}
              </Badge>
            )}
            {item.unavailableReason === "OUT_OF_STOCK" && (
              <Badge variant="danger">{t.adm.menu.outOfStock}</Badge>
            )}
          </span>
        </span>
      ),
    },
    {
      id: "category",
      header: t.adm.menu.colCategory,
      sortValue: (item) => categoryName(item.categoryId),
      cell: (item) => (
        <span className="text-ink-muted">{categoryName(item.categoryId)}</span>
      ),
    },
    {
      id: "tags",
      header: t.adm.menu.colTags,
      cell: (item) => (
        <span className="flex flex-wrap gap-1">
          {item.tags.map((tag) => (
            <Badge key={tag} variant="muted">
              {t.adm.menu.tagLabels[tag]}
            </Badge>
          ))}
        </span>
      ),
    },
    {
      id: "price",
      header: t.adm.menu.colPrice,
      align: "right",
      sortValue: (item) => item.price,
      cell: (item) => (
        <span className="nums font-semibold text-ink">{formatPrice(item.price)}</span>
      ),
    },
    {
      id: "available",
      interactive: true,
      header: t.adm.menu.colAvailable,
      sortValue: (item) => (item.isAvailable ? 1 : 0),
      cell: (item) => (
        <Switch
          checked={item.isAvailable}
          onCheckedChange={(checked) => void toggleAvailability(item, checked)}
          aria-label={`${pick(item.name)} — ${t.adm.menu.colAvailable}`}
        />
      ),
    },
    {
      id: "actions",
      interactive: true,
      header: "",
      className: "w-10",
      cell: rowMenu,
    },
  ];

  return (
    <>
      <PageHeader
        title={t.adm.menu.title}
        description={t.adm.menu.subtitle}
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => void bulkAvailability(true)}>
              {t.adm.menu.bulkAvailable}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => void bulkAvailability(false)}
            >
              {t.adm.menu.bulkUnavailable}
            </Button>
            <Button size="sm" onClick={openCreate}>
              <Plus aria-hidden="true" />
              {t.adm.menu.newItem}
            </Button>
          </>
        }
      />

      <DataTable
        data={rows}
        columns={columns}
        getRowId={(item) => item.id}
        isLoading={isLoading}
        searchPlaceholder={t.adm.menu.search}
        csvName="menu"
        pageSize={25}
        filters={
          <Select value={categoryId} onValueChange={setCategoryId}>
            <SelectTrigger size="sm" aria-label={t.adm.menu.category} className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>{t.adm.table.all}</SelectItem>
              {(categories ?? []).map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {pick(category.name)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
        toCsvRow={(item) => ({
          name: item.name.en,
          nameHi: item.name.hi,
          category: categoryName(item.categoryId),
          price: item.price,
          veg: item.isVeg ? "veg" : "non-veg",
          available: item.isAvailable ? "yes" : "no",
          prepMinutes: item.prepMinutes,
          tags: item.tags.join(" "),
        })}
        renderCard={(item) => (
          <Card className="flex items-start gap-3 p-3">
            <MenuItemImage
              src={item.images[0]}
              alt={pick(item.name)}
              sizes="64px"
              className="size-16 shrink-0 rounded-control"
            />
            <div className="min-w-0 flex-1">
              <span className="flex items-center gap-1.5">
                <VegMark isVeg={item.isVeg} size="sm" />
                <span className="truncate font-medium text-ink">{pick(item.name)}</span>
              </span>
              <p className="text-xs text-ink-muted">{categoryName(item.categoryId)}</p>
              <p className="nums mt-1 text-sm font-semibold text-ink">
                {formatPrice(item.price)}
              </p>
            </div>
            <div className="shrink-0">
              <Switch
                checked={item.isAvailable}
                onCheckedChange={(checked) => void toggleAvailability(item, checked)}
                aria-label={`${pick(item.name)} — ${t.adm.menu.colAvailable}`}
              />
            </div>
          </Card>
        )}
        onRowClick={openEdit}
      />

      <MenuItemSheet item={editing} open={isSheetOpen} onOpenChange={setIsSheetOpen} />

      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
        title={deleting ? t.adm.common.deleteTitle(pick(deleting.name)) : ""}
        description={t.adm.common.deleteBody}
        confirmLabel={t.adm.common.delete}
        isDestructive
        successMessage={t.adm.common.deleted}
        onConfirm={async () => {
          if (deleting) await deleteMenuItem(deleting.id);
          setDeleting(null);
        }}
      />
    </>
  );
}

export default function AdminMenuPage() {
  return (
    <RequireAdmin permission="MENU">
      <MenuModule />
    </RequireAdmin>
  );
}
