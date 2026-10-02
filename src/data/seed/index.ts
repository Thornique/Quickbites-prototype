import { toDateKey } from "@/lib/format";
import type {
  ActivityLogEntry,
  AppNotification,
  Banner,
  Category,
  Coupon,
  Enquiry,
  GalleryImage,
  InventoryItem,
  MenuItem,
  Order,
  Review,
  SiteContent,
  StockMovement,
  StoreSettings,
  TableBooking,
  User,
} from "@/types";
import { SEED_CATEGORIES } from "./categories";
import {
  SEED_BANNERS,
  SEED_GALLERY,
  SEED_SITE_CONTENT,
  SEED_STORE_SETTINGS,
} from "./content";
import { SEED_COUPONS } from "./coupons";
import { buildSeedBookings, buildSeedEnquiries, buildSeedReviews } from "./engagement";
import { SEED_INVENTORY } from "./inventory";
import { SEED_MENU_ITEMS } from "./menu-items";
import { buildSeedNotifications } from "./notifications";
import { buildSeedOrders } from "./orders";
import { buildSeedUsers } from "./users";

export { DEMO_ACCOUNTS } from "./users";

export interface SeedData {
  users: User[];
  categories: Category[];
  menuItems: MenuItem[];
  coupons: Coupon[];
  orders: Order[];
  inventoryItems: InventoryItem[];
  stockMovements: StockMovement[];
  enquiries: Enquiry[];
  bookings: TableBooking[];
  reviews: Review[];
  gallery: GalleryImage[];
  banners: Banner[];
  siteContent: SiteContent;
  storeSettings: StoreSettings;
  notifications: AppNotification[];
  activityLog: ActivityLogEntry[];
  counters: Array<{ id: string; value: number }>;
}

/**
 * Builds the full demo dataset. Async only because password hashing goes
 * through Web Crypto, so this must run in the browser.
 */
export async function buildSeedData(now = new Date()): Promise<SeedData> {
  const users = await buildSeedUsers();
  const customers = users.filter((user) => user.role === "CUSTOMER");

  const orders = buildSeedOrders({
    menu: SEED_MENU_ITEMS,
    customers,
    coupons: SEED_COUPONS,
    now,
  });

  // The next order number continues from the generated history.
  const lastNumber =
    orders.length > 0 ? Number(orders[orders.length - 1].id.split("-")[1]) : 1000;

  /*
    Daily token counters must continue from the seeded orders too, otherwise
    the first order placed today would be handed token A01 — which a seeded
    order is already holding at the counter.
  */
  const tokenCounters = new Map<string, number>();
  for (const order of orders) {
    // Must match nextTokenNumber(), which keys by Asia/Kolkata, not UTC.
    const dateKey = toDateKey(order.createdAt);
    tokenCounters.set(dateKey, (tokenCounters.get(dateKey) ?? 0) + 1);
  }

  return {
    users,
    categories: SEED_CATEGORIES,
    menuItems: SEED_MENU_ITEMS,
    coupons: SEED_COUPONS,
    orders,
    inventoryItems: SEED_INVENTORY,
    /*
      Stock movements are not back-filled for the 500 historical orders: that
      would add ~1500 rows of noise to localStorage for no demo value. The
      ledger starts empty and fills from the first order the admin accepts.
    */
    stockMovements: [],
    enquiries: buildSeedEnquiries(now),
    bookings: buildSeedBookings(now),
    reviews: buildSeedReviews(now),
    gallery: SEED_GALLERY,
    banners: SEED_BANNERS,
    siteContent: SEED_SITE_CONTENT,
    storeSettings: SEED_STORE_SETTINGS,
    notifications: buildSeedNotifications(orders, now),
    activityLog: [],
    counters: [
      { id: "orderNumber", value: lastNumber },
      ...[...tokenCounters.entries()].map(([dateKey, value]) => ({
        id: `token:${dateKey}`,
        value,
      })),
    ],
  };
}
