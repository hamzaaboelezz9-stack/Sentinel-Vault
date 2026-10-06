import sodium from "libsodium-wrappers-sumo";
import { buffer, utf8, wipe } from "./bytes";
export async function breachCheck(
  password: string,
  fetcher: typeof fetch = fetch,
): Promise<{
  status: "breached" | "not-found" | "unavailable";
  count?: number;
}> {
  const bytes = utf8(password);
  let digest: Uint8Array | undefined;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10000);
  try {
    await sodium.ready;
    digest = new Uint8Array(await crypto.subtle.digest("SHA-1", buffer(bytes)));
    // SHA-1 is HIBP's lookup identifier only. It is never a storage or authentication hash.
    const hex = Array.from(digest, (b) => b.toString(16).padStart(2, "0"))
        .join("")
        .toUpperCase(),
      suffix = utf8(hex.slice(5));
    try {
      const response = await fetcher(
        "https://api.pwnedpasswords.com/range/" + hex.slice(0, 5),
        {
          headers: { "Add-Padding": "true" },
          signal: controller.signal,
          cache: "no-store",
          credentials: "omit",
          referrerPolicy: "no-referrer",
          redirect: "error",
        },
      );
      if (!response.ok || !response.body) throw new Error();
      const reader = response.body.getReader(),
        chunks: Uint8Array[] = [];
      let length = 0;
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          length += value.length;
          if (length > 1048576) throw new Error();
          chunks.push(value);
        }
      } catch (error) {
        await reader.cancel();
        throw error;
      }
      const data = new Uint8Array(length);
      let offset = 0;
      for (const chunk of chunks) {
        data.set(chunk, offset);
        offset += chunk.length;
        chunk.fill(0);
      }
      let found = 0;
      try {
        const text = new TextDecoder("utf-8", { fatal: true }).decode(data);
        for (const line of text.trim().split(/\r?\n/)) {
          const match = /^([0-9A-F]{35}):(\d{1,12})$/.exec(line);
          if (!match) throw new Error();
          const count = Number(match[2]),
            candidate = utf8(match[1]);
          if (sodium.memcmp(candidate, suffix)) found = Math.max(found, count);
          candidate.fill(0);
        }
      } finally {
        data.fill(0);
      }
      return found > 0
        ? { status: "breached", count: found }
        : { status: "not-found", count: 0 };
    } finally {
      suffix.fill(0);
    }
  } catch {
    return { status: "unavailable" };
  } finally {
    clearTimeout(timer);
    wipe(bytes, digest);
  }
}
