/**
 * Deterministic PRNG (mulberry32). The demo data must be identical on every
 * machine so screenshots, the demo script and the reports all line up.
 */
export function createRandom(seed = 20261002) {
  let state = seed >>> 0;

  const next = (): number => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  return {
    next,
    /** Integer in [min, max] inclusive. */
    int(min: number, max: number): number {
      return Math.floor(next() * (max - min + 1)) + min;
    },
    /** Random element of a non-empty array. */
    pick<T>(items: readonly T[]): T {
      return items[Math.floor(next() * items.length)];
    },
    /** `count` distinct elements, or all of them when count >= length. */
    sample<T>(items: readonly T[], count: number): T[] {
      const pool = [...items];
      const out: T[] = [];
      while (out.length < count && pool.length > 0) {
        out.push(pool.splice(Math.floor(next() * pool.length), 1)[0]);
      }
      return out;
    },
    /** True with the given probability (0–1). */
    chance(probability: number): boolean {
      return next() < probability;
    },
    /** Picks an index using relative weights. */
    weighted(weights: readonly number[]): number {
      const total = weights.reduce((sum, w) => sum + w, 0);
      let roll = next() * total;
      for (let i = 0; i < weights.length; i += 1) {
        roll -= weights[i];
        if (roll <= 0) return i;
      }
      return weights.length - 1;
    },
  };
}

export type Random = ReturnType<typeof createRandom>;
