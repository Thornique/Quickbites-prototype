"use client";

import { useEffect, useState } from "react";
import { Ban, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { PaymentBadge, StatusBadge } from "@/components/admin/badges";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { DataTable, type AdminColumn } from "@/components/admin/data-table";
import { FormSheet } from "@/components/admin/form-sheet";
import { PageHeader } from "@/components/admin/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RequireAdmin } from "@/features/auth";
import { useCustomer, useCustomers } from "@/features/customers";
import { useOrders } from "@/features/orders";
import { OutletBadge, useAdminOutlet } from "@/features/outlet";
import { useT } from "@/i18n";
import { toErrorMessage } from "@/lib/errors";
import { formatDate, formatDateTime, formatPrice } from "@/lib/format";
import { setCustomerBlocked, setCustomerNotes } from "@/services/customers";
import type { CustomerSummary } from "@/services/customers";

/** Profile, what they order, their history, and a private note. */
function CustomerSheet({
  customerId,
  open,
  onOpenChange,
}: {
  customerId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const t = useT();
  const { data: customer } = useCustomer(customerId ?? "");
  /*
    An assigned admin sees only their own outlet's orders for this customer —
    narrowed by the service either way, but passing the scope keeps the super
    admin's selection honest too.
  */
  const { outletId } = useAdminOutlet();
  const { data: orders } = useOrders({
    customerId: customerId ?? undefined,
    outletId,
  });
  const [notes, setNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (open && customer) setNotes(customer.user.notes ?? "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, customer?.user.id]);

  if (!customer) return null;
  const { user } = customer;

  const saveNotes = async () => {
    setIsSaving(true);
    try {
      await setCustomerNotes(user.id, notes);
      toast.success(t.adm.customers.notesSaved);
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
      title={user.name}
      description={user.email}
      width="lg"
      submitLabel={t.adm.customers.saveNotes}
      onSubmit={() => void saveNotes()}
      isSubmitting={isSaving}
    >
      <div className="grid gap-5">
        <div className="flex flex-wrap items-center gap-2">
          {user.status === "BLOCKED" && (
            <Badge variant="danger">{t.adm.customers.blocked}</Badge>
          )}
          <Badge variant="muted">
            {t.adm.customers.joined} {formatDate(user.createdAt)}
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Card className="p-3">
            <p className="text-xs text-ink-muted">{t.adm.customers.colOrders}</p>
            <p className="nums mt-0.5 text-lg font-bold text-ink">
              {customer.orderCount}
            </p>
          </Card>
          <Card className="p-3">
            <p className="text-xs text-ink-muted">{t.adm.customers.colSpent}</p>
            <p className="nums mt-0.5 text-lg font-bold text-ink">
              {formatPrice(customer.totalSpent)}
            </p>
          </Card>
          <Card className="p-3">
            <p className="text-xs text-ink-muted">{t.contact.phone}</p>
            <p className="nums mt-0.5 text-sm font-semibold text-ink">{user.phone}</p>
          </Card>
          <Card className="p-3">
            <p className="text-xs text-ink-muted">{t.adm.customers.colLast}</p>
            <p className="nums mt-0.5 text-sm font-semibold text-ink">
              {customer.lastOrderAt
                ? formatDate(customer.lastOrderAt)
                : t.adm.customers.never}
            </p>
          </Card>
        </div>

        <div>
          <h3 className="text-xs font-bold tracking-wide text-ink-muted uppercase">
            {t.adm.customers.favourites}
          </h3>
          <p className="mt-1 text-sm text-ink">
            {customer.favouriteItem ?? t.adm.customers.noFavourites}
          </p>
        </div>

        <div>
          <Label htmlFor="cust-notes">{t.adm.common.notesInternal}</Label>
          <p className="mt-0.5 text-xs text-ink-muted">{t.adm.common.notesHint}</p>
          <Textarea
            id="cust-notes"
            className="mt-1.5"
            rows={3}
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
          />
        </div>

        <div>
          <h3 className="text-xs font-bold tracking-wide text-ink-muted uppercase">
            {t.adm.customers.orderHistory}
          </h3>
          {(orders ?? []).length === 0 ? (
            <p className="mt-1.5 text-sm text-ink-muted">{t.adm.customers.noOrders}</p>
          ) : (
            <ul className="mt-2 grid gap-2">
              {(orders ?? []).slice(0, 12).map((order) => (
                <li
                  key={order.id}
                  className="flex flex-wrap items-center justify-between gap-2 border-b border-hairline pb-2 text-sm last:border-0"
                >
                  <span className="min-w-0">
                    <span className="nums font-semibold text-ink">
                      {order.tokenNumber}
                    </span>
                    <span className="nums ml-2 text-xs text-ink-muted">
                      {formatDateTime(order.createdAt)}
                    </span>
                  </span>
                  <span className="flex items-center gap-2">
                    <OutletBadge outletId={order.outletId} variant="plain" />
                    <StatusBadge status={order.status} orderType={order.orderType} />
                    <PaymentBadge order={order} />
                    <span className="nums font-semibold text-ink">
                      {formatPrice(order.total)}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </FormSheet>
  );
}

function CustomersModule() {
  const t = useT();
  const { data: customers, isLoading } = useCustomers();
  const [openId, setOpenId] = useState<string | null>(null);
  const [blocking, setBlocking] = useState<CustomerSummary | null>(null);

  const columns: AdminColumn<CustomerSummary>[] = [
    {
      id: "name",
      header: t.adm.customers.colName,
      sortValue: (row) => row.user.name,
      searchValue: (row) => `${row.user.name} ${row.user.email} ${row.user.phone}`,
      cell: (row) => (
        <span className="block min-w-0">
          <span className="flex items-center gap-1.5">
            <span className="truncate font-medium text-ink">{row.user.name}</span>
            {row.user.status === "BLOCKED" && (
              <Badge variant="danger">{t.adm.customers.blocked}</Badge>
            )}
          </span>
          <span className="block truncate text-xs text-ink-muted">
            {row.user.email}
          </span>
        </span>
      ),
    },
    {
      id: "phone",
      header: t.contact.phone,
      cell: (row) => <span className="nums text-ink-muted">{row.user.phone}</span>,
    },
    {
      id: "orders",
      header: t.adm.customers.colOrders,
      align: "right",
      sortValue: (row) => row.orderCount,
      cell: (row) => <span className="nums text-ink">{row.orderCount}</span>,
    },
    {
      id: "spent",
      header: t.adm.customers.colSpent,
      align: "right",
      sortValue: (row) => row.totalSpent,
      cell: (row) => (
        <span className="nums font-semibold text-ink">
          {formatPrice(row.totalSpent)}
        </span>
      ),
    },
    {
      id: "last",
      header: t.adm.customers.colLast,
      sortValue: (row) => (row.lastOrderAt ? Date.parse(row.lastOrderAt) : 0),
      cell: (row) => (
        <span className="nums text-xs text-ink-muted">
          {row.lastOrderAt ? formatDate(row.lastOrderAt) : t.adm.customers.never}
        </span>
      ),
    },
    {
      id: "actions",
      header: "",
      interactive: true,
      className: "w-28",
      cell: (row) => (
        <div className="flex justify-end">
          <Button
            variant={row.user.status === "BLOCKED" ? "outline" : "destructive-ghost"}
            size="sm"
            onClick={() => {
              if (row.user.status === "BLOCKED") {
                void setCustomerBlocked(row.user.id, false)
                  .then(() => toast.success(t.adm.customers.unblocked(row.user.name)))
                  .catch((error) => toast.error(toErrorMessage(error)));
                return;
              }
              setBlocking(row);
            }}
          >
            {row.user.status === "BLOCKED" ? (
              <>
                <ShieldCheck aria-hidden="true" />
                {t.adm.customers.unblock}
              </>
            ) : (
              <>
                <Ban aria-hidden="true" />
                {t.adm.customers.block}
              </>
            )}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title={t.adm.customers.title}
        description={t.adm.customers.subtitle}
      />

      <DataTable
        data={customers ?? []}
        columns={columns}
        getRowId={(row) => row.user.id}
        isLoading={isLoading}
        searchPlaceholder={t.adm.customers.search}
        csvName="customers"
        pageSize={25}
        onRowClick={(row) => setOpenId(row.user.id)}
        toCsvRow={(row) => ({
          name: row.user.name,
          email: row.user.email,
          phone: row.user.phone,
          orders: row.orderCount,
          totalSpent: row.totalSpent,
          lastOrder: row.lastOrderAt ? formatDate(row.lastOrderAt) : "",
          status: row.user.status,
          favourite: row.favouriteItem ?? "",
        })}
        renderCard={(row) => (
          <Card className="p-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate font-medium text-ink">{row.user.name}</p>
                <p className="nums truncate text-xs text-ink-muted">{row.user.phone}</p>
              </div>
              <p className="nums shrink-0 font-semibold text-ink">
                {formatPrice(row.totalSpent)}
              </p>
            </div>
            <p className="nums mt-1 text-xs text-ink-muted">
              {row.orderCount} ·{" "}
              {row.lastOrderAt ? formatDate(row.lastOrderAt) : t.adm.customers.never}
            </p>
          </Card>
        )}
      />

      <CustomerSheet
        customerId={openId}
        open={!!openId}
        onOpenChange={(open) => !open && setOpenId(null)}
      />

      <ConfirmDialog
        open={!!blocking}
        onOpenChange={(open) => !open && setBlocking(null)}
        title={blocking ? t.adm.customers.blockTitle(blocking.user.name) : ""}
        description={t.adm.customers.blockBody}
        confirmLabel={t.adm.customers.block}
        isDestructive
        successMessage={
          blocking ? t.adm.customers.blocked_toast(blocking.user.name) : undefined
        }
        onConfirm={async () => {
          if (blocking) await setCustomerBlocked(blocking.user.id, true);
          setBlocking(null);
        }}
      />
    </>
  );
}

export default function AdminCustomersPage() {
  return (
    <RequireAdmin permission="CUSTOMERS">
      <CustomersModule />
    </RequireAdmin>
  );
}
