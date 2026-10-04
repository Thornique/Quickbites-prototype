# Quick Bites — demo guide

Written for whoever is showing this to the client. Plain language, no code.

---

## 1. What this is

This is a **working prototype** of the Quick Bites website and admin panel. Everything you can
click, click it — the menu, the cart, paying, the kitchen screen, the reports. It all behaves
like the real thing.

**There are two shops in here, not one.** "Quick Bites" at Bombay Bazar is the restaurant;
"Quick Bites Coffee" on Nagchun Road is the coffee shop. One website, one admin panel, and a
toggle in the header that swaps between them — menu, prices, offers, opening hours, colour and
all. The two keep **separate carts, separate stock, separate coupons and separate token
numbers** (A-series at the restaurant, C-series at coffee). See section 4a.

Three more things to understand before you show it:

**There is no server and no database.** The whole thing runs inside the web browser. When you
place an order, the order is saved into the browser's own storage, not sent anywhere.

**Each device has its own separate data.** If you place an order on a laptop, it will **not**
show up on a phone, or on anybody else's computer. They are completely separate copies. This
is the single most important thing to say out loud during the demo, because otherwise the
client will assume their phone should show what your laptop is showing.

**Two tabs in the same browser DO talk to each other.** Open the customer site in one tab and
the admin panel in another tab of the *same* browser, and they update each other live. That is
how you demo the kitchen flow — and it is genuinely impressive, so use it.

**The payments are fake.** No money moves. No card is charged. The UPI and card screens are
simulations that always succeed unless you choose to fail them.

---

## 2. Before you start — two minute setup

Do this **before** the client is in the room.

### a. Open the app and let it load

Open the site once and wait for it to finish loading. The first load builds all the demo data
for **both shops** (two menus, 45 days of past orders each, customers, reviews). It takes a few
seconds. After that it is instant.

### b. Check the shop is open — this one catches people out

Each shop keeps its **own** hours: the restaurant is **10:00 AM to 11:00 PM**, the coffee shop
**7:30 AM to 10:30 PM**. If you demo outside those hours, that shop correctly shows **"Closed"**
and its **Add buttons are greyed out** — you will not be able to put anything in the cart, and
the demo stops dead.

If you are demoing early morning or late at night, do this **for each shop you plan to show**:

1. Go to the admin panel → pick the outlet in the **topbar switcher** → **Settings** → **Hours**
2. Set the opening time to `00:00` and the closing time to `23:59` for every day
3. **Save changes**
4. Switch the topbar to the other outlet and repeat

That shop will immediately start taking orders. Set it back afterwards if you like.

### c. Decide whether to reset

If you have been practising, reset so the client sees clean numbers:

- **Admin → Settings → Demo → Reset demo data**, type `RESET`, confirm.
- Only the **super admin** (owner@quickbites.in) can do this.

Resetting wipes anything you created and rebuilds the original demo data. It takes a second.

---

## 3. Demo accounts

| Who | Email | Password | What they can do |
| --- | --- | --- | --- |
| Owner (super admin) | `owner@quickbites.in` | `Owner@123` | Everything, **both outlets**, including staff and reset |
| Restaurant manager | `manager@quickbites.in` | `Manager@123` | Orders, menu, inventory, coupons, enquiries, bookings — **restaurant only**. **Not** reports, customers, content, reviews, staff or settings |
| Coffee manager | `coffee@quickbites.in` | `Coffee@123` | The same permissions — **coffee shop only** |
| Customer | `demo@quickbites.in` | `Demo@123` | Ordinary customer with past orders at both shops |

The customer signs in at `/login`. The admins sign in at a **separate** screen, `/admin/login`.

**Customers are shared; admins are not.** One customer account orders from either shop. Each
admin is tied to one outlet and simply cannot see the other one's orders, menu, stock or
takings — not hidden, genuinely refused. Only the owner sees both, and only the owner gets the
**Restaurant / Coffee / All outlets** switcher in the topbar.

You can be signed in as a customer in one tab and as the owner in another at the same time —
they are kept separate on purpose, and that is exactly how you run the demo.

---

## 4. The ten-minute walkthrough

Use **one browser, two tabs**.

- **Tab 1** — the customer site (`/`)
- **Tab 2** — the admin panel (`/admin`), signed in as the **owner**

Put them side by side if the screen allows. The whole point is that the client sees the admin
tab react while you act as a customer.

---

### Minute 0 · The two shops (do this first)

**Tab 1.** On a first visit the home page opens with a **two-card choice** — "Where are you
ordering from?" — the restaurant and the coffee shop side by side. Pick **Quick Bites Coffee**.

Everything changes at once, and it is worth pausing on:

- The wordmark becomes **QUICK BITES COFFEE**, the headings switch to a **serif**, and the
  red becomes **caramel on espresso**. It reads as a specialty coffee bar, not the restaurant
  in a different colour.
