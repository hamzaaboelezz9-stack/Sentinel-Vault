import { it, expect } from "vitest";
import { readFile } from "node:fs/promises";
import { readFileSync } from "node:fs";
import { createContext, runInContext } from "node:vm";
import { argon } from "./fixtures";
it("the shipped classic-worker WASM matches independent native Argon2id m=65536/t=3/p=4 and erases its heap", async () => {
  const root = "apps/web/public/",
    password = new TextEncoder().encode(
      "RFC-profile public integration vector",
    ),
    salt = new Uint8Array(16).fill(27),
    expected = await argon(password, salt);
  let resolve!: (value: any) => void;
  const result = new Promise<any>((r) => (resolve = r));
  const scope: any = {
    location: { href: "http://localhost/kdf-worker.js" },
    Uint8Array,
    ArrayBuffer,
    WebAssembly,
    TextEncoder,
    TextDecoder,
    Promise,
    URL,
    console: { log() {}, warn() {}, error() {} },
    setTimeout,
    clearTimeout,
    atob,
    btoa,
    postMessage: resolve,
    fetch: async () =>
      new Response(await readFile(root + "vendor/argon2.wasm")),
  };
  scope.self = scope;
  const context = createContext(scope);
  scope.importScripts = (file: string) =>
    runInContext(readFileSync(root + file.replace("./", ""), "utf8"), context);
  runInContext(await readFile(root + "kdf-worker.js", "utf8"), context);
  await scope.onmessage({ data: { password, salt } });
  const response = await result;
  expect(response.error).toBeUndefined();
  expect(response.output).toEqual(expected);
  expect(password.every((b) => b === 0)).toBe(true);
  expect(salt.every((b) => b === 0)).toBe(true);
  expect(scope.Module.HEAPU8.every((b: number) => b === 0)).toBe(true);
});
