You are building a production-grade, fully clickable PROTOTYPE web application for a client. This file (CLAUDE.md) is the single source of truth — follow it in every step. Where a build prompt says "Read PROJECT_BRIEF.md", read this file instead; do not create PROJECT_BRIEF.md.

# Client
"Quick Bites" — a modern quick-service cafe in Khandwa, Madhya Pradesh, India. Sells burgers, sandwiches, wraps, fries & sides, pizzas, coffee (hot), cold beverages/shakes, desserts, and combo meals. Affordable, fast service. Single outlet. Customers mostly order from mobile.

# What the prototype must prove
A customer can browse the menu, customise items, add to cart, apply coupons, "pay" (fake), place a TAKEAWAY order, see an estimated ready time and track live status. Admins run the entire business from one admin panel: orders (they also act as the kitchen), menu, inventory, coupons, customers, enquiries, table bookings, website content, reports, settings and staff. Everything must WORK end to end with mock data — not static screens.

# Hard rules
- UI ONLY: Next.js 15 (App Router) + TypeScript strict + Tailwind v4. NO backend of any kind — no Express/Node server code, no database, no Next.js API routes (no app/api/*), no server actions, no external APIs. Everything runs in the browser. All dummy data lives in localStorage, accessed through small typed helper modules in src/services (one file per domain). UI components never call localStorage directly.
- No delivery. Order type is chosen at checkout: TAKEAWAY or DINE_IN. See "Order & payment flow".
- Payment is simulated (UPI / Card / Cash). No real gateway.
- No chatbot / AI features.
- Bilingual: English + Hindi (हिन्दी) with a toggle in header; choice persisted. Every user-facing string comes from dictionaries; menu items have name/description in both languages.
- Currency INR, formatted with Intl.NumberFormat('en-IN') → ₹1,249. Dates in Asia/Kolkata.
- Indian food convention: every menu item shows a VEG (green square with dot) or NON-VEG (brown/red square with triangle) marker.
- Auth is fake but realistic: email + password signup/sign-in/logout for customers; separate admin login. Passwords hashed with SHA-256 via Web Crypto before storing (prototype only).
- Roles: CUSTOMER, ADMIN, SUPER_ADMIN. Exactly ONE super admin (cannot be deleted/demoted). Super admin has all access and manages admins. Admins have a configurable permission set.
- Mobile-first, fully responsive, accessible (keyboard, focus states, aria labels, colour contrast AA).
- Code must be clean enough to become the production frontend: typed, modular, no `any`, no dead code, no giant files (>300 lines → split).

# Order & payment flow (client-approved, supersedes earlier takeaway-only rules)
1. Order type is chosen at checkout: TAKEAWAY or DINE_IN. Every order gets a short daily token (e.g. #A23) shown big to the customer; DINE_IN may carry a table number. The packaging charge applies to TAKEAWAY only.
2. Allowed payment methods: TAKEAWAY → ONLINE only (UPI or Card). Cash is never offered for takeaway — food is not cooked for customers who may not arrive. DINE_IN → ONLINE or CASH.
3. TAKEAWAY is prepaid. The order is created only after the simulated payment succeeds, as PAID_UNVERIFIED with a 12-digit reference. An admin must verify the payment before the order can be ACCEPTED. "Reject payment" with a reason sets FAILED and the customer sees "Pay again"; if not re-paid within unpaidTakeawayTimeoutMinutes (default 15) the order auto-cancels. HARD RULE: a TAKEAWAY order cannot reach ACCEPTED or PREPARING unless paymentStatus = VERIFIED (AppError PAYMENT_NOT_VERIFIED).
4. DINE_IN online behaves like takeaway. DINE_IN cash starts UNPAID and the kitchen may begin immediately, unless requirePaymentBeforePrepForCash (default false) is on, which blocks PREPARING until VERIFIED. Admin records cash with the amount received and the change is calculated. While a dine-in cash order is UNPAID and still open the customer may switch to paying online; online → cash is never allowed.
5. Statuses: PLACED → ACCEPTED → PREPARING → READY → HANDED_OVER | CANCELLED. Label HANDED_OVER as "Picked up" for takeaway and "Served" for dine-in. HARD RULE: nothing reaches HANDED_OVER unless paymentStatus = VERIFIED. Cancelling a VERIFIED or PAID_UNVERIFIED order sets REFUNDED.
6. Every payment action is appended to paymentHistory[] {action, method, amount, ref?, reason?, byUserId?, at}.
7. The ADMIN sets the ready time on acceptance — accept(orderId, readyInMinutes) and verifyAndAccept(orderId, readyInMinutes) require 1–90 minutes. Before acceptance the customer sees "Waiting for the cafe to confirm" plus a provisional estimate from lib/prep-time.ts. estimatedReadyAt = acceptedAt + readyInMinutes, recorded with readyTimeSetBy and readyTimeHistory[]. extendReadyTime(+5/+10) is logged and pushed live. Marking READY early is allowed. Past the promised time and not READY → customer sees "Almost ready…" (never a negative countdown) and the order is flagged OVERDUE.
8. Scheduled takeaway: "As soon as possible" or a 15-minute slot today/tomorrow within opening hours, minimum lead scheduleMinLeadMinutes (30), capacity maxOrdersPerSlot (8). Payment is still upfront and online. estimatedReadyAt = scheduledFor, and the order is flagged DUE_TO_START once scheduledFor − max prepMinutes − basePrepBuffer has passed. Customers may cancel until scheduleCancelCutoffMinutes (60) before the slot, then the reason is shown instead.

# Libraries (use these, nothing heavier without asking)
- UI primitives: Radix UI (via shadcn/ui CLI, but RESTYLED to our design tokens — never ship default shadcn look)
- Icons: lucide-react (stroke 1.75, consistent sizes 16/20/24)
- Forms & validation: react-hook-form + zod
- Client state: zustand (cart, session, UI prefs)
- Tables: @tanstack/react-table
- Charts: recharts
- Toasts: sonner
- Dates: date-fns + date-fns-tz
- Utils: clsx + tailwind-merge, nanoid
- Admin-uploaded images only: idb-keyval (IndexedDB)

# Locked decisions (client-approved)
- Images: real Unsplash/Pexels photos for high-impact slots only (hero, category rail, bestsellers, gallery, about); clean brand-styled placeholders elsewhere. Record source URL (+ photographer where verifiable) in public/images/CREDITS.md, and list every placeholder slot in public/images/TODO.md for later swap.
- Seed images stay as file paths under /public/images. Admin uploads go to IndexedDB via idb-keyval, compressed to ≤200KB WebP; localStorage holds only the image key. Friendly error when storage is full.
- Deployment health check curls the home page — there is no /api/health route.

# Architecture (folder structure)
src/
  app/
    (site)/            public pages: /, /menu, /menu/[slug], /cart, /checkout, /order/[id], /about, /gallery, /reviews, /contact, /services, /pricing, /book-table, /privacy, /terms
    (auth)/            /login, /signup
    account/           /account, /account/orders, /account/profile
    admin/login/       admin login
    admin/(panel)/     /admin (dashboard), orders, menu, categories, coupons, inventory, customers, enquiries, bookings, reports, content, staff, settings
  components/
    ui/                design-system primitives (Button, Input, Badge, Card, Dialog, Sheet, Tabs, Select, Switch, Table, Skeleton, EmptyState, VegMark, Price…)
    site/              customer-facing composites (Header, Footer, MenuCard, CartDrawer…)
    admin/             admin composites (Sidebar, Topbar, DataTable, StatCard…)
  features/<domain>/   thin domain hooks & components that re-read on cross-tab sync events: auth, menu, cart, orders, coupons, inventory, customers, enquiries, bookings, content, reports, settings, staff
  services/            one file per domain (menu.ts, orders.ts, cart-pricing.ts, coupons.ts, inventory.ts, auth.ts, customers.ts, enquiries.ts, bookings.ts, content.ts, reviews.ts, reports.ts, settings.ts, staff.ts) — plain typed functions over localStorage
  storage/             localStorage adapter (namespaced keys, schema version, JSON safety, migrations), seed loader, cross-tab sync (BroadcastChannel + storage event)
  store/               zustand stores
  i18n/                en.ts, hi.ts, provider, useT() hook, type-safe keys
  data/seed/           seed JSON/TS: categories, menu items, add-ons, coupons, users, orders (last 60 days), customers, enquiries, bookings, reviews, gallery, banners, settings
  lib/                 format (price, date), utils, constants, permissions, prep-time calculator
  types/               shared domain types
public/images/         downloaded stock images + CREDITS.md

# Design direction — "simple & clean, but with fast-food energy; must NOT look AI/vibe-coded"
Reference the clarity of mcdonalds.com and bk.com (big food photography, bold condensed headings, dense but tidy menu grids, sticky category nav, strong CTAs) but keep our own identity.
Tokens:
- Background: warm off-white #FBF7F0 ; Surface: #FFFFFF ; Ink: #1A1714 ; Muted ink: #6B645C ; Border: #E8E1D6
- Primary: tomato red #D7261E (hover #B81E17) ; Accent: mustard #F4B400 ; Veg green #1E8E3E ; Non-veg #8B2E16 ; Success #1E8E3E ; Warning #C77700 ; Danger #C62828
- Admin uses the same tokens but calmer: mostly neutral surfaces, red only for primary actions and alerts.
Typography (next/font/google):
- Display/headings: "Archivo" (use condensed width 75 + weight 800 for big headings, uppercase only for short labels)
- Body/UI + Hindi: "Mukta" (supports Latin + Devanagari so both languages look consistent)
Rules to avoid the generic AI look:
- NO purple/blue gradients, NO glassmorphism, NO glowing blobs, NO emoji used as icons, NO "Welcome to our website" copy, NO three identical feature cards with icons as the main hero content.
- Radius: 6px inputs/buttons, 10px cards, full-pill ONLY for chips/tags. Shadows minimal (1 subtle level); use borders for separation.
- 4/8px spacing scale, 12-column grid, max content width 1240px.
- Food photography is the hero: consistent aspect ratios (menu cards 4:3, hero 16:9 desktop / 4:5 mobile), object-cover, no stretched images.
- Copy is specific and local ("Hot in 12 minutes. Pick up at Bombay Bazar, Khandwa."), never placeholder lorem ipsum.
- Micro-details that real brands have: veg/non-veg marks, "Bestseller"/"New"/"Spicy" tags, calorie/serving info, "Customisable" label, sticky mobile cart bar, out-of-stock greyed states, skeleton loaders, empty states with a clear action.
- Motion: subtle (150–200ms ease-out), respect prefers-reduced-motion.

# Demo accounts (seeded)
- Super Admin: owner@quickbites.in / Owner@123
- Admin: manager@quickbites.in / Manager@123 (orders, menu, inventory, coupons, enquiries, bookings)
- Customer: demo@quickbites.in / Demo@123 (has past orders)

# Definition of done for every step
- `npm run lint` and `npm run build` pass with zero errors.
- No console errors in the browser.
- Works at 360px, 768px and 1440px widths.
- All new strings exist in BOTH en and hi dictionaries.
- Briefly list the files you created/changed and how to test the feature.
