import type { Dictionary } from "./en";
import { hiCore } from "./hi-core";
import { hiSite } from "./hi-site";

/**
 * The Hindi dictionary. Each half is typed against its English counterpart, so
 * a missing key fails the build in the file that is actually missing it.
 */
export const hi: Dictionary = { ...hiCore, ...hiSite };
