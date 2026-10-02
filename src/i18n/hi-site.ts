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
    takeawayOnly: "सिर्फ़ टेकअवे — डिलीवरी नहीं",
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
    steps: [
      {
        title: "ऑनलाइन ऑर्डर",
        body: "अपनी चीज़ें चुनिए, पसंद से बदलिए, और UPI या कार्ड से भुगतान कीजिए — या काउंटर पर दीजिए।",
      },
      {
        title: "हम ताज़ा पकाते हैं",
        body: "कुछ भी पहले से बना नहीं रहता। ऑर्डर स्वीकार होते ही रसोई बनाना शुरू करती है।",
      },
      {
        title: "गरम ले जाइए",
        body: "लाइव स्टेटस देखिए और तैयार होते ही बॉम्बे बाज़ार से ले जाइए।",
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

  menuCard: {
    add: "जोड़ें",
    soldOut: "खत्म हो गया",
    customisable: "अपनी पसंद से",
    calories: (count: number) => `${count} कैलोरी`,
    noPhotoYet: "फ़ोटो जल्द",
    viewItem: (name: string) => `${name} देखें`,
  },
};
