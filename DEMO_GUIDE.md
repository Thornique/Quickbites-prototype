# Quick Bites — demo guide

Written for whoever is showing this to the client. Plain language, no code.

---

## 1. What this is

This is a **working prototype** of the Quick Bites website and admin panel. Everything you can
click, click it — the menu, the cart, paying, the kitchen screen, the reports. It all behaves
like the real thing.

Three things to understand before you show it:

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
(menu, 60 days of past orders, customers, reviews). After that it is instant.

### b. Check the shop is open — this one catches people out

The cafe's hours are **10:00 AM to 11:00 PM**. If you demo outside those hours, the site
correctly shows **"Closed"** and the **Add buttons are greyed out** — you will not be able to
put anything in the cart, and the demo stops dead.

If you are demoing early morning or late at night:

1. Go to the admin panel → **Settings** → **Hours**
2. Set the opening time to `00:00` and the closing time to `23:59` for every day
3. **Save changes**

The site will immediately start taking orders. Set it back afterwards if you like.

### c. Decide whether to reset

If you have been practising, reset so the client sees clean numbers:

- **Admin → Settings → Demo → Reset demo data**, type `RESET`, confirm.
- Only the **super admin** (owner@quickbites.in) can do this.

Resetting wipes anything you created and rebuilds the original demo data. It takes a second.

---

## 3. Demo accounts

| Who | Email | Password | What they can do |
| --- | --- | --- | --- |
| Owner (super admin) | `owner@quickbites.in` | `Owner@123` | Everything, including staff and reset |
| Manager (admin) | `manager@quickbites.in` | `Manager@123` | Orders, menu, inventory, coupons, enquiries, bookings. **Not** reports, customers, content, reviews, staff or settings |
| Customer | `demo@quickbites.in` | `Demo@123` | Ordinary customer with past orders |

The customer signs in at `/login`. The admins sign in at a **separate** screen, `/admin/login`.

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
11. You land on the **order tracking page** with a big **token number** (like `#A23`) and the
    message **"Waiting for the cafe to confirm."**

> Leave this tab open. Do not close it. It is about to come alive.

### Minute 6–8 · The cafe side

**Switch to Tab 2 (admin).**

12. The new order is already there on the **dashboard** and in **Orders** — no refresh needed.
    It is marked **"Paid — verifying."**
13. Open it. The money came in online, so somebody has to confirm it arrived: click
    **Verify & accept**, and enter a ready time — say **15 minutes**.

**Switch back to Tab 1 (customer).** Without touching anything, the page has already changed
to a **live countdown** to the promised time.

**Back to Tab 2.** The kitchen is running late:

14. Press **Extend +5**. Go and look at Tab 1 — the countdown has moved, and the customer can
    see that it was extended. Nothing was hidden from them.
15. Move the order to **Preparing**, then **Ready**.

**Tab 1** now shows **"Your order is ready"** with the token to show at the counter.

**Tab 2.** Mark it **Picked up**. (For a dine-in order the same button reads **Served** — the
wording follows the order type.)

### Minute 8–9 · The other order types

16. **Dine-in with cash.** Place a second order, choose **Dine in**, pick a table number, and
    choose **Cash**. The kitchen can start straight away — no prepayment. In admin, record the
    cash: enter what the customer handed over and the **change is calculated for you**.
17. **Order for later.** Start a third takeaway order and choose **a time slot** instead of
    "as soon as possible". Slots are in 15-minute steps, need at least 30 minutes' notice, and
    each slot holds a limited number of orders — a full slot is shown as full. Payment is
    still upfront.

### Minute 9–10 · Running the business

**Tab 2 only.** Move quickly here — this is the "it is not just a website" part.

18. **Dashboard** — today's takings, live order board, charts.
19. **Reports** — change the date range and watch every number recalculate. Six reports: sales,
    busiest hours, best sellers, payment methods, takeaway vs dine-in, and **promised vs actual
    ready time**. Every one exports to **CSV**, and the page prints.
20. **Inventory** — mark an item **sold out**. Flip to Tab 1 and show it greyed out on the
    menu **instantly**. This usually gets the biggest reaction.
21. **Staff** — open the manager's permissions and show the checkboxes. Sign in as the manager
    in a private window and show that Reports, Staff and Settings are simply not there for
    them. The owner cannot be deleted or demoted by anyone.

Other things to show if there is time: **Menu** (add an item, upload a photo), **Coupons**,
**Customers** (history and block), **Enquiries** (with Call and WhatsApp buttons),
**Bookings**, **Reviews** (reply and watch it appear on the public reviews page), and
**Content** (edit the home banners, the offers line, and the contact details, and watch the
website change).

---

## 5. If something goes wrong mid-demo

| Problem | Fix |
| --- | --- |
| Add buttons are greyed out | The shop is closed. Admin → Settings → Hours → widen the hours |
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

Reset rebuilds the menu, the 60 days of order history, customers, reviews and settings exactly
as they started. Anything you created is gone.

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

Things that carry over unchanged: the whole design, the bilingual content, the menu structure,
the order and payment rules, the admin screens and the reports.
