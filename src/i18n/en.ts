import { enCore } from "./en-core";
import { enSite } from "./en-site";

/**
 * The English dictionary, composed from the core (chrome, auth, permissions)
 * and site (marketing copy) halves. Its type is the contract every other
 * language must satisfy — see hi.ts.
 */
export const en = { ...enCore, ...enSite };

export type Dictionary = typeof en;
