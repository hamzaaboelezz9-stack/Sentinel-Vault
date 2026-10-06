/** Canonical encodings prevent equivalent-but-different identifiers and envelopes. */
export function toB64(bytes: Uint8Array): string {
  let text = "";
  for (const b of bytes) text += String.fromCharCode(b);
  return btoa(text).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}
export function fromB64(text: string, expected?: number): Uint8Array {
  if (!/^[A-Za-z0-9_-]+$/.test(text) || text.length > 131072)
    throw new Error("Invalid encoded data.");
  let decoded: Uint8Array;
  try {
    decoded = Uint8Array.from(
      atob(
        text.replace(/-/g, "+").replace(/_/g, "/") +
          "=".repeat((4 - (text.length % 4)) % 4),
      ),
      (c) => c.charCodeAt(0),
    );
  } catch {
    throw new Error("Invalid encoded data.");
  }
  if (
    toB64(decoded) !== text ||
    (expected !== undefined && decoded.length !== expected)
  ) {
    decoded.fill(0);
    throw new Error("Invalid encoded data.");
  }
  return decoded;
}
export const utf8 = (text: string) => new TextEncoder().encode(text);
export const buffer = (bytes: Uint8Array) => bytes as Uint8Array<ArrayBuffer>;
export function random(size: number): Uint8Array<ArrayBuffer> {
  return crypto.getRandomValues(new Uint8Array(size));
}
export function wipe(...values: (Uint8Array | undefined)[]) {
  for (const value of values) value?.fill(0);
}
export function passwordBytes(text: string): Uint8Array<ArrayBuffer> {
  // Preserve the exact password. Reject malformed surrogate input instead of replacing it during UTF-8 encoding.
  if (
    !text ||
    !text.isWellFormed() ||
    text.length > 1024 ||
    /[\u0000-\u001f\u007f]/u.test(text)
  )
    throw new Error(
      "Use 1–1024 well-formed characters without control characters.",
    );
  return utf8(text);
}
export function context(
  vaultId: string,
  itemId: string,
  revision: number,
): Uint8Array<ArrayBuffer> {
  // Fixed-width AAD: "SVI1" (4), vault UUID (16), item UUID (16), unsigned revision (8), all binary.
  const out = new Uint8Array(44);
  out.set(utf8("SVI1"));
  for (const [id, offset] of [
    [vaultId, 4],
    [itemId, 20],
  ] as const) {
    if (
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        id,
      )
    )
      throw new Error("Invalid context.");
    const hex = id.replaceAll("-", "");
    for (let i = 0; i < 16; i++)
      out[offset + i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  if (!Number.isSafeInteger(revision) || revision < 1 || revision > 2147483647)
    throw new Error("Invalid revision.");
  new DataView(out.buffer).setBigUint64(36, BigInt(revision), false);
  return out;
}
