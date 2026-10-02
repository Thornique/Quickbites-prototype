import type { NotificationParams } from "@/types";
import type { NotificationDictionary } from "./en-notify";

const token = (p: NotificationParams) => p.token ?? p.orderId ?? "";

/**
 * Hindi notification copy. Typed against the English dictionary, so a new
 * notification type cannot ship without its Hindi text.
 */
export const hiNotify: NotificationDictionary = {
  /* ---- Customer ------------------------------------------------------ */
  ORDER_CONFIRMED: (p) => ({
    title: `ऑर्डर ${token(p)} पक्का हो गया`,
    body: p.time
      ? `हमने बनाना शुरू कर दिया है। लगभग ${p.time} तक तैयार।`
      : "हमने बनाना शुरू कर दिया है।",
  }),
  PAYMENT_REJECTED: (p) => ({
    title: `${token(p)} का भुगतान नहीं मिला`,
    body: p.minutes
      ? `हमें आपका भुगतान नहीं मिला। ${p.minutes} मिनट में दोबारा भुगतान कीजिए, वरना ऑर्डर रद्द हो जाएगा।`
      : "हमें आपका भुगतान नहीं मिला। कृपया दोबारा भुगतान कीजिए।",
  }),
  READY_TIME_EXTENDED: (p) => ({
    title: `ऑर्डर ${token(p)} में थोड़ा और समय लगेगा`,
    body: p.time
      ? `माफ़ कीजिए — अब लगभग ${p.time} तक तैयार।`
      : `माफ़ कीजिए — लगभग ${p.minutes ?? 10} मिनट और।`,
  }),
  ORDER_PREPARING: (p) => ({
    title: `ऑर्डर ${token(p)} बन रहा है`,
    body: "आपका खाना अभी रसोई में है।",
  }),
  ORDER_READY: (p) => ({
    title: `ऑर्डर ${token(p)} तैयार है`,
    body: `काउंटर पर टोकन ${token(p)} दिखाइए।`,
  }),
  ORDER_HANDED_OVER: (p) => ({
    title: "खाने का आनंद लीजिए",
    body: `ऑर्डर ${token(p)} कैसा रहा? रेटिंग देने के लिए टैप कीजिए।`,
  }),
  ORDER_CANCELLED: (p) => ({
    title: `ऑर्डर ${token(p)} रद्द हो गया`,
    body: p.reason
      ? `${p.reason} भुगतान वापस कर दिया गया है।`
      : "भुगतान वापस कर दिया गया है।",
  }),
  SCHEDULED_REMINDER: (p) => ({
    title: "30 मिनट में पिकअप",
    body: p.time
      ? `ऑर्डर ${token(p)} ${p.time} के लिए तय है।`
      : `ऑर्डर ${token(p)} जल्द तैयार होगा।`,
  }),
  BOOKING_CONFIRMED: (p) => ({
    title: "टेबल पक्की हो गई",
    body: p.time ? `${p.time} पर मिलते हैं।` : "जल्द मिलते हैं।",
  }),
  BOOKING_CANCELLED: () => ({
    title: "टेबल बुकिंग रद्द",
    body: "आपकी बुकिंग रद्द कर दी गई है। दोबारा बुक करने के लिए कॉल कीजिए।",
  }),
  REVIEW_REPLIED: () => ({
    title: "Quick Bites ने आपकी समीक्षा का जवाब दिया",
    body: "कैफ़े ने क्या कहा, पढ़ने के लिए टैप कीजिए।",
  }),

  /* ---- Admin --------------------------------------------------------- */
  NEW_ORDER: (p) => ({
    title: `नया ऑर्डर ${token(p)}`,
    body: p.amount
      ? `₹${p.amount} · बोर्ड खोलने के लिए टैप कीजिए।`
      : "बोर्ड खोलने के लिए टैप कीजिए।",
  }),
  PAYMENT_AWAITING: (p) => ({
    title: `भुगतान जाँचना है — ${token(p)}`,
    body: p.amount
      ? `₹${p.amount} ऑनलाइन आया है। पुष्टि कीजिए।`
      : "भुगतान आया या नहीं, पुष्टि कीजिए।",
  }),
  PAYMENT_STALE: (p) => ({
    title: `${token(p)} अब भी अनजाँचा है`,
    body: `${p.minutes ?? 5}+ मिनट से इंतज़ार में। ग्राहक देख रहा है।`,
  }),
  CASH_TO_COLLECT: (p) => ({
    title: `नकद लेना है — ${token(p)}`,
    body: p.amount ? `काउंटर पर ₹${p.amount} बाकी हैं।` : "काउंटर पर भुगतान बाकी है।",
  }),
  SWITCHED_TO_ONLINE: (p) => ({
    title: `${token(p)} ऑनलाइन भुगतान पर बदल गया`,
    body: "भुगतान आते ही जाँच लीजिए।",
  }),
  SCHEDULED_DUE: (p) => ({
    title: `तय ऑर्डर ${token(p)} शुरू कीजिए`,
    body: p.time ? `${p.time} पर पिकअप है।` : "जल्द पिकअप है।",
  }),
  ORDER_OVERDUE: (p) => ({
    title: `${token(p)} में देरी हो रही है`,
    body: "वादा किया समय निकल गया। तैयार बताइए या समय बढ़ाइए।",
  }),
  TAKEAWAY_AUTO_CANCELLED: (p) => ({
    title: `${token(p)} अपने आप रद्द हो गया`,
    body: "ग्राहक ने समय पर दोबारा भुगतान नहीं किया।",
  }),
  INVENTORY_LOW: (p) => ({
    title: "स्टॉक कम हो रहा है",
    body: `${p.item ?? "एक चीज़"} तय सीमा से नीचे है।`,
  }),
  INVENTORY_OUT: (p) => ({
    title: "स्टॉक खत्म",
    body: `${p.item ?? "एक चीज़"} खत्म हो गई। जुड़े मेन्यू आइटम अब सोल्ड आउट हैं।`,
  }),
  NEW_BOOKING: (p) => ({
    title: "नई टेबल बुकिंग",
    body: p.name ? `${p.name} ने टेबल माँगी है।` : "नई टेबल बुकिंग आई है।",
  }),
  NEW_ENQUIRY: (p) => ({
    title: "नई पूछताछ",
    body: p.name ? `${p.name} ने संदेश भेजा है।` : "नया संदेश आया है।",
  }),
  NEW_REVIEW: (p) => ({
    title: "नई समीक्षा",
    body: p.rating
      ? `${p.rating} स्टार की समीक्षा मंज़ूरी के इंतज़ार में।`
      : "एक समीक्षा मंज़ूरी के इंतज़ार में है।",
  }),
};
