# Photography still to source

Per the client-approved decision, real stock photography covers only the high-impact slots
(hero, category rail, bestsellers, gallery, about). Every other menu item ships with a
**brand-styled placeholder** instead of a photo.

## How a placeholder is represented

A menu item with an **empty `images` array** renders the branded placeholder (category initial
on a warm sand panel) rather than a photo. No placeholder image files exist — there is nothing
to delete. To swap one in later:

1. Drop a 4:3 JPEG into `public/images/menu/<slug>.jpg` (800×600, quality ~80).
2. Set that item's `images` to `["/images/menu/<slug>.jpg"]` in the admin Menu module, or in
   `src/data/seed/` if it should become part of the seed.
3. Add a row to `CREDITS.md`.

## Items that have real photography

These 13 menu items are covered and need nothing:

`chicken-cheese-burger`, `crispy-chicken-burger`, `margherita-pizza`, `farmhouse-pizza`,
`peri-peri-fries`, `classic-salted-fries`, `cappuccino`, `cold-coffee`, `chocolate-shake`,
`brownie-sundae`, `veg-grilled-sandwich`, `club-sandwich`, `chicken-tikka-sandwich`.

## Items awaiting photography

Everything else on the menu. The highest-value ones to shoot first are the vegetarian
burgers, because **no veg burger photo could be sourced** — all available stock burger shots
show meat patties, which must never illustrate a veg item on an Indian menu.

Priority order for a shoot:

1. **Veg burgers** — `aloo-tikki-burger`, `paneer-tikka-burger`, `veg-cheese-burger`,
   `masala-veg-burger`
2. **Wraps** — `paneer-kathi-roll`, `veg-frankie`, `chicken-kathi-roll`
3. **Remaining pizzas** — `paneer-tikka-pizza`, `corn-cheese-pizza`, `veggie-supreme-pizza`
4. **Sides** — `cheese-garlic-bread`, `veg-nuggets`, `masala-fries`, `onion-rings`
5. **Hot coffee** — `filter-coffee`, `cafe-latte`, `masala-chai`, `hot-chocolate`
6. **Cold drinks** — `oreo-shake`, `mango-shake`, `strawberry-shake`, `fresh-lime-soda`,
   `iced-tea`, `butterscotch-shake`
7. **Desserts** — `choco-lava-cake`, `gulab-jamun`, `ice-cream-scoop`, `red-velvet-pastry`
8. **Combos** — `burger-combo-meal`, `pizza-combo-meal`, `student-combo`, `family-feast`

## Also outstanding

- Photographer names in `CREDITS.md` (needs an Unsplash API key or manually opening each
  source URL).
- A real team photo for `/about` — currently uses a cafe interior shot.
- An FSSAI licence number for the about page and footer (currently a placeholder).
