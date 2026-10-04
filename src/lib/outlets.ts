import type { Outlet, OutletId } from "@/types";
import { OUTLET_IDS } from "@/types";

/**
 * Static facts about the two outlets.
 *
 * Anything the admin can edit at runtime — hours, holidays, prep config, tax,
 * packaging, payment and scheduling rules — lives in that outlet's
 * StoreSettings record. This file holds only what is fixed for the prototype.
 */
export const OUTLETS: Record<OutletId, Outlet> = {
  restaurant: {
    id: "restaurant",
    name: { en: "Quick Bites", hi: "क्विक बाइट्स" },
    shortName: { en: "Restaurant", hi: "रेस्टोरेंट" },
    accentToken: "--color-brand-restaurant",
    address: {
      en: "Bombay Bazar, Khandwa, Madhya Pradesh 450001",
      hi: "बॉम्बे बाज़ार, खंडवा, मध्य प्रदेश 450001",
    },
    phone: "+91 99999 00000",
    tokenPrefix: "A",
  },
  coffee: {
    id: "coffee",
    name: { en: "Quick Bites Coffee", hi: "क्विक बाइट्स कॉफ़ी" },
    shortName: { en: "Coffee", hi: "कॉफ़ी" },
    accentToken: "--color-brand-coffee",
    address: {
      en: "Nagchun Road, near Civil Lines, Khandwa, Madhya Pradesh 450001",
      hi: "नागचून रोड, सिविल लाइन्स के पास, खंडवा, मध्य प्रदेश 450001",
    },
    phone: "+91 99999 00011",
    tokenPrefix: "C",
  },
};

export const OUTLET_LIST: Outlet[] = OUTLET_IDS.map((id) => OUTLETS[id]);

export const DEFAULT_OUTLET_ID: OutletId = "restaurant";

export function getOutlet(id: OutletId): Outlet {
  return OUTLETS[id];
}

/** Dialable form of an outlet's phone number, for tel: links. */
export function outletPhoneHref(id: OutletId): string {
  return `+${OUTLETS[id].phone.replace(/\D/g, "")}`;
}

/** Extra per-outlet facts the contact and about pages need. */
export const OUTLET_DETAILS: Record<
  OutletId,
  { hoursLabel: { en: string; hi: string }; mapsUrl: string; wordmark: string }
> = {
  restaurant: {
    hoursLabel: {
      en: "10:00 AM – 11:00 PM, all days",
      hi: "सुबह 10:00 – रात 11:00, रोज़",
    },
    mapsUrl:
      "https://www.google.com/maps/search/?api=1&query=Bombay+Bazar%2C+Khandwa%2C+Madhya+Pradesh+450001",
    wordmark: "QUICK BITES",
  },
  coffee: {
    hoursLabel: {
      en: "7:30 AM – 10:30 PM, all days",
      hi: "सुबह 7:30 – रात 10:30, रोज़",
    },
    mapsUrl:
      "https://www.google.com/maps/search/?api=1&query=Nagchun+Road%2C+Khandwa%2C+Madhya+Pradesh+450001",
    wordmark: "QUICK BITES COFFEE",
  },
};
