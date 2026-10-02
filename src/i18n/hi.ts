import type { Dictionary } from "./en";

/**
 * Hindi dictionary. Typed as `Dictionary`, so this file cannot drift from
 * English — a missing key fails the build.
 *
 * Written as a Khandwa cafe would actually speak, not transliterated English.
 * The brand name, order IDs and coupon codes deliberately stay in Latin script
 * because that is how customers read them on a bill and at the counter.
 */
export const hi: Dictionary = {
  common: {
    appName: "Quick Bites",
    loading: "लोड हो रहा है…",
    retry: "दोबारा कोशिश करें",
    cancel: "रद्द करें",
    save: "सेव करें",
    close: "बंद करें",
    required: "ज़रूरी",
    optional: "वैकल्पिक",
    somethingWentWrong: "कुछ गड़बड़ हो गई।",
    show: "दिखाएँ",
    hide: "छिपाएँ",
  },

  nav: {
    menu: "मेन्यू",
    offers: "ऑफ़र",
    about: "हमारे बारे में",
    gallery: "गैलरी",
    contact: "संपर्क",
    bookTable: "टेबल बुक करें",
    openMenu: "मेन्यू खोलें",
    closeMenu: "मेन्यू बंद करें",
  },

  language: {
    label: "भाषा",
    english: "EN",
    hindi: "हिं",
    switchToHindi: "हिन्दी में बदलें",
    switchToEnglish: "अंग्रेज़ी में बदलें",
  },

  account: {
    signIn: "साइन इन",
    signUp: "खाता बनाएँ",
    signOut: "लॉगआउट",
    myOrders: "मेरे ऑर्डर",
    profile: "प्रोफ़ाइल",
    accountMenu: "खाता मेन्यू",
    openAdminPanel: "एडमिन पैनल खोलें",
    greeting: (name: string) => `नमस्ते, ${name}`,
    signedInAs: (email: string) => `${email} से साइन इन हैं`,
  },

  auth: {
    loginTitle: "फिर से स्वागत है",
    loginSubtitle: "ऑर्डर करने और उसे ट्रैक करने के लिए साइन इन कीजिए।",
    loginCta: "साइन इन करें",
    noAccount: "Quick Bites पर नए हैं?",
    createOne: "खाता बनाइए",

    signupTitle: "अपना खाता बनाइए",
    signupSubtitle: "एक मिनट लगेगा। ऑर्डर करने के लिए यह ज़रूरी है।",
    signupCta: "खाता बनाएँ",
    haveAccount: "पहले से खाता है?",
    signInInstead: "साइन इन करें",

    adminTitle: "स्टाफ़ साइन-इन",
    adminSubtitle: "Quick Bites एडमिन पैनल — बॉम्बे बाज़ार, खंडवा।",
    adminCta: "एडमिन में साइन इन करें",
    backToSite: "वेबसाइट पर वापस जाएँ",

    name: "पूरा नाम",
    namePlaceholder: "जैसे रोहित वर्मा",
    email: "ईमेल",
    emailPlaceholder: "you@example.com",
    phone: "मोबाइल नंबर",
    phonePlaceholder: "10 अंकों का नंबर",
    password: "पासवर्ड",
    passwordPlaceholder: "कम से कम 8 अक्षर",
    confirmPassword: "पासवर्ड दोबारा लिखें",
    showPassword: "पासवर्ड दिखाएँ",
    hidePassword: "पासवर्ड छिपाएँ",

    signingIn: "साइन इन हो रहा है…",
    creatingAccount: "आपका खाता बन रहा है…",
    welcomeBack: (name: string) => `फिर से स्वागत है, ${name}`,
    accountCreated: "खाता बन गया। आप साइन इन हैं।",
    signedOut: "आप लॉगआउट हो गए हैं।",
  },

  validation: {
    nameRequired: "कृपया अपना नाम लिखिए।",
    nameTooShort: "यह नाम बहुत छोटा लग रहा है।",
    emailRequired: "कृपया अपना ईमेल लिखिए।",
    emailInvalid: "यह सही ईमेल नहीं लग रहा।",
    phoneRequired: "कृपया अपना मोबाइल नंबर लिखिए।",
    phoneInvalid: "6–9 से शुरू होने वाला 10 अंकों का मोबाइल नंबर लिखिए।",
    passwordRequired: "कृपया पासवर्ड लिखिए।",
    passwordTooShort: "कम से कम 8 अक्षर रखिए।",
    passwordNeedsNumber: "कम से कम एक अंक ज़रूर डालिए।",
    confirmRequired: "कृपया पासवर्ड दोबारा लिखिए।",
    passwordsDoNotMatch: "दोनों पासवर्ड मेल नहीं खा रहे।",
  },

  guard: {
    checkingAccess: "आपकी पहुँच जाँची जा रही है…",
    signInRequired: "आगे बढ़ने के लिए साइन इन कीजिए",
    signInRequiredBody: "इस पेज तक पहुँचने के लिए खाता ज़रूरी है।",
    forbiddenTitle: "इस तक आपकी पहुँच नहीं है",
    forbiddenBody: (module: string) =>
      `आपके खाते में ${module} की अनुमति नहीं है। ज़रूरत हो तो मालिक से कहिए।`,
    backToDashboard: "डैशबोर्ड पर वापस",
  },

  demo: {
    title: "डेमो खाते",
    subtitle: "सिर्फ़ प्रोटोटाइप के लिए — ये टेस्ट लॉगिन हैं, असली खाते नहीं।",
    superAdmin: "सुपर एडमिन",
    admin: "एडमिन (सीमित)",
    customer: "ग्राहक",
    fill: "इसे भरें",
    filled: "भर दिया",
  },

  admin: {
    panel: "एडमिन पैनल",
    dashboard: "डैशबोर्ड",
    signedInAs: "साइन इन हैं",
    role: "भूमिका",
    permissions: "अनुमतियाँ",
    noPermissions: "कोई मॉड्यूल अनुमति नहीं दी गई।",
    allPermissions: "हर मॉड्यूल तक पूरी पहुँच।",
    settings: "सेटिंग्स",
    staff: "स्टाफ़",
    viewSite: "वेबसाइट देखें",
  },

  roles: {
    CUSTOMER: "ग्राहक",
    ADMIN: "एडमिन",
    SUPER_ADMIN: "सुपर एडमिन",
  },

  permissions: {
    ORDERS: "ऑर्डर",
    MENU: "मेन्यू और श्रेणियाँ",
    INVENTORY: "इन्वेंटरी",
    COUPONS: "कूपन",
    CUSTOMERS: "ग्राहक",
    ENQUIRIES: "पूछताछ",
    BOOKINGS: "टेबल बुकिंग",
    CONTENT: "वेबसाइट सामग्री",
    REPORTS: "रिपोर्ट",
    SETTINGS: "सेटिंग्स",
  },
};
