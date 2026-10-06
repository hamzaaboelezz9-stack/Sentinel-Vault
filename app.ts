import Fastify, { type FastifyRequest } from "fastify";
import cookie from "@fastify/cookie";
import helmet from "@fastify/helmet";
import swagger from "@fastify/swagger";
import serveStatic from "@fastify/static";
import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} from "@simplewebauthn/server";
import { randomBytes, randomUUID } from "node:crypto";
import * as OTPAuth from "otpauth";
import { z } from "zod";
import {
  EnvelopeSchema,
  ProfileSchema,
  ShareSchema,
  uuid,
} from "../../../packages/shared/schema";
import type { Config } from "./config";
import { transaction, type Database } from "./db";
import {
  HttpError,
  audit,
  authenticate,
  browserOnly,
  recent,
  hash,
  token,
  equal,
  validToken,
  csrf,
  cookieName,
  flowName,
  setCookie,
  createSession,
  throttle,
  throttleKey,
  encryptSeed,
  totpCounter,
  verifySecondFactor,
  type Auth,
} from "./security";

declare module "fastify" {
  interface FastifyRequest {
    auth: Auth | null;
  }
}
const identifier = z.strictObject({ id: uuid });
const email = z
  .email()
  .max(254)
  .transform((v) => v.toLowerCase());
const codeBody = z.strictObject({
  code: z.string().max(80),
  recovery: z.boolean().default(false),
});
const credential = z.record(z.string(), z.unknown());
const objectResponse = { type: "object", additionalProperties: true };
const schema = (body?: z.ZodType, tags = ["Vault"]) => ({
  tags,
  ...(body
    ? {
        body: z.toJSONSchema(body, {
          unrepresentable: "any",
          target: "draft-7",
        }),
      }
    : {}),
  response: {
    200: objectResponse,
    201: objectResponse,
    400: objectResponse,
    401: objectResponse,
    403: objectResponse,
    409: objectResponse,
    429: objectResponse,
  },
});
export interface WebAuthnProvider {
  registration: typeof verifyRegistrationResponse;
  authentication: typeof verifyAuthenticationResponse;
}

