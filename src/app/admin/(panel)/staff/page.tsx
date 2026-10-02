"use client";

import { useEffect, useState } from "react";
import { KeyRound, Plus, Trash2 } from "lucide-react";
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
import { Switch } from "@/components/ui/switch";
import { RequireAdmin, useSession } from "@/features/auth";
import { useActivityLog, useStaff } from "@/features/staff";
import { useT } from "@/i18n";
import { toErrorMessage } from "@/lib/errors";
import { formatDate, formatDateTime } from "@/lib/format";
import {
  createAdmin,
  deleteAdmin,
  resetAdminPassword,
  updateAdmin,
} from "@/services/staff";
import { PERMISSIONS, type Permission, type User } from "@/types";

interface Draft {
  name: string;
  email: string;
  phone: string;
  password: string;
  permissions: Permission[];
}

const emptyDraft = (): Draft => ({
  name: "",
  email: "",
  phone: "",
  password: "",
  permissions: ["ORDERS"],
});

/**
 * Create a new admin, or change an existing one's permissions.
 *
 * The super admin is never editable here — services/staff.ts refuses it, and
 * offering the controls anyway would only produce an error the owner cannot act
 * on.
 */
function StaffSheet({
  admin,
  open,
  onOpenChange,
}: {
  admin: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const t = useT();
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setDraft(
      admin
        ? {
            name: admin.name,
            email: admin.email,
            phone: admin.phone,
            password: "",
            permissions: admin.permissions,
          }
        : emptyDraft(),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, admin?.id]);

  const togglePermission = (permission: Permission) =>
    setDraft((current) => ({
      ...current,
      permissions: current.permissions.includes(permission)
        ? current.permissions.filter((entry) => entry !== permission)
        : [...current.permissions, permission],
    }));

  const save = async () => {
    setIsSaving(true);
    try {
      if (admin) {
        await updateAdmin(admin.id, {
          name: draft.name,
          phone: draft.phone,
          permissions: draft.permissions,
        });
        toast.success(t.adm.staff.updated);
      } else {
        await createAdmin({
          name: draft.name,
          email: draft.email,
          phone: draft.phone,
          password: draft.password,
          permissions: draft.permissions,
        });
        toast.success(t.adm.staff.created(draft.name));
      }
      onOpenChange(false);
    } catch (caught) {
      toast.error(toErrorMessage(caught));
    } finally {
      setIsSaving(false);
    }
  };

  const canSave =
    draft.name.trim().length > 0 &&
    (admin ? true : draft.email.trim().length > 0 && draft.password.length >= 8);

  return (
    <FormSheet
      open={open}
      onOpenChange={onOpenChange}
      title={admin ? admin.name : t.adm.staff.newAdmin}
      submitLabel={admin ? t.adm.common.save : t.adm.common.create}
      onSubmit={() => void save()}
      isSubmitting={isSaving}
      isSubmitDisabled={!canSave}
    >
      <div className="grid gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField id="sf-name" label={t.adm.staff.name}>
            <Input
              {...fieldAria("sf-name")}
              value={draft.name}
              onChange={(event) => setDraft({ ...draft, name: event.target.value })}
            />
          </FormField>
          <FormField id="sf-phone" label={t.contact.phone}>
            <Input
              {...fieldAria("sf-phone")}
              value={draft.phone}
              type="tel"
              inputMode="numeric"
              maxLength={10}
              onChange={(event) => setDraft({ ...draft, phone: event.target.value })}
            />
          </FormField>
        </div>

        <FormField id="sf-email" label={t.adm.staff.email}>
          <Input
            {...fieldAria("sf-email")}
            type="email"
            value={draft.email}
            disabled={!!admin}
            onChange={(event) => setDraft({ ...draft, email: event.target.value })}
          />
        </FormField>

        {!admin && (
          <FormField
            id="sf-password"
            label={t.adm.staff.tempPassword}
            hint={t.adm.staff.tempPasswordHint}
          >
            <Input
              {...fieldAria("sf-password", undefined, t.adm.staff.tempPasswordHint)}
              value={draft.password}
              onChange={(event) => setDraft({ ...draft, password: event.target.value })}
            />
          </FormField>
        )}

        <div>
          <Label>{t.adm.staff.permissions}</Label>
          <p className="mt-0.5 text-xs text-ink-muted">{t.adm.staff.permissionsHint}</p>
          <ul className="mt-2 grid gap-1.5 sm:grid-cols-2">
            {PERMISSIONS.map((permission) => (
              <li key={permission} className="flex items-center gap-2">
                <Checkbox
                  id={`perm-${permission}`}
                  checked={draft.permissions.includes(permission)}
                  onCheckedChange={() => togglePermission(permission)}
                />
                <Label htmlFor={`perm-${permission}`} className="font-normal">
                  {t.permissions[permission]}
                </Label>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </FormSheet>
  );
}

function StaffModule() {
  const t = useT();
  const { user } = useSession();
  const { data: staff, isLoading } = useStaff();
  const { data: activity } = useActivityLog(25);

  const [editing, setEditing] = useState<User | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [deleting, setDeleting] = useState<User | null>(null);
  const [resetting, setResetting] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState("");

  /** The owner's own row and the super admin row are read-only. */
  const isLocked = (row: User) => row.role === "SUPER_ADMIN" || row.id === user?.id;

  const columns: AdminColumn<User>[] = [
    {
      id: "name",
      header: t.adm.staff.colName,
      sortValue: (row) => row.name,
      searchValue: (row) => `${row.name} ${row.email}`,
      cell: (row) => (
        <span className="block min-w-0">
          <span className="truncate font-medium text-ink">{row.name}</span>
          <span className="block truncate text-xs text-ink-muted">{row.email}</span>
        </span>
      ),
    },
    {
      id: "role",
      header: t.adm.staff.colRole,
      sortValue: (row) => row.role,
      cell: (row) => (
        <Badge variant={row.role === "SUPER_ADMIN" ? "default" : "secondary"}>
          {t.roles[row.role]}
        </Badge>
      ),
    },
    {
      id: "permissions",
      header: t.adm.staff.colPermissions,
      cell: (row) => (
        <span className="flex max-w-xs flex-wrap gap-1">
          {row.role === "SUPER_ADMIN" ? (
            <Badge variant="muted">{t.admin.allPermissions}</Badge>
          ) : row.permissions.length === 0 ? (
            <span className="text-xs text-ink-muted">{t.adm.common.none}</span>
          ) : (
            row.permissions.map((permission) => (
              <Badge key={permission} variant="muted">
                {t.permissions[permission]}
              </Badge>
            ))
          )}
        </span>
      ),
    },
    {
      id: "lastLogin",
      header: t.adm.staff.colLastLogin,
      sortValue: (row) => (row.lastLoginAt ? Date.parse(row.lastLoginAt) : 0),
      cell: (row) => (
        <span className="nums text-xs text-ink-muted">
          {row.lastLoginAt ? formatDate(row.lastLoginAt) : t.adm.staff.never}
        </span>
      ),
    },
    {
      id: "status",
      header: t.adm.common.active,
      interactive: true,
      cell: (row) => (
        <Switch
          checked={row.status === "ACTIVE"}
          disabled={isLocked(row)}
          aria-label={`${row.name} — ${t.adm.common.active}`}
          onCheckedChange={(checked) => {
            void updateAdmin(row.id, { status: checked ? "ACTIVE" : "INACTIVE" })
              .then(() =>
                toast.success(
                  checked ? t.adm.staff.activated : t.adm.staff.deactivated,
                ),
              )
              .catch((error) => toast.error(toErrorMessage(error)));
          }}
        />
      ),
    },
    {
      id: "actions",
      header: "",
      interactive: true,
      className: "w-28",
      cell: (row) => (
        <div className="flex justify-end gap-0.5">
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={t.adm.staff.resetPassword}
            disabled={row.role === "SUPER_ADMIN"}
            onClick={() => {
              setNewPassword("");
              setResetting(row);
            }}
          >
            <KeyRound aria-hidden="true" />
          </Button>
          <Button
            variant="destructive-ghost"
            size="icon-sm"
            aria-label={t.adm.common.delete}
            disabled={isLocked(row)}
            onClick={() => setDeleting(row)}
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
        title={t.adm.staff.title}
        description={t.adm.staff.subtitle}
        actions={
          <Button
            size="sm"
            onClick={() => {
              setEditing(null);
              setIsSheetOpen(true);
            }}
          >
            <Plus aria-hidden="true" />
            {t.adm.staff.newAdmin}
          </Button>
        }
      />

      <DataTable
        data={staff ?? []}
        columns={columns}
        getRowId={(row) => row.id}
        isLoading={isLoading}
        hideSearch
        onRowClick={(row) => {
          if (row.role === "SUPER_ADMIN") {
            toast.message(t.adm.staff.cannotTouchOwner);
            return;
          }
          setEditing(row);
          setIsSheetOpen(true);
        }}
        renderCard={(row) => (
          <Card className="p-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate font-medium text-ink">{row.name}</p>
                <p className="truncate text-xs text-ink-muted">{row.email}</p>
              </div>
              <Badge variant={row.role === "SUPER_ADMIN" ? "default" : "secondary"}>
                {t.roles[row.role]}
              </Badge>
            </div>
          </Card>
        )}
      />

      {/* Who did what — the audit trail the owner can read. */}
      <section className="mt-6">
        <h2 className="text-sm font-semibold text-ink">{t.adm.staff.activityLog}</h2>
        {(activity ?? []).length === 0 ? (
          <p className="mt-2 text-sm text-ink-muted">{t.adm.staff.activityEmpty}</p>
        ) : (
          <Card flush className="mt-2 overflow-hidden">
            <ul className="divide-y divide-hairline">
              {(activity ?? []).map((entry) => (
                <li
                  key={entry.id}
                  className="flex flex-wrap items-baseline justify-between gap-2 px-4 py-2.5"
                >
                  <span className="min-w-0">
                    <span className="text-sm text-ink">{entry.summary}</span>
                    <span className="ml-2 text-xs text-ink-muted">{entry.byName}</span>
                  </span>
                  <span className="nums text-xs text-ink-muted">
                    {formatDateTime(entry.at)}
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        )}
      </section>

      <StaffSheet admin={editing} open={isSheetOpen} onOpenChange={setIsSheetOpen} />

      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
        title={deleting ? t.adm.staff.deleteTitle(deleting.name) : ""}
        description={t.adm.staff.deleteBody}
        confirmLabel={t.adm.common.delete}
        isDestructive
        successMessage={t.adm.common.deleted}
        onConfirm={async () => {
          if (deleting) await deleteAdmin(deleting.id);
          setDeleting(null);
        }}
      />

      <ConfirmDialog
        open={!!resetting}
        onOpenChange={(open) => !open && setResetting(null)}
        title={t.adm.staff.resetPasswordTitle}
        description={resetting?.name}
        confirmLabel={t.adm.staff.resetPassword}
        isConfirmDisabled={newPassword.length < 8}
        successMessage={t.adm.staff.resetDone}
        onConfirm={async () => {
          if (resetting) await resetAdminPassword(resetting.id, newPassword);
          setResetting(null);
        }}
      >
        <FormField
          id="sf-newpass"
          label={t.adm.staff.tempPassword}
          hint={t.auth.passwordPlaceholder}
        >
          <Input
            {...fieldAria("sf-newpass", undefined, t.auth.passwordPlaceholder)}
            value={newPassword}
            autoFocus
            onChange={(event) => setNewPassword(event.target.value)}
          />
        </FormField>
      </ConfirmDialog>
    </>
  );
}

export default function AdminStaffPage() {
  return (
    <RequireAdmin superAdminOnly>
      <StaffModule />
    </RequireAdmin>
  );
}
