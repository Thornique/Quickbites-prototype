/**
 * English — customer-site copy: header, footer, home sections and the menu
 * card. Written specifically for a Khandwa quick-service cafe; no filler.
 */
export const enSite = {
  store: {
    openNow: "Open now",
    closed: "Closed",
    tillTime: (time: string) => `till ${time}`,
    opensAt: (time: string) => `opens ${time}`,
    pausedOrders: "Not taking orders",
    statusLabel: "Store status",
  },

  cart: {
    label: "Cart",
    empty: "Your cart is empty",
    itemCount: (count: number) => (count === 1 ? "1 item" : `${count} items`),
    viewCart: "View cart",
  },

  /**
   * The two outlets. Names themselves come from the outlet registry, which
   * carries them in both languages, so only the surrounding copy is here.
   */
  outlet: {
    switchLabel: "Choose an outlet",
    chooseTitle: "Where are you ordering from?",
    chooseBlurb:
      "Two counters, two menus. Pick one — you can switch any time from the header.",
    restaurantBlurb: "Burgers, pizzas, wraps, shakes and combos. Bombay Bazar.",
    coffeeBlurb: "Espresso, frappés and fresh bakes. Nagchun Road.",
    restaurantCta: "Order food",
    coffeeCta: "Order coffee",
    openFrom: (hours: string) => `Open ${hours}`,
    switchedTo: (name: string) => `Now showing ${name}`,
    otherCart: (count: number, name: string) =>
      count === 1
        ? `1 item is still waiting in your ${name} cart.`
        : `${count} items are still waiting in your ${name} cart.`,
    goToOtherCart: "Switch and view it",
    badgeLabel: "Outlet",
    bothOutlets: "Both outlets",
  },

  /**
   * Coffee outlet copy. Only the coffee storefront reads these, so the
   * restaurant's wording is untouched by anything added here.
   */
  coffeeHome: {
    heroEyebrow: "Freshly brewed",
    heroTitle: "Ground this morning, pulled to order.",
    heroBody:
      "Chikmagalur arabica, roasted for us and ground the same day. Milk steamed to order, bakes out of the oven by eight.",
    orderNow: "Order now",
    viewMenu: "View menu",

    signaturesEyebrow: "Signatures",
    signaturesTitle: "What the counter is known for",
    signaturesBody:
      "Eight drinks and bakes people come back for. Every one is made to order.",

    brewEyebrow: "The brew bar",
    brewTitle: "Three steps, and it is in your hand.",
    stepPickTitle: "Pick your brew",
    stepPickBody:
      "Espresso and milk coffee, cold brew and frappés, chai and hot chocolate.",
    stepPickNote: "22 drinks and bakes",
    stepCustomiseTitle: "Make it yours",
    stepCustomiseBody:
      "Cup size, the milk you want, an extra shot, and how sweet. The price moves as you choose.",
    stepCustomiseNote: "Oat, almond and soy milk available",
    stepCollectTitle: "Pick it up hot",
    stepCollectBody:
      "Pay online, watch the live status, and collect at the counter when your token is called.",
    stepCollectNote: "Most drinks in under 6 minutes",

    emptyCartTitle: "Nothing brewing yet",
    emptyCartBody: "Pick a coffee and we will start it the moment you pay.",
    emptyOrdersTitle: "No orders from the coffee bar yet",
    emptyOrdersBody: "Your first flat white is one tap away.",
  },

  header: {
    skipToContent: "Skip to content",
    primaryNav: "Main navigation",
    outletAria: (address: string) => `${address} — see contact details`,
    searchMenu: "Search the menu",
  },

  footer: {
    visitUs: "Visit us",
    openingHours: "Opening hours",
    everyDay: "Every day",
    quickLinks: "Quick links",
    followUs: "Follow us",
    callUs: "Call us",
    whatsapp: "WhatsApp",
    getDirections: "Get directions",
    legal: "Legal",
    privacy: "Privacy policy",
    terms: "Terms",
    rights: "© Quick Bites, Khandwa",
    prototypeNote: "Prototype build — ordering and payments are simulated.",
    fssai: (number: string) => `FSSAI Lic. No. ${number}`,
  },

  hero: {
    orderTakeaway: "Order takeaway",
    seeMenu: "See menu",
    carouselLabel: "Featured offers",
    previous: "Previous slide",
    next: "Next slide",
    goToSlide: (index: number) => `Go to slide ${index}`,
    pause: "Pause",
    play: "Play",
  },

  ready: {
    eyebrow: "Right now",
    readyIn: (minutes: number) => `Ready in about ${minutes} min`,
    closedNow: "We're closed right now",
    opensAt: (time: string) => `Ordering opens at ${time}`,
    pickUpAt: "Pick up at",
    dineInOrTakeaway: "Takeaway or dine in — no delivery",
    prepaidNote: "Takeaway orders are prepaid — so we cook only for you, fresh.",
    busyNow: (count: number) =>
      count === 1 ? "1 order in the kitchen" : `${count} orders in the kitchen`,
  },

  categories: {
    title: "Browse the menu",
    description: (sections: number, items: number) =>
      `${sections} sections, ${items} items, most of them vegetarian.`,
    itemCount: (count: number) => (count === 1 ? "1 item" : `${count} items`),
    seeAll: "See all",
    scrollLeft: "Scroll categories left",
    scrollRight: "Scroll categories right",
  },

  bestsellers: {
    eyebrow: "Most loved",
    title: "What Khandwa orders",
    description: "The items that leave our counter the fastest.",
    seeAll: "See full menu",
    scrollLeft: "Scroll left",
    scrollRight: "Scroll right",
  },

  offers: {
    eyebrow: "Save a little",
    title: "Running offers",
    description: "Apply any of these at checkout.",
    copyCode: "Copy code",
    copied: (code: string) => `${code} copied`,
    minOrder: (amount: string) => `On orders above ${amount}`,
    upTo: (amount: string) => `up to ${amount}`,
    offFlat: (amount: string) => `${amount} off`,
    offPercent: (percent: number) => `${percent}% off`,
    noOffers: "No offers running right now",
    noOffersBody: "Check back soon — we usually have something on.",
  },

  combos: {
    eyebrow: "Better together",
    title: "Combo meals from ₹149",
    description:
      "A full meal costs less than ordering the same items apart. Pick one up on your way home.",
    cta: "See combos",
  },

  howItWorks: {
    eyebrow: "How takeaway works",
    title: "Three steps, about 12 minutes",
    note: "Takeaway orders are prepaid — so we cook only for you, fresh.",
    steps: [
      {
        title: "Order online",
        body: "Choose takeaway or dine in, customise your items, and pay by UPI or card. Dining in, you can also pay cash at the counter.",
      },
      {
        title: "We cook fresh",
        body: "Nothing sits under a lamp. The kitchen starts the moment we confirm your order, and tells you exactly how long it will take.",
      },
      {
        title: "Pick up or sit down",
        body: "Watch the live status and collect from the counter when it says ready — or take a seat and we'll bring it over.",
      },
    ],
  },

  reviews: {
    eyebrow: "From our counter",
    title: "What people say",
    readAll: "Read all reviews",
    ratingOf: (rating: number) => `Rated ${rating} out of 5`,
    averageOf: (average: number, total: number) =>
      `${average} out of 5 from ${total} reviews`,
  },

  social: {
    eyebrow: "On the gram",
    title: "Straight from the kitchen",
    description: "Follow along for new items and weekend specials.",
    follow: "Follow us",
    openPost: (caption: string) => `${caption} — opens Instagram in a new tab`,
  },

  location: {
    eyebrow: "Find us",
    title: "Where to find us",
    description:
      "Both counters are a short walk from the bus stand. Parking is easiest in the side lane after 7 PM.",
    mapLabel: "Map showing Quick Bites, Khandwa",
    loadMap: "Load map",
    mapNote: "Loads Google Maps",
  },

  notifications: {
    label: "Notifications",
    open: "Open notifications",
    unreadCount: (count: number) =>
      count === 1 ? "1 unread notification" : `${count} unread notifications`,
    today: "Today",
    earlier: "Earlier",
    markAllRead: "Mark all as read",
    seeAll: "See all notifications",
    unread: "unread",
    relative: (minutes: number) => {
      if (minutes < 1) return "just now";
      if (minutes < 60) return `${Math.round(minutes)} min ago`;
      const hours = Math.round(minutes / 60);
      return hours === 1 ? "1 hr ago" : `${hours} hr ago`;
    },
    emptyTitle: "Nothing new",
    emptyBody: "Order updates and alerts will show up here.",
    title: "Notifications",
    subtitle: "Updates about your orders, bookings and reviews.",
    adminSubtitle: "New orders, payments to verify and stock alerts.",
    preferences: "Notification preferences",
    sound: "Play a sound for urgent alerts",
    soundHint: "Plays only after you have interacted with the page.",
    browser: "Show browser notifications",
    browserHint: "Alerts you when this tab is in the background.",
    enableBrowser: "Turn on browser notifications?",
    enableBrowserBody:
      "We'll alert you when an order is ready, even if this tab is hidden.",
    allow: "Allow",
    notNow: "Not now",
    browserBlocked: "Your browser has blocked notifications for this site.",
  },

  menu: {
    title: "Menu",
    subtitle: "Everything we make, in both languages.",
    paymentNote: "Takeaway is prepaid online · Dine-in: pay online or at the counter",
    searchLabel: "Search the menu",
    searchPlaceholder: "Search burgers, coffee, paneer…",
    clearSearch: "Clear search",
    filters: "Filters",
    clearFilters: "Clear filters",
    sortLabel: "Sort",
    categoriesLabel: "Categories",
    jumpTo: (name: string) => `Jump to ${name}`,
    resultCount: (count: number) => (count === 1 ? "1 item" : `${count} items`),
    noResultsTitle: "Nothing matches that",
    noResultsBody: "Try a different word, or clear the filters to see everything.",
    sort: {
      popular: "Popular",
      priceAsc: "Price: low to high",
      priceDesc: "Price: high to low",
      name: "A–Z",
    },
    chips: {
      vegOnly: "Veg only",
      nonVeg: "Non-veg",
      bestseller: "Bestseller",
      new: "New",
      spicy: "Spicy",
      under100: "Under ₹100",
    },
  },

  closed: {
    title: "We're closed right now",
    body: (time: string) => `You can browse the menu — ordering opens at ${time}.`,
    pausedTitle: "We've paused new orders",
    pausedBody: "The kitchen is catching up. Please try again shortly.",
  },

  customise: {
    title: (name: string) => `Customise ${name}`,
    required: "Required",
    chooseOne: "Choose 1",
    chooseUpTo: (max: number) => `Choose up to ${max}`,
    missingRequired: (group: string) => `Please choose a ${group.toLowerCase()}.`,
    maxReached: (max: number) => `You can pick at most ${max}.`,
    notes: "Anything for the kitchen?",
    notesPlaceholder: "Less spicy, no onion…",
    notesCount: (used: number, max: number) => `${used}/${max}`,
    addForPrice: (price: string) => `Add · ${price}`,
    updateForPrice: (price: string) => `Update · ${price}`,
    soldOutOption: "Sold out",
  },

  item: {
    backToMenu: "Back to the menu",
    notFoundTitle: "We can't find that item",
    notFoundBody: "It may have been renamed or taken off the menu.",
    addToCart: (price: string) => `Add to cart · ${price}`,
    quantity: "Quantity",
    about: "About this item",
    addedToCart: (name: string) => `${name} added to the cart`,
    gallery: "Item photos",
  },

  orderType: {
    legend: "How are you eating?",
    takeaway: "Takeaway",
    takeawayHint: "Prepaid online",
    dineIn: "Dine in",
    dineInHint: "Pay online or at the counter",
  },

  cartPage: {
    title: "Your cart",
    empty: "Your cart is empty",
    emptyBody: "Add a burger, a shake or a combo and it will show up here.",
    browseMenu: "Browse the menu",
    subtotal: "Subtotal",
    discount: "Discount",
    discountWithCode: (code: string) => `Discount (${code})`,
    packaging: "Packaging",
    gst: (rate: number) => `GST ${rate}%`,
    total: "Total",
    checkout: "Go to checkout",
    remove: (name: string) => `Remove ${name}`,
    removed: (name: string) => `${name} removed`,
    undo: "Undo",
    suggestions: "Goes well with this",
  },

  coupon: {
    label: "Coupon code",
    placeholder: "Have a code?",
    apply: "Apply",
    remove: "Remove",
    available: "Available offers",
    applied: (code: string, amount: string) => `${code} applied, you saved ${amount}`,
    appliedShort: "Applied",
    invalid: "That code is not valid.",
    expired: "This offer has ended.",
    notStarted: "This offer has not started yet.",
    exhausted: "This offer has been fully claimed.",
    alreadyUsed: "You have already used this offer.",
    noEligibleItems: "Nothing in your cart qualifies for this offer.",
    addMore: (amount: string) => `Add ${amount} more to use this`,
  },

  checkout: {
    title: "Checkout",
    pickupDetails: "Pickup details",
    tableDetails: "Your table",
    name: "Name",
    phone: "Phone",
    tableNumber: "Table number",
    tableNumberHint: "Optional, staff can fill this in",
    notes: "Notes for the kitchen",
    notesPlaceholder: "Less spicy, no onion...",
    when: "When do you want it?",
    asap: "As soon as possible",
    asapHint: (minutes: number) =>
      `Ready in about ${minutes} min after the cafe confirms`,
    schedule: "Schedule for later",
    today: "Today",
    tomorrow: "Tomorrow",
    slotFull: "Full",
    slotPast: "Past",
    slotTooSoon: "Too soon",
    noSlots: "No slots left for this day.",
    payment: "Payment",
    payOnline: "Pay online (UPI or Card)",
    payCash: "Pay cash at the counter",
    prepaidNote: "Takeaway orders are prepaid, so we cook only for you, fresh.",
    cashNote: "Show your token at the counter and pay when you collect.",
    summary: "Order summary",
    editCart: "Edit cart",
    placeOrder: "Place order",
    continueToPayment: "Continue to payment",
    placing: "Placing your order...",
    blockedTitle: "Ordering is closed right now",
  },

  pay: {
    title: "Payment",
    prototype: "Prototype, no real payment is taken",
    upi: "UPI",
    card: "Card",
    upiId: "UPI ID",
    upiIdPlaceholder: "yourname@bank",
    scanHint: "Scan with any UPI app, or enter your UPI ID",
    cardNumber: "Card number",
    cardName: "Name on card",
    expiry: "Expiry",
    cvv: "CVV",
    payNow: (amount: string) => `Pay ${amount}`,
    processing: "Processing...",
    failedTitle: "Payment failed",
    failedBody: "The payment did not go through. Nothing has been charged.",
    retry: "Try again",
    backToCheckout: "Back to checkout",
    invalidCard: "Check the card number.",
    invalidExpiry: "Check the expiry date.",
    invalidCvv: "Check the CVV.",
    invalidUpi: "Enter a UPI ID like yourname@bank.",
  },

  confirm: {
    tokenLabel: "Your token",
    showToken: (token: string) => `Show this at the counter: ${token}`,
    awaitingVerification: "Waiting for the cafe to confirm your payment",
    awaitingBody: "We will start cooking as soon as it is confirmed.",
    cashDue: (amount: string) => `Pay ${amount} at the counter`,
    scheduledFor: (time: string) => `Scheduled for ${time}`,
    yourOrder: "Your order",
    trackOrder: "Track this order",
    orderNumber: (id: string) => `Order ${id}`,
  },

  track: {
    showAtCounter: "Show this at the counter",
    dineInTable: (table: string) => `Dine-in · Table ${table}`,
    waitingConfirm: "Waiting for the cafe to confirm",
    usuallyAbout: (minutes: number) => `Usually about ${minutes} min`,
    readyBy: (time: string) => `Ready by ${time}`,
    inMinutes: (minutes: number) => `in ${minutes} min`,
    almostReady: "Almost ready...",
    readyNow: "Ready for you now",
    scheduledFor: (time: string) => `Scheduled for ${time}`,
    willStartAt: (time: string) => `We will start cooking at ${time}`,
    timeline: "Progress",
    steps: {
      placed: "Order placed",
      paymentVerified: "Payment verified",
      accepted: "Confirmed by the cafe",
      preparing: "Being prepared",
      ready: "Ready",
      handedOverTakeaway: "Picked up",
      handedOverDineIn: "Served",
      cancelled: "Cancelled",
    },
    paymentTitle: "Payment",
    paidUnverified: "Payment received, being verified by the cafe",
    transactionRef: (ref: string) => `Ref ${ref}`,
    paymentFailed: "Payment could not be verified",
    payAgain: "Pay again",
    autoCancelIn: (minutes: number) =>
      `This order will be cancelled in ${minutes} min if it is not paid.`,
    cashAtCounter: (amount: string) => `Pay ${amount} at the counter`,
    payOnlineNow: "Pay online now",
    paidWith: (method: string) => `Paid, ${method}`,
    refunded: "Refunded",
    methodUpi: "UPI",
    methodCard: "Card",
    methodCash: "Cash",
    cancelOrder: "Cancel order",
    cancelTitle: "Cancel this order?",
    cancelBody: "Anything you have paid will be refunded.",
    cancelConfirm: "Yes, cancel it",
    cancelKeep: "Keep my order",
    cancelReason: "Changed my mind",
    cancelledReason: (reason: string) => `Cancelled: ${reason}`,
    details: "Order details",
    print: "Print receipt",
    pickupTitle: "Pick up from",
    callStore: "Call the store",
    directions: "Get directions",
    notes: (text: string) => `Note: ${text}`,
  },

  orders: {
    title: "My orders",
    active: "Active",
    past: "Past",
    noneActive: "No orders in progress",
    noneActiveBody: "When you place an order it will show up here.",
    nonePast: "No past orders yet",
    nonePastBody: "Your completed orders will be listed here.",
    track: "Track",
    reorder: "Reorder",
    rate: "Rate order",
    reordered: (count: number) =>
      count === 1 ? "1 item added back to your cart" : `${count} items added back`,
    reorderSkipped: (names: string) => `Not available right now: ${names}`,
    rateTitle: "How was your order?",
    rateBody: "Your review is published once the cafe approves it.",
    rateComment: "Tell us a little more",
    rateSubmit: "Send review",
    rated: "Thanks, your review is awaiting approval",
    stars: (n: number) => `${n} star${n === 1 ? "" : "s"}`,
  },

  profile: {
    title: "Profile",
    details: "Your details",
    save: "Save changes",
    saved: "Profile updated",
    changePassword: "Change password",
    currentPassword: "Current password",
    newPassword: "New password",
    updatePassword: "Update password",
    passwordChanged: "Password updated",
    language: "Language",
    languageHint: "Used across the site and in your notifications.",
  },

  accountPage: {
    overview: "Account",
    activeOrder: "Order in progress",
    recentOrders: "Recent orders",
    seeAll: "See all orders",
    noActivity: "Nothing in progress",
    noActivityBody: "Browse the menu and place an order to see it tracked here.",
  },

  menuCard: {
    add: "Add",
    soldOut: "Sold out",
    customisable: "Customisable",
    calories: (count: number) => `${count} kcal`,
    noPhotoYet: "Photo coming soon",
    viewItem: (name: string) => `View ${name}`,
  },

  about: {
    eyebrow: "About us",
    title: "Made fresh, served fast",
    intro:
      "Two counters in Khandwa, kitchens you can see into, and food that leaves hot.",
    valuesTitle: "What we hold to",
    hygieneTitle: "Kitchen & hygiene",
    hygienePoints: [
      "Surfaces sanitised every two hours",
      "Frying oil changed daily, filtered twice a day",
      "Separate boards, tongs and fryers for veg and non-veg",
      "Staff temperature and hand-wash log kept at the counter",
      "Cold storage checked morning and night",
    ],
    licenceTitle: "FSSAI licence",
    licenceNote:
      "Displayed at the counter as required. Number to be confirmed by the client.",
    statKitchen: "Open kitchen",
    statMinutes: "Most orders in under 15 min",
    statSince: "Serving Khandwa since 2021",
    visitTitle: "Come and see",
    visitBody: "Walk in, watch your burger being pressed, and take it away hot.",
  },

  gallery: {
    eyebrow: "Gallery",
    title: "The counter, the kitchen, the food",
    description:
      "Photographs from our own counters in Khandwa — no stock food styling.",
    filterAll: "All",
    filterFood: "Food",
    filterCafe: "Cafe",
    filterEvents: "Events",
    empty: "No photos in this set yet",
    emptyBody: "Try another filter — or come and give us something to photograph.",
    open: (alt: string) => `Open ${alt} larger`,
    close: "Close",
    previous: "Previous photo",
    next: "Next photo",
    counter: (index: number, total: number) => `${index} of ${total}`,
  },

  reviewsPage: {
    eyebrow: "Reviews",
    title: "What Khandwa says",
    outOf: "out of 5",
    fromCount: (count: number) =>
      count === 1 ? "from 1 review" : `from ${count} reviews`,
    distribution: "Rating breakdown",
    starBar: (stars: number, count: number) =>
      `${stars} star: ${count} ${count === 1 ? "review" : "reviews"}`,
    ownerReply: "Quick Bites replied",
    empty: "No reviews yet",
    emptyBody: "Be the first to tell Khandwa what you thought.",
    writeTitle: "Leave a review",
    writeBody: "Reviews appear once we have read them.",
    signInToWrite: "Sign in to leave a review",
    orderToWrite: "Order once and you can review us here.",
    alreadySaid: "Thanks — your review is with us already.",
  },

  services: {
    eyebrow: "Services",
    title: "Feeding more than a few",
    description:
      "Party orders, catering and daily lunch boxes, run from the same kitchen as the counter.",
    enquire: "Enquire",
    enquireAbout: (service: string) => `Enquire about ${service}`,
    includes: "What you get",
    formTitle: "Tell us what you need",
    formBody: "We reply the same day, usually within a couple of hours.",
    subject: "What is this about",
    sent: "Thanks — we have your enquiry and will call you back.",
    seePacks: "See party pack prices",
  },

  pricing: {
    eyebrow: "Prices",
    title: "Combos & party packs",
    combosTitle: "Combo meals",
    combosBody: "A main, a side and a drink — cheaper than the three on their own.",
    packsTitle: "Party packs",
    feeds: (people: number) => `Feeds about ${people}`,
    popular: "Most ordered",
    enquirePack: (pack: string) => `Enquire about the ${pack}`,
    perPerson: (amount: string) => `about ${amount} a head`,
    orderCombo: "Order this combo",
    noCombos: "Combos are being reworked",
    noCombosBody: "Ask at the counter — we will still put a meal together for you.",
  },

  contact: {
    eyebrow: "Contact",
    title: "Talk to the counter",
    description:
      "Call for anything urgent. For party orders, the form reaches the manager.",
    formTitle: "Send us a message",
    name: "Your name",
    phone: "Phone number",
    email: "Email",
    subject: "What is this about",
    message: "Message",
    messagePlaceholder: "Tell us what you need and when you need it.",
    send: "Send message",
    sent: "Message sent",
    sentBody: "We will call you back on the number you gave us.",
    sendAnother: "Send another message",
    reachUs: "Other ways to reach us",
    hoursTitle: "When we are open",
    addressTitle: "Where we are",
    subjects: {
      PARTY_ORDER: "Party order",
      BULK_ORDER: "Bulk order",
      CATERING: "Catering",
      CORPORATE_LUNCH: "Corporate lunch boxes",
      FEEDBACK: "Feedback",
      OTHER: "Something else",
    },
  },

  booking: {
    eyebrow: "Book a table",
    title: "Keep a table for us",
    description:
      "Twelve tables, no cover charge. We hold a booked table for fifteen minutes.",
    date: "Date",
    today: "Today",
    tomorrow: "Tomorrow",
    time: "Time",
    partySize: "How many people",
    people: (count: number) => (count === 1 ? "1 person" : `${count} people`),
    name: "Name",
    phone: "Phone number",
    request: "Anything we should know",
    requestPlaceholder: "Birthday, high chair, window table…",
    submit: "Request this table",
    noSlots: "We are closed on this date",
    noSlotsBody: "Pick another day and the times will appear.",
    seatsLeft: (count: number) => `${count} left`,
    full: "Full",
    confirmedTitle: "Table requested",
    confirmedBody:
      "We will confirm by phone shortly. Show this booking ID at the counter.",
    bookingId: "Booking ID",
    bookAnother: "Book another table",
    myBookings: "Your bookings",
    noBookings: "No bookings yet",
    noBookingsBody: "Book a table and it will show up here with its status.",
    status: {
      PENDING: "Waiting for confirmation",
      CONFIRMED: "Confirmed",
      SEATED: "Seated",
      CANCELLED: "Cancelled",
      NO_SHOW: "Marked as no-show",
    },
  },

  legal: {
    privacyTitle: "Privacy policy",
    termsTitle: "Terms of service",
    draftBadge: "Draft for client review",
    draftNote:
      "This wording is a starting point for the client's lawyer, not final legal advice.",
    updatedOn: (date: string) => `Last updated ${date}`,
    questions: "Questions about this?",
    questionsBody: "Call the counter or send us a message and we will explain.",
  },

  errorPage: {
    notFoundTitle: "That page is off the menu",
    notFoundBody:
      "The link may be old, or we may have moved the page. The menu is where most people were heading anyway.",
    errorTitle: "Something went wrong at our end",
    errorBody: "Try again — and if it keeps happening, call the counter and tell us.",
    tryAgain: "Try again",
    goHome: "Back to home",
    seeMenu: "See the menu",
  },
};

export type SiteDictionary = typeof enSite;
