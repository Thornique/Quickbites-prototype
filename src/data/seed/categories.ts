import type { Category } from "@/types";

const CREATED_AT = "2026-08-01T04:30:00.000Z";

/**
 * Menu sections, in the order they appear on /menu.
 *
 * Each belongs to exactly one outlet. "Hot Coffee" moved to the coffee shop
 * when it opened — the restaurant still sells cold coffee and shakes at the
 * counter, but the espresso machine lives on Nagchun Road now.
 */
export const SEED_CATEGORIES: Category[] = [
  {
    id: "cat-burgers",
    outletId: "restaurant",
    slug: "burgers",
    name: { en: "Burgers", hi: "बर्गर" },
    description: {
      en: "Toasted buns, hot patties, made to order.",
      hi: "सिका हुआ बन, गरम पैटी, आपके ऑर्डर पर बनी।",
    },
    image: "/images/menu/chicken-cheese-burger.webp",
    sortOrder: 1,
    isActive: true,
    createdAt: CREATED_AT,
  },
  {
    id: "cat-sandwiches",
    outletId: "restaurant",
    slug: "sandwiches-wraps",
    name: { en: "Sandwiches & Wraps", hi: "सैंडविच और रोल" },
    description: {
      en: "Grilled sandwiches and kathi rolls for a quick bite.",
      hi: "जल्दी खाने के लिए ग्रिल्ड सैंडविच और काठी रोल।",
    },
    image: "/images/menu/club-sandwich.webp",
    sortOrder: 2,
    isActive: true,
    createdAt: CREATED_AT,
  },
  {
    id: "cat-pizzas",
    outletId: "restaurant",
    slug: "pizzas",
    name: { en: "Pizzas", hi: "पिज़्ज़ा" },
    description: {
      en: "Hand-stretched base, baked fresh every order.",
      hi: "हाथ से बेला बेस, हर ऑर्डर पर ताज़ा बेक।",
    },
    image: "/images/menu/farmhouse-pizza.webp",
    sortOrder: 3,
    isActive: true,
    createdAt: CREATED_AT,
  },
  {
    id: "cat-sides",
    outletId: "restaurant",
    slug: "fries-sides",
    name: { en: "Fries & Sides", hi: "फ्राइज़ और साइड्स" },
    description: {
      en: "Crispy, salty and best shared.",
      hi: "कुरकुरे, नमकीन — साथ में बाँटने के लिए।",
    },
    image: "/images/menu/classic-fries.webp",
    sortOrder: 4,
    isActive: true,
    createdAt: CREATED_AT,
  },
  {
    id: "cat-coffee",
    outletId: "coffee",
    slug: "hot-coffee",
    name: { en: "Espresso & Hot Coffee", hi: "एस्प्रेसो और गरम कॉफ़ी" },
    description: {
      en: "Freshly ground Chikmagalur beans, pulled to order.",
      hi: "ताज़ा पिसे चिकमगलूर बीन्स, ऑर्डर पर बनी।",
    },
    image: "/images/coffee/espresso.webp",
    sortOrder: 1,
    isActive: true,
    createdAt: CREATED_AT,
  },
  {
    id: "cat-cold",
    outletId: "restaurant",
    slug: "cold-beverages-shakes",
    name: { en: "Cold Beverages & Shakes", hi: "ठंडे पेय और शेक" },
    description: {
      en: "Thick shakes and cooling drinks for a Khandwa afternoon.",
      hi: "खंडवा की दोपहर के लिए गाढ़े शेक और ठंडे पेय।",
    },
    image: "/images/menu/chocolate-shake.webp",
    sortOrder: 5,
    isActive: true,
    createdAt: CREATED_AT,
  },
  {
    id: "cat-desserts",
    outletId: "restaurant",
    slug: "desserts",
    name: { en: "Desserts", hi: "मिठाई" },
    description: {
      en: "Something sweet to finish.",
      hi: "अंत में कुछ मीठा।",
    },
    image: "/images/gallery/donuts.webp",
    sortOrder: 6,
    isActive: true,
    createdAt: CREATED_AT,
  },
  {
    id: "cat-combos",
    outletId: "restaurant",
    slug: "combos-meals",
    name: { en: "Combos & Meals", hi: "कॉम्बो और मील" },
    description: {
      en: "Full meals that cost less than ordering apart.",
      hi: "पूरा खाना, अलग-अलग लेने से सस्ता।",
    },
    image: "/images/hero/burger-combo.webp",
    sortOrder: 7,
    isActive: true,
    createdAt: CREATED_AT,
  },
  {
    id: "cat-coffee-cold",
    outletId: "coffee",
    slug: "cold-coffee-frappes",
    name: { en: "Cold Coffee & Frappés", hi: "कोल्ड कॉफ़ी और फ़्रापे" },
    description: {
      en: "Shaken, blended or slow-steeped — all of it cold.",
      hi: "शेक, ब्लेंड या धीरे भिगोकर — सब ठंडा।",
    },
    image: "/images/coffee/cold-coffee.webp",
    sortOrder: 2,
    isActive: true,
    createdAt: CREATED_AT,
  },
  {
    id: "cat-coffee-tea",
    outletId: "coffee",
    slug: "tea-hot-chocolate",
    name: { en: "Tea & Hot Chocolate", hi: "चाय और हॉट चॉकलेट" },
    description: {
      en: "For everyone at the table who does not drink coffee.",
      hi: "टेबल पर उनके लिए जो कॉफ़ी नहीं पीते।",
    },
    image: "/images/coffee/green-tea.webp",
    sortOrder: 3,
    isActive: true,
    createdAt: CREATED_AT,
  },
  {
    id: "cat-coffee-bakes",
    outletId: "coffee",
    slug: "bakes-pastries",
    name: { en: "Bakes & Pastries", hi: "बेक्स और पेस्ट्री" },
    description: {
      en: "Out of the oven each morning, warmed to order.",
      hi: "हर सुबह ओवन से, ऑर्डर पर गरम।",
    },
    image: "/images/coffee/croissant.webp",
    sortOrder: 4,
    isActive: true,
    createdAt: CREATED_AT,
  },
  {
    id: "cat-coffee-bites",
    outletId: "coffee",
    slug: "savoury-bites",
    name: { en: "Savoury Bites", hi: "नमकीन स्नैक्स" },
    description: {
      en: "Grilled sandwiches and garlic bread, nothing deep-fried.",
      hi: "ग्रिल्ड सैंडविच और गार्लिक ब्रेड, कुछ भी तला नहीं।",
    },
    image: "/images/coffee/club-sandwich.webp",
    sortOrder: 5,
    isActive: true,
    createdAt: CREATED_AT,
  },
];
