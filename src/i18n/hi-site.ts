import type { SiteDictionary } from "./en-site";

/**
 * Hindi — customer-site copy. Typed as `SiteDictionary` so it cannot drift
 * from English. Prices, the brand name and coupon codes stay in Latin script,
 * which is how they are read on a bill and at the counter.
 */
export const hiSite: SiteDictionary = {
  store: {
    openNow: "अभी खुला है",
    closed: "अभी बंद है",
    tillTime: (time: string) => `${time} तक`,
    opensAt: (time: string) => `${time} बजे खुलेगा`,
    pausedOrders: "अभी ऑर्डर नहीं ले रहे",
    statusLabel: "दुकान की स्थिति",
  },

  cart: {
    label: "कार्ट",
    empty: "आपका कार्ट खाली है",
    itemCount: (count: number) => (count === 1 ? "1 चीज़" : `${count} चीज़ें`),
    viewCart: "कार्ट देखें",
  },

  header: {
    skipToContent: "सीधे सामग्री पर जाएँ",
    primaryNav: "मुख्य नेविगेशन",
  },

  footer: {
    visitUs: "हमारे यहाँ आइए",
    openingHours: "खुलने का समय",
    everyDay: "रोज़ाना",
    quickLinks: "ज़रूरी लिंक",
    followUs: "हमें फ़ॉलो करें",
    callUs: "कॉल कीजिए",
    whatsapp: "व्हाट्सऐप",
    getDirections: "रास्ता देखें",
    privacy: "प्राइवेसी नीति",
    terms: "नियम",
    rights: "© Quick Bites, खंडवा",
    prototypeNote: "प्रोटोटाइप — ऑर्डर और भुगतान असली नहीं हैं।",
    fssai: (number: string) => `FSSAI लाइसेंस नं. ${number}`,
  },

  hero: {
    orderTakeaway: "टेकअवे ऑर्डर करें",
    seeMenu: "मेन्यू देखें",
    carouselLabel: "ख़ास ऑफ़र",
    previous: "पिछली स्लाइड",
    next: "अगली स्लाइड",
    goToSlide: (index: number) => `स्लाइड ${index} पर जाएँ`,
    pause: "रोकें",
    play: "चलाएँ",
  },

  ready: {
    eyebrow: "अभी",
    readyIn: (minutes: number) => `लगभग ${minutes} मिनट में तैयार`,
    closedNow: "अभी हम बंद हैं",
    opensAt: (time: string) => `${time} बजे से ऑर्डर शुरू`,
    pickUpAt: "यहाँ से लीजिए",
    addressShort: "बॉम्बे बाज़ार, खंडवा",
    dineInOrTakeaway: "टेकअवे या यहीं बैठकर — डिलीवरी नहीं",
    prepaidNote:
      "टेकअवे ऑर्डर पहले से चुकाए जाते हैं — इसलिए हम सिर्फ़ आपके लिए, ताज़ा बनाते हैं।",
    busyNow: (count: number) =>
      count === 1 ? "रसोई में 1 ऑर्डर" : `रसोई में ${count} ऑर्डर`,
  },

  categories: {
    eyebrow: "क्या खाना है?",
    title: "मेन्यू देखिए",
    description: "आठ हिस्से, 40 चीज़ें — ज़्यादातर शाकाहारी।",
    itemCount: (count: number) => (count === 1 ? "1 चीज़" : `${count} चीज़ें`),
  },

  bestsellers: {
    eyebrow: "सबसे पसंदीदा",
    title: "खंडवा क्या मंगाता है",
    description: "ये चीज़ें हमारे काउंटर से सबसे तेज़ी से जाती हैं।",
    seeAll: "पूरा मेन्यू देखें",
    scrollLeft: "बाएँ ले जाएँ",
    scrollRight: "दाएँ ले जाएँ",
  },

  offers: {
    eyebrow: "थोड़ी बचत",
    title: "चल रहे ऑफ़र",
    description: "इनमें से कोई भी चेकआउट पर लगाइए।",
    copyCode: "कोड कॉपी करें",
    copied: (code: string) => `${code} कॉपी हो गया`,
    minOrder: (amount: string) => `${amount} से ऊपर के ऑर्डर पर`,
    upTo: (amount: string) => `अधिकतम ${amount}`,
    offFlat: (amount: string) => `${amount} की छूट`,
    offPercent: (percent: number) => `${percent}% छूट`,
    noOffers: "अभी कोई ऑफ़र नहीं चल रहा",
    noOffersBody: "थोड़ी देर बाद देखिए — आमतौर पर कुछ न कुछ चलता रहता है।",
  },

  combos: {
    eyebrow: "साथ में बेहतर",
    title: "कॉम्बो मील ₹149 से",
    description: "पूरा खाना, वही चीज़ें अलग-अलग लेने से सस्ता। घर लौटते हुए ले जाइए।",
    cta: "कॉम्बो देखें",
  },

  howItWorks: {
    eyebrow: "टेकअवे कैसे काम करता है",
    title: "तीन कदम, लगभग 12 मिनट",
    note: "टेकअवे ऑर्डर पहले से चुकाए जाते हैं — इसलिए हम सिर्फ़ आपके लिए, ताज़ा बनाते हैं।",
    steps: [
      {
        title: "ऑनलाइन ऑर्डर",
        body: "टेकअवे या यहीं बैठना चुनिए, अपनी चीज़ें पसंद से बदलिए, और UPI या कार्ड से भुगतान कीजिए। यहीं बैठ रहे हों तो काउंटर पर नकद भी दे सकते हैं।",
      },
      {
        title: "हम ताज़ा पकाते हैं",
        body: "कुछ भी पहले से बना नहीं रहता। ऑर्डर पक्का होते ही रसोई शुरू कर देती है, और कितना समय लगेगा यह भी बता देती है।",
      },
      {
        title: "ले जाइए या बैठिए",
        body: "लाइव स्टेटस देखिए और तैयार होते ही बॉम्बे बाज़ार से ले जाइए — या बैठ जाइए, हम टेबल पर ले आएँगे।",
      },
    ],
  },

  reviews: {
    eyebrow: "हमारे काउंटर से",
    title: "लोग क्या कहते हैं",
    readAll: "सारी समीक्षाएँ पढ़ें",
    ratingOf: (rating: number) => `5 में से ${rating} रेटिंग`,
    averageOf: (average: number, total: number) =>
      `${total} समीक्षाओं में 5 में से ${average}`,
  },

  social: {
    eyebrow: "इंस्टाग्राम पर",
    title: "सीधे रसोई से",
    description: "नई चीज़ों और वीकेंड स्पेशल के लिए फ़ॉलो कीजिए।",
    follow: "फ़ॉलो करें",
    openPost: (caption: string) => `${caption} — नए टैब में Instagram खुलेगा`,
  },

  location: {
    eyebrow: "हम यहाँ हैं",
    title: "बॉम्बे बाज़ार, खंडवा",
    description:
      "शाम 7 बजे के बाद साइड गली में पार्किंग सबसे आसान। बस स्टैंड से दो मिनट की दूरी।",
    mapLabel: "Quick Bites, खंडवा का नक्शा",
    loadMap: "नक्शा दिखाएँ",
    mapNote: "Google Maps लोड होगा",
  },

  notifications: {
    label: "सूचनाएँ",
    open: "सूचनाएँ खोलें",
    unreadCount: (count: number) =>
      count === 1 ? "1 बिना पढ़ी सूचना" : `${count} बिना पढ़ी सूचनाएँ`,
    today: "आज",
    earlier: "पहले",
    markAllRead: "सभी पढ़ी हुई मानें",
    seeAll: "सारी सूचनाएँ देखें",
    unread: "बिना पढ़ी",
    relative: (minutes: number) => {
      if (minutes < 1) return "अभी";
      if (minutes < 60) return `${Math.round(minutes)} मिनट पहले`;
      const hours = Math.round(minutes / 60);
      return `${hours} घंटे पहले`;
    },
    emptyTitle: "कुछ नया नहीं",
    emptyBody: "ऑर्डर की जानकारी और अलर्ट यहाँ दिखेंगे।",
    title: "सूचनाएँ",
    subtitle: "आपके ऑर्डर, बुकिंग और समीक्षाओं की जानकारी।",
    adminSubtitle: "नए ऑर्डर, जाँचने वाले भुगतान और स्टॉक अलर्ट।",
    preferences: "सूचना सेटिंग्स",
    sound: "ज़रूरी अलर्ट पर आवाज़ बजाएँ",
    soundHint: "पेज पर एक बार क्लिक करने के बाद ही बजेगी।",
    browser: "ब्राउज़र सूचनाएँ दिखाएँ",
    browserHint: "यह टैब पीछे हो तब भी आपको बताएगा।",
    enableBrowser: "ब्राउज़र सूचनाएँ चालू करें?",
    enableBrowserBody: "ऑर्डर तैयार होते ही बता देंगे, चाहे यह टैब छिपा हो।",
    allow: "चालू करें",
    notNow: "अभी नहीं",
    browserBlocked: "आपके ब्राउज़र ने इस साइट की सूचनाएँ रोक रखी हैं।",
  },

  menu: {
    title: "मेन्यू",
    subtitle: "हम जो भी बनाते हैं, दोनों भाषाओं में।",
    paymentNote: "टेकअवे का भुगतान पहले ऑनलाइन · यहीं बैठें तो ऑनलाइन या काउंटर पर",
    searchLabel: "मेन्यू में खोजें",
    searchPlaceholder: "बर्गर, कॉफ़ी, पनीर खोजिए…",
    clearSearch: "खोज हटाएँ",
    filters: "फ़िल्टर",
    clearFilters: "फ़िल्टर हटाएँ",
    sortLabel: "क्रम",
    categoriesLabel: "श्रेणियाँ",
    jumpTo: (name: string) => `${name} पर जाएँ`,
    resultCount: (count: number) => (count === 1 ? "1 चीज़" : `${count} चीज़ें`),
    noResultsTitle: "इससे कुछ नहीं मिला",
    noResultsBody: "कोई और शब्द आज़माइए, या सब देखने के लिए फ़िल्टर हटाइए।",
    sort: {
      popular: "लोकप्रिय",
      priceAsc: "दाम: कम से ज़्यादा",
      priceDesc: "दाम: ज़्यादा से कम",
      name: "अ–ज्ञ",
    },
    chips: {
      vegOnly: "सिर्फ़ वेज",
      nonVeg: "नॉन-वेज",
      bestseller: "सबसे लोकप्रिय",
      new: "नया",
      spicy: "तीखा",
      under100: "₹100 से कम",
    },
  },

  closed: {
    title: "अभी हम बंद हैं",
    body: (time: string) => `मेन्यू देख सकते हैं — ऑर्डर ${time} बजे से शुरू।`,
    pausedTitle: "हमने नए ऑर्डर रोक दिए हैं",
    pausedBody: "रसोई थोड़ा पीछे चल रही है। कृपया थोड़ी देर बाद कोशिश कीजिए।",
  },

  customise: {
    title: (name: string) => `${name} अपनी पसंद से`,
    required: "ज़रूरी",
    chooseOne: "1 चुनिए",
    chooseUpTo: (max: number) => `ज़्यादा से ज़्यादा ${max} चुनिए`,
    missingRequired: (group: string) => `कृपया ${group} चुनिए।`,
    maxReached: (max: number) => `ज़्यादा से ज़्यादा ${max} ही चुन सकते हैं।`,
    notes: "रसोई के लिए कुछ कहना है?",
    notesPlaceholder: "कम तीखा, प्याज़ नहीं…",
    notesCount: (used: number, max: number) => `${used}/${max}`,
    addForPrice: (price: string) => `जोड़ें · ${price}`,
    updateForPrice: (price: string) => `बदलें · ${price}`,
    soldOutOption: "खत्म",
  },

  item: {
    backToMenu: "मेन्यू पर वापस",
    notFoundTitle: "यह चीज़ नहीं मिली",
    notFoundBody: "शायद इसका नाम बदल गया है या इसे मेन्यू से हटा दिया गया है।",
    addToCart: (price: string) => `कार्ट में जोड़ें · ${price}`,
    quantity: "मात्रा",
    about: "इस चीज़ के बारे में",
    addedToCart: (name: string) => `${name} कार्ट में जुड़ गया`,
    gallery: "आइटम की तस्वीरें",
  },

  orderType: {
    legend: "कैसे खाएँगे?",
    takeaway: "टेकअवे",
    takeawayHint: "पहले ऑनलाइन भुगतान",
    dineIn: "यहीं बैठकर",
    dineInHint: "ऑनलाइन या काउंटर पर भुगतान",
  },

  cartPage: {
    title: "आपका कार्ट",
    empty: "आपका कार्ट खाली है",
    emptyBody: "कोई बर्गर, शेक या कॉम्बो जोड़िए, यहाँ दिख जाएगा।",
    browseMenu: "मेन्यू देखें",
    subtotal: "कुल सामान",
    discount: "छूट",
    discountWithCode: (code: string) => `छूट (${code})`,
    packaging: "पैकेजिंग",
    gst: (rate: number) => `जीएसटी ${rate}%`,
    total: "कुल",
    checkout: "चेकआउट पर जाएँ",
    remove: (name: string) => `${name} हटाएँ`,
    removed: (name: string) => `${name} हटा दिया`,
    undo: "वापस लाएँ",
    suggestions: "इसके साथ अच्छा लगेगा",
  },

  coupon: {
    label: "कूपन कोड",
    placeholder: "कोई कोड है?",
    apply: "लगाएँ",
    remove: "हटाएँ",
    available: "उपलब्ध ऑफ़र",
    applied: (code: string, amount: string) => `${code} लग गया, ${amount} बचे`,
    appliedShort: "लगा है",
    invalid: "यह कोड सही नहीं है।",
    expired: "यह ऑफ़र खत्म हो चुका है।",
    notStarted: "यह ऑफ़र अभी शुरू नहीं हुआ।",
    exhausted: "यह ऑफ़र पूरा इस्तेमाल हो चुका है।",
    alreadyUsed: "आप यह ऑफ़र पहले ही ले चुके हैं।",
    noEligibleItems: "आपके कार्ट में इस ऑफ़र लायक कुछ नहीं है।",
    addMore: (amount: string) => `इसे लगाने के लिए ${amount} और जोड़िए`,
  },

  checkout: {
    title: "चेकआउट",
    pickupDetails: "पिकअप की जानकारी",
    tableDetails: "आपकी टेबल",
    name: "नाम",
    phone: "फ़ोन",
    tableNumber: "टेबल नंबर",
    tableNumberHint: "वैकल्पिक, स्टाफ़ भी भर सकता है",
    notes: "रसोई के लिए कुछ कहना है",
    notesPlaceholder: "कम तीखा, प्याज़ नहीं...",
    when: "कब चाहिए?",
    asap: "जितनी जल्दी हो सके",
    asapHint: (minutes: number) =>
      `कैफ़े के पक्का करने के बाद लगभग ${minutes} मिनट में तैयार`,
    schedule: "बाद के लिए तय करें",
    today: "आज",
    tomorrow: "कल",
    slotFull: "भरा है",
    slotPast: "निकल गया",
    slotTooSoon: "बहुत जल्दी",
    noSlots: "इस दिन के लिए कोई समय नहीं बचा।",
    payment: "भुगतान",
    payOnline: "ऑनलाइन भुगतान (UPI या कार्ड)",
    payCash: "काउंटर पर नकद",
    prepaidNote:
      "टेकअवे ऑर्डर पहले से चुकाए जाते हैं, इसलिए हम सिर्फ़ आपके लिए, ताज़ा बनाते हैं।",
    cashNote: "काउंटर पर अपना टोकन दिखाइए और लेते समय भुगतान कीजिए।",
    summary: "ऑर्डर का सार",
    editCart: "कार्ट बदलें",
    placeOrder: "ऑर्डर दें",
    continueToPayment: "भुगतान पर जाएँ",
    placing: "आपका ऑर्डर दिया जा रहा है...",
    blockedTitle: "अभी ऑर्डर बंद हैं",
  },

  pay: {
    title: "भुगतान",
    prototype: "प्रोटोटाइप, असली भुगतान नहीं लिया जाता",
    upi: "UPI",
    card: "कार्ड",
    upiId: "UPI आईडी",
    upiIdPlaceholder: "yourname@bank",
    scanHint: "किसी भी UPI ऐप से स्कैन कीजिए, या अपनी UPI आईडी लिखिए",
    cardNumber: "कार्ड नंबर",
    cardName: "कार्ड पर नाम",
    expiry: "एक्सपायरी",
    cvv: "CVV",
    payNow: (amount: string) => `${amount} भुगतान करें`,
    processing: "प्रक्रिया चल रही है...",
    failedTitle: "भुगतान नहीं हुआ",
    failedBody: "भुगतान पूरा नहीं हो सका। कोई राशि नहीं कटी है।",
    retry: "दोबारा कोशिश करें",
    backToCheckout: "चेकआउट पर वापस",
    invalidCard: "कार्ड नंबर जाँच लीजिए।",
    invalidExpiry: "एक्सपायरी तारीख़ जाँच लीजिए।",
    invalidCvv: "CVV जाँच लीजिए।",
    invalidUpi: "yourname@bank जैसी UPI आईडी लिखिए।",
  },

  confirm: {
    tokenLabel: "आपका टोकन",
    showToken: (token: string) => `काउंटर पर यह दिखाइए: ${token}`,
    awaitingVerification: "कैफ़े आपके भुगतान की पुष्टि कर रहा है",
    awaitingBody: "पुष्टि होते ही हम बनाना शुरू कर देंगे।",
    cashDue: (amount: string) => `काउंटर पर ${amount} दीजिए`,
    scheduledFor: (time: string) => `${time} के लिए तय`,
    yourOrder: "आपका ऑर्डर",
    trackOrder: "ऑर्डर ट्रैक करें",
    orderNumber: (id: string) => `ऑर्डर ${id}`,
  },

  menuCard: {
    add: "जोड़ें",
    soldOut: "खत्म हो गया",
    customisable: "अपनी पसंद से",
    calories: (count: number) => `${count} कैलोरी`,
    noPhotoYet: "फ़ोटो जल्द",
    viewItem: (name: string) => `${name} देखें`,
  },
};
