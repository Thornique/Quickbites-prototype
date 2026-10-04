# Photography still to source

Per the client-approved decision, real stock photography covers only the high-impact slots
(hero, category rail, bestsellers, gallery, about). Every other menu item ships with a
**brand-styled placeholder** instead of a photo.

## How a placeholder is represented

A menu item with an **empty `images` array** renders the branded placeholder (category initial
on a warm sand panel) rather than a photo. No placeholder image files exist — there is nothing
to delete. To swap one in later:

1. Drop a 4:3 JPEG into `public/images/menu/<slug>.jpg` (800×600), then run
   `node scripts/optimize-images.mjs --replace` to turn it into `<slug>.webp`.
2. Set that item's `images` to `["/images/menu/<slug>.webp"]` in the admin Menu module, or in
   `src/data/seed/` if it should become part of the seed.
3. Add a row to `CREDITS.md`.

## Items that have real photography

These 17 menu items are covered and need nothing:

`chicken-cheese-burger`, `crispy-chicken-burger`, `aloo-tikki-burger`, `veg-cheese-burger`,
`paneer-tikka-burger`, `masala-veg-burger`, `margherita-pizza`, `farmhouse-pizza`,
`peri-peri-fries`, `classic-salted-fries`, `cappuccino`, `cold-coffee`, `chocolate-shake`,
`brownie-sundae`, `veg-grilled-sandwich`, `club-sandwich`, `chicken-tikka-sandwich`.

## Items awaiting photography

Everything else on the menu.

The veg burgers are now **done** — four Pexels photos with unmistakably vegetarian patties
(visible coriander and shredded vegetables, or paneer slabs) were sourced and are credited in
`CREDITS.md`. They are stock, not the cafe's own food, so they are still worth replacing with
a real shoot eventually, but nothing is blocked on them.

Priority order for a shoot:

1. **Wraps** — `paneer-kathi-roll`, `veg-frankie`, `chicken-kathi-roll`
3. **Remaining pizzas** — `paneer-tikka-pizza`, `corn-cheese-pizza`, `veggie-supreme-pizza`
4. **Sides** — `cheese-garlic-bread`, `veg-nuggets`, `masala-fries`, `onion-rings`
5. **Cold drinks (restaurant)** — `oreo-shake`, `mango-shake`, `strawberry-shake`,
   `fresh-lime-soda`, `iced-tea`, `butterscotch-shake`
6. **Desserts** — `choco-lava-cake`, `gulab-jamun`, `ice-cream-scoop`, `red-velvet-pastry`
7. **Combos** — `burger-combo-meal`, `pizza-combo-meal`, `student-combo`, `family-feast`

## Quick Bites Coffee

The visual refresh covered the coffee outlet's high-impact slots: the hero, both dark bands,
all five category tiles, the three banners and 17 of its 22 items now carry real photography
(see the `coffee/` section of `CREDITS.md`).

Five coffee items still ship with the brand placeholder, all of them in the long tail of the
menu rather than anywhere the eye lands first:

- `cold-brew` — needs a tall glass with the concentrate visible, not another iced latte
- `caramel-frappe` — distinct enough from `coffee-frappe` to need its own shot
- `choco-cookies` — two cookies in a bag, not a tray of them
- `chicken-pesto-sandwich` — the only non-veg item at this outlet
- `cheese-garlic-bread` — shared slug with the restaurant's side, but a different plating

Two of the shipped photos are stand-ins a real shoot should replace: `cafe-mocha` reuses the
hot-chocolate cup, and `iced-latte` reuses the cold-coffee glass. Both are honest about what
is in the cup; neither is that exact drink.

## Also outstanding

- Photographer names for the **Unsplash** rows in `CREDITS.md`. Unsplash now requires an API
  key for its search endpoint and photo pages, so these must be opened by hand. The Pexels
  rows are already credited.
- A real team photo for `/about` — currently uses a cafe interior shot.
- Interior and counter photography of the **actual coffee shop** on Nagchun Road. Everything
  under `coffee/` is stock, so the room in the gallery is not the client's room.
- An FSSAI licence number for the about page and footer (currently a placeholder).
