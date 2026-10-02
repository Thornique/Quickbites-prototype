/**
 * English/Hindi dictionaries, I18nProvider, useT() and the pick() helper for
 * {en,hi} fields coming out of the data layer.
 */

export { en, type Dictionary } from "./en";
export { hi } from "./hi";
export {
  I18nProvider,
  pick,
  useLocale,
  useNotificationCopy,
  usePick,
  useT,
} from "./provider";
export type { NotificationCopy } from "./en-notify";
