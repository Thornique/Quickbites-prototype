"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ExternalLink, Pencil, Plus, Trash2 } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RequireAdmin } from "@/features/auth";
import { RequireOutlet } from "@/features/outlet";
import { useBanners, useGallery, useSiteContent } from "@/features/content";
import { usePick, useT } from "@/i18n";
import { toErrorMessage } from "@/lib/errors";
import {
  addGalleryImage,
  createBanner,
  deleteBanner,
  removeGalleryImage,
  updateBanner,
  updateSiteContent,
} from "@/services/content";
import {
  GALLERY_CATEGORIES,
  type Banner,
  type GalleryCategory,
  type OutletId,
  type SiteContent,
} from "@/types";

type BannerDraft = Omit<Banner, "id" | "createdAt" | "updatedAt">;

const emptyBanner = (sortOrder: number, outletId: OutletId): BannerDraft => ({
  outletId,
  image: "",
  headline: { en: "", hi: "" },
  subhead: { en: "", hi: "" },
  ctaLabel: { en: "", hi: "" },
  ctaHref: "/menu",
  sortOrder,
  isActive: true,
});

function BannerSheet({
  banner,
  nextSortOrder,
  outletId,
  open,
  onOpenChange,
}: {
  banner: Banner | null;
  nextSortOrder: number;
  outletId: OutletId;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const t = useT();
  const [draft, setDraft] = useState<BannerDraft>(() =>
    emptyBanner(nextSortOrder, outletId),
  );
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (banner) {
      const { id: _id, createdAt: _c, updatedAt: _u, ...rest } = banner;
      setDraft(rest);
    } else {
      setDraft(emptyBanner(nextSortOrder, outletId));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, banner?.id]);

  const patch = (next: Partial<BannerDraft>) =>
    setDraft((current) => ({ ...current, ...next }));

  const save = async () => {
    setIsSaving(true);
    try {
      if (banner) {
        await updateBanner(banner.id, draft);
      } else {
        await createBanner(draft);
      }
      toast.success(t.adm.content.bannerSaved);
      onOpenChange(false);
    } catch (caught) {
      toast.error(toErrorMessage(caught));
    } finally {
      setIsSaving(false);
    }
  };

  const pairs: Array<
    [keyof BannerDraft & ("headline" | "subhead" | "ctaLabel"), string, string]
  > = [
    ["headline", t.adm.content.headlineEn, t.adm.content.headlineHi],
    ["subhead", t.adm.content.subheadEn, t.adm.content.subheadHi],
    ["ctaLabel", t.adm.content.ctaLabelEn, t.adm.content.ctaLabelHi],
  ];

  return (
    <FormSheet
      open={open}
      onOpenChange={onOpenChange}
      title={banner ? banner.headline.en : t.adm.content.newBanner}
      submitLabel={banner ? t.adm.common.save : t.adm.common.create}
      onSubmit={() => void save()}
      isSubmitting={isSaving}
      isSubmitDisabled={draft.headline.en.trim().length === 0}
    >
      <div className="grid gap-4">
        {pairs.map(([field, labelEn, labelHi]) => (
          <div key={field} className="grid gap-4 sm:grid-cols-2">
            <FormField id={`bn-${field}-en`} label={labelEn}>
              <Input
                {...fieldAria(`bn-${field}-en`)}
                value={draft[field].en}
                onChange={(event) =>
                  patch({ [field]: { ...draft[field], en: event.target.value } })
                }
              />
            </FormField>
            <FormField id={`bn-${field}-hi`} label={labelHi}>
              <Input
                {...fieldAria(`bn-${field}-hi`)}
                value={draft[field].hi}
                onChange={(event) =>
                  patch({ [field]: { ...draft[field], hi: event.target.value } })
                }
              />
            </FormField>
          </div>
        ))}

        <FormField id="bn-href" label={t.adm.content.ctaHref}>
          <Input
            {...fieldAria("bn-href")}
            value={draft.ctaHref}
            onChange={(event) => patch({ ctaHref: event.target.value })}
          />
        </FormField>

        <div className="flex items-center gap-3">
          <Switch
            id="bn-active"
            checked={draft.isActive}
            onCheckedChange={(checked) => patch({ isActive: checked })}
          />
          <Label htmlFor="bn-active">{t.adm.common.active}</Label>
        </div>

        <div>
          <Label>{t.adm.menu.tabImages}</Label>
          <ImagePicker
            className="mt-1.5"
            value={draft.image ? [draft.image] : []}
            onChange={(images) => patch({ image: images[0] ?? "" })}
            uploadPrefix="banner"
            max={1}
          />
        </div>
      </div>
    </FormSheet>
  );
}

