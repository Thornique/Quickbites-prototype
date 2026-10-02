import { enAdmin } from "./en-admin";
import { enCore } from "./en-core";
import { enSite } from "./en-site";

/**
 * The English dictionary, composed from the core (chrome, auth, permissions),
 * site (marketing copy) and admin (back-office) parts. Its type is the
 * contract every other language must satisfy — see hi.ts.
 */
export const en = { ...enCore, ...enSite, ...enAdmin };

export type Dictionary = typeof en;
