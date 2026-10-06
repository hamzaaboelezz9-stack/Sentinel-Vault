/* Disposable classic worker around the pinned, unmodified reference Argon2 WASM.
 * Caller terminates it after one derivation; do not persist or log any input.
 */
"use strict";
self.loadArgon2WasmBinary = async () => {
  const response = await fetch(
    new URL("./vendor/argon2.wasm", self.location.href),
    { cache: "no-store", credentials: "omit" },
  );
  if (!response.ok) throw new Error("KDF unavailable");
  return new Uint8Array(await response.arrayBuffer());
};
self.loadArgon2WasmModule = () => {
  importScripts("./vendor/argon2.js");
  return Promise.resolve(self.Module);
};
importScripts("./vendor/argon2-api.js");
self.onmessage = async (event) => {
  const { password, salt } = event.data || {};
  if (
    !(password instanceof Uint8Array) ||
    password.length < 1 ||
    password.length > 4096 ||
    !(salt instanceof Uint8Array) ||
    salt.length !== 16
  ) {
    password?.fill?.(0);
    salt?.fill?.(0);
    self.postMessage({ error: "Invalid KDF input" });
    return;
  }
  try {
    // RFC 9106's second profile. Four lanes are NOT silently changed to the library's default of one.
    const result = await self.argon2.hash({
      pass: password,
      salt,
      mem: 65536,
      time: 3,
      parallelism: 4,
      hashLen: 32,
      type: self.argon2.ArgonType.Argon2id,
    });
    const output = result.hash;
    password.fill(0);
    salt.fill(0);
    // This worker will never derive again: overwriting the heap also removes freed password/KDF working areas.
    self.Module?.HEAPU8?.fill(0);
    self.postMessage({ output }, [output.buffer]);
  } catch {
    self.postMessage({ error: "KDF failed" });
  } finally {
    self.Module?.HEAPU8?.fill(0);
    password.fill(0);
    salt.fill(0);
  }
};