export async function makeApp(
  db: Database,
  config: Config,
  provider: WebAuthnProvider = {
    registration: verifyRegistrationResponse,
    authentication: verifyAuthenticationResponse,
  },
) {
  const app = Fastify({
    logger: false,
    bodyLimit: 262144,
    trustProxy: config.trustProxy,
    ajv: { customOptions: { removeAdditional: false } },
  });
  app.decorateRequest("auth", null);
  await app.register(cookie);
  await app.register(helmet, {
    global: true,
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'none'"],
        scriptSrc: ["'self'", "'wasm-unsafe-eval'"],
        styleSrc: ["'self'"],
        imgSrc: ["'self'", "data:"],
        fontSrc: ["'self'"],
        connectSrc: ["'self'", "https://api.pwnedpasswords.com"],
        workerSrc: ["'self'"],
        manifestSrc: ["'self'"],
        baseUri: ["'none'"],
        formAction: ["'none'"],
        frameAncestors: ["'none'"],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: config.secure ? [] : null,
      },
    },
    crossOriginEmbedderPolicy: false,
  });
  await app.register(swagger, {
    transformObject: (document) => {
      const convert = (value: any): any => {
        if (Array.isArray(value)) return value.map(convert);
        if (!value || typeof value !== "object") return value;
        const next: any = {};
        for (const [key, item] of Object.entries(value))
          if (key !== "$schema" && key !== "propertyNames")
            next[key] = convert(item);
        if (Object.hasOwn(next, "const")) {
          next.enum = [next.const];
          delete next.const;
        }
        for (const edge of ["Minimum", "Maximum"]) {
          const key = "exclusive" + edge;
          if (typeof next[key] === "number") {
            next[edge.toLowerCase()] = next[key];
            next[key] = true;
          }
        }
        return next;
      };
      return convert(
        "openapiObject" in document
          ? document.openapiObject
          : document.swaggerObject,
      );
    },
    openapi: {
      openapi: "3.0.3",
      info: {
        title: "Sentinel Vault API",
        version: "0.1.0",
        description:
          "The API accepts encrypted vault envelopes only. Cookie mutations require Origin and X-CSRF-Token. Device bearer tokens are restricted to vault operations.",
      },
      components: {
        securitySchemes: {
          sessionCookie: {
            type: "apiKey",
            in: "cookie",
            name: cookieName(config),
          },
          deviceBearer: { type: "http", scheme: "bearer" },
        },
      },
    },
  });
  app.setErrorHandler((error, req, reply) => {
    if (error instanceof HttpError)
      return reply.code(error.status).send({ error: error.message });
    if (error instanceof z.ZodError || (error as any).validation)
      return reply.code(400).send({ error: "Invalid request." });
    if ((error as any).code === "23505")
      return reply
        .code(409)
        .send({ error: "Conflict. Refresh and try again." });
    // Neither request data nor exception text is logged: library errors can contain sensitive input.
    if ((error as any).statusCode === 400)
      return reply.code(400).send({ error: "Invalid request." });
    if ((error as any).statusCode === 415)
      return reply.code(415).send({ error: "Use application/json." });
    reply.code((error as any).statusCode === 413 ? 413 : 500).send({
      error:
        (error as any).statusCode === 413
          ? "Request is too large."
          : "Request could not be completed.",
    });
  });
  app.addHook("onRequest", async (req, reply) => {
    reply.header("Cache-Control", "no-store");
    reply.header("Referrer-Policy", "no-referrer");
    reply.header(
      "Permissions-Policy",
      "camera=(), microphone=(), geolocation=(), payment=()",
    );
    const origin = req.headers.origin;
    // Extension origins are not authentication: their bearer token is still required on protected routes.
    if (
      origin &&
      /^(chrome-extension|moz-extension):\/\/[A-Za-z0-9-]+$/.test(origin)
    ) {
      reply
        .header("Access-Control-Allow-Origin", origin)
        .header("Vary", "Origin");
      if (req.method === "OPTIONS")
        return reply
          .header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE")
          .header("Access-Control-Allow-Headers", "Content-Type,Authorization")
          .code(204)
          .send();
    }
    if (req.url.startsWith("/api/auth/") && req.method === "POST") {
      if (
        origin !== config.origin &&
        !req.url.startsWith("/api/auth/pair") &&
        !(req.url === "/api/auth/logout" && req.headers.authorization)
      )
        throw new HttpError(403, "Request verification failed.");
      if (!(await throttle(db, throttleKey(config, "ip:" + req.ip))))
        throw new HttpError(429, "Too many attempts. Try again later.");
    }
  });
  app.addHook("onError", async (req, _reply, error) => {
    if (
      req.auth &&
      req.url.startsWith("/api/account/totp/") &&
      error instanceof HttpError &&
      error.status === 401
    ) {
      await throttle(
        db,
        throttleKey(config, "settings:" + req.auth.userId),
        true,
      );
      await audit(db, req.auth.userId, "auth.totp.failed", false);
    }
  });
  const protect = async (req: FastifyRequest) => {
    req.auth = await authenticate(req, db, config);
    if (
      req.method !== "GET" &&
      (req.url.startsWith("/api/account/") ||
        req.url.startsWith("/api/directory/")) &&
      !(await throttle(db, throttleKey(config, "settings:" + req.auth.userId)))
    )
      throw new HttpError(429, "Too many requests. Try again later.");
  };
  app.addHook("onRoute", (options) => {
    if (options.preHandler === protect) {
      options.schema = {
        ...options.schema,
        security: [{ sessionCookie: [] }, { deviceBearer: [] }],
        headers: {
          type: "object",
          properties: {
            "x-csrf-token": {
              type: "string",
              description:
                "Required on browser-session mutations together with the canonical Origin. Device bearer requests omit it.",
            },
          },
          additionalProperties: true,
        },
      };
    }
  });
  const account = async (userId: string) => {
    const row = (
      await db.query(
        "SELECT u.*,EXISTS(SELECT 1 FROM two_factor t WHERE t.user_id=u.id AND t.enabled) AS two_factor FROM users u WHERE u.id=$1",
        [userId],
      )
    ).rows[0];
    if (!row) throw new HttpError(401, "Sign in required.");
    return {
      id: row.id,
      email: row.email,
      vaultId: row.vault_id,
      profile: row.profile,
      profileRevision: row.profile_revision,
      twoFactor: row.two_factor,
    };
  };
  async function issueFlow(
    reply: any,
    purpose: string,
    payload: unknown,
    seconds = 300,
  ) {
    const raw = token();
    await db.query(
      "INSERT INTO challenges(token_hash,purpose,payload,expires_at) VALUES($1,$2,$3,now()+($4*interval '1 second'))",
      [hash(raw), purpose, JSON.stringify(payload), seconds],
    );
    setCookie(reply, config, flowName(config), raw, seconds);
  }
  async function takeFlow(req: FastifyRequest, purpose: string) {
    const raw = req.cookies[flowName(config)];
    if (!validToken(raw)) throw new HttpError(401, "Authentication failed.");
    const row = (
      await db.query(
        "DELETE FROM challenges WHERE token_hash=$1 AND purpose=$2 AND expires_at>now() RETURNING payload",
        [hash(raw), purpose],
      )
    ).rows[0];
    if (!row) throw new HttpError(401, "Authentication failed.");
    return row.payload;
  }
  const health = { tags: ["Operations"], response: { 200: objectResponse } };
  app.get("/api/health", { schema: health }, async () => ({ status: "ok" }));
  app.get("/api/openapi.json", { schema: { hide: true } }, async () =>
    app.swagger(),
  );

  const registrationBody = z.strictObject({
    email,
    registrationToken: z.string().max(100),
  });
  app.post(
    "/api/auth/register/options",
    { schema: schema(registrationBody, ["Authentication"]) },
    async (req, reply) => {
      const body = registrationBody.parse(req.body);
      if (!equal(body.registrationToken, config.registrationToken))
        throw new HttpError(403, "Registration is not authorized.");
      const userId = randomUUID(),
        vaultId = randomUUID();
      const options = await generateRegistrationOptions({
        rpName: "Sentinel Vault",
        rpID: config.rpId,
        userName: body.email,
        userID: new TextEncoder().encode(userId),
        attestationType: "none",
        authenticatorSelection: {
          residentKey: "required",
          userVerification: "required",
        },
        supportedAlgorithmIDs: [-7, -257],
      });
      await issueFlow(reply, "register", {
        userId,
        vaultId,
        email: body.email,
        challenge: options.challenge,
      });
      return { options, userId, vaultId };
    },
  );
  const finishRegistration = z.strictObject({
    response: credential,
    profile: ProfileSchema,
  });
  app.post(
    "/api/auth/register/finish",
    { schema: schema(finishRegistration, ["Authentication"]) },
    async (req, reply) => {
      const body = finishRegistration.parse(req.body),
        flow = await takeFlow(req, "register");
      if (body.profile.vaultId !== flow.vaultId)
        throw new HttpError(400, "Invalid vault context.");
      let verified;
      try {
        verified = await provider.registration({
          response: body.response as any,
          expectedChallenge: flow.challenge,
          expectedOrigin: config.origin,
          expectedRPID: config.rpId,
          requireUserVerification: true,
        });
      } catch {
        throw new HttpError(401, "Authentication failed.");
      }
      if (!verified.verified || !verified.registrationInfo)
        throw new HttpError(401, "Authentication failed.");
      const key = verified.registrationInfo.credential;
      const session = await transaction(db, async (c) => {
        // Serialize admission so concurrent registration cannot exceed the 50-account deployment limit.
        await c.query("SELECT pg_advisory_xact_lock(7639201)");
        if (
          Number(
            (await c.query("SELECT count(*) AS n FROM users")).rows[0].n,
          ) >= 50
        )
          throw new HttpError(403, "Account limit reached.");
        await c.query(
          "INSERT INTO users(id,email,vault_id,profile) VALUES($1,$2,$3,$4)",
          [flow.userId, flow.email, flow.vaultId, JSON.stringify(body.profile)],
        );
        await c.query(
          "INSERT INTO passkeys(id,user_id,public_key,counter,transports) VALUES($1,$2,$3,$4,$5)",
          [
            key.id,
            flow.userId,
            Buffer.from(key.publicKey),
            key.counter,
            key.transports || [],
          ],
        );
        await audit(c, flow.userId, "account.register");
        return createSession(c, reply, config, flow.userId);
      });
      return {
        account: await account(flow.userId),
        csrfToken: session.csrfToken,
      };
    },
  );
  app.post(
    "/api/auth/login/options",
    { schema: schema(z.strictObject({}), ["Authentication"]) },
    async (_req, reply) => {
      // Discoverable passkeys avoid a username-existence oracle on the public login endpoint.
      const options = await generateAuthenticationOptions({
        rpID: config.rpId,
        userVerification: "required",
      });
      await issueFlow(reply, "login", { challenge: options.challenge });
      return { options };
    },
  );
  const assertionBody = z.strictObject({ response: credential });
  app.post(
    "/api/auth/login/finish",
    { schema: schema(assertionBody, ["Authentication"]) },
    async (req, reply) => {
      const body = assertionBody.parse(req.body),
        flow = await takeFlow(req, "login");
      const id = typeof body.response.id === "string" ? body.response.id : "";
      const key = (
        await db.query("SELECT * FROM passkeys WHERE id=$1", [
          id.slice(0, 1024),
        ])
      ).rows[0];
      if (!key) {
        await audit(db, null, "auth.login", false);
        throw new HttpError(401, "Authentication failed.");
      }
      const limitKey = throttleKey(config, "account:" + key.user_id);
      if (!(await throttle(db, limitKey)))
        throw new HttpError(429, "Too many attempts. Try again later.");
      let verified;
      try {
        verified = await provider.authentication({
          response: body.response as any,
          expectedChallenge: flow.challenge,
          expectedOrigin: config.origin,
          expectedRPID: config.rpId,
          credential: {
            id: key.id,
            publicKey: new Uint8Array(key.public_key),
            counter: Number(key.counter),
            transports: key.transports,
          },
          requireUserVerification: true,
        });
      } catch {
        verified = undefined;
      }
      if (!verified?.verified) {
        await throttle(db, limitKey, true);
        await audit(db, key.user_id, "auth.login", false);
        throw new HttpError(401, "Authentication failed.");
      }
      await db.query(
        "UPDATE passkeys SET counter=GREATEST(counter,$2) WHERE id=$1",
        [id, verified.authenticationInfo.newCounter],
      );
      const user = await account(key.user_id);
      if (user.twoFactor) {
        await issueFlow(reply, "second-factor", { userId: key.user_id }, 120);
        return { twoFactorRequired: true };
      }
      await db.query("DELETE FROM auth_throttle WHERE key_hash=$1", [limitKey]);
      const session = await createSession(db, reply, config, key.user_id);
      await audit(db, key.user_id, "auth.login");
      return { account: user, csrfToken: session.csrfToken };
    },
  );
  app.post(
    "/api/auth/second-factor",
    { schema: schema(codeBody, ["Authentication"]) },
    async (req, reply) => {
      const body = codeBody.parse(req.body),
        flow = await takeFlow(req, "second-factor"),
        limitKey = throttleKey(config, "account:" + flow.userId);
      if (!(await throttle(db, limitKey)))
        throw new HttpError(429, "Too many attempts. Sign in again later.");
      const valid = await transaction(db, (c) =>
        verifySecondFactor(c, config, flow.userId, body.code, body.recovery),
      );
      if (!valid) {
        await throttle(db, limitKey, true);
        await audit(db, flow.userId, "auth.second-factor", false);
        throw new HttpError(401, "Authentication failed. Sign in again.");
      }
      await db.query("DELETE FROM auth_throttle WHERE key_hash=$1", [limitKey]);
      const session = await createSession(db, reply, config, flow.userId);
      await audit(
        db,
        flow.userId,
        body.recovery ? "auth.recovery-code" : "auth.login",
      );
      return {
        account: await account(flow.userId),
        csrfToken: session.csrfToken,
      };
    },
  );
  app.get(
    "/api/account",
    { preHandler: protect, schema: schema(undefined, ["Account"]) },
    async (req) => ({
      account: await account(req.auth!.userId),
      csrfToken: req.auth!.device ? undefined : csrf(config, req.auth!.raw),
    }),
  );
  app.post(
    "/api/auth/logout",
    {
      preHandler: protect,
      schema: schema(z.strictObject({}), ["Authentication"]),
    },
    async (req, reply) => {
      await db.query("DELETE FROM sessions WHERE token_hash=$1", [
        hash(req.auth!.raw),
      ]);
      reply.clearCookie(cookieName(config), { path: "/" });
      await audit(db, req.auth!.userId, "auth.logout");
      return { ok: true };
    },
  );
  const updateProfile = z.strictObject({
    profile: ProfileSchema,
    expectedRevision: z.number().int().positive(),
  });
  app.put(
    "/api/account/profile",
    { preHandler: protect, schema: schema(updateProfile, ["Account"]) },
    async (req) => {
      browserOnly(req.auth!);
      const body = updateProfile.parse(req.body),
        current = await account(req.auth!.userId);
      if (
        body.profile.vaultId !== current.vaultId ||
        body.profile.publicKey !== current.profile.publicKey
      )
        throw new HttpError(
          400,
          "Identity changes are not permitted through this endpoint.",
        );
      const passwordChanged =
        body.profile.kdf.salt !== current.profile.kdf.salt ||
        body.profile.wrappedVaultKey !== current.profile.wrappedVaultKey;
      if (passwordChanged) recent(req.auth!);
      return transaction(db, async (c) => {
        const row = (
          await c.query(
            "UPDATE users SET profile=$2,profile_revision=profile_revision+1 WHERE id=$1 AND profile_revision=$3 RETURNING profile_revision",
            [current.id, JSON.stringify(body.profile), body.expectedRevision],
          )
        ).rows[0];
        if (!row)
          throw new HttpError(
            409,
            "Profile changed on another device. Refresh before saving.",
          );
        if (passwordChanged)
          await c.query(
            "DELETE FROM sessions WHERE user_id=$1 AND token_hash<>$2",
            [current.id, hash(req.auth!.raw)],
          );
        await audit(
          c,
          current.id,
          passwordChanged
            ? "vault.master-password.change"
            : "vault.contacts.update",
        );
        return { profileRevision: row.profile_revision };
      });
    },
  );
  app.get(
    "/api/items",
    { preHandler: protect, schema: schema() },
    async (req) => {
      const rows = (
        await db.query(
          "SELECT id,revision,deleted,envelope FROM vault_items WHERE user_id=$1 ORDER BY updated_at,id",
          [req.auth!.userId],
        )
      ).rows;
      await audit(db, req.auth!.userId, "vault.read");
      return { items: rows };
    },
  );
  const saveBody = z.strictObject({
    expectedRevision: z.number().int().min(0).max(2147483646),
    envelope: EnvelopeSchema,
  });
  app.put(
    "/api/items/:id",
    {
      preHandler: protect,
      schema: {
        ...schema(saveBody),
        params: z.toJSONSchema(identifier, { target: "draft-7" }),
      },
    },
    async (req) => {
      const { id } = identifier.parse(req.params),
        body = saveBody.parse(req.body),
        user = await account(req.auth!.userId);
      if (
        body.envelope.id !== id ||
        body.envelope.vaultId !== user.vaultId ||
        id === user.vaultId ||
        body.envelope.revision !== body.expectedRevision + 1
      )
        throw new HttpError(400, "Invalid item context.");
      return transaction(db, async (c) => {
        await c.query("SELECT id FROM users WHERE id=$1 FOR UPDATE", [user.id]);
        const existing = (
          await c.query(
            "SELECT revision,user_id,deleted FROM vault_items WHERE id=$1 FOR UPDATE",
            [id],
          )
        ).rows[0];
        if (
          existing &&
          (existing.user_id !== user.id ||
            existing.revision !== body.expectedRevision)
        )
          throw new HttpError(409, "Item conflict. Refresh before saving.");
        if (!existing && body.expectedRevision !== 0)
          throw new HttpError(409, "Item conflict. Refresh before saving.");
        if (!existing || existing.deleted) {
          const n = Number(
            (
              await c.query(
                "SELECT count(*) AS n FROM vault_items WHERE user_id=$1 AND deleted=false",
                [user.id],
              )
            ).rows[0].n,
          );
          if (n >= 1000) throw new HttpError(403, "Vault item limit reached.");
        }
        await c.query(
          "INSERT INTO vault_items(id,user_id,revision,envelope) VALUES($1,$2,$3,$4) ON CONFLICT(id) DO UPDATE SET revision=EXCLUDED.revision,envelope=EXCLUDED.envelope,deleted=false,updated_at=now()",
          [id, user.id, body.envelope.revision, JSON.stringify(body.envelope)],
        );
        await audit(c, user.id, "vault.item.save", true, id);
        return { revision: body.envelope.revision };
      });
    },
  );
  const deleteBody = z.strictObject({
    expectedRevision: z.number().int().positive().max(2147483646),
  });
  app.delete(
    "/api/items/:id",
    {
      preHandler: protect,
      schema: {
        ...schema(deleteBody),
        params: z.toJSONSchema(identifier, { target: "draft-7" }),
      },
    },
    async (req) => {
      const { id } = identifier.parse(req.params),
        body = deleteBody.parse(req.body);
      return transaction(db, async (c) => {
        const row = (
          await c.query(
            "UPDATE vault_items SET envelope=NULL,deleted=true,revision=revision+1,updated_at=now() WHERE id=$1 AND user_id=$2 AND revision=$3 AND deleted=false RETURNING revision",
            [id, req.auth!.userId, body.expectedRevision],
          )
        ).rows[0];
        if (!row)
          throw new HttpError(409, "Item conflict. Refresh before deleting.");
        await c.query("DELETE FROM shares WHERE sender_id=$1 AND item_id=$2", [
          req.auth!.userId,
          id,
        ]);
        await audit(c, req.auth!.userId, "vault.item.delete", true, id);
        return { revision: row.revision };
      });
    },
  );
  const lookup = z.strictObject({ email });
  app.post(
    "/api/directory/lookup",
    { preHandler: protect, schema: schema(lookup, ["Sharing"]) },
    async (req) => {
      const body = lookup.parse(req.body),
        row = (
          await db.query(
            "SELECT id,email,profile->>'publicKey' AS public_key FROM users WHERE email=$1",
            [body.email],
          )
        ).rows[0];
      if (!row) throw new HttpError(404, "Recipient not found.");
      return {
        user: { id: row.id, email: row.email, publicKey: row.public_key },
      };
    },
  );
  const shareBody = z.strictObject({
    recipientId: uuid,
    itemId: uuid,
    envelope: ShareSchema,
  });
  app.post(
    "/api/shares",
    { preHandler: protect, schema: schema(shareBody, ["Sharing"]) },
    async (req) => {
      const body = shareBody.parse(req.body),
        sender = await account(req.auth!.userId),
        recipient = await account(body.recipientId);
      if (
        sender.id === recipient.id ||
        body.envelope.senderPublicKey !== sender.profile.publicKey ||
        body.envelope.recipientPublicKey !== recipient.profile.publicKey ||
        body.envelope.record.id !== body.itemId ||
        body.envelope.record.vaultId !== sender.vaultId
      )
        throw new HttpError(400, "Invalid sharing context.");
      return transaction(db, async (c) => {
        const item = (
          await c.query(
            "SELECT revision FROM vault_items WHERE id=$1 AND user_id=$2 AND deleted=false FOR UPDATE",
            [body.itemId, sender.id],
          )
        ).rows[0];
        if (!item || item.revision !== body.envelope.record.revision)
          throw new HttpError(409, "Item changed. Refresh before sharing.");
        const id = randomUUID();
        const row = (
          await c.query(
            "INSERT INTO shares(id,sender_id,recipient_id,item_id,envelope) VALUES($1,$2,$3,$4,$5) ON CONFLICT(sender_id,recipient_id,item_id) DO UPDATE SET envelope=EXCLUDED.envelope,created_at=now() RETURNING id",
            [
              id,
              sender.id,
              recipient.id,
              body.itemId,
              JSON.stringify(body.envelope),
            ],
          )
        ).rows[0];
        await audit(c, sender.id, "vault.share.create", true, row.id);
        return { id: row.id };
      });
    },
  );
  app.get(
    "/api/shares",
    { preHandler: protect, schema: schema(undefined, ["Sharing"]) },
    async (req) => ({
      shares: (
        await db.query(
          "SELECT s.*,a.email AS sender_email,b.email AS recipient_email FROM shares s JOIN users a ON a.id=s.sender_id JOIN users b ON b.id=s.recipient_id WHERE s.sender_id=$1 OR s.recipient_id=$1 ORDER BY s.created_at DESC",
          [req.auth!.userId],
        )
      ).rows,
    }),
  );
  app.delete(
    "/api/shares/:id",
    {
      preHandler: protect,
      schema: {
        ...schema(z.strictObject({}), ["Sharing"]),
        params: z.toJSONSchema(identifier, { target: "draft-7" }),
      },
    },
    async (req) => {
      const { id } = identifier.parse(req.params),
        result = await db.query(
          "DELETE FROM shares WHERE id=$1 AND sender_id=$2 RETURNING id",
          [id, req.auth!.userId],
        );
      if (!result.rows.length) throw new HttpError(404, "Share not found.");
      await audit(db, req.auth!.userId, "vault.share.revoke", true, id);
      return { ok: true };
    },
  );
  app.get(
    "/api/audit",
    { preHandler: protect, schema: schema(undefined, ["Account"]) },
    async (req) => {
      browserOnly(req.auth!);
      return {
        events: (
          await db.query(
            "SELECT id,action,success,object_id,created_at FROM audit_events WHERE user_id=$1 ORDER BY id DESC LIMIT 200",
            [req.auth!.userId],
          )
        ).rows,
      };
    },
  );
  app.get(
    "/api/sessions",
    { preHandler: protect, schema: schema(undefined, ["Account"]) },
    async (req) => {
      browserOnly(req.auth!);
      return {
        sessions: (
          await db.query(
            "SELECT encode(token_hash,'hex') AS id,label,device,created_at,last_seen,expires_at FROM sessions WHERE user_id=$1 AND expires_at>now()",
            [req.auth!.userId],
          )
        ).rows,
      };
    },
  );
  const revokeParams = z.strictObject({
    id: z.string().regex(/^[0-9a-f]{64}$/),
  });
  app.delete(
    "/api/sessions/:id",
    {
      preHandler: protect,
      schema: {
        ...schema(z.strictObject({}), ["Account"]),
        params: z.toJSONSchema(revokeParams, { target: "draft-7" }),
      },
    },
    async (req) => {
      recent(req.auth!);
      const { id } = revokeParams.parse(req.params);
      await db.query(
        "DELETE FROM sessions WHERE user_id=$1 AND token_hash=$2",
        [req.auth!.userId, Buffer.from(id, "hex")],
      );
      await audit(db, req.auth!.userId, "auth.session.revoke");
      return { ok: true };
    },
  );
  const pairBody = z.strictObject({ label: z.string().min(1).max(120) });
  app.post(
    "/api/devices/pairing",
    { preHandler: protect, schema: schema(pairBody, ["Devices"]) },
    async (req) => {
      recent(req.auth!);
      const body = pairBody.parse(req.body),
        raw = token();
      await db.query(
        "INSERT INTO device_pairings(token_hash,user_id,label,expires_at) VALUES($1,$2,$3,now()+interval '5 minutes')",
        [hash(raw), req.auth!.userId, body.label],
      );
      await audit(db, req.auth!.userId, "auth.device.pairing");
      return { pairingToken: raw, expiresIn: 300 };
    },
  );
  const consumePair = z.strictObject({
    pairingToken: z.string().regex(/^[A-Za-z0-9_-]{43}$/),
  });
  app.post(
    "/api/auth/pair",
    { schema: schema(consumePair, ["Devices"]) },
    async (req, reply) => {
      const body = consumePair.parse(req.body),
        row = (
          await db.query(
            "DELETE FROM device_pairings WHERE token_hash=$1 AND expires_at>now() RETURNING user_id,label",
            [hash(body.pairingToken)],
          )
        ).rows[0];
      if (!row) throw new HttpError(401, "Pairing failed.");
      const session = await createSession(
        db,
        reply,
        config,
        row.user_id,
        true,
        row.label,
      );
      await audit(db, row.user_id, "auth.device.paired");
      return { token: session.raw, account: await account(row.user_id) };
    },
  );
  app.post(
    "/api/account/totp/setup",
    { preHandler: protect, schema: schema(z.strictObject({}), ["Two-factor"]) },
    async (req) => {
      recent(req.auth!);
      const user = await account(req.auth!.userId);
      if (user.twoFactor)
        throw new HttpError(
          409,
          "Two-factor authentication is already enabled.",
        );
      const seed = randomBytes(20),
        encrypted = encryptSeed(config, user.id, seed);
      try {
        const secret = new OTPAuth.Secret({
            buffer: seed.buffer.slice(
              seed.byteOffset,
              seed.byteOffset + seed.byteLength,
            ),
          }),
          totp = new OTPAuth.TOTP({
            issuer: "Sentinel Vault",
            label: user.email,
            algorithm: "SHA1",
            digits: 6,
            period: 30,
            secret,
          });
        await db.query(
          "INSERT INTO two_factor(user_id,encrypted_seed,pending_expires_at) VALUES($1,$2,now()+interval '5 minutes') ON CONFLICT(user_id) DO UPDATE SET encrypted_seed=EXCLUDED.encrypted_seed,pending_expires_at=EXCLUDED.pending_expires_at,last_counter=-1 WHERE two_factor.enabled=false",
          [user.id, encrypted],
        );
        return { secret: secret.base32, uri: totp.toString() };
      } finally {
        seed.fill(0);
      }
    },
  );
  app.post(
    "/api/account/totp/confirm",
    { preHandler: protect, schema: schema(codeBody, ["Two-factor"]) },
    async (req) => {
      recent(req.auth!);
      const body = codeBody.parse(req.body);
      return transaction(db, async (c) => {
        const row = (
          await c.query(
            "SELECT * FROM two_factor WHERE user_id=$1 AND enabled=false AND pending_expires_at>now() FOR UPDATE",
            [req.auth!.userId],
          )
        ).rows[0];
        const counter = row
          ? totpCounter(config, req.auth!.userId, row.encrypted_seed, body.code)
          : null;
        if (counter === null)
          throw new HttpError(401, "Invalid or expired setup code.");
        await c.query(
          "UPDATE two_factor SET enabled=true,last_counter=$2,pending_expires_at=NULL WHERE user_id=$1",
          [req.auth!.userId, counter],
        );
        await c.query("DELETE FROM recovery_codes WHERE user_id=$1", [
          req.auth!.userId,
        ]);
        const codes: string[] = [];
        for (let i = 0; i < 10; i++) {
          const raw = randomBytes(20).toString("hex").toUpperCase();
          codes.push(raw.match(/.{1,8}/g)!.join("-"));
          await c.query(
            "INSERT INTO recovery_codes(id,user_id,code_hash) VALUES($1,$2,$3)",
            [randomUUID(), req.auth!.userId, hash(raw)],
          );
        }
        await c.query(
          "DELETE FROM sessions WHERE user_id=$1 AND token_hash<>$2",
          [req.auth!.userId, hash(req.auth!.raw)],
        );
        await audit(c, req.auth!.userId, "auth.totp.enabled");
        return { recoveryCodes: codes };
      });
    },
  );
  app.post(
    "/api/account/totp/disable",
    { preHandler: protect, schema: schema(codeBody, ["Two-factor"]) },
    async (req) => {
      recent(req.auth!);
      const body = codeBody.parse(req.body);
      return transaction(db, async (c) => {
        if (
          !(await verifySecondFactor(
            c,
            config,
            req.auth!.userId,
            body.code,
            body.recovery,
          ))
        )
          throw new HttpError(401, "Authentication failed.");
        await c.query("DELETE FROM two_factor WHERE user_id=$1", [
          req.auth!.userId,
        ]);
        await c.query("DELETE FROM recovery_codes WHERE user_id=$1", [
          req.auth!.userId,
        ]);
        await audit(c, req.auth!.userId, "auth.totp.disabled");
        return { ok: true };
      });
    },
  );
  app.post(
    "/api/account/passkeys/options",
    {
      preHandler: protect,
      schema: schema(z.strictObject({}), ["Authentication"]),
    },
    async (req, reply) => {
      recent(req.auth!);
      const user = await account(req.auth!.userId),
        keys = (
          await db.query(
            "SELECT id,transports FROM passkeys WHERE user_id=$1",
            [user.id],
          )
        ).rows;
      const options = await generateRegistrationOptions({
        rpName: "Sentinel Vault",
        rpID: config.rpId,
        userName: user.email,
        userID: new TextEncoder().encode(user.id),
        attestationType: "none",
        excludeCredentials: keys,
        authenticatorSelection: {
          residentKey: "required",
          userVerification: "required",
        },
      });
      await issueFlow(reply, "add-passkey", {
        userId: user.id,
        challenge: options.challenge,
      });
      return { options };
    },
  );
  app.post(
    "/api/account/passkeys/finish",
    { preHandler: protect, schema: schema(assertionBody, ["Authentication"]) },
    async (req) => {
      recent(req.auth!);
      const body = assertionBody.parse(req.body),
        flow = await takeFlow(req, "add-passkey");
      if (flow.userId !== req.auth!.userId)
        throw new HttpError(403, "Authentication failed.");
      let result;
      try {
        result = await provider.registration({
          response: body.response as any,
          expectedChallenge: flow.challenge,
          expectedOrigin: config.origin,
          expectedRPID: config.rpId,
          requireUserVerification: true,
        });
      } catch {
        throw new HttpError(401, "Authentication failed.");
      }
      if (!result.verified || !result.registrationInfo)
        throw new HttpError(401, "Authentication failed.");
      const key = result.registrationInfo.credential;
      await db.query(
        "INSERT INTO passkeys(id,user_id,public_key,counter,transports) VALUES($1,$2,$3,$4,$5)",
        [
          key.id,
          flow.userId,
          Buffer.from(key.publicKey),
          key.counter,
          key.transports || [],
        ],
      );
      await audit(db, flow.userId, "auth.passkey.add");
      return { ok: true };
    },
  );
  if (config.staticDir) {
    await app.register(serveStatic, {
      root: config.staticDir,
      decorateReply: true,
    });
    app.setNotFoundHandler((req, reply) =>
      req.url.startsWith("/api/")
        ? reply.code(404).send({ error: "Not found." })
        : reply.code(404).send({ error: "Page not found." }),
    );
  }
  await app.ready();
  return app;
}
