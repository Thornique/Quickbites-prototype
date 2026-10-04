# Quick Bites — prototype

A clickable prototype of the website and admin panel for **Quick Bites** in Khandwa, Madhya
Pradesh — **two outlets under one brand**: the restaurant at Bombay Bazar and Quick Bites
Coffee on Nagchun Road. One site and one admin panel serve both; see
[Outlets](#outlets) below.

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

The first page load seeds the demo data for both outlets (two menus, 45 days of orders each,
customers, reviews) into the browser. Nothing else to configure — there is no `.env`, no
database, no keys.

## Scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Development server on port 3000, via Turbopack |
| `npm run dev:webpack` | Same, on the webpack compiler — fallback if Turbopack misbehaves |
| `npm run build` | Production build |
| `npm run build:render` | Production build, then copies `public/` and `.next/static/` into `.next/standalone/` so the standalone server can serve them (used by Render) |
| `npm start` | Not used — the build is `output: "standalone"`, so run `node .next/standalone/server.js` |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run format` | Prettier write |
| `npm run format:check` | Prettier check |
| `node scripts/optimize-images.mjs --replace` | Re-encode `public/images` as WebP, capped at 1600px. Run by hand after adding photography; the output is committed |
| `ANALYZE=true npm run build` | Build and write bundle treemaps to `.next/analyze` |

To run a production build locally:

```bash
npm run build:render
node .next/standalone/server.js     # http://localhost:3000
```

## Demo accounts

| Role | Email | Password | Outlet |
| --- | --- | --- | --- |
| Super admin | `owner@quickbites.in` | `Owner@123` | Both, plus a combined "All outlets" view |
| Admin | `manager@quickbites.in` | `Manager@123` | Restaurant only |
| Admin | `coffee@quickbites.in` | `Coffee@123` | Coffee shop only |
| Customer | `demo@quickbites.in` | `Demo@123` | Shared — orders from either |

Customers sign in at `/login`, admins at `/admin/login`. The two sessions are stored separately,
so one browser can be signed in as both at once.

Reset everything from **Admin → Settings → Demo → Reset demo data** (super admin only).

## Outlets

Two outlets, `restaurant` and `coffee`, share one codebase.

- **Every business record carries an `outletId`**: categories, menu items (and the option
  groups inside them), coupons, inventory, stock movements, orders, token counters, store
  settings, banners, gallery, reviews, bookings, enquiries and notifications. `storeSettings`
  is therefore a collection with one record per outlet (`store-settings:restaurant`,
  `store-settings:coffee`) — each shop keeps its own hours, prep config, tax, packaging and
  scheduling rules.
- **Customers are shared, admins are not.** `User.assignedOutletId` is set on every `ADMIN`
  and unset on the single `SUPER_ADMIN`.
- **Access is enforced in `src/services`, not in the UI.** `services/outlets.ts` is the one
  authority: admin-only reads narrow through `adminReadScope()`, and every admin write calls
  `assertOutletAccess()` or `requireOutlet()`. Hiding a button is not access control.
- **Counter tokens are per outlet and reset daily** — `A12` at the restaurant, `C12` at the
  coffee shop. Order numbers stay one shared `QB-` series so `/order/QB-1234` resolves without
  knowing the outlet.
- **The storefront has one active outlet**, held in `store/outlet.ts`, persisted, and shareable
  as `?outlet=coffee`. `features/outlet/provider.tsx` sets `data-outlet` on `<html>`, which
  re-points the colour, radius, shadow and font tokens at the coffee palette — so every
  existing `bg-brand` / `text-brand` / `rounded-card` utility follows the outlet without a
  component knowing about it. Every coffee style in `globals.css` is scoped to
  `:root[data-outlet="coffee"]`, which is what keeps the restaurant byte-identical.
- **The coffee outlet has its own personality, not a recolour.** Deep espresso bands, a caramel
  accent (`#A85A26`, 5.05:1 under white), creamy surfaces, 20px card radii, warm-tinted
  shadows, a faint SVG grain over the page, and **Fraunces** for Latin headings — self-hosted
  beside the other faces, Latin subset only, so Hindi headings keep Baloo and download nothing
  extra. Its home page is a different layout too (`_sections/home-sections.tsx` picks between
  the two), with coffee-only composites under `components/site/coffee/`.
- **Each outlet keeps its own cart.** Switching swaps which basket is on screen; nothing is
  merged or cleared.
- **Slugs and coupon codes are unique within an outlet**, not across both, so menu item ids and
  option ids are outlet-qualified (`item-coffee-cold-coffee`).
- **The admin panel has an outlet scope**, in `store/admin-outlet.ts` and surfaced by
  `AdminOutletSwitcher`. The super admin picks Restaurant, Coffee or All; an assigned admin
  sees their outlet's name as plain text. Screens that cannot mean "both" — catalogue,
  inventory, coupons, content, settings — are wrapped in `RequireOutlet`.

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
  features/<domain>/ thin hooks that re-read on cross-tab sync events; `outlet/` holds the
                     storefront switch, the admin scope and the RequireOutlet gate
  services/          one file per domain — plain typed functions over localStorage.
                     UI components never touch localStorage directly.
  storage/           localStorage adapter (namespaced keys, schema version, migrations),
                     seed loader, cross-tab sync (BroadcastChannel + storage event)
  store/             zustand stores (cart, session, active outlet, admin outlet scope)
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

Fonts: **Baloo 2** (display), **Mukta** (body) — both carrying Latin and Devanagari — and
**Fraunces** (variable serif, Latin only) for the coffee outlet's headings. They are
**self-hosted** from `src/fonts` rather than fetched by `next/font/google`, whose download timed
out on every dev start and every build. Each family is split into a Latin file and a Devanagari
file and chained in a font stack, so Latin text uses the small Latin file and Hindi — plus ₹,
which Google subsets into Devanagari — falls through to the other. Nothing touches the network
for fonts at dev or build time.

Photography is **WebP**, capped at 1600px wide (`scripts/optimize-images.mjs`).

Recharts, the IndexedDB image store and the gallery lightbox are loaded with `next/dynamic`, so
none of them appear in a customer page's first load. `ANALYZE=true npm run build` is how that was
checked and how to re-check it.

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
- **Each outlet is closed outside its own hours** (restaurant 10:00–23:00, coffee 07:30–22:30),
  which disables that shop's Add buttons. Widen the hours in Admin → pick the outlet →
  Settings → Hours when demoing outside those times.
- **The combined "All outlets" view is read-only in effect.** Catalogue, inventory, coupons,
  content and settings ask you to pick an outlet first, because those records belong to one
  shop and cannot be saved to both.
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
per-outlet kitchen displays and bill printers, and hosting on a VPS with the client's own
domain. The design, the bilingual content, the two-outlet structure, the order and payment
rules and the admin screens all carry over unchanged.
