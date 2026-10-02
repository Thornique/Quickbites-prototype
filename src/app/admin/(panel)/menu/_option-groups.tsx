"use client";

import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
import { useT } from "@/i18n";
import type { MenuOption, OptionGroup } from "@/types";

/** Short local id — these only need to be unique inside one item. */
const localId = (prefix: string) =>
  `${prefix}-${Math.random().toString(36).slice(2, 8)}`;

/**
 * Builder for an item's option groups.
 *
 * Edits happen on a draft in the sheet's state and are saved with the item, so
 * a half-built "Size" group never reaches the customer menu. Hindi names are
 * required alongside English because the customise sheet is bilingual.
 */
export function OptionGroupsEditor({
  groups,
  onChange,
}: {
  groups: OptionGroup[];
  onChange: (next: OptionGroup[]) => void;
}) {
  const t = useT();

  const patchGroup = (id: string, patch: Partial<OptionGroup>) =>
    onChange(groups.map((group) => (group.id === id ? { ...group, ...patch } : group)));

  const patchOption = (
    groupId: string,
    optionId: string,
    patch: Partial<MenuOption>,
  ) =>
    onChange(
      groups.map((group) =>
        group.id === groupId
          ? {
              ...group,
              options: group.options.map((option) =>
                option.id === optionId ? { ...option, ...patch } : option,
              ),
            }
          : group,
      ),
    );

  const addGroup = () =>
    onChange([
      ...groups,
      {
        id: localId("grp"),
        name: { en: "", hi: "" },
        type: "single",
        isRequired: true,
        minSelect: 1,
        maxSelect: 1,
        options: [
          {
            id: localId("opt"),
            name: { en: "", hi: "" },
            priceDelta: 0,
            isAvailable: true,
          },
        ],
      },
    ]);

  const addOption = (groupId: string) =>
    onChange(
      groups.map((group) =>
        group.id === groupId
          ? {
              ...group,
              options: [
                ...group.options,
                {
                  id: localId("opt"),
                  name: { en: "", hi: "" },
                  priceDelta: 0,
                  isAvailable: true,
                },
              ],
            }
          : group,
      ),
    );

  return (
    <div className="grid gap-3">
      {groups.length === 0 && (
        <p className="rounded-control border border-dashed border-hairline px-3 py-4 text-sm text-ink-muted">
          {t.adm.menu.noGroups}
        </p>
      )}

      {groups.map((group) => (
        <Card key={group.id} className="p-3">
          <div className="flex items-start justify-between gap-2">
            <div className="grid flex-1 gap-2 sm:grid-cols-2">
              <div className="grid gap-1.5">
                <Label htmlFor={`${group.id}-en`}>{t.adm.menu.groupName}</Label>
                <Input
                  id={`${group.id}-en`}
                  value={group.name.en}
                  placeholder="Size"
                  onChange={(event) =>
                    patchGroup(group.id, {
                      name: { ...group.name, en: event.target.value },
                    })
                  }
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor={`${group.id}-hi`}>{t.adm.menu.nameHi}</Label>
                <Input
                  id={`${group.id}-hi`}
                  value={group.name.hi}
                  placeholder="साइज़"
                  onChange={(event) =>
                    patchGroup(group.id, {
                      name: { ...group.name, hi: event.target.value },
                    })
                  }
                />
              </div>
            </div>
            <Button
              type="button"
              variant="destructive-ghost"
              size="icon-sm"
              aria-label={t.adm.menu.removeGroup}
              onClick={() => onChange(groups.filter((g) => g.id !== group.id))}
            >
              <Trash2 aria-hidden="true" />
            </Button>
          </div>

          <div className="mt-3 flex flex-wrap items-end gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor={`${group.id}-type`}>{t.adm.menu.groupType}</Label>
              <Select
                value={group.type}
                onValueChange={(value) =>
                  patchGroup(group.id, {
                    type: value as OptionGroup["type"],
                    // A single-choice group can only ever take one.
                    maxSelect: value === "single" ? 1 : Math.max(2, group.maxSelect),
                    minSelect: value === "single" ? (group.isRequired ? 1 : 0) : 0,
                  })
                }
              >
                <SelectTrigger id={`${group.id}-type`} size="sm" className="w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="single">{t.adm.menu.groupSingle}</SelectItem>
                  <SelectItem value="multi">{t.adm.menu.groupMulti}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2 pb-2">
              <Switch
                id={`${group.id}-required`}
                checked={group.isRequired}
                onCheckedChange={(checked) =>
                  patchGroup(group.id, {
                    isRequired: checked,
                    minSelect: checked ? Math.max(1, group.minSelect) : 0,
                  })
                }
              />
              <Label htmlFor={`${group.id}-required`}>{t.adm.menu.groupRequired}</Label>
            </div>

            {group.type === "multi" && (
              <div className="grid gap-1.5">
                <Label htmlFor={`${group.id}-max`}>{t.adm.menu.maxSelect}</Label>
                <Input
                  id={`${group.id}-max`}
                  type="number"
                  min={1}
                  value={group.maxSelect}
                  onChange={(event) =>
                    patchGroup(group.id, { maxSelect: Number(event.target.value) })
                  }
                  className="h-8 w-20"
                />
              </div>
            )}
          </div>

          {/* The choices themselves. */}
          <ul className="mt-3 grid gap-2 border-t border-hairline pt-3">
            {group.options.map((option) => (
              <li key={option.id} className="flex items-end gap-2">
                <div className="grid flex-1 gap-1.5">
                  <Label htmlFor={`${option.id}-en`} className="text-xs">
                    {t.adm.menu.optionName}
                  </Label>
                  <Input
                    id={`${option.id}-en`}
                    value={option.name.en}
                    placeholder="Regular"
                    onChange={(event) =>
                      patchOption(group.id, option.id, {
                        name: { ...option.name, en: event.target.value },
                      })
                    }
                    className="h-9"
                  />
                </div>
                <div className="grid flex-1 gap-1.5">
                  <Label htmlFor={`${option.id}-hi`} className="text-xs">
                    {t.adm.menu.nameHi}
                  </Label>
                  <Input
                    id={`${option.id}-hi`}
                    value={option.name.hi}
                    placeholder="रेगुलर"
                    onChange={(event) =>
                      patchOption(group.id, option.id, {
                        name: { ...option.name, hi: event.target.value },
                      })
                    }
                    className="h-9"
                  />
                </div>
                <div className="grid w-24 gap-1.5">
                  <Label htmlFor={`${option.id}-delta`} className="text-xs">
                    {t.adm.menu.priceDelta}
                  </Label>
                  <Input
                    id={`${option.id}-delta`}
                    type="number"
                    value={option.priceDelta}
                    onChange={(event) =>
                      patchOption(group.id, option.id, {
                        priceDelta: Number(event.target.value),
                      })
                    }
                    className="nums h-9"
                  />
                </div>
                <Button
                  type="button"
                  variant="destructive-ghost"
                  size="icon-sm"
                  aria-label={t.adm.menu.removeOption}
                  disabled={group.options.length <= 1}
                  onClick={() =>
                    patchGroup(group.id, {
                      options: group.options.filter((o) => o.id !== option.id),
                    })
                  }
                >
                  <Trash2 aria-hidden="true" />
                </Button>
              </li>
            ))}
          </ul>

          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-2"
            onClick={() => addOption(group.id)}
          >
            <Plus aria-hidden="true" />
            {t.adm.menu.addOption}
          </Button>
        </Card>
      ))}

      <Button type="button" variant="outline" size="sm" onClick={addGroup}>
        <Plus aria-hidden="true" />
        {t.adm.menu.addGroup}
      </Button>
    </div>
  );
}
