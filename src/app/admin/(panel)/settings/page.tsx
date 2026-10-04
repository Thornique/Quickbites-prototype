"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { PageHeader } from "@/components/admin/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FormField, fieldAria } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RequireAdmin, useSession } from "@/features/auth";
import { RequireOutlet } from "@/features/outlet";
import { usePrepEstimate, useSettings } from "@/features/settings";
import { useT } from "@/i18n";
import { toErrorMessage } from "@/lib/errors";
import { formatDate } from "@/lib/format";
import { resetDemo, updateSettings } from "@/services/settings";
import { WEEKDAYS, type OutletId, type StoreSettings, type Weekday } from "@/types";

type Patch = Partial<Omit<StoreSettings, "id" | "createdAt">>;

/** Label + number input bound to one settings field. */
function NumberField({
  id,
  label,
  hint,
  value,
  min,
  max,
  onChange,
}: {
  id: string;
  label: string;
  hint?: string;
  value: number;
  min?: number;
  max?: number;
  onChange: (value: number) => void;
}) {
  return (
    <FormField id={id} label={label} hint={hint}>
      <Input
        {...fieldAria(id, undefined, hint)}
        type="number"
        min={min}
        max={max}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="nums w-28"
      />
    </FormField>
  );
}

function SettingsModule({ outletId }: { outletId: OutletId }) {
  const t = useT();
  const { isSuperAdmin } = useSession();
  const { data: settings } = useSettings(outletId);
  const { data: estimate } = usePrepEstimate(outletId);

  const [draft, setDraft] = useState<StoreSettings | null>(null);
  const [tab, setTab] = useState("store");
  const [isSaving, setIsSaving] = useState(false);
  const [isResetOpen, setIsResetOpen] = useState(false);
  const [resetWord, setResetWord] = useState("");
  const [newHoliday, setNewHoliday] = useState("");

  useEffect(() => {
    if (settings) setDraft(settings);
  }, [settings]);

  // A different outlet is a different record, so drop the half-edited draft.
  useEffect(() => {
    setDraft(null);
  }, [outletId]);

  if (!draft) return <Skeleton className="h-96 w-full rounded-card" />;

  const patch = (next: Patch) =>
    setDraft((current) => (current ? { ...current, ...next } : current));

  const save = async () => {
    setIsSaving(true);
    try {
      const { id: _id, outletId: _o, createdAt: _c, updatedAt: _u, ...rest } = draft;
      await updateSettings(outletId, rest);
      toast.success(t.adm.settings.saved);
    } catch (caught) {
      toast.error(toErrorMessage(caught));
    } finally {
      setIsSaving(false);
    }
  };

  const setDay = (day: Weekday, next: Partial<StoreSettings["hours"][Weekday]>) =>
    patch({ hours: { ...draft.hours, [day]: { ...draft.hours[day], ...next } } });

  const saveBar = (
    <div className="mt-5 flex gap-2">
      <Button disabled={isSaving} onClick={() => void save()}>
        {t.adm.common.save}
      </Button>
    </div>
  );

  return (
    <>
      <PageHeader title={t.adm.settings.title} description={t.adm.settings.subtitle}>
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="store">{t.adm.settings.tabStore}</TabsTrigger>
            <TabsTrigger value="hours">{t.adm.settings.tabHours}</TabsTrigger>
            <TabsTrigger value="orders">{t.adm.settings.tabOrders}</TabsTrigger>
            <TabsTrigger value="charges">{t.adm.settings.tabCharges}</TabsTrigger>
            <TabsTrigger value="demo">{t.adm.settings.tabDemo}</TabsTrigger>
          </TabsList>
        </Tabs>
      </PageHeader>

      {tab === "store" && (
        <Card className="max-w-2xl p-5">
          <div className="grid gap-4">
            <div className="flex items-start gap-3">
              <Switch
                id="st-open"
                checked={draft.isOpen}
                onCheckedChange={(checked) => patch({ isOpen: checked })}
              />
              <div>
                <Label htmlFor="st-open">{t.adm.settings.storeOpen}</Label>
                <p className="mt-0.5 text-xs text-ink-muted">
                  {t.adm.settings.storeOpenHint}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Switch
                id="st-accepting"
                checked={draft.acceptingOrders}
                onCheckedChange={(checked) => patch({ acceptingOrders: checked })}
              />
              <div>
                <Label htmlFor="st-accepting">{t.adm.settings.acceptingOrders}</Label>
                <p className="mt-0.5 text-xs text-ink-muted">
                  {t.adm.settings.acceptingOrdersHint}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Switch
                id="st-sound"
                checked={draft.notificationSound}
                onCheckedChange={(checked) => patch({ notificationSound: checked })}
              />
              <Label htmlFor="st-sound">{t.adm.settings.soundDefault}</Label>
            </div>
          </div>
          {saveBar}
        </Card>
      )}

      {tab === "hours" && (
        <Card className="max-w-2xl p-5">
          <h2 className="text-sm font-semibold text-ink">
            {t.adm.settings.weeklyHours}
          </h2>
          <ul className="mt-3 grid gap-2">
            {WEEKDAYS.map((day) => {
              const hours = draft.hours[day];
              return (
                <li key={day} className="flex flex-wrap items-center gap-3">
                  <span className="w-24 text-sm font-medium text-ink capitalize">
                    {day}
                  </span>
                  <Switch
                    id={`day-${day}`}
                    checked={!hours.isClosed}
                    onCheckedChange={(checked) => setDay(day, { isClosed: !checked })}
                    aria-label={`${day} — ${t.adm.settings.storeOpen}`}
                  />
                  {hours.isClosed ? (
                    <Badge variant="muted">{t.adm.settings.closed}</Badge>
                  ) : (
                    <>
                      <Input
                        type="time"
                        value={hours.openTime}
                        onChange={(event) =>
                          setDay(day, { openTime: event.target.value })
                        }
                        aria-label={t.adm.settings.openTime}
                        className="nums h-9 w-28"
                      />
                      <Input
                        type="time"
                        value={hours.closeTime}
                        onChange={(event) =>
                          setDay(day, { closeTime: event.target.value })
                        }
                        aria-label={t.adm.settings.closeTime}
                        className="nums h-9 w-28"
                      />
                    </>
                  )}
                </li>
              );
            })}
          </ul>

          <div className="mt-5 border-t border-hairline pt-4">
            <h2 className="text-sm font-semibold text-ink">
              {t.adm.settings.holidays}
            </h2>
            <p className="mt-0.5 text-xs text-ink-muted">
              {t.adm.settings.holidaysHint}
            </p>

            <ul className="mt-2 flex flex-wrap gap-2">
              {draft.holidays.map((date) => (
                <li key={date}>
                  <span className="inline-flex items-center gap-1.5 rounded-pill border border-hairline bg-surface px-2.5 py-1 text-xs">
                    <span className="nums">{formatDate(`${date}T00:00:00`)}</span>
                    <button
                      type="button"
                      aria-label={t.adm.common.delete}
                      onClick={() =>
                        patch({ holidays: draft.holidays.filter((d) => d !== date) })
                      }
                      className="text-danger hover:text-[#a71f1f]"
                    >
                      <Trash2 size={12} aria-hidden="true" />
                    </button>
                  </span>
                </li>
              ))}
            </ul>

            <div className="mt-3 flex items-end gap-2">
              <div className="grid gap-1.5">
                <Label htmlFor="st-holiday">{t.adm.settings.addHoliday}</Label>
                <Input
                  id="st-holiday"
                  type="date"
                  value={newHoliday}
                  onChange={(event) => setNewHoliday(event.target.value)}
                  className="h-9 w-44"
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                disabled={!newHoliday || draft.holidays.includes(newHoliday)}
                onClick={() => {
                  patch({ holidays: [...draft.holidays, newHoliday].sort() });
                  setNewHoliday("");
                }}
              >
                <Plus aria-hidden="true" />
                {t.adm.settings.addHoliday}
              </Button>
            </div>
          </div>
          {saveBar}
        </Card>
      )}

      {tab === "orders" && (
        <Card className="max-w-2xl p-5">
          <h2 className="text-sm font-semibold text-ink">{t.adm.settings.prepTime}</h2>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            <NumberField
              id="st-buffer"
              label={t.adm.settings.basePrepBuffer}
              value={draft.basePrepBufferMinutes}
              min={0}
              onChange={(value) => patch({ basePrepBufferMinutes: value })}
            />
            <NumberField
              id="st-peractive"
              label={t.adm.settings.perActiveOrder}
              value={draft.perActiveOrderMinutes}
              min={0}
              onChange={(value) => patch({ perActiveOrderMinutes: value })}
            />
          </div>

          {/* What the customer would be told right now, with live orders counted. */}
          <Card className="mt-3 border-brand/25 bg-brand/5 p-3">
            <p className="text-xs font-bold tracking-wide text-ink-muted uppercase">
              {t.adm.settings.liveEstimate}
            </p>
            <p className="nums mt-1 text-base font-semibold text-ink">
              {t.adm.settings.estimateMinutes(estimate ?? 0)}
            </p>
          </Card>

          <div className="mt-5 grid gap-4 border-t border-hairline pt-4 sm:grid-cols-2">
            <NumberField
              id="st-verify"
              label={t.adm.settings.verificationAlert}
              value={draft.verificationAlertMinutes}
              min={1}
              onChange={(value) => patch({ verificationAlertMinutes: value })}
            />
            <NumberField
              id="st-unpaid"
              label={t.adm.settings.unpaidTimeout}
              value={draft.unpaidTakeawayTimeoutMinutes}
              min={1}
              onChange={(value) => patch({ unpaidTakeawayTimeoutMinutes: value })}
            />
          </div>

          <div className="mt-4 flex items-start gap-3">
            <Switch
              id="st-cash-first"
              checked={draft.requirePaymentBeforePrepForCash}
              onCheckedChange={(checked) =>
                patch({ requirePaymentBeforePrepForCash: checked })
              }
            />
            <div>
              <Label htmlFor="st-cash-first">{t.adm.settings.cashBeforePrep}</Label>
              <p className="mt-0.5 text-xs text-ink-muted">
                {t.adm.settings.cashBeforePrepHint}
              </p>
            </div>
          </div>

          <h2 className="mt-5 border-t border-hairline pt-4 text-sm font-semibold text-ink">
            {t.adm.settings.scheduling}
          </h2>
          <div className="mt-3 grid gap-4 sm:grid-cols-3">
            <NumberField
              id="st-lead"
              label={t.adm.settings.scheduleMinLead}
              value={draft.scheduleMinLeadMinutes}
              min={0}
              onChange={(value) => patch({ scheduleMinLeadMinutes: value })}
            />
            <NumberField
              id="st-slot-orders"
              label={t.adm.settings.maxOrdersPerSlot}
              value={draft.maxOrdersPerSlot}
              min={1}
              onChange={(value) => patch({ maxOrdersPerSlot: value })}
            />
            <NumberField
              id="st-cutoff"
              label={t.adm.settings.scheduleCancelCutoff}
              value={draft.scheduleCancelCutoffMinutes}
              min={0}
              onChange={(value) => patch({ scheduleCancelCutoffMinutes: value })}
            />
          </div>
          {saveBar}
        </Card>
      )}

      {tab === "charges" && (
        <Card className="max-w-2xl p-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <NumberField
              id="st-tax"
              label={t.adm.settings.taxRate}
              value={draft.taxRate}
              min={0}
              max={28}
              onChange={(value) => patch({ taxRate: value })}
            />
            <NumberField
              id="st-packaging"
              label={t.adm.settings.packagingCharge}
              value={draft.packagingCharge}
              min={0}
              onChange={(value) => patch({ packagingCharge: value })}
            />
            <NumberField
              id="st-slot-minutes"
              label={t.adm.settings.bookingSlotMinutes}
              value={draft.bookingSlotMinutes}
              min={15}
              onChange={(value) => patch({ bookingSlotMinutes: value })}
            />
            <NumberField
              id="st-covers"
              label={t.adm.settings.maxCoversPerSlot}
              value={draft.maxCoversPerSlot}
              min={1}
              onChange={(value) => patch({ maxCoversPerSlot: value })}
            />
          </div>
          {saveBar}
        </Card>
      )}

      {tab === "demo" && (
        <Card className="max-w-2xl border-danger/25 p-5">
          <div className="flex items-start gap-3">
            <AlertTriangle
              size={20}
              strokeWidth={1.75}
              aria-hidden="true"
              className="mt-0.5 shrink-0 text-danger"
            />
            <div>
              <h2 className="text-sm font-semibold text-ink">
                {t.adm.settings.resetDemo}
              </h2>
              <p className="measure mt-1 text-sm text-ink-muted">
                {t.adm.settings.resetDemoBody}
              </p>
              <p className="mt-2 text-sm font-medium text-danger">
                {t.adm.settings.resetWarning}
              </p>

              {isSuperAdmin ? (
                <Button
                  variant="destructive"
                  className="mt-4"
                  onClick={() => {
                    setResetWord("");
                    setIsResetOpen(true);
                  }}
                >
                  {t.adm.settings.resetDemo}
                </Button>
              ) : (
                <Badge variant="muted" className="mt-4">
                  {t.adm.settings.superAdminOnly}
                </Badge>
              )}
            </div>
          </div>
        </Card>
      )}

      <ConfirmDialog
        open={isResetOpen}
        onOpenChange={setIsResetOpen}
        title={t.adm.settings.resetDemo}
        description={t.adm.settings.resetWarning}
        confirmLabel={t.adm.settings.resetDemo}
        isDestructive
        isConfirmDisabled={resetWord !== t.adm.settings.resetWord}
        successMessage={t.adm.settings.resetDone}
        onConfirm={async () => {
          await resetDemo();
          setResetWord("");
        }}
      >
        <FormField
          id="reset-word"
          label={t.adm.settings.resetConfirmHint(t.adm.settings.resetWord)}
        >
          <Input
            {...fieldAria("reset-word")}
            value={resetWord}
            autoFocus
            onChange={(event) => setResetWord(event.target.value.toUpperCase())}
            className="nums w-40"
          />
        </FormField>
      </ConfirmDialog>
    </>
  );
}

export default function AdminSettingsPage() {
  return (
    <RequireAdmin permission="SETTINGS">
      <RequireOutlet>
        {(outletId) => <SettingsModule outletId={outletId} />}
      </RequireOutlet>
    </RequireAdmin>
  );
}
