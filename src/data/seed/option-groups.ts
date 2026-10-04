import type { OptionGroup } from "@/types";

/*
  Option groups are shared between items rather than written out per item, so
  "Extra cheese" costs the same everywhere and the seed stays readable.
  Each builder returns a fresh object — groups carry ids that must be unique
  per item, so the item slug is mixed into them.
*/

const g = (slug: string, group: string) => `${slug}-${group}`;
const o = (slug: string, group: string, option: string) => `${slug}-${group}-${option}`;

/** Regular / Large sizing, required single-select. */
export function sizeGroup(slug: string, largeDelta: number): OptionGroup {
  return {
    id: g(slug, "size"),
    name: { en: "Size", hi: "साइज़" },
    type: "single",
    isRequired: true,
    minSelect: 1,
    maxSelect: 1,
    options: [
      {
        id: o(slug, "size", "regular"),
        name: { en: "Regular", hi: "रेगुलर" },
        priceDelta: 0,
        isAvailable: true,
      },
      {
        id: o(slug, "size", "large"),
        name: { en: "Large", hi: "लार्ज" },
        priceDelta: largeDelta,
        isAvailable: true,
      },
    ],
  };
}

/** Burger and sandwich add-ons, optional multi-select. */
export function addOnsGroup(slug: string): OptionGroup {
  return {
    id: g(slug, "addons"),
    name: { en: "Add-ons", hi: "एक्स्ट्रा" },
    type: "multi",
    isRequired: false,
    minSelect: 0,
    maxSelect: 3,
    options: [
      {
        id: o(slug, "addons", "cheese"),
        name: { en: "Extra cheese", hi: "एक्स्ट्रा चीज़" },
        priceDelta: 25,
        isAvailable: true,
      },
      {
        id: o(slug, "addons", "jalapeno"),
        name: { en: "Jalapeños", hi: "जलेपीनो" },
        priceDelta: 15,
        isAvailable: true,
      },
      {
        id: o(slug, "addons", "patty"),
        name: { en: "Extra patty", hi: "एक्स्ट्रा पैटी" },
        priceDelta: 45,
        isAvailable: true,
      },
      {
        id: o(slug, "addons", "mayo"),
        name: { en: "Peri-peri mayo", hi: "पेरी-पेरी मेयो" },
        priceDelta: 12,
        isAvailable: true,
      },
    ],
  };
}

/** Turns a single item into a meal with fries and a drink. */
export function makeItMealGroup(slug: string): OptionGroup {
  return {
    id: g(slug, "meal"),
    name: { en: "Make it a meal", hi: "मील बनाएँ" },
    type: "single",
    isRequired: false,
    minSelect: 0,
    maxSelect: 1,
    options: [
      {
        id: o(slug, "meal", "none"),
        name: { en: "No thanks", hi: "नहीं चाहिए" },
        priceDelta: 0,
        isAvailable: true,
      },
      {
        id: o(slug, "meal", "fries-drink"),
        name: { en: "Add fries & a cold drink", hi: "फ्राइज़ और कोल्ड ड्रिंक जोड़ें" },
        priceDelta: 79,
        isAvailable: true,
      },
    ],
  };
}

/** Spice level for wraps, fries and pizzas. */
export function spiceGroup(slug: string): OptionGroup {
  return {
    id: g(slug, "spice"),
    name: { en: "Spice level", hi: "तीखापन" },
    type: "single",
    isRequired: true,
    minSelect: 1,
    maxSelect: 1,
    options: [
      {
        id: o(slug, "spice", "mild"),
        name: { en: "Mild", hi: "कम तीखा" },
        priceDelta: 0,
        isAvailable: true,
      },
      {
        id: o(slug, "spice", "medium"),
        name: { en: "Medium", hi: "मध्यम" },
        priceDelta: 0,
        isAvailable: true,
      },
      {
        id: o(slug, "spice", "hot"),
        name: { en: "Extra hot", hi: "ज़्यादा तीखा" },
        priceDelta: 0,
        isAvailable: true,
      },
    ],
  };
}

/** Pizza crust choice. */
export function crustGroup(slug: string): OptionGroup {
  return {
    id: g(slug, "crust"),
    name: { en: "Crust", hi: "क्रस्ट" },
    type: "single",
    isRequired: true,
    minSelect: 1,
    maxSelect: 1,
    options: [
      {
        id: o(slug, "crust", "classic"),
        name: { en: "Classic hand-tossed", hi: "क्लासिक हैंड-टॉस्ड" },
        priceDelta: 0,
        isAvailable: true,
      },
      {
        id: o(slug, "crust", "thin"),
        name: { en: "Thin crust", hi: "थिन क्रस्ट" },
        priceDelta: 0,
        isAvailable: true,
      },
      {
        id: o(slug, "crust", "cheese-burst"),
        name: { en: "Cheese burst", hi: "चीज़ बर्स्ट" },
        priceDelta: 60,
        isAvailable: true,
      },
    ],
  };
}