function BannersTab({ outletId }: { outletId: OutletId }) {
  const t = useT();
  const pick = usePick();
  const { data: banners } = useBanners(outletId, false);
  const [editing, setEditing] = useState<Banner | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [deleting, setDeleting] = useState<Banner | null>(null);

  const rows = banners ?? [];

  return (
    <div className="grid gap-3">
      <div className="flex justify-end">
        <Button
          size="sm"
          onClick={() => {
            setEditing(null);
            setIsOpen(true);
          }}
        >
          <Plus aria-hidden="true" />
          {t.adm.content.newBanner}
        </Button>
      </div>

      <ul className="grid gap-2 [&>li]:min-w-0">
        {rows.map((banner) => (
          <li key={banner.id}>
            <Card className="flex items-center gap-3 p-3">
              <MenuItemImage
                src={banner.image}
                alt={pick(banner.headline)}
                sizes="96px"
                className="h-14 w-24 shrink-0 rounded-control"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-ink">{pick(banner.headline)}</p>
                <p className="truncate text-xs text-ink-muted">
                  {pick(banner.subhead)}
                </p>
                <p className="nums truncate text-xs text-ink-muted">{banner.ctaHref}</p>
              </div>
              {!banner.isActive && (
                <Badge variant="muted">{t.adm.common.inactive}</Badge>
              )}
              <div className="flex shrink-0 gap-1">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label={t.adm.common.edit}
                  onClick={() => {
                    setEditing(banner);
                    setIsOpen(true);
                  }}
                >
                  <Pencil aria-hidden="true" />
                </Button>
                <Button
                  variant="destructive-ghost"
                  size="icon-sm"
                  aria-label={t.adm.common.delete}
                  onClick={() => setDeleting(banner)}
                >
                  <Trash2 aria-hidden="true" />
                </Button>
              </div>
            </Card>
          </li>
        ))}
      </ul>

      <BannerSheet
        banner={editing}
        nextSortOrder={rows.length + 1}
        outletId={outletId}
        open={isOpen}
        onOpenChange={setIsOpen}
      />

      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
        title={deleting ? t.adm.common.deleteTitle(pick(deleting.headline)) : ""}
        description={t.adm.common.deleteBody}
        confirmLabel={t.adm.common.delete}
        isDestructive
        successMessage={t.adm.common.deleted}
        onConfirm={async () => {
          if (deleting) await deleteBanner(deleting.id);
          setDeleting(null);
        }}
      />
    </div>
  );
}

/**
 * Address, hours, phone, WhatsApp and the offers strip — per outlet — plus the
 * one email inbox and the two social links, which both shops share.
 */
