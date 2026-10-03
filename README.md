# Quick Bites — prototype

A clickable prototype of the website and admin panel for **Quick Bites**, a quick-service cafe
in Khandwa, Madhya Pradesh.

It is a **UI-only prototype**. There is no backend of any kind — no server code, no database,
no API routes, no external services. Everything runs in the browser and all data lives in
`localStorage`. It exists to prove the design and the flows before the real product is built.

Showing this to the client? Read **[DEMO_GUIDE.md](DEMO_GUIDE.md)** instead of this file.
Deploying it? **[DEPLOY_RENDER.md](DEPLOY_RENDER.md)**.

---

## Setup

Requires **Node 20 or newer**.

```bash
npm ci          # or: npm install
npm run dev     # http://localhost:3000
```

The first page load seeds the demo data (menu, 60 days of orders, customers, reviews) into the
browser. Nothing else to configure — there is no `.env`, no database, no keys.

## Scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Development server on port 3000 |
| `npm run build` | Production build |
| `npm run build:render` | Production build, then copies `public/` and `.next/static/` into `.next/standalone/` so the standalone server can serve them (used by Render) |
| `npm start` | Not used — the build is `output: "standalone"`, so run `node .next/standalone/server.js` |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run format` | Prettier write |
| `npm run format:check` | Prettier check |

To run a production build locally:

```bash
npm run build:render
node .next/standalone/server.js     # http://localhost:3000
```

## Demo accounts

| Role | Email | Password |
| --- | --- | --- |
| Super admin | `owner@quickbites.in` | `Owner@123` |
| Admin | `manager@quickbites.in` | `Manager@123` |
| Customer | `demo@quickbites.in` | `Demo@123` |

Customers sign in at `/login`, admins at `/admin/login`. The two sessions are stored separately,
so one browser can be signed in as both at once.

Reset everything from **Admin → Settings → Demo → Reset demo data** (super admin only).

## Folder structure

```
src/
  app/
    (site)/          public pages: /, /menu, /menu/[slug], /cart, /checkout, /order/[id],
                     /about, /gallery, /reviews, /contact, /services, /pricing,
                     /book-table, /privacy, /terms
    (auth)/          /login, /signup
    account/         /account, /account/orders, /account/profile, /account/notifications
    admin/login/     admin sign-in (separate from the customer one)
    admin/(panel)/   dashboard, orders, menu, categories, coupons, inventory, customers,
                     enquiries, bookings, reviews, reports, content, staff, settings
    styleguide/      design-system reference — 404s in production
    dev/data/        seed inspector and reset — 404s in production
  components/
    ui/              design-system primitives (Button, Badge, Card, Dialog, Sheet, Table,
                     VegMark, Price, Tag, EmptyState, Skeleton…)
    site/            customer-facing composites (Header, Footer, MenuCard, CartDrawer…)
    admin/           admin composites (Sidebar, Topbar, DataTable, StatCard…)
  features/<domain>/ thin hooks that re-read on cross-tab sync events
  services/          one file per domain — plain typed functions over localStorage.
                     UI components never touch localStorage directly.
  storage/           localStorage adapter (namespaced keys, schema version, migrations),
                     seed loader, cross-tab sync (BroadcastChannel + storage event)
  store/             zustand stores (cart, session, UI preferences)
  i18n/              en/hi dictionaries, provider, useT() and usePick() hooks
  data/seed/         seed data: categories, menu, coupons, users, orders, customers,
                     enquiries, bookings, reviews, gallery, banners, settings
  lib/               formatting, constants, permissions, pricing, prep-time calculator
  types/             shared domain types
public/images/       stock photography + CREDITS.md and TODO.md
```

### How data flows

`UI component → features/<domain> hook → services/<domain>.ts → storage/adapter → localStorage`

Writes broadcast on a `BroadcastChannel`, so two tabs of the same browser update each other
live. That is what makes the customer/admin demo work.

Bumping `SCHEMA_VERSION` in `src/storage/keys.ts` re-seeds every collection on the next load —
do that whenever seed data changes.

## Stack

Next.js 15 (App Router) · TypeScript strict · Tailwind v4 · Radix UI · zustand ·
react-hook-form + zod · TanStack Table · Recharts · sonner · date-fns · lucide-react ·
idb-keyval (admin image uploads only)

Fonts: **Baloo 2** (display) and **Mukta** (body), both carrying Latin and Devanagari.

## Known prototype limitations

These are deliberate. The prototype is scoped to prove the design and the flows.

- **No backend.** No server, no database, no API routes, no server actions, no external APIs.
- **Data is per-browser.** Two devices never see the same data. Clearing site data wipes
  everything. Nothing is backed up.
- **Payments are simulated.** The UPI and card screens are fake and always succeed unless you
  choose to fail them. No gateway, no settlement.
- **No real notifications.** No WhatsApp, SMS or email is ever sent. The notification bell and
  the customer's updates are in-app only.
- **Passwords are hashed with SHA-256** via Web Crypto and stored in `localStorage`. That is
  fine for a prototype and **not** acceptable for production — the real build needs server-side
  hashing with a slow KDF.
- **The cafe is closed outside 10:00–23:00**, which disables the Add buttons. Widen the hours in
  Admin → Settings → Hours when demoing outside those times.
- **Admin image uploads** go to IndexedDB, compressed to ≤200KB WebP. They live only in that
  browser.
- **No automated tests and no CI.** Verification is `npm run lint`, `npm run typecheck`,
  `npm run build` and clicking through.
- **Most menu items ship with a branded placeholder** rather than a photo. The covered items and
  the shoot priority are listed in `public/images/TODO.md`.
- **The FSSAI licence number is a placeholder** and the `/about` team photo is a stock cafe
  interior. Both need the client's real assets.
- Some route files exceed the 300-line guideline in `CLAUDE.md` (the admin content, inventory,
  coupons, settings and staff pages). Splitting them is tidy-up for the production build, not
  something to risk against a demo deadline.

## What changes in the real product

Server + database, real Razorpay payments, WhatsApp/SMS notifications, true multi-device sync,
and hosting on a VPS with the client's own domain. The design, the bilingual content, the order
and payment rules and the admin screens all carry over unchanged.