/** Pizza toppings, optional multi-select. */
export function toppingsGroup(slug: string): OptionGroup {
  return {
    id: g(slug, "toppings"),
    name: { en: "Extra toppings", hi: "एक्स्ट्रा टॉपिंग" },
    type: "multi",
    isRequired: false,
    minSelect: 0,
    maxSelect: 4,
    options: [
      {
        id: o(slug, "toppings", "cheese"),
        name: { en: "Extra mozzarella", hi: "एक्स्ट्रा मोज़रेला" },
        priceDelta: 45,
        isAvailable: true,
      },
      {
        id: o(slug, "toppings", "paneer"),
        name: { en: "Paneer", hi: "पनीर" },
        priceDelta: 50,
        isAvailable: true,
      },
      {
        id: o(slug, "toppings", "corn"),
        name: { en: "Sweet corn", hi: "स्वीट कॉर्न" },
        priceDelta: 30,
        isAvailable: true,
      },
      {
        id: o(slug, "toppings", "olives"),
        name: { en: "Olives", hi: "ऑलिव" },
        priceDelta: 35,
        isAvailable: true,
      },
    ],
  };
}

/** Cup size for the coffee counter's milk drinks. */
export function cupSizeGroup(slug: string, largeDelta: number): OptionGroup {
  return {
    id: g(slug, "size"),
    name: { en: "Cup size", hi: "कप साइज़" },
    type: "single",
    isRequired: true,
    minSelect: 1,
    maxSelect: 1,
    options: [
      {
        id: o(slug, "size", "small"),
        name: { en: "Small (180ml)", hi: "स्मॉल (180ml)" },
        priceDelta: -15,
        isAvailable: true,
      },
      {
        id: o(slug, "size", "regular"),
        name: { en: "Regular (240ml)", hi: "रेगुलर (240ml)" },
        priceDelta: 0,
        isAvailable: true,
      },
      {
        id: o(slug, "size", "large"),
        name: { en: "Large (350ml)", hi: "लार्ज (350ml)" },
        priceDelta: largeDelta,
        isAvailable: true,
      },
    ],
  };
}

/** Which milk goes in it. The plant milks carry a real cost, so they cost more. */
export function milkTypeGroup(slug: string): OptionGroup {
  return {
    id: g(slug, "milk"),
    name: { en: "Milk", hi: "दूध" },
    type: "single",
    isRequired: true,
    minSelect: 1,
    maxSelect: 1,
    options: [
      {
        id: o(slug, "milk", "whole"),
        name: { en: "Whole milk", hi: "फ़ुल क्रीम दूध" },
        priceDelta: 0,
        isAvailable: true,
      },
      {
        id: o(slug, "milk", "skimmed"),
        name: { en: "Skimmed milk", hi: "टोंड दूध" },
        priceDelta: 0,
        isAvailable: true,
      },
      {
        id: o(slug, "milk", "oat"),
        name: { en: "Oat milk", hi: "ओट मिल्क" },
        priceDelta: 30,
        isAvailable: true,
      },
      {
        id: o(slug, "milk", "almond"),
        name: { en: "Almond milk", hi: "बादाम मिल्क" },
        priceDelta: 30,
        isAvailable: true,
      },
      {
        id: o(slug, "milk", "soy"),
        name: { en: "Soy milk", hi: "सोया मिल्क" },
        priceDelta: 25,
        isAvailable: true,
      },
    ],
  };
}

/** Strength. Single-select rather than multi so "two extra" is one choice. */
export function extraShotGroup(slug: string): OptionGroup {
  return {
    id: g(slug, "shot"),
    name: { en: "Extra shot", hi: "एक्स्ट्रा शॉट" },
    type: "single",
    isRequired: false,
    minSelect: 0,
    maxSelect: 1,
    options: [
      {
        id: o(slug, "shot", "none"),
        name: { en: "As it comes", hi: "जैसा है वैसा" },
        priceDelta: 0,
        isAvailable: true,
      },
      {
        id: o(slug, "shot", "one"),
        name: { en: "One extra shot", hi: "एक एक्स्ट्रा शॉट" },
        priceDelta: 30,
        isAvailable: true,
      },
      {
        id: o(slug, "shot", "two"),
        name: { en: "Two extra shots", hi: "दो एक्स्ट्रा शॉट" },
        priceDelta: 55,
        isAvailable: true,
      },
      {
        id: o(slug, "shot", "decaf"),
        name: { en: "Decaf", hi: "डीकैफ़" },
        priceDelta: 0,
        isAvailable: true,
      },
    ],
  };
}

/** How sweet. Free either way — it is a spoon of sugar, not an upsell. */
export function sugarGroup(slug: string): OptionGroup {
  return {
    id: g(slug, "sugar"),
    name: { en: "Sugar", hi: "चीनी" },
    type: "single",
    isRequired: true,
    minSelect: 1,
    maxSelect: 1,
    options: [
      {
        id: o(slug, "sugar", "none"),
        name: { en: "No sugar", hi: "बिना चीनी" },
        priceDelta: 0,
        isAvailable: true,
      },
      {
        id: o(slug, "sugar", "less"),
        name: { en: "Less sugar", hi: "कम चीनी" },
        priceDelta: 0,
        isAvailable: true,
      },
      {
        id: o(slug, "sugar", "normal"),
        name: { en: "Normal", hi: "सामान्य" },
        priceDelta: 0,
        isAvailable: true,
      },
      {
        id: o(slug, "sugar", "extra"),
        name: { en: "Extra sweet", hi: "ज़्यादा मीठा" },
        priceDelta: 0,
        isAvailable: true,
      },
    ],
  };
}
