import { utf8 } from "../../../packages/crypto/bytes";
let timer: ReturnType<typeof setTimeout> | undefined;
export async function copySecret(
  value: string,
  notify: (message: string) => void,
) {
  if (!navigator.clipboard)
    throw new Error("Clipboard unavailable. Use HTTPS or localhost.");
  clearTimeout(timer);
  const key = await crypto.subtle.generateKey(
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign", "verify"],
    ),
    bytes = utf8(value);
  let tag: ArrayBuffer;
  try {
    tag = await crypto.subtle.sign("HMAC", key, bytes);
    await navigator.clipboard.writeText(value);
  } finally {
    bytes.fill(0);
  }
  notify("Copied. Automatic clearing will be attempted in 30 seconds.");
  timer = setTimeout(async () => {
    try {
      const current = utf8(await navigator.clipboard.readText());
      let matches: boolean;
      try {
        matches = await crypto.subtle.verify("HMAC", key, tag, current);
      } finally {
        current.fill(0);
      }
      // Do not overwrite something the user copied afterwards. Browser permission restrictions are reported honestly.
      if (matches) await navigator.clipboard.writeText("");
      notify(
        matches
          ? "Clipboard cleared."
          : "Clipboard changed; your newer content was left intact.",
      );
    } catch {
      notify(
        "Automatic clipboard clearing was blocked. Clear it manually if needed.",
      );
    } finally {
      new Uint8Array(tag).fill(0);
    }
  }, 30000);
}