- The **home page is a different page**: one full-bleed photograph with steam drifting off the
  cup, a "Signatures" rail you can scroll, category pills, and a dark "brew bar" band showing
  how a drink is built.
- The menu is the coffee menu — espresso, frappés, bakes. No burgers anywhere.
- The address, the phone, the opening hours and the offers line are the coffee shop's.

Open any drink and show the **customise sheet**: cup size, milk, extra shot and sugar are
selectable pills, and the price in the button at the bottom moves as you tick them. That is
the single best thing to demo on this side.

Use the **Restaurant | Coffee** toggle in the header to switch back and forth. Two things to
show the client while you do:

- **The carts stay apart.** Put a latte in the coffee cart, switch to the restaurant, and the
  restaurant cart is still its own — the cart page even says *"1 item is still waiting in your
  Coffee cart"* with a button to go back to it. Nothing is merged and nothing is lost.
- **Links are shareable.** `?outlet=coffee` on any URL opens that shop directly, which is what
  a WhatsApp link or a QR code on the coffee counter would use.

### Minute 0–2 · The shopfront

**Tab 1.**

1. Land on the **home page**. Point out the rotating hero, the "Hot in 12 minutes" band, the
   category rail and the bestsellers — all real photography.
2. Hit the **EN / हिं** toggle in the header. The entire site switches to Hindi, including the
   menu item names and descriptions. Switch back (or stay in Hindi — it works everywhere).
3. Go to **Menu**. Scroll. Point out:
   - The **green square** (veg) and **brown square** (non-veg) markers on every single item —
     the thing Indian customers look for first.
   - **Bestseller / New / Spicy** tags, calories, "Customisable".
   - Items that are **sold out** are greyed out and cannot be added.

### Minute 2–4 · Build an order

**Tab 1.**

4. Click a customisable item — say **Aloo Tikki Burger**. The customise sheet opens: choose a
   size, add cheese, add a note for the kitchen. The price updates as you tick things.
5. **Add to cart.** Add a second item so the order looks real.
6. Open the **cart**. Change a quantity. Then apply a coupon — type **`QUICK20`** — and the
   discount appears in the bill. It is 20% off up to ₹80, and it needs a basket **over ₹249**,
   so add enough to clear that or the code will be refused. Try a nonsense code too; it refuses
   politely.

### Minute 4–6 · Pay and place it

**Tab 1.**

7. **Checkout.** Sign in as `demo@quickbites.in` / `Demo@123` when asked.
8. Choose **Takeaway**, and **"As soon as possible"**.
9. Note the bill: items, GST, and a **packaging charge** that only applies to takeaway.
10. Takeaway is **prepaid and online only** — there is no cash option, deliberately, because
    the kitchen should not cook for someone who might not turn up. Choose **UPI**, let the
    simulated payment succeed.
11. You land on the **order tracking page** with a big **token number** and the message
    **"Waiting for the cafe to confirm."** The token says which counter to stand at: an
    **A-series** number (`A23`) at the restaurant, a **C-series** one (`C14`) at the coffee
    shop, and the page carries an outlet badge next to it. Each shop counts its own tokens from
    1 each morning.

> Leave this tab open. Do not close it. It is about to come alive.

### Minute 6–8 · The cafe side

**Switch to Tab 2 (admin).**

12. The new order is already there on the **dashboard** and in **Orders** — no refresh needed.
    It is marked **"Paid — verifying."**
13. Open it. The money came in online, so somebody has to confirm it arrived: click
    **Verify & accept**, and enter a ready time — say **15 minutes**. The order goes straight
    into **Preparing** — accepting an order is starting it, so there is no second button to
    press and nothing waiting in a queue that nobody looks at.

**Switch back to Tab 1 (customer).** Without touching anything, the page has already changed
to **"Preparing"** with a **live countdown** to the promised time.

**Back to Tab 2.** The kitchen is running late:

14. Press **Extend +5**. Go and look at Tab 1 — the countdown has moved, and the customer can
    see that it was extended. Nothing was hidden from them.
15. Move the order to **Ready**.

**Tab 1** now shows **"Your order is ready"** with the token to show at the counter.

**Tab 2.** Mark it **Picked up**. (For a dine-in order the same button reads **Served** — the
wording follows the order type.)

### Minute 8–9 · The other order types

16. **Dine-in with cash.** Place a second order, choose **Dine in**, pick a table number, and
    choose **Cash**. The kitchen can start straight away — no prepayment, so **Accept** sends it
    into Preparing immediately. In admin, record the cash: enter what the customer handed over
    and the **change is calculated for you**.