function ContactTab({ outletId }: { outletId: OutletId }) {
  const t = useT();
  const { data: content } = useSiteContent();
  const [draft, setDraft] = useState<SiteContent["outlets"][OutletId] | null>(null);
  const [email, setEmail] = useState("");
  const [social, setSocial] = useState<SiteContent["social"] | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!content) return;
    setDraft(content.outlets[outletId]);
    setEmail(content.contact.email);
    setSocial(content.social);
  }, [content, outletId]);

  if (!draft || !social || !content) return null;

  const save = async () => {
    setIsSaving(true);
    try {
      await updateSiteContent({
        outlets: { ...content.outlets, [outletId]: draft },
        contact: { email },
        social,
      });
      toast.success(t.adm.content.contentSaved);
    } catch (caught) {
      toast.error(toErrorMessage(caught));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="grid max-w-2xl gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField id="ct-address-en" label={`${t.adm.content.addressLine} (EN)`}>
          <Input
            {...fieldAria("ct-address-en")}
            value={draft.addressLine.en}
            onChange={(event) =>
              setDraft({
                ...draft,
                addressLine: { ...draft.addressLine, en: event.target.value },
              })
            }
          />
        </FormField>
        <FormField id="ct-address-hi" label={`${t.adm.content.addressLine} (हिं)`}>
          <Input
            {...fieldAria("ct-address-hi")}
            value={draft.addressLine.hi}
            onChange={(event) =>
              setDraft({
                ...draft,
                addressLine: { ...draft.addressLine, hi: event.target.value },
              })
            }
          />
        </FormField>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <FormField id="ct-phone" label={t.adm.content.phone}>
          <Input
            {...fieldAria("ct-phone")}
            value={draft.phone}
            onChange={(event) => setDraft({ ...draft, phone: event.target.value })}
          />
        </FormField>
        <FormField id="ct-whatsapp" label={t.adm.content.whatsapp}>
          <Input
            {...fieldAria("ct-whatsapp")}
            value={draft.whatsapp}
            onChange={(event) => setDraft({ ...draft, whatsapp: event.target.value })}
          />
        </FormField>
        {/* One inbox for both outlets, so this is not per outlet. */}
        <FormField id="ct-email" label={t.adm.content.email}>
          <Input
            {...fieldAria("ct-email")}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </FormField>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField id="ct-instagram" label={t.adm.content.instagram}>
          <Input
            {...fieldAria("ct-instagram")}
            value={social.instagram}
            onChange={(event) =>
              setSocial({ ...social, instagram: event.target.value })
            }
          />
        </FormField>
        <FormField id="ct-facebook" label={t.adm.content.facebook}>
          <Input
            {...fieldAria("ct-facebook")}
            value={social.facebook}
            onChange={(event) => setSocial({ ...social, facebook: event.target.value })}
          />
        </FormField>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField id="ct-hours-en" label={`${t.adm.content.hoursNote} (EN)`}>
          <Input
            {...fieldAria("ct-hours-en")}
            value={draft.hoursNote.en}
            onChange={(event) =>
              setDraft({
                ...draft,
                hoursNote: { ...draft.hoursNote, en: event.target.value },
              })
            }
          />
        </FormField>
        <FormField id="ct-hours-hi" label={`${t.adm.content.hoursNote} (हिं)`}>
          <Input
            {...fieldAria("ct-hours-hi")}
            value={draft.hoursNote.hi}
            onChange={(event) =>
              setDraft({
                ...draft,
                hoursNote: { ...draft.hoursNote, hi: event.target.value },
              })
            }
          />
        </FormField>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          id="ct-strip-en"
          label={`${t.adm.content.offersStrip} (EN)`}
          hint={t.adm.content.offersStripHint}
        >
          <Input
            {...fieldAria("ct-strip-en", undefined, t.adm.content.offersStripHint)}
            value={draft.offersStrip.en}
            onChange={(event) =>
              setDraft({
                ...draft,
                offersStrip: { ...draft.offersStrip, en: event.target.value },
              })
            }
          />
        </FormField>
        <FormField id="ct-strip-hi" label={`${t.adm.content.offersStrip} (हिं)`}>
          <Input
            {...fieldAria("ct-strip-hi")}
            value={draft.offersStrip.hi}
            onChange={(event) =>
              setDraft({
                ...draft,
                offersStrip: { ...draft.offersStrip, hi: event.target.value },
              })
            }
          />
        </FormField>
      </div>

      <div className="flex gap-2">
        <Button disabled={isSaving} onClick={() => void save()}>
          {t.adm.common.save}
        </Button>
        <Button asChild variant="outline">
          <Link href="/contact" target="_blank">
            {t.adm.common.viewOnSite}
            <ExternalLink aria-hidden="true" />
          </Link>
        </Button>
      </div>
    </div>
  );
}

