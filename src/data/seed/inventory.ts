import type { InventoryItem, InventoryUnit, OutletId } from "@/types";

const CREATED_AT = "2026-08-01T04:30:00.000Z";

type Row = [
  id: string,
  name: string,
  unit: InventoryUnit,
  qty: number,
  lowStockThreshold: number,
  costPerUnit: number,
  category: string,
];

/** The restaurant kitchen's 25 stock lines. */
const ROWS: Row[] = [
  ["inv-burger-bun", "Burger buns", "pcs", 180, 40, 9, "Bakery"],
  ["inv-pav-bread", "Sandwich bread slices", "pcs", 240, 60, 4, "Bakery"],
  ["inv-roti-wrap", "Roomali wraps", "pcs", 90, 25, 11, "Bakery"],
  ["inv-pizza-base", "Pizza bases (7 inch)", "pcs", 70, 20, 28, "Bakery"],
  ["inv-garlic-bread", "Garlic bread loaves", "pcs", 40, 12, 22, "Bakery"],

  ["inv-veg-patty", "Veg patties", "pcs", 160, 40, 18, "Frozen"],
  ["inv-paneer-patty", "Paneer patties", "pcs", 90, 25, 32, "Frozen"],
  ["inv-chicken-patty", "Chicken patties", "pcs", 80, 20, 38, "Frozen"],
  ["inv-nuggets", "Veg nuggets", "pcs", 220, 60, 7, "Frozen"],
  ["inv-potato-fries", "Frozen french fries", "kg", 22, 6, 145, "Frozen"],

  ["inv-cheese-slice", "Cheese slices", "pcs", 300, 80, 11, "Dairy"],
  ["inv-mozzarella", "Mozzarella", "kg", 9, 3, 420, "Dairy"],
  ["inv-paneer", "Paneer", "kg", 7, 2, 360, "Dairy"],
  ["inv-milk", "Milk", "litre", 45, 12, 62, "Dairy"],
  ["inv-butter", "Butter", "kg", 5, 2, 540, "Dairy"],
  ["inv-ice-cream", "Vanilla ice cream", "litre", 12, 4, 240, "Dairy"],

  ["inv-coffee-beans", "Coffee beans", "kg", 6, 2, 880, "Beverage"],
  ["inv-tea-masala", "Masala chai premix", "kg", 3, 1, 410, "Beverage"],
  ["inv-choco-syrup", "Chocolate syrup", "litre", 8, 3, 290, "Beverage"],
  ["inv-cola-syrup", "Soda concentrate", "litre", 10, 3, 210, "Beverage"],

  ["inv-onion-tomato", "Onion & tomato", "kg", 28, 8, 34, "Produce"],
  ["inv-lettuce", "Lettuce & cabbage", "kg", 11, 4, 58, "Produce"],
  ["inv-sweet-corn", "Sweet corn", "kg", 6, 2, 120, "Produce"],

  ["inv-paper-cup", "Paper cups", "pcs", 420, 100, 4, "Packaging"],
  ["inv-takeaway-box", "Takeaway boxes", "pcs", 350, 90, 6, "Packaging"],
];

/**
 * The coffee shop's own cupboard. Deliberately separate rather than shared:
 * each outlet counts its own milk, and a restaurant stock-take must not make
 * a latte unavailable on Nagchun Road.
 */
const COFFEE_ROWS: Row[] = [
  ["inv-c-arabica", "Arabica beans (Chikmagalur)", "kg", 9, 3, 1180, "Coffee"],
  ["inv-c-filter-blend", "Filter coffee blend", "kg", 4, 1.5, 720, "Coffee"],
  ["inv-c-cold-brew", "Cold brew concentrate", "litre", 7, 2, 460, "Coffee"],
  ["inv-c-chai-premix", "Masala chai premix", "kg", 3, 1, 410, "Coffee"],
  ["inv-c-green-tea", "Green tea leaves", "kg", 1.5, 0.5, 1650, "Coffee"],

  ["inv-c-milk", "Milk", "litre", 60, 18, 62, "Dairy"],
  ["inv-c-cheese-slice", "Cheese slices", "pcs", 160, 40, 11, "Dairy"],
  ["inv-c-mozzarella", "Mozzarella", "kg", 4, 1.5, 420, "Dairy"],
  ["inv-c-vanilla-ice", "Vanilla ice cream", "litre", 10, 3, 240, "Dairy"],

  ["inv-c-choco", "Dark chocolate (couverture)", "kg", 5, 2, 880, "Pantry"],
  ["inv-c-caramel", "Salted caramel sauce", "litre", 4, 1.5, 390, "Pantry"],

  ["inv-c-croissant", "Croissants", "pcs", 48, 14, 38, "Bakery"],
  ["inv-c-muffin", "Chocolate chip muffins", "pcs", 40, 12, 32, "Bakery"],
  ["inv-c-brownie", "Walnut brownies", "pcs", 36, 10, 44, "Bakery"],
  ["inv-c-cookie", "Double chocolate cookies", "pcs", 90, 24, 14, "Bakery"],
  ["inv-c-garlic-loaf", "Garlic bread loaves", "pcs", 30, 10, 22, "Bakery"],
  ["inv-c-sandwich-bread", "Sourdough slices", "pcs", 140, 40, 9, "Bakery"],

  ["inv-c-chicken-grill", "Grilled chicken strips", "kg", 3, 1, 420, "Chilled"],

  ["inv-c-cup-small", "Paper cups (180ml)", "pcs", 300, 80, 4, "Packaging"],
  ["inv-c-cup-regular", "Paper cups (240ml)", "pcs", 380, 100, 5, "Packaging"],
  ["inv-c-cup-cold", "Cold cups with lids", "pcs", 260, 70, 7, "Packaging"],
  ["inv-c-bag", "Bakery paper bags", "pcs", 300, 80, 2, "Packaging"],
  ["inv-c-box", "Sandwich boxes", "pcs", 180, 50, 6, "Packaging"],
];

function toItems(rows: Row[], outletId: OutletId): InventoryItem[] {
  return rows.map(
    ([id, name, unit, qty, lowStockThreshold, costPerUnit, category]) => ({
      id,
      outletId,
      name,
      unit,
      qty,
      lowStockThreshold,
      costPerUnit,
      category,
      createdAt: CREATED_AT,
    }),
  );
}

export const SEED_INVENTORY: InventoryItem[] = [
  ...toItems(ROWS, "restaurant"),
  ...toItems(COFFEE_ROWS, "coffee"),
];
