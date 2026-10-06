import {
  createHash,
  createHmac,
  randomBytes,
  timingSafeEqual,
  createCipheriv,
  createDecipheriv,
} from "node:crypto";
import * as OTPAuth from "otpauth";
import type { FastifyReply, FastifyRequest } from "fastify";
import type { Config } from "./config";
import { transaction, type Connection, type Database } from "./db";
export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
export const hash = (text: string) =>
  createHash("sha256").update(text).digest();
export const token = () => randomBytes(32).toString("base64url");
export const equal = (a: string, b: string) => {
  const x = Buffer.from(a),
    y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
};
export const validToken = (value: unknown): value is string =>
  typeof value === "string" && /^[A-Za-z0-9_-]{43}$/.test(value);
export async function audit(
  db: Database | Connection,
  userId: string | null,
  action: string,
  success = true,
  objectId: string | null = null,
) {
  // Never persist request bodies, account secrets, credential fields, URLs, tokens or raw client addresses.
  await db.query(
    "INSERT INTO audit_events(user_id,action,success,object_id) VALUES($1,$2,$3,$4)",
    [userId, action, success, objectId],
  );
}
export const cookieName = (config: Config) =>
  config.secure ? "__Host-sv_session" : "sv_session";
export const flowName = (config: Config) =>
  config.secure ? "__Host-sv_flow" : "sv_flow";
export function csrf(config: Config, sessionToken: string) {
  return createHmac("sha256", config.operationalKey)
    .update("SV-CSRF/v1\0")
    .update(sessionToken)
    .digest("base64url");
}
export function setCookie(
  reply: FastifyReply,
  config: Config,
  name: string,
  value: string,
  seconds: number,
) {
  reply.setCookie(name, value, {
    httpOnly: true,
    secure: config.secure,
    sameSite: "strict",
    path: "/",
    maxAge: seconds,
  });
}
export async function createSession(
  db: Database | Connection,
  reply: FastifyReply,
  config: Config,
  userId: string,
  device = false,
  label = "Browser",
) {
  const raw = token();
  await db.query(
    "INSERT INTO sessions(token_hash,user_id,device,label,expires_at) VALUES($1,$2,$3,$4,now()+interval '12 hours')",
    [hash(raw), userId, device, label],
  );
  if (!device) setCookie(reply, config, cookieName(config), raw, 43200);
  return { raw, csrfToken: device ? undefined : csrf(config, raw) };
}
export interface Auth {
  userId: string;
  raw: string;
  device: boolean;
  authenticatedAt: Date;
}
export async function authenticate(
  req: FastifyRequest,
  db: Database,
  config: Config,
): Promise<Auth> {
  const authorization = req.headers.authorization,
    device = !!authorization;
  const raw =
    device && authorization?.startsWith("Bearer ")
      ? authorization.slice(7)
      : req.cookies[cookieName(config)];
  if (!validToken(raw)) throw new HttpError(401, "Sign in required.");
  const { rows } = await db.query(
    "SELECT user_id,device,authenticated_at FROM sessions WHERE token_hash=$1 AND expires_at>now() AND last_seen>now()-interval '30 minutes'",
    [hash(raw)],
  );
  const session = rows[0];
  if (!session || session.device !== device)
    throw new HttpError(401, "Sign in required.");
  if (!["GET", "HEAD", "OPTIONS"].includes(req.method) && !device) {
    if (
      req.headers.origin !== config.origin ||
      typeof req.headers["x-csrf-token"] !== "string" ||
      !equal(req.headers["x-csrf-token"], csrf(config, raw))
    )
      throw new HttpError(403, "Request verification failed.");
  }
  await db.query("UPDATE sessions SET last_seen=now() WHERE token_hash=$1", [
    hash(raw),
  ]);
  return {
    userId: session.user_id,
    raw,
    device,
    authenticatedAt: new Date(session.authenticated_at),
  };
}
export function browserOnly(auth: Auth) {
  if (auth.device)
    throw new HttpError(
      403,
      "Use a browser session for account security settings.",
    );
}
export function recent(auth: Auth) {
  browserOnly(auth);
  if (Date.now() - auth.authenticatedAt.getTime() > 300000)
    throw new HttpError(
      403,
      "Sign in again before changing account security settings.",
    );
}
export async function throttle(db: Database, key: Buffer, failed = false) {
  return transaction(db, async (c) => {
    await c.query(
      "INSERT INTO auth_throttle(key_hash) VALUES($1) ON CONFLICT DO NOTHING",
      [key],
    );
    const row = (
      await c.query(
        "SELECT * FROM auth_throttle WHERE key_hash=$1 FOR UPDATE",
        [key],
      )
    ).rows[0];
    if (failed) {
      const failures = Math.min(row.failures + 1, 10),
        delay = Math.min(300, 2 ** failures);
      await c.query(
        "UPDATE auth_throttle SET failures=$2,next_allowed=now()+($3*interval '1 second'),updated_at=now() WHERE key_hash=$1",
        [key, failures, delay],
      );
      return true;
    }
    if (new Date(row.next_allowed).getTime() > Date.now()) return false;
    const fresh = Date.now() - new Date(row.window_started).getTime() > 60000,
      attempts = fresh ? 1 : row.attempts + 1;
    await c.query(
      "UPDATE auth_throttle SET attempts=$2,window_started=CASE WHEN $3 THEN now() ELSE window_started END,updated_at=now() WHERE key_hash=$1",
      [key, attempts, fresh],
    );
    return attempts <= 40;
  });
}
export const throttleKey = (config: Config, label: string) =>
  createHmac("sha256", config.operationalKey)
    .update("SV-THROTTLE/v1\0")
    .update(label)
    .digest();
