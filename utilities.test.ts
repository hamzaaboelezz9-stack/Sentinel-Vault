import { it, expect } from "vitest";
import { createHash } from "node:crypto";
import { generate } from "../packages/crypto/generator";
import { breachCheck } from "../packages/crypto/breach";
import { importCsv } from "../packages/shared/import-csv";
import { allowedOrigin } from "../extensions/browser/src/autofill";
it("generates full-charset passwords and 88-bit eight-word passphrases; rejects invalid options", () => {
  for (let i = 0; i < 50; i++) {
    const result = generate({
      mode: "password",
      length: 24,
      lower: true,
      upper: true,
      digits: true,
      symbols: true,
    });
    expect(result.text).toHaveLength(24);
    expect(result.text).toMatch(/[a-z]/);
    expect(result.text).toMatch(/[A-Z]/);
    expect(result.text).toMatch(/[0-9]/);
    expect(result.text).toMatch(/[^a-zA-Z0-9]/);
  }
  const p = generate({ mode: "passphrase", length: 8 });
  expect(p.text.split("-")).toHaveLength(8);
  expect(p.entropyBits).toBe(88);
  expect(() => generate({ mode: "password", length: 16 })).toThrow();
  expect(() => generate({ mode: "passphrase", length: 3 })).toThrow();
});
it("sends only the five-character prefix, requests padding, ignores padded zero counts and fails closed on malformed results", async () => {
  const password = "public HIBP test secret",
    hex = createHash("sha1").update(password).digest("hex").toUpperCase();
  let request: any;
  const fetcher = async (url: any, options: any) => {
    request = { url, options };
    return new Response(hex.slice(5) + ":12\r\n" + "A".repeat(35) + ":0\r\n");
  };
  expect(await breachCheck(password, fetcher as any)).toEqual({
    status: "breached",
    count: 12,
  });
  expect(request.url).toBe(
    "https://api.pwnedpasswords.com/range/" + hex.slice(0, 5),
  );
  expect(JSON.stringify(request)).not.toContain(password);
  expect(request.options.headers["Add-Padding"]).toBe("true");
  expect(request.options.credentials).toBe("omit");
  expect(
    await breachCheck(
      password,
      (async () => new Response(hex.slice(5) + ":0")) as any,
    ),
  ).toEqual({ status: "not-found", count: 0 });
  expect(
    await breachCheck(password, (async () => new Response("malformed")) as any),
  ).toEqual({ status: "unavailable" });
  expect(
    await breachCheck(
      password,
      (async () => new Response("A".repeat(1048577))) as any,
    ),
  ).toEqual({ status: "unavailable" });
});
it("parses provider CSVs locally, preserves quoted fields and refuses duplicates or missing login data", () => {
  const bw = importCsv(
    'type,name,login_username,login_password,login_uri,notes,login_totp\n1,Example,alice,public-test,https://example.com,"one, two",public-seed\n2,Card,,,,,',
  );
  expect(bw.items).toHaveLength(1);
  expect(bw.skipped).toBe(1);
  expect(bw.items[0].notes).toContain("one, two");
  expect(bw.items[0].notes).toContain("public-seed");
  expect(
    importCsv(
      "url,username,password,extra,name,grouping,fav\nhttps://example.com,bob,public,notes,Example,Work,1",
    ).items[0].folder,
  ).toBe("Work");
  expect(
    importCsv(
      "Title,Username,Password,Website\nExample,carol,public,https://example.com",
    ).items[0].username,
  ).toBe("carol");
  expect(() => importCsv("name,username\nExample,alice")).toThrow();
  expect(() => importCsv("password,password\na,b")).toThrow();
});
it("restricts autofill and backend origins to HTTPS or loopback and rejects embedded credentials", () => {
  expect(allowedOrigin("https://example.com/login")).toBe(
    "https://example.com",
  );
  expect(allowedOrigin("http://localhost:8080")).toBe("http://localhost:8080");
  for (const value of [
    "http://example.com",
    "https://user:password@example.com",
    "javascript:alert(1)",
    "file:///tmp/example",
  ])
    expect(() => allowedOrigin(value)).toThrow();
});
