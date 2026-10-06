import { beforeAll, afterAll, it, expect } from "vitest";
import { randomBytes, randomUUID } from "node:crypto";
import * as OTPAuth from "otpauth";
import { makeApp } from "../apps/api/src/app";
import {
  hash,
  token,
  csrf,
  throttle,
  encryptSeed,
  verifySecondFactor,
} from "../apps/api/src/security";
import { transaction, type Database } from "../apps/api/src/db";
import type { Config } from "../apps/api/src/config";
import { testDatabase } from "./database";
import { fixture, item } from "./fixtures";
let db: Database, app: Awaited<ReturnType<typeof makeApp>>, a: any, b: any;
it("handles malformed JSON and unsupported media types without input echo or internal-error status", async () => {
  const invalid = await app.inject({
    method: "POST",
    url: "/api/auth/login/options",
    headers: { origin: config.origin, "content-type": "application/json" },
    payload: "{",
  });
  expect(invalid.statusCode).toBe(400);
  expect(invalid.json()).toEqual({ error: "Invalid request." });
  const type = await app.inject({
    method: "POST",
    url: "/api/auth/login/options",
    headers: { origin: config.origin, "content-type": "application/xml" },
    payload: "<synthetic-invalid-input/>",
  });
  expect(type.statusCode).toBe(415);
  expect(type.body).not.toContain("synthetic-invalid-input");
});
const config: Config = {
  origin: "http://localhost:8080",
  rpId: "localhost",
  secure: false,
  operationalKey: randomBytes(32),
  registrationToken: token(),
  trustProxy: false,
};
const headers = (user: any) => ({
  cookie: "sv_session=" + user.session,
  origin: config.origin,
  "x-csrf-token": csrf(config, user.session),
});
beforeAll(async () => {
  db = await testDatabase();
  app = await makeApp(db, config);
  for (const email of ["alice@tests.invalid", "bob@tests.invalid"]) {
    const f = await fixture(),
      id = randomUUID(),
      session = token();
    await db.query(
      "INSERT INTO users(id,email,vault_id,profile) VALUES($1,$2,$3,$4)",
      [id, email, f.vaultId, JSON.stringify(f.profile)],
    );
    await db.query(
      "INSERT INTO sessions(token_hash,user_id,expires_at) VALUES($1,$2,now()+interval '12 hours')",
      [hash(session), id],
    );
    const u = { ...f, id, session };
    if (!a) a = u;
    else b = u;
  }
});
afterAll(async () => {
  a?.vault.lock();
  b?.vault.lock();
  await app?.close();
  await db?.end();
  config.operationalKey.fill(0);
});
it("documents authentication in OpenAPI and rejects null/invalid live envelopes at the SQL boundary", async () => {
  const spec = (await app.inject({ url: "/api/openapi.json" })).json();
  expect(spec.openapi).toBe("3.0.3");
  expect(spec.paths["/api/items"].get.security).toEqual([
    { sessionCookie: [] },
    { deviceBearer: [] },
  ]);
  expect(spec.paths["/api/auth/login/options"].post.security).toBeUndefined();
  expect(JSON.stringify(spec)).not.toContain('"$schema"');
  await expect(
    db.query(
      "INSERT INTO vault_items(id,user_id,revision,envelope) VALUES($1,$2,1,NULL)",
      [randomUUID(), a.id],
    ),
  ).rejects.toThrow();
});
it("requires valid sessions, Origin and CSRF and emits strict browser security headers", async () => {
  expect((await app.inject({ url: "/api/account" })).statusCode).toBe(401);
  const profile = { profile: a.profile, expectedRevision: 1 };
  expect(
    (
      await app.inject({
        method: "PUT",
        url: "/api/account/profile",
        headers: { cookie: "sv_session=" + a.session },
        payload: profile,
      })
    ).statusCode,
  ).toBe(403);
  expect(
    (
      await app.inject({
        method: "PUT",
        url: "/api/account/profile",
        headers: { ...headers(a), origin: "https://attacker.invalid" },
        payload: profile,
      })
    ).statusCode,
  ).toBe(403);
  const res = await app.inject({ url: "/api/account", headers: headers(a) });
  expect(res.statusCode).toBe(200);
  expect(res.headers["cache-control"]).toBe("no-store");
  expect(res.headers["content-security-policy"]).toContain(
    "frame-ancestors 'none'",
  );
  expect(res.headers["content-security-policy"]).not.toContain(
    "'unsafe-inline'",
  );
  expect(res.headers["content-security-policy"]).not.toContain("'unsafe-eval'");
  expect(res.headers["x-content-type-options"]).toBe("nosniff");
});
it("accepts ciphertext only, enforces ownership and revision conflicts, and never stores plaintext credential fields", async () => {
  const id = randomUUID(),
    envelope = await a.vault.seal(id, 1, item());
  expect(
    (
      await app.inject({
        method: "PUT",
        url: "/api/items/" + id,
        headers: headers(a),
        payload: { expectedRevision: 0, envelope, password: "secret" },
      })
    ).statusCode,
  ).toBe(400);
  const saved = await app.inject({
    method: "PUT",
    url: "/api/items/" + id,
    headers: headers(a),
    payload: { expectedRevision: 0, envelope },
  });
  expect(saved.statusCode, saved.body).toBe(200);
  expect(
    (await app.inject({ url: "/api/items", headers: headers(b) })).json().items,
  ).toHaveLength(0);
  const attack = { ...envelope, vaultId: b.vaultId };
  expect(
    (
      await app.inject({
        method: "PUT",
        url: "/api/items/" + id,
        headers: headers(b),
        payload: { expectedRevision: 0, envelope: attack },
      })
    ).statusCode,
  ).toBe(409);
  expect(
    (
      await app.inject({
        method: "DELETE",
        url: "/api/items/" + id,
        headers: headers(b),
        payload: { expectedRevision: 1 },
      })
    ).statusCode,
  ).toBe(409);
  expect(
    (
      await app.inject({
        method: "PUT",
        url: "/api/items/" + id,
        headers: headers(a),
        payload: { expectedRevision: 0, envelope },
      })
    ).statusCode,
  ).toBe(409);
  const values = await db.query("SELECT envelope FROM vault_items");
  expect(JSON.stringify(values.rows)).not.toContain(item().password);
  expect(JSON.stringify(values.rows)).not.toContain(item().username);
  expect(
    (
      await app.inject({
        method: "DELETE",
        url: "/api/items/" + id,
        headers: headers(a),
        payload: { expectedRevision: 1 },
      })
    ).statusCode,
  ).toBe(200);
  const tomb = (await db.query("SELECT * FROM vault_items WHERE id=$1", [id]))
    .rows[0];
  expect(tomb.envelope).toBeNull();
  expect(tomb.revision).toBe(2);
});
it("consumes device grants once and denies account security actions to bearer devices", async () => {
  const pairing = await app.inject({
    method: "POST",
    url: "/api/devices/pairing",
    headers: headers(a),
    payload: { label: "Public test extension" },
  });
  expect(pairing.statusCode, pairing.body).toBe(200);
  const payload = { pairingToken: pairing.json().pairingToken };
  const res = await app.inject({
    method: "POST",
    url: "/api/auth/pair",
    payload,
  });
  expect(res.statusCode, res.body).toBe(200);
  expect(
    (await app.inject({ method: "POST", url: "/api/auth/pair", payload }))
      .statusCode,
  ).toBe(401);
  const authorization = "Bearer " + res.json().token;
  expect(
    (await app.inject({ url: "/api/items", headers: { authorization } }))
      .statusCode,
  ).toBe(200);
  expect(
    (
      await app.inject({
        method: "POST",
        url: "/api/account/totp/setup",
        headers: { authorization },
        payload: {},
      })
    ).statusCode,
  ).toBe(403);
  expect(
    (await db.query("SELECT token_hash FROM sessions")).rows.every(
      (r) => r.token_hash.length === 32,
    ),
  ).toBe(true);
});
it("rejects TOTP replay and atomically consumes hashed recovery codes", async () => {
  const seed = randomBytes(20),
    secret = new OTPAuth.Secret({ buffer: Uint8Array.from(seed).buffer }),
    totp = new OTPAuth.TOTP({
      algorithm: "SHA1",
      digits: 6,
      period: 30,
      secret,
    });
  await db.query(
    "INSERT INTO two_factor(user_id,encrypted_seed,enabled) VALUES($1,$2,true)",
    [b.id, encryptSeed(config, b.id, seed)],
  );
  seed.fill(0);
  const code = totp.generate();
  expect(
    await transaction(db, (c) => verifySecondFactor(c, config, b.id, code)),
  ).toBe(true);
  expect(
    await transaction(db, (c) => verifySecondFactor(c, config, b.id, code)),
  ).toBe(false);
  const raw = randomBytes(20).toString("hex").toUpperCase();
  await db.query(
    "INSERT INTO recovery_codes(id,user_id,code_hash) VALUES($1,$2,$3)",
    [randomUUID(), b.id, hash(raw)],
  );
  const results = await Promise.all([
    transaction(db, (c) => verifySecondFactor(c, config, b.id, raw, true)),
    transaction(db, (c) => verifySecondFactor(c, config, b.id, raw, true)),
  ]);
  expect(results.sort()).toEqual([false, true]);
  expect(
    JSON.stringify((await db.query("SELECT * FROM recovery_codes")).rows),
  ).not.toContain(raw);
});
it("applies persistent exponential backoff and the 40-request window", async () => {
  const key = randomBytes(32);
  expect(await throttle(db, key)).toBe(true);
  await throttle(db, key, true);
  expect(await throttle(db, key)).toBe(false);
  const first = (
    await db.query("SELECT * FROM auth_throttle WHERE key_hash=$1", [key])
  ).rows[0];
  expect(first.failures).toBe(1);
  expect(new Date(first.next_allowed).getTime() - Date.now()).toBeGreaterThan(
    1000,
  );
  const flood = randomBytes(32);
  for (let i = 0; i < 40; i++) expect(await throttle(db, flood)).toBe(true);
  expect(await throttle(db, flood)).toBe(false);
});
it("audit records contain metadata only and security actions require fresh passkey authentication", async () => {
  await db.query(
    "UPDATE sessions SET authenticated_at=now()-interval '6 minutes' WHERE token_hash=$1",
    [hash(b.session)],
  );
  expect(
    (
      await app.inject({
        method: "POST",
        url: "/api/devices/pairing",
        headers: headers(b),
        payload: { label: "Old login" },
      })
    ).statusCode,
  ).toBe(403);
  const audit = (
    await app.inject({ url: "/api/audit", headers: headers(a) })
  ).json().events;
  expect(audit.some((e: any) => e.action === "vault.item.save")).toBe(true);
  expect(JSON.stringify(audit)).not.toContain(item().password);
  expect(JSON.stringify(audit)).not.toContain(a.session);
});
