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
  services: [
    {
      id: "svc-party",
      subject: "PARTY_ORDER",
      title: { en: "Party & bulk orders", hi: "पार्टी और बल्क ऑर्डर" },
      body: {
        en: "Twenty burgers for a cricket final, fifty wraps for a college fest — give us a day's notice and the whole lot leaves the counter hot, at the same time.",
        hi: "क्रिकेट फ़ाइनल के लिए बीस बर्गर, कॉलेज फ़ेस्ट के लिए पचास रोल — एक दिन पहले बता दीजिए, पूरा ऑर्डर एक ही समय पर गरम तैयार मिलेगा।",
      },
      bullets: [
        { en: "Minimum 20 items, one day's notice", hi: "कम से कम 20 आइटम, एक दिन पहले" },
        { en: "Everything packed hot at one time", hi: "सब कुछ एक ही समय पर गरम पैक" },
        { en: "10% off above ₹5,000", hi: "₹5,000 से ऊपर 10% छूट" },
      ],
      priceNote: { en: "Menu price, 10% off above ₹5,000", hi: "मेन्यू दाम, ₹5,000 से ऊपर 10% छूट" },
      image: "/images/hero/burger-combo.jpg",
    },
    {
      id: "svc-catering",
      subject: "CATERING",
      title: { en: "Birthday & office catering", hi: "बर्थडे और ऑफ़िस कैटरिंग" },
      body: {
        en: "We bring the counter to you: a live burger and fries station for birthdays, farewells and small office parties anywhere in Khandwa.",
        hi: "हम काउंटर आपके यहाँ ले आते हैं: खंडवा में कहीं भी बर्थडे, फ़ेयरवेल और छोटी ऑफ़िस पार्टी के लिए लाइव बर्गर और फ्राइज़ स्टेशन।",
      },
      bullets: [
        { en: "25 to 200 guests", hi: "25 से 200 मेहमान" },
        { en: "Live counter or packed trays", hi: "लाइव काउंटर या पैक ट्रे" },
        { en: "Veg-only kitchen on request", hi: "कहने पर पूरी वेज रसोई" },
      ],
      priceNote: { en: "From ₹199 per guest", hi: "₹199 प्रति मेहमान से" },
      image: "/images/gallery/cafe-dining.jpg",
    },
    {
      id: "svc-corporate",
      subject: "CORPORATE_LUNCH",
      title: { en: "Corporate lunch boxes", hi: "कॉर्पोरेट लंच बॉक्स" },
      body: {
        en: "A standing daily order for your office — a rotating menu of wraps, rice bowls and a drink, delivered to your gate at a fixed time, billed monthly.",
        hi: "आपके ऑफ़िस के लिए रोज़ का तय ऑर्डर — रोल, राइस बाउल और एक ड्रिंक का बदलता मेन्यू, तय समय पर गेट तक, बिल महीने के हिसाब से।",
      },
      bullets: [
        { en: "Minimum 10 boxes a day", hi: "रोज़ कम से कम 10 बॉक्स" },
        { en: "Weekly rotating menu", hi: "हफ़्ते में बदलता मेन्यू" },
        { en: "One monthly invoice", hi: "महीने का एक बिल" },
      ],
      priceNote: { en: "₹120 per box, billed monthly", hi: "₹120 प्रति बॉक्स, महीने का बिल" },
      image: "/images/gallery/cafe-counter.jpg",
    },
  ],
  pricing: {
    intro: {
      en: "Combo prices are the same at the counter and online. Party packs need a day's notice and are paid upfront.",
      hi: "कॉम्बो के दाम काउंटर और ऑनलाइन पर एक जैसे हैं। पार्टी पैक के लिए एक दिन पहले बताना होता है और भुगतान पहले।",
    },
    partyPacks: [
      {
        id: "pack-10",
        name: { en: "Small pack", hi: "छोटा पैक" },
        people: 10,
        price: 2490,
        inclusions: [
          { en: "10 burgers of your choice", hi: "आपकी पसंद के 10 बर्गर" },
          { en: "5 large salted fries", hi: "5 लार्ज सॉल्टेड फ्राइज़" },
          { en: "10 cold drinks", hi: "10 कोल्ड ड्रिंक" },
        ],
      },
      {
        id: "pack-25",
        name: { en: "Party pack", hi: "पार्टी पैक" },
        people: 25,
        price: 5990,
        inclusions: [
          { en: "25 burgers or wraps", hi: "25 बर्गर या रोल" },
          { en: "3 large pizzas, cut into 8", hi: "3 लार्ज पिज़्ज़ा, 8 टुकड़ों में" },
          { en: "12 large fries to share", hi: "बाँटने के लिए 12 लार्ज फ्राइज़" },
          { en: "25 cold drinks", hi: "25 कोल्ड ड्रिंक" },
        ],
        isPopular: true,
      },
      {
        id: "pack-50",
        name: { en: "Big day pack", hi: "बड़े दिन का पैक" },
        people: 50,
        price: 11490,
        inclusions: [
          { en: "50 burgers or wraps", hi: "50 बर्गर या रोल" },
          { en: "6 large pizzas", hi: "6 लार्ज पिज़्ज़ा" },
          { en: "25 large fries", hi: "25 लार्ज फ्राइज़" },
          { en: "50 cold drinks or shakes", hi: "50 कोल्ड ड्रिंक या शेक" },
          { en: "Brownie tray for the table", hi: "टेबल के लिए ब्राउनी ट्रे" },
        ],
      },
    ],
    note: {
      en: "All prices include GST. Packs can be made fully vegetarian at no extra cost.",
      hi: "सभी दाम जीएसटी सहित। पैक को बिना अतिरिक्त दाम पूरी तरह शाकाहारी बनाया जा सकता है।",
    },
  },
  legal: {
    privacy: [
      {
        heading: { en: "What we keep", hi: "हम क्या रखते हैं" },
        body: {
          en: "Your name, phone number and email, so we can call you when your order is ready and send you the bill. Nothing else.",
          hi: "आपका नाम, फ़ोन नंबर और ईमेल, ताकि ऑर्डर तैयार होने पर आपको बता सकें और बिल भेज सकें। इसके अलावा कुछ नहीं।",
        },
      },
      {
        heading: { en: "Where it is stored", hi: "यह कहाँ रखा जाता है" },
        body: {
          en: "In this prototype everything stays in your own browser on this device. Clearing your browser data removes it completely.",
          hi: "इस प्रोटोटाइप में सब कुछ इसी डिवाइस पर आपके ब्राउज़र में रहता है। ब्राउज़र डेटा हटाने पर यह पूरी तरह मिट जाता है।",
        },
      },
      {
        heading: { en: "Payments", hi: "भुगतान" },
        body: {
          en: "We never see or store your card or UPI credentials. Payment in this prototype is simulated and no money moves.",
          hi: "हम आपका कार्ड या यूपीआई विवरण न देखते हैं न रखते हैं। इस प्रोटोटाइप में भुगतान नकली है, कोई पैसा नहीं जाता।",
        },
      },
      {
        heading: { en: "Who we share with", hi: "हम किसके साथ साझा करते हैं" },
        body: {
          en: "Nobody. We do not sell contact details and we do not run advertising trackers on this site.",
          hi: "किसी के साथ नहीं। हम संपर्क विवरण नहीं बेचते और इस साइट पर विज्ञापन ट्रैकर नहीं चलाते।",
        },
      },
      {
        heading: { en: "Asking us to delete it", hi: "हटाने के लिए कहना" },
        body: {
          en: "Call or WhatsApp the number on our contact page and we will remove your account and order history.",
          hi: "संपर्क पेज पर दिए नंबर पर कॉल या व्हाट्सऐप कीजिए, हम आपका खाता और ऑर्डर इतिहास हटा देंगे।",
        },
      },
    ],
    terms: [
      {
        heading: { en: "Ordering", hi: "ऑर्डर करना" },
        body: {
          en: "Takeaway orders are paid online before the kitchen starts. Dine-in may be paid online or in cash at the counter. Prices include GST; takeaway adds ₹10 packaging.",
          hi: "टेकअवे ऑर्डर का भुगतान रसोई शुरू करने से पहले ऑनलाइन होता है। डाइन-इन का भुगतान ऑनलाइन या काउंटर पर नकद। दाम जीएसटी सहित; टेकअवे पर ₹10 पैकेजिंग।",
        },
      },
      {
        heading: { en: "Ready times", hi: "तैयार होने का समय" },
        body: {
          en: "The time we show is the kitchen's best promise, set when we accept your order. On a busy evening it can move, and we will update it live rather than leave you guessing.",
          hi: "दिखाया गया समय रसोई का सबसे सही अंदाज़ा है, जो ऑर्डर स्वीकार करते समय तय होता है। व्यस्त शाम में यह बदल सकता है, और हम आपको लाइव अपडेट देंगे।",
        },
      },
      {
        heading: { en: "Cancellation & refunds", hi: "रद्द करना और रिफ़ंड" },
        body: {
          en: "You can cancel before the kitchen accepts the order and the full amount is refunded. Once cooking has started we cannot refund it. Scheduled orders can be cancelled up to an hour before the slot.",
          hi: "रसोई ऑर्डर स्वीकार करने से पहले आप रद्द कर सकते हैं और पूरी रकम वापस मिलेगी। पकना शुरू होने के बाद रिफ़ंड नहीं हो सकता। शेड्यूल ऑर्डर स्लॉट से एक घंटे पहले तक रद्द किए जा सकते हैं।",
        },
      },
      {
        heading: { en: "Uncollected orders", hi: "न लिए गए ऑर्डर" },
        body: {
          en: "A ready takeaway order is held for 45 minutes. After that it is treated as collected and no refund is due, because the food has been cooked.",
          hi: "तैयार टेकअवे ऑर्डर 45 मिनट तक रखा जाता है। उसके बाद उसे लिया हुआ माना जाता है और रिफ़ंड नहीं बनता, क्योंकि खाना बन चुका है।",
        },
      },
      {
        heading: { en: "Allergies", hi: "एलर्जी" },
        body: {
          en: "One kitchen cooks everything, so we cannot promise a dish is free of traces of nuts, dairy or gluten. Tell us at the counter and we will tell you honestly what we can do.",
          hi: "सब कुछ एक ही रसोई में बनता है, इसलिए हम यह नहीं कह सकते कि किसी चीज़ में मेवा, दूध या ग्लूटन का अंश नहीं है। काउंटर पर बताइए, हम साफ़-साफ़ बता देंगे कि क्या कर सकते हैं।",
        },
      },
    ],
    updatedOn: "2026-09-01",
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
  unpaidTakeawayTimeoutMinutes: 15,
  requirePaymentBeforePrepForCash: false,
  scheduleMinLeadMinutes: 30,
  maxOrdersPerSlot: 8,
  scheduleCancelCutoffMinutes: 60,
  verificationAlertMinutes: 5,
  notificationSound: true,
  createdAt: CREATED_AT,
};
