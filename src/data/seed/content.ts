import { OPENING_HOURS, ORDER_DEFAULTS, STORE } from "@/lib/constants";
import type {
  Banner,
  GalleryImage,
  SiteContent,
  StoreSettings,
  Weekday,
} from "@/types";
import { WEEKDAYS } from "@/types";

const CREATED_AT = "2026-08-01T04:30:00.000Z";

export const SEED_BANNERS: Banner[] = [
  {
    id: "banner-1",
    image: "/images/hero/burger-combo.jpg",
    headline: { en: "Hot in 12 minutes", hi: "12 मिनट में गरम" },
    subhead: {
      en: "Order takeaway and pick it up at Bombay Bazar, Khandwa.",
      hi: "टेकअवे ऑर्डर कीजिए और बॉम्बे बाज़ार, खंडवा से ले जाइए।",
    },
    ctaLabel: { en: "Order takeaway", hi: "टेकअवे ऑर्डर करें" },
    ctaHref: "/menu",
    sortOrder: 1,
    isActive: true,
    createdAt: CREATED_AT,
  },
  {
    id: "banner-2",
    image: "/images/hero/pizza-night.jpg",
    headline: { en: "Pizza, baked to order", hi: "पिज़्ज़ा, ऑर्डर पर बेक" },
    subhead: {
      en: "Hand-stretched bases and a proper cheese pull. From ₹129.",
      hi: "हाथ से बेला बेस और असली चीज़ की तार। ₹129 से।",
    },
    ctaLabel: { en: "See pizzas", hi: "पिज़्ज़ा देखें" },
    ctaHref: "/menu#pizzas",
    sortOrder: 2,
    isActive: true,
    createdAt: CREATED_AT,
  },
  {
    id: "banner-3",
    image: "/images/hero/shakes.jpg",
    headline: { en: "Beat the Khandwa heat", hi: "खंडवा की गर्मी को मात दें" },
    subhead: {
      en: "Thick shakes and cold coffee, blended fresh. From ₹59.",
      hi: "गाढ़े शेक और कोल्ड कॉफ़ी, ताज़ा बनी। ₹59 से।",
    },
    ctaLabel: { en: "See cold drinks", hi: "ठंडे पेय देखें" },
    ctaHref: "/menu#cold-beverages-shakes",
    sortOrder: 3,
    isActive: true,
    createdAt: CREATED_AT,
  },
];

const GALLERY_ROWS: Array<[string, string, string, GalleryImage["category"]]> = [
  /*
    Food and cafe shots alternate on purpose: the home page shows the first
    eight as a social feed, and four interiors in a row read as repetition
    rather than a feed.
  */
  ["/images/menu/farmhouse-pizza.jpg", "Farmhouse pizza", "फार्महाउस पिज़्ज़ा", "FOOD"],
  [
    "/images/gallery/cafe-interior.jpg",
    "Inside the cafe",
    "कैफ़े का अंदरूनी हिस्सा",
    "CAFE",
  ],
  ["/images/gallery/donuts.jpg", "Fresh doughnuts", "ताज़े डोनट", "FOOD"],
  ["/images/gallery/coffee-moment.jpg", "Coffee for two", "दो के लिए कॉफ़ी", "CAFE"],
  [
    "/images/menu/chocolate-shake.jpg",
    "Thick chocolate shake",
    "थिक चॉकलेट शेक",
    "FOOD",
  ],
  [
    "/images/gallery/cafe-counter.jpg",
    "Our order counter",
    "हमारा ऑर्डर काउंटर",
    "CAFE",
  ],
  ["/images/menu/peri-peri-fries.jpg", "Peri peri fries", "पेरी पेरी फ्राइज़", "FOOD"],
  [
    "/images/gallery/cafe-dining.jpg",
    "Evening at Quick Bites",
    "क्विक बाइट्स में शाम",
    "EVENTS",
  ],
  [
    "/images/menu/margherita-pizza.jpg",
    "Margherita, straight from the oven",
    "मार्गेरिटा, ओवन से सीधा",
    "FOOD",
  ],
  [
    "/images/gallery/cafe-seating.jpg",
    "Seating by the window",
    "खिड़की के पास बैठने की जगह",
    "CAFE",
  ],
  ["/images/gallery/dessert-cups.jpg", "Dessert cups", "डेज़र्ट कप", "FOOD"],
  ["/images/menu/cold-coffee.jpg", "Cold coffee", "कोल्ड कॉफ़ी", "FOOD"],
  [
    "/images/gallery/burger-board.jpg",
    "Burgers on the board",
    "बोर्ड पर बर्गर",
    "FOOD",
  ],
  [
    "/images/menu/cappuccino.jpg",
    "Cappuccino with cocoa dust",
    "कोको वाली कैपेचीनो",
    "FOOD",
  ],
  ["/images/menu/brownie-sundae.jpg", "Brownie sundae", "ब्राउनी संडे", "FOOD"],
  [
    "/images/menu/veg-grilled-sandwich.jpg",
    "Grilled veg sandwich",
    "ग्रिल्ड वेज सैंडविच",
    "FOOD",
  ],
];

