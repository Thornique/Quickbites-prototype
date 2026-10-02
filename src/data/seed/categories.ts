import type { Category } from "@/types";

const CREATED_AT = "2026-08-01T04:30:00.000Z";

/** The eight menu sections, in the order they appear on /menu. */
export const SEED_CATEGORIES: Category[] = [
  {
    id: "cat-burgers",
    slug: "burgers",
    name: { en: "Burgers", hi: "बर्गर" },
    description: {
      en: "Toasted buns, hot patties, made to order.",
      hi: "सिका हुआ बन, गरम पैटी, आपके ऑर्डर पर बनी।",
    },
    image: "/images/menu/chicken-cheese-burger.jpg",
    sortOrder: 1,
    isActive: true,
    createdAt: CREATED_AT,
  },
  {
    id: "cat-sandwiches",
    slug: "sandwiches-wraps",
    name: { en: "Sandwiches & Wraps", hi: "सैंडविच और रोल" },
    description: {
      en: "Grilled sandwiches and kathi rolls for a quick bite.",
      hi: "जल्दी खाने के लिए ग्रिल्ड सैंडविच और काठी रोल।",
    },
    image: "/images/menu/club-sandwich.jpg",
    sortOrder: 2,
    isActive: true,
    createdAt: CREATED_AT,
  },
  {
    id: "cat-pizzas",
    slug: "pizzas",
    name: { en: "Pizzas", hi: "पिज़्ज़ा" },
    description: {
      en: "Hand-stretched base, baked fresh every order.",
      hi: "हाथ से बेला बेस, हर ऑर्डर पर ताज़ा बेक।",
    },
    image: "/images/menu/farmhouse-pizza.jpg",
    sortOrder: 3,
    isActive: true,
    createdAt: CREATED_AT,
  },
  {
    id: "cat-sides",
    slug: "fries-sides",
    name: { en: "Fries & Sides", hi: "फ्राइज़ और साइड्स" },
    description: {
      en: "Crispy, salty and best shared.",
      hi: "कुरकुरे, नमकीन — साथ में बाँटने के लिए।",
    },
    image: "/images/menu/classic-fries.jpg",
    sortOrder: 4,
    isActive: true,
    createdAt: CREATED_AT,
  },
  {
    id: "cat-coffee",
    slug: "hot-coffee",
    name: { en: "Hot Coffee", hi: "गरम कॉफ़ी" },
    description: {
      en: "Freshly ground beans, pulled to order.",
      hi: "ताज़ा पिसे बीन्स, ऑर्डर पर बनी।",
    },
    image: "/images/menu/cappuccino.jpg",
    sortOrder: 5,
    isActive: true,
    createdAt: CREATED_AT,
  },
  {
    id: "cat-cold",
    slug: "cold-beverages-shakes",
    name: { en: "Cold Beverages & Shakes", hi: "ठंडे पेय और शेक" },
    description: {
      en: "Thick shakes and cooling drinks for a Khandwa afternoon.",
      hi: "खंडवा की दोपहर के लिए गाढ़े शेक और ठंडे पेय।",
    },
    image: "/images/menu/chocolate-shake.jpg",
    sortOrder: 6,
    isActive: true,
    createdAt: CREATED_AT,
  },
  {
    id: "cat-desserts",
    slug: "desserts",
    name: { en: "Desserts", hi: "मिठाई" },
    description: {
      en: "Something sweet to finish.",
      hi: "अंत में कुछ मीठा।",
    },
    image: "/images/gallery/donuts.jpg",
    sortOrder: 7,
    isActive: true,
    createdAt: CREATED_AT,
  },
  {
    id: "cat-combos",
    slug: "combos-meals",
    name: { en: "Combos & Meals", hi: "कॉम्बो और मील" },
    description: {
      en: "Full meals that cost less than ordering apart.",
      hi: "पूरा खाना, अलग-अलग लेने से सस्ता।",
    },
    image: "/images/hero/burger-combo.jpg",
    sortOrder: 8,
    isActive: true,
    createdAt: CREATED_AT,
  },
];
