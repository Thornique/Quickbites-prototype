"use client";

import { Construction } from "lucide-react";
import { PageHeader } from "@/components/admin/page-header";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useT } from "@/i18n";

/**
 * Stand-in for a module that has a nav entry and a guarded route but no screen
 * yet.
 *
 * The entry exists from this step so permissions and routing can be checked as
 * a whole; saying plainly which step fills it in beats a 404 or a dead link.
 */
export function ModulePlaceholder({
  title,
  step,
}: {
  title: string;
  /** Build step that replaces this. */
  step: number;
}) {
  const t = useT();

  return (
    <>
      <PageHeader
        title={title}
        actions={<Badge variant="warning">{t.adm.shell.comingIn(step)}</Badge>}
      />
      <Card className="flex items-start gap-3 p-5">
        <Construction
          size={20}
          strokeWidth={1.75}
          aria-hidden="true"
          className="mt-0.5 shrink-0 text-warning-dark"
        />
        <p className="measure text-sm text-ink-muted">
          {t.adm.shell.placeholderBody(title, step)}
        </p>
      </Card>
    </>
  );
}