export function encryptSeed(config: Config, userId: string, seed: Buffer) {
  const iv = randomBytes(12),
    cipher = createCipheriv("aes-256-gcm", config.operationalKey, iv);
  cipher.setAAD(Buffer.from("SV-TOTP/v1/" + userId));
  return Buffer.concat([
    iv,
    cipher.update(seed),
    cipher.final(),
    cipher.getAuthTag(),
  ]);
}
function decryptSeed(config: Config, userId: string, encoded: Buffer) {
  const data = Buffer.from(encoded),
    decipher = createDecipheriv(
      "aes-256-gcm",
      config.operationalKey,
      data.subarray(0, 12),
    );
  decipher.setAAD(Buffer.from("SV-TOTP/v1/" + userId));
  decipher.setAuthTag(data.subarray(-16));
  return Buffer.concat([
    decipher.update(data.subarray(12, -16)),
    decipher.final(),
  ]);
}
export function totpCounter(
  config: Config,
  userId: string,
  encrypted: Buffer,
  code: string,
): number | null {
  if (!/^\d{6}$/.test(code)) return null;
  const seed = decryptSeed(config, userId, encrypted);
  try {
    const totp = new OTPAuth.TOTP({
      algorithm: "SHA1",
      digits: 6,
      period: 30,
      secret: new OTPAuth.Secret({
        buffer: seed.buffer.slice(
          seed.byteOffset,
          seed.byteOffset + seed.byteLength,
        ),
      }),
    });
    const now = Math.floor(Date.now() / 30000);
    let match: number | null = null;
    // Always check all three allowed steps with Node's native constant-time comparison; no early matching branch exits.
    for (const delta of [-1, 0, 1])
      if (equal(totp.generate({ timestamp: (now + delta) * 30000 }), code))
        match = now + delta;
    return match;
  } finally {
    seed.fill(0);
  }
}
export function recoveryHash(code: string) {
  const normalized = code.replaceAll("-", "").toUpperCase();
  if (!/^[0-9A-F]{40}$/.test(normalized)) return null;
  return hash(normalized);
}
export async function verifySecondFactor(
  c: Connection,
  config: Config,
  userId: string,
  code: string,
  recovery = false,
) {
  if (recovery) {
    const h = recoveryHash(code);
    if (!h) return false;
    const result = await c.query(
      "UPDATE recovery_codes SET used_at=now() WHERE user_id=$1 AND code_hash=$2 AND used_at IS NULL RETURNING id",
      [userId, h],
    );
    return result.rows.length === 1;
  }
  const row = (
    await c.query(
      "SELECT * FROM two_factor WHERE user_id=$1 AND enabled=true FOR UPDATE",
      [userId],
    )
  ).rows[0];
  if (!row) return false;
  const counter = totpCounter(config, userId, row.encrypted_seed, code);
  if (counter === null || counter <= Number(row.last_counter)) return false;
  await c.query("UPDATE two_factor SET last_counter=$2 WHERE user_id=$1", [
    userId,
    counter,
  ]);
  return true;
}
