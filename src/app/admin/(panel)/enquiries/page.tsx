"use client";

import { useEffect, useState } from "react";
import { MessageCircle, Phone } from "lucide-react";
import { toast } from "sonner";
import { DataTable, type AdminColumn } from "@/components/admin/data-table";
import { FormSheet } from "@/components/admin/form-sheet";
import { PageHeader } from "@/components/admin/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { RequireAdmin } from "@/features/auth";
import { useEnquiries } from "@/features/enquiries";
import { OutletBadge, useAdminOutlet } from "@/features/outlet";
import { useT } from "@/i18n";
import { toErrorMessage } from "@/lib/errors";
import { formatDateTime } from "@/lib/format";
import { updateEnquiry } from "@/services/enquiries";
import { ENQUIRY_STATUSES, type Enquiry, type EnquiryStatus } from "@/types";

const ALL = "ALL";

const TONE: Record<EnquiryStatus, "warning" | "secondary" | "muted"> = {
  NEW: "warning",
  IN_PROGRESS: "secondary",
  CLOSED: "muted",
};

/** Read the message, note what was done, and reach the person. */
function EnquirySheet({
  enquiry,
  open,
  onOpenChange,
}: {
  enquiry: Enquiry | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const t = useT();
  const [notes, setNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (open && enquiry) setNotes(enquiry.internalNotes ?? "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, enquiry?.id]);

  if (!enquiry) return null;

  const save = async (status?: EnquiryStatus) => {
    setIsSaving(true);
    try {
      await updateEnquiry(enquiry.id, { internalNotes: notes, status });
      toast.success(status ? t.adm.enquiries.statusChanged : t.adm.common.saved);
      if (status) onOpenChange(false);
    } catch (caught) {
      toast.error(toErrorMessage(caught));
    } finally {
      setIsSaving(false);
    }
  };

  /*
    wa.me with the greeting prefilled — the manager taps once and is in the
    conversation with context, rather than retyping who this person is.
  */
  const whatsapp = `https://wa.me/91${enquiry.phone.replace(/\D/g, "").slice(-10)}?text=${encodeURIComponent(
    t.adm.enquiries.whatsappGreeting(enquiry.name),
  )}`;

  return (
    <FormSheet
      open={open}
      onOpenChange={onOpenChange}
      title={enquiry.name}
      description={t.adm.enquiries.subjects[enquiry.subject]}
      submitLabel={t.adm.common.save}
      onSubmit={() => void save()}
      isSubmitting={isSaving}
      secondaryActions={
        <>
          <Button asChild variant="outline" size="sm">
            <a href={`tel:${enquiry.phone}`}>
              <Phone aria-hidden="true" />
              {t.adm.enquiries.call}
            </a>
          </Button>
          <Button asChild variant="outline" size="sm">
            <a href={whatsapp} target="_blank" rel="noopener noreferrer">
              <MessageCircle aria-hidden="true" />
              {t.adm.enquiries.whatsapp}
            </a>
          </Button>
        </>
      }
    >
      <div className="grid gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={TONE[enquiry.status]}>
            {t.adm.enquiries.status[enquiry.status]}
          </Badge>
          <Badge variant="muted">{formatDateTime(enquiry.createdAt)}</Badge>
        </div>

        <dl className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="text-xs text-ink-muted">{t.contact.phone}</dt>
            <dd className="nums font-medium text-ink">{enquiry.phone}</dd>
          </div>
          <div className="min-w-0">
            <dt className="text-xs text-ink-muted">{t.contact.email}</dt>
            <dd className="truncate font-medium text-ink">{enquiry.email}</dd>
          </div>
        </dl>

        <Card className="p-3">
          <p className="text-xs font-bold tracking-wide text-ink-muted uppercase">
            {t.adm.enquiries.message}
          </p>
          <p className="mt-1.5 text-sm leading-relaxed text-ink">{enquiry.message}</p>
        </Card>

        <div>
          <Label htmlFor="enq-notes">{t.adm.common.notesInternal}</Label>
          <p className="mt-0.5 text-xs text-ink-muted">{t.adm.common.notesHint}</p>
          <Textarea
            id="enq-notes"
            className="mt-1.5"
            rows={3}
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {enquiry.status !== "IN_PROGRESS" && (
            <Button
              variant="outline"
              size="sm"
              disabled={isSaving}
              onClick={() => void save("IN_PROGRESS")}
            >
              {t.adm.enquiries.setInProgress}
            </Button>
          )}
          {enquiry.status !== "CLOSED" ? (
            <Button size="sm" disabled={isSaving} onClick={() => void save("CLOSED")}>
              {t.adm.enquiries.setClosed}
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              disabled={isSaving}
              onClick={() => void save("NEW")}
            >
              {t.adm.enquiries.reopen}
            </Button>
          )}
        </div>
      </div>
    </FormSheet>
  );
}

function EnquiriesModule() {
  const t = useT();
  const [status, setStatus] = useState<EnquiryStatus | typeof ALL>(ALL);
  const { outletId, isAll } = useAdminOutlet();
  const { data: enquiries, isLoading } = useEnquiries(
    status === ALL ? undefined : status,
    outletId,
  );
  const [open, setOpen] = useState<Enquiry | null>(null);

  const columns: AdminColumn<Enquiry>[] = [
    // Only worth a column when both inboxes are on screen at once.
    ...(isAll
      ? [
          {
            id: "outlet",
            header: t.adm.outlet.outletColumn,
            sortValue: (row: Enquiry) => row.outletId,
            cell: (row: Enquiry) => <OutletBadge outletId={row.outletId} />,
          } satisfies AdminColumn<Enquiry>,
        ]
      : []),
    {
      id: "from",
      header: t.adm.enquiries.colFrom,
      sortValue: (row) => row.name,
      searchValue: (row) => `${row.name} ${row.phone} ${row.email} ${row.message}`,
      cell: (row) => (
        <span className="block min-w-0">
          <span className="truncate font-medium text-ink">{row.name}</span>
          <span className="nums block text-xs text-ink-muted">{row.phone}</span>
        </span>
      ),
    },
    {
      id: "subject",
      header: t.adm.enquiries.colSubject,
      sortValue: (row) => row.subject,
      cell: (row) => (
        <span className="text-ink-muted">{t.adm.enquiries.subjects[row.subject]}</span>
      ),
    },
    {
      id: "message",
      header: t.adm.enquiries.message,
      cell: (row) => (
        <span className="block max-w-xs truncate text-ink-muted">{row.message}</span>
      ),
    },
    {
      id: "received",
      header: t.adm.enquiries.colReceived,
      sortValue: (row) => Date.parse(row.createdAt),
      cell: (row) => (
        <span className="nums text-xs text-ink-muted">
          {formatDateTime(row.createdAt)}
        </span>
      ),
    },
    {
      id: "status",
      header: t.adm.common.status,
      sortValue: (row) => row.status,
      cell: (row) => (
        <Badge variant={TONE[row.status]}>{t.adm.enquiries.status[row.status]}</Badge>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title={t.adm.enquiries.title}
        description={t.adm.enquiries.subtitle}
      />

      <DataTable
        data={enquiries ?? []}
        columns={columns}
        getRowId={(row) => row.id}
        isLoading={isLoading}
        searchPlaceholder={t.adm.enquiries.search}
        csvName="enquiries"
        onRowClick={setOpen}
        filters={
          <Select
            value={status}
            onValueChange={(value) => setStatus(value as EnquiryStatus)}
          >
            <SelectTrigger size="sm" aria-label={t.adm.common.status} className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>{t.adm.table.all}</SelectItem>
              {ENQUIRY_STATUSES.map((value) => (
                <SelectItem key={value} value={value}>
                  {t.adm.enquiries.status[value]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
        toCsvRow={(row) => ({
          name: row.name,
          phone: row.phone,
          email: row.email,
          subject: row.subject,
          message: row.message,
          status: row.status,
          received: formatDateTime(row.createdAt),
        })}
        renderCard={(row) => (
          <Card className="p-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate font-medium text-ink">{row.name}</p>
                <p className="text-xs text-ink-muted">
                  {t.adm.enquiries.subjects[row.subject]}
                </p>
              </div>
              <Badge variant={TONE[row.status]}>
                {t.adm.enquiries.status[row.status]}
              </Badge>
            </div>
            <p className="mt-1.5 line-clamp-2 text-xs text-ink-muted">{row.message}</p>
          </Card>
        )}
      />

      <EnquirySheet
        enquiry={open}
        open={!!open}
        onOpenChange={(next) => !next && setOpen(null)}
      />
    </>
  );
}

export default function AdminEnquiriesPage() {
  return (
    <RequireAdmin permission="ENQUIRIES">
      <EnquiriesModule />
    </RequireAdmin>
  );
}
