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
5. **Hot coffee** — `filter-coffee`, `cafe-latte`, `masala-chai`, `hot-chocolate`
6. **Cold drinks** — `oreo-shake`, `mango-shake`, `strawberry-shake`, `fresh-lime-soda`,
   `iced-tea`, `butterscotch-shake`
7. **Desserts** — `choco-lava-cake`, `gulab-jamun`, `ice-cream-scoop`, `red-velvet-pastry`
8. **Combos** — `burger-combo-meal`, `pizza-combo-meal`, `student-combo`, `family-feast`

## Also outstanding

- Photographer names for the **Unsplash** rows in `CREDITS.md`. Unsplash now requires an API
  key for its search endpoint and photo pages, so these must be opened by hand. The Pexels
  rows are already credited.
- A real team photo for `/about` — currently uses a cafe interior shot.
- An FSSAI licence number for the about page and footer (currently a placeholder).
