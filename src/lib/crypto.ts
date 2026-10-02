/**
 * SHA-256 password hashing via Web Crypto.
 *
 * PROTOTYPE ONLY. A real deployment must use a slow, salted KDF (bcrypt or
 * argon2) on a server — a bare SHA-256 digest computed in the browser is not
 * password security, it only keeps plain text out of localStorage.
 */
export async function sha256Hex(input: string): Promise<string> {
  const bytes = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** Constant-time-ish comparison; adequate for a local prototype. */
export async function verifyPassword(
  password: string,
  expectedHash: string,
): Promise<boolean> {
  const actual = await sha256Hex(password);
  if (actual.length !== expectedHash.length) return false;
  let diff = 0;
  for (let i = 0; i < actual.length; i += 1) {
    diff |= actual.charCodeAt(i) ^ expectedHash.charCodeAt(i);
  }
  return diff === 0;
}