export const SEED_GALLERY: GalleryImage[] = GALLERY_ROWS.map(
  ([src, en, hi, category], i) => ({
    id: `gal-${String(i + 1).padStart(3, "0")}`,
    src,
    alt: { en, hi },
    category,
    sortOrder: i + 1,
    isActive: true,
    createdAt: CREATED_AT,
  }),
);

export const SEED_SITE_CONTENT: SiteContent = {
  id: "site-content",
  offersStrip: {
    en: "Use QUICK20 for 20% off orders above ₹249 · Takeaway only",
    hi: "₹249 से ऊपर के ऑर्डर पर QUICK20 से 20% छूट · सिर्फ़ टेकअवे",
  },
  home: {
    howItWorks: [
      {
        heading: { en: "Order online", hi: "ऑनलाइन ऑर्डर करें" },
        body: {
          en: "Pick your items, customise them and pay — or choose to pay at the counter.",
          hi: "अपनी चीज़ें चुनिए, पसंद से बदलिए और भुगतान कीजिए — या काउंटर पर भुगतान चुनिए।",
        },
      },
      {
        heading: { en: "We cook fresh", hi: "हम ताज़ा बनाते हैं" },
        body: {
          en: "Nothing is pre-made. We start your order the moment the kitchen accepts it.",
          hi: "कुछ भी पहले से बना नहीं होता। रसोई ऑर्डर लेते ही बनाना शुरू करती है।",
        },
      },
      {
        heading: { en: "Pick up hot", hi: "गरम ले जाइए" },
        body: {
          en: "Watch the live status and collect from Bombay Bazar when it says ready.",
          hi: "लाइव स्टेटस देखिए और तैयार होते ही बॉम्बे बाज़ार से ले जाइए।",
        },
      },
    ],
    locationNote: {
      en: "Parking is easiest on the Bombay Bazar side lane after 7 PM.",
      hi: "शाम 7 बजे के बाद बॉम्बे बाज़ार की साइड गली में पार्किंग सबसे आसान है।",
    },
  },
  about: {
    story: {
      heading: {
        en: "Started in Khandwa, for Khandwa",
        hi: "खंडवा में, खंडवा के लिए शुरू",
      },
      body: {
        en: "Quick Bites opened on a single counter at Bombay Bazar with one idea: good fast food should not mean waiting, and it should not cost a day's wage. We grind our own coffee, press our own patties and cook every order from scratch.",
        hi: "क्विक बाइट्स की शुरुआत बॉम्बे बाज़ार के एक काउंटर से हुई, एक ही सोच के साथ — अच्छा फ़ास्ट फ़ूड मतलब लंबा इंतज़ार नहीं, और दाम भी दिन भर की कमाई जितना नहीं। हम अपनी कॉफ़ी खुद पीसते हैं, पैटी खुद बनाते हैं और हर ऑर्डर ताज़ा पकाते हैं।",
      },
    },
    values: [
      {
        heading: { en: "Made fresh, served fast", hi: "ताज़ा बना, जल्दी परोसा" },
        body: {
          en: "Most orders leave the counter in under 15 minutes without anything sitting under a lamp.",
          hi: "ज़्यादातर ऑर्डर 15 मिनट से कम में तैयार — कुछ भी लैंप के नीचे रखा नहीं रहता।",
        },
      },
      {
        heading: { en: "Veg and non-veg kept apart", hi: "वेज और नॉन-वेज अलग" },
        body: {
          en: "Separate boards, separate tongs, separate fryers. Marked clearly on every item.",
          hi: "अलग बोर्ड, अलग चिमटे, अलग फ्रायर। हर आइटम पर साफ़ निशान।",
        },
      },
      {
        heading: { en: "Honest pricing", hi: "ईमानदार दाम" },
        body: {
          en: "The price on the menu is the price on the bill, plus GST and ₹10 packaging.",
          hi: "मेन्यू का दाम ही बिल का दाम, साथ में जीएसटी और ₹10 पैकेजिंग।",
        },
      },
    ],
    hygiene: {
      heading: { en: "An open kitchen", hi: "खुली रसोई" },
      body: {
        en: "Our prep area faces the counter so you can see it. Surfaces are sanitised every two hours and oil is changed daily.",
        hi: "हमारी तैयारी की जगह काउंटर की तरफ़ खुली है, आप देख सकते हैं। हर दो घंटे में सफ़ाई और रोज़ाना तेल बदला जाता है।",
      },
    },
    fssaiNumber: STORE.fssai,
  },
  contact: {
    addressLine: {
      en: STORE.addressFull,
      hi: "बॉम्बे बाज़ार, खंडवा, मध्य प्रदेश 450001",
    },
    phone: STORE.phoneDisplay,
    whatsapp: STORE.whatsappHref,
    email: STORE.email,
  },
  social: {
    instagram: STORE.social.instagram,
    facebook: STORE.social.facebook,
  },
  seo: {
    home: {
      title: {
        en: "Quick Bites — Takeaway burgers, pizzas & coffee in Khandwa",
        hi: "क्विक बाइट्स — खंडवा में टेकअवे बर्गर, पिज़्ज़ा और कॉफ़ी",
      },
      description: {
        en: "Order takeaway from Quick Bites, Bombay Bazar, Khandwa. Ready in about 12 minutes.",
        hi: "बॉम्बे बाज़ार, खंडवा से क्विक बाइट्स का टेकअवे ऑर्डर करें। लगभग 12 मिनट में तैयार।",
      },
    },
    menu: {
      title: { en: "Menu", hi: "मेन्यू" },
      description: {
        en: "Burgers, wraps, pizzas, fries, coffee, shakes and desserts from ₹49.",
        hi: "बर्गर, रोल, पिज़्ज़ा, फ्राइज़, कॉफ़ी, शेक और मिठाई, ₹49 से।",
      },
    },
  },
  createdAt: CREATED_AT,
};

function defaultHours(): Record<Weekday, StoreSettings["hours"][Weekday]> {
  const hours = {} as Record<Weekday, StoreSettings["hours"][Weekday]>;
  for (const day of WEEKDAYS) {
    hours[day] = {
      isClosed: false,
      openTime: OPENING_HOURS.openTime,
      closeTime: OPENING_HOURS.closeTime,
    };
  }
  return hours;
}

export const SEED_STORE_SETTINGS: StoreSettings = {
  id: "store-settings",
  isOpen: true,
  acceptingOrders: true,
  hours: defaultHours(),
  holidays: [],
  basePrepBufferMinutes: ORDER_DEFAULTS.basePrepBufferMinutes,
  perActiveOrderMinutes: ORDER_DEFAULTS.perActiveOrderMinutes,
  taxRate: ORDER_DEFAULTS.taxRatePercent,
  packagingCharge: ORDER_DEFAULTS.packagingCharge,
  bookingSlotMinutes: 30,
  maxCoversPerSlot: 16,
  notificationSound: true,
  createdAt: CREATED_AT,
};