17. **Order for later.** Start a third takeaway order and choose **a time slot** instead of
    "as soon as possible". Slots are in 15-minute steps, need at least 30 minutes' notice, and
    each slot holds a limited number of orders — a full slot is shown as full. Payment is
    still upfront. Once accepted it waits on the **Scheduled** tab rather than cluttering the
    board, and **starts itself** when the slot comes round.

### Minute 9–10 · Running the business

**Tab 2 only.** Move quickly here — this is the "it is not just a website" part.

18. **Dashboard** — today's takings, live order board, charts.
19. **Reports** — change the date range and watch every number recalculate. Six reports: sales,
    busiest hours, best sellers, payment methods, takeaway vs dine-in, and **promised vs actual
    ready time**. Every one exports to **CSV**, and the page prints.
20. **Inventory** — mark an item **sold out**. Flip to Tab 1 and show it greyed out on the
    menu **instantly**. This usually gets the biggest reaction.
21. **Staff** — open the manager's permissions and show the checkboxes, and the **Outlet**
    choice above them. Create a new admin, set the outlet to **Quick Bites Coffee**, then sign
    in as them in a private window: they land on a panel that says **"Working at: Quick Bites
    Coffee"**, with no switcher, and the restaurant's orders, menu and stock are not there at
    all. The owner cannot be deleted or demoted by anyone.

### Minute 10 · Both shops at once (owner only)

22. In the topbar switcher choose **All outlets**. The orders board now shows both shops side
    by side, every card badged **Restaurant** or **Coffee**, with A-series and C-series tokens
    mixed together — which is exactly what the owner wants to see from home.
23. Open **Reports** on "All outlets". The top of the page gains a **By outlet** block: net
    sales, orders, average order and items for each shop, with the combined totals underneath.
    It exports to CSV like everything else.
24. Try **Menu** while still on "All outlets". It asks you to **pick an outlet first** — a menu
    item, a coupon or a set of opening hours belongs to one shop and cannot be saved to both.
    That is the one deliberate limit of the combined view.

Other things to show if there is time: **Menu** (add an item, upload a photo), **Coupons**,
**Customers** (history and block), **Enquiries** (with Call and WhatsApp buttons),
**Bookings**, **Reviews** (reply and watch it appear on the public reviews page), and
**Content** (edit the home banners, the offers line, and the contact details, and watch the
website change).

---

## 5. If something goes wrong mid-demo

| Problem | Fix |
| --- | --- |
| Add buttons are greyed out | That shop is closed. Admin → pick the outlet → Settings → Hours → widen the hours |
| A screen says "Pick an outlet first" | The topbar is on **All outlets**. Catalogue, stock, coupons, content and settings need a specific shop — choose one |
| An admin "cannot see" an order | They are assigned to the other outlet. Only the owner sees both |
| The menu looks wrong for the shop you meant | Check the **Restaurant / Coffee** toggle in the site header |
| Nothing is on the menu, pages look empty | Reload the page once; the demo data builds on first load |
| Admin tab does not react to the customer tab | They must be the **same browser**. Different browsers, or a private window, are separate worlds |
| Numbers look wrong after practising | Admin → Settings → Demo → Reset demo data |
| "This account has been blocked" | You blocked that customer earlier. Admin → Customers → Unblock |
| Payment "failed" | You chose the failure option on the payment screen. Use **Pay again** |

---

## 6. How to reset the demo data

Two ways:

1. **Admin → Settings → Demo → Reset demo data** — type `RESET` to confirm. Super admin only.
   This is the one to use.
2. In development only, `/dev/data` has the same reset plus a view of what is stored. That page
   is switched off in the deployed version.

Reset rebuilds both menus, 45 days of order history for each shop, customers, reviews and both
sets of settings exactly as they started. Anything you created is gone.

---

## 7. What changes in the real product

Be straight with the client about this. The prototype proves the design and the flows; the
real build swaps the foundations underneath.

- **A proper server and database.** Orders, menu and customers move out of the browser onto a
  real database, so every device sees the same live data and nothing is ever lost when someone
  clears their browser.
- **Real payments.** The simulated UPI and card screens are replaced with **Razorpay**, with
  real settlement into the cafe's bank account and automatic payment confirmation — the manual
  "verify the payment" step mostly disappears.
- **Real notifications.** Customers get **WhatsApp and SMS** updates when the order is accepted,
  when the time changes and when it is ready, instead of only seeing it on screen.
- **Multi-device sync.** The counter tablet, the kitchen screen and the owner's phone all show
  the same orders at the same moment.
- **Proper hosting.** The real product runs on a **VPS** with the cafe's own domain, backups,
  and an SSL certificate — not the free demo hosting this prototype uses.

- **Per-outlet printers and screens.** Each counter gets its own kitchen display and its own
  bill printer, instead of both boards living in one browser.

Things that carry over unchanged: the whole design, the bilingual content, the two-outlet
structure, the menu, the order and payment rules, the admin screens and the reports.
