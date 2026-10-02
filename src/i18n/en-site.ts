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

  header: {
    skipToContent: "Skip to content",
    primaryNav: "Main navigation",
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
    addressShort: "Bombay Bazar, Khandwa",
    dineInOrTakeaway: "Takeaway or dine in — no delivery",
    prepaidNote: "Takeaway orders are prepaid — so we cook only for you, fresh.",
    busyNow: (count: number) =>
      count === 1 ? "1 order in the kitchen" : `${count} orders in the kitchen`,
  },

  categories: {
    eyebrow: "What are you after?",
    title: "Browse the menu",
    description: "Eight sections, 40 items, most of them vegetarian.",
    itemCount: (count: number) => (count === 1 ? "1 item" : `${count} items`),
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
        body: "Watch the live status and collect from Bombay Bazar when it says ready — or take a seat and we'll bring it over.",
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
    title: "Bombay Bazar, Khandwa",
    description:
      "Parking is easiest in the side lane after 7 PM. We're a two-minute walk from the bus stand.",
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

  menuCard: {
    add: "Add",
    soldOut: "Sold out",
    customisable: "Customisable",
    calories: (count: number) => `${count} kcal`,
    noPhotoYet: "Photo coming soon",
    viewItem: (name: string) => `View ${name}`,
  },
};

export type SiteDictionary = typeof enSite;
