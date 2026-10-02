import {
  BarChart3,
  Bell,
  BookOpen,
  CalendarClock,
  ClipboardList,
  Cog,
  FileText,
  LayoutDashboard,
  MessageSquare,
  Package,
  Star,
  Tags,
  Ticket,
  Users,
  UserCog,
  type LucideIcon,
} from "lucide-react";
import type { Dictionary } from "@/i18n";
import type { Permission } from "@/types";

export interface AdminNavItem {
  href: string;
  /** Key into t.adm.nav, so one list drives the sidebar and the breadcrumbs. */
  labelKey: keyof Dictionary["adm"]["nav"];
  icon: LucideIcon;
  /** Module permission needed to see it. Omitted = any admin. */
  permission?: Permission;
  /** Restricted to the single super admin. */
  superAdminOnly?: boolean;
}

export interface AdminNavGroup {
  labelKey: keyof Dictionary["adm"]["nav"];
  items: AdminNavItem[];
}

/**
 * The admin navigation, grouped the way the cafe thinks about its day:
 * what is happening now, what is on sale, who is involved, what the public
 * sees, what it all added up to, and the switches behind it.
 *
 * One source of truth — the sidebar renders it, the breadcrumbs read labels
 * out of it, and the permission fields decide what each admin can even see.
 */
export const ADMIN_NAV: AdminNavGroup[] = [
  {
    labelKey: "operations",
    items: [
      { href: "/admin", labelKey: "dashboard", icon: LayoutDashboard },
      {
        href: "/admin/orders",
        labelKey: "orders",
        icon: ClipboardList,
        permission: "ORDERS",
      },
      {
        href: "/admin/bookings",
        labelKey: "bookings",
        icon: CalendarClock,
        permission: "BOOKINGS",
      },
      {
        href: "/admin/enquiries",
        labelKey: "enquiries",
        icon: MessageSquare,
        permission: "ENQUIRIES",
      },
    ],
  },
  {
    labelKey: "catalogue",
    items: [
      { href: "/admin/menu", labelKey: "menu", icon: BookOpen, permission: "MENU" },
      {
        href: "/admin/categories",
        labelKey: "categories",
        icon: Tags,
        permission: "MENU",
      },
      {
        href: "/admin/inventory",
        labelKey: "inventory",
        icon: Package,
        permission: "INVENTORY",
      },
      {
        href: "/admin/coupons",
        labelKey: "coupons",
        icon: Ticket,
        permission: "COUPONS",
      },
    ],
  },
  {
    labelKey: "people",
    items: [
      {
        href: "/admin/customers",
        labelKey: "customers",
        icon: Users,
        permission: "CUSTOMERS",
      },
      { href: "/admin/staff", labelKey: "staff", icon: UserCog, superAdminOnly: true },
    ],
  },
  {
    labelKey: "website",
    items: [
      {
        href: "/admin/content",
        labelKey: "content",
        icon: FileText,
        permission: "CONTENT",
      },
      {
        href: "/admin/reviews",
        labelKey: "reviews",
        icon: Star,
        permission: "CONTENT",
      },
    ],
  },
  {
    labelKey: "insights",
    items: [
      {
        href: "/admin/reports",
        labelKey: "reports",
        icon: BarChart3,
        permission: "REPORTS",
      },
    ],
  },
  {
    labelKey: "system",
    items: [
      {
        href: "/admin/settings",
        labelKey: "settings",
        icon: Cog,
        permission: "SETTINGS",
      },
      { href: "/admin/notifications", labelKey: "notifications", icon: Bell },
    ],
  },
];

/** Flat list, for breadcrumbs and active-state matching. */
export const ADMIN_NAV_ITEMS: AdminNavItem[] = ADMIN_NAV.flatMap((group) => group.items);

/** The deepest nav entry whose href prefixes the current path. */
export function matchNavItem(pathname: string): AdminNavItem | undefined {
  return ADMIN_NAV_ITEMS.filter(
    (item) => pathname === item.href || pathname.startsWith(`${item.href}/`),
  ).sort((a, b) => b.href.length - a.href.length)[0];
}