function GalleryTab({ outletId }: { outletId: OutletId }) {
  const t = useT();
  const pick = usePick();
  const { data: images } = useGallery(outletId);
  const [category, setCategory] = useState<GalleryCategory>("FOOD");
  const [picked, setPicked] = useState<string[]>([]);
  const [altEn, setAltEn] = useState("");
  const [altHi, setAltHi] = useState("");
  const [removing, setRemoving] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const add = async () => {
    if (picked.length === 0) return;
    setIsSaving(true);
    try {
      for (const src of picked) {
        await addGalleryImage({
          outletId,
          src,
          alt: { en: altEn || "Quick Bites", hi: altHi || "क्विक बाइट्स" },
          category,
          sortOrder: 0,
          isActive: true,
        });
      }
      toast.success(t.adm.content.photoAdded);
      setPicked([]);
      setAltEn("");
      setAltHi("");
    } catch (caught) {
      toast.error(toErrorMessage(caught));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="grid gap-5">
      <Card className="p-4">
        <p className="text-sm font-semibold text-ink">{t.adm.content.addPhoto}</p>

        <div className="mt-3 grid gap-4 sm:grid-cols-3">
          <FormField id="gl-cat" label={t.adm.content.galleryCategory}>
            <Select
              value={category}
              onValueChange={(value) => setCategory(value as GalleryCategory)}
            >
              <SelectTrigger id="gl-cat">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {GALLERY_CATEGORIES.map((value) => (
                  <SelectItem key={value} value={value}>
                    {t.adm.content.galleryCategories[value]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
          <FormField id="gl-alt-en" label={t.adm.content.altEn}>
            <Input
              {...fieldAria("gl-alt-en")}
              value={altEn}
              onChange={(event) => setAltEn(event.target.value)}
            />
          </FormField>
          <FormField id="gl-alt-hi" label={t.adm.content.altHi}>
            <Input
              {...fieldAria("gl-alt-hi")}
              value={altHi}
              onChange={(event) => setAltHi(event.target.value)}
            />
          </FormField>
        </div>

        <ImagePicker
          className="mt-4"
          value={picked}
          onChange={setPicked}
          uploadPrefix="gallery"
          max={4}
        />

        <div className="mt-4 flex gap-2">
          <Button disabled={isSaving || picked.length === 0} onClick={() => void add()}>
            {t.adm.content.addPhoto}
          </Button>
          <Button asChild variant="outline">
            <Link href="/gallery" target="_blank">
              {t.adm.common.viewOnSite}
              <ExternalLink aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </Card>

      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
        {(images ?? []).map((image) => (
          <li key={image.id} className="relative">
            <MenuItemImage
              src={image.src}
              alt={pick(image.alt)}
              sizes="160px"
              className="aspect-square w-full rounded-control"
            />
            <Badge variant="muted" className="absolute bottom-1 left-1">
              {t.adm.content.galleryCategories[image.category]}
            </Badge>
            <button
              type="button"
              onClick={() => setRemoving(image.id)}
              aria-label={t.adm.images.remove}
              className="absolute top-1 right-1 inline-flex size-7 items-center justify-center rounded-full bg-danger text-white shadow-card transition-colors hover:bg-[#a71f1f] focus-visible:ring-2 focus-visible:ring-danger"
            >
              <Trash2 size={13} aria-hidden="true" />
            </button>
          </li>
        ))}
      </ul>

      <ConfirmDialog
        open={!!removing}
        onOpenChange={(open) => !open && setRemoving(null)}
        title={t.adm.images.remove}
        description={t.adm.common.deleteBody}
        confirmLabel={t.adm.common.delete}
        isDestructive
        successMessage={t.adm.content.photoRemoved}
        onConfirm={async () => {
          if (removing) await removeGalleryImage(removing);
          setRemoving(null);
        }}
      />
    </div>
  );
}

function ContentModule({ outletId }: { outletId: OutletId }) {
  const t = useT();
  const [tab, setTab] = useState("banners");

  return (
    <>
      <PageHeader title={t.adm.content.title} description={t.adm.content.subtitle}>
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="banners">{t.adm.content.tabBanners}</TabsTrigger>
            <TabsTrigger value="contact">{t.adm.content.tabContact}</TabsTrigger>
            <TabsTrigger value="gallery">{t.adm.content.tabGallery}</TabsTrigger>
          </TabsList>
        </Tabs>
      </PageHeader>

      {tab === "banners" && <BannersTab outletId={outletId} />}
      {tab === "contact" && <ContactTab outletId={outletId} />}
      {tab === "gallery" && <GalleryTab outletId={outletId} />}
    </>
  );
}

export default function AdminContentPage() {
  return (
    <RequireAdmin permission="CONTENT">
      <RequireOutlet>
        {(outletId) => <ContentModule outletId={outletId} />}
      </RequireOutlet>
    </RequireAdmin>
  );
}
