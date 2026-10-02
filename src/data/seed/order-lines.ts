import type { CartLine, MenuItem, SelectedOption } from "@/types";
import type { Random } from "./random";

/**
 * Picks 1–4 items for a generated order, favouring popular ones and making
 * plausible option choices (required groups always answered, add-ons
 * occasionally).
 */
export function pickLines(random: Random, menu: MenuItem[]): CartLine[] {
  const weights = menu.map((item) => item.popularity);
  const count = random.weighted([38, 34, 18, 10]) + 1;
  const chosen = new Map<string, MenuItem>();

  while (chosen.size < count) {
    const item = menu[random.weighted(weights)];
    if (!chosen.has(item.id)) chosen.set(item.id, item);
  }

  return [...chosen.values()].map((item) => {
    const selectedOptions: SelectedOption[] = [];

    for (const group of item.optionGroups) {
      if (group.type === "single") {
        if (!group.isRequired && random.chance(0.75)) continue;
        const option = random.pick(group.options);
        selectedOptions.push({
          groupId: group.id,
          groupName: group.name,
          optionId: option.id,
          optionName: option.name,
          priceDelta: option.priceDelta,
        });
      } else if (random.chance(0.35)) {
        for (const option of random.sample(group.options, random.int(1, 2))) {
          selectedOptions.push({
            groupId: group.id,
            groupName: group.name,
            optionId: option.id,
            optionName: option.name,
            priceDelta: option.priceDelta,
          });
        }
      }
    }

    const optionIds = selectedOptions
      .map((o) => o.optionId)
      .sort()
      .join(",");

    return {
      lineKey: `${item.id}|${optionIds}|`,
      menuItemId: item.id,
      slug: item.slug,
      name: item.name,
      image: item.images[0] ?? "",
      isVeg: item.isVeg,
      unitPrice: item.price,
      selectedOptions,
      quantity: random.weighted([70, 22, 8]) + 1,
      prepMinutes: item.prepMinutes,
    } satisfies CartLine;
  });
}
