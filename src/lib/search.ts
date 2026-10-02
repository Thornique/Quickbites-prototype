/**
 * Search normalisation for a bilingual menu.
 *
 * Latin combining diacritics are stripped so "jalapeno" finds "Jalapeños" and
 * "cafe" finds "Café". Devanagari marks are deliberately left alone: they are
 * also combining characters, but stripping them would turn "पनीर" into "पनर"
 * and match almost anything.
 */

/** Latin-1/Latin Extended combining accents only — U+0300 to U+036F. */
const LATIN_DIACRITICS = /[̀-ͯ]/g;

export function normalizeForSearch(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(LATIN_DIACRITICS, "")
    .normalize("NFC")
    .replace(/\s+/g, " ")
    .trim();
}

/** True when every whitespace-separated term appears somewhere in the text. */
export function matchesSearch(haystack: string, query: string): boolean {
  const text = normalizeForSearch(haystack);
  const terms = normalizeForSearch(query).split(" ").filter(Boolean);
  if (terms.length === 0) return true;
  return terms.every((term) => text.includes(term));
}
