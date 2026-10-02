import type { InventoryItem, InventoryUnit } from "@/types";

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

/** 25 stock items covering every menu item's ingredients and packaging. */
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

export const SEED_INVENTORY: InventoryItem[] = ROWS.map(
  ([id, name, unit, qty, lowStockThreshold, costPerUnit, category]) => ({
    id,
    name,
    unit,
    qty,
    lowStockThreshold,
    costPerUnit,
    category,
    createdAt: CREATED_AT,
  }),
);
