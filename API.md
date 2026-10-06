# API guide

Base URL is the same canonical origin as the web app, with `/api`. The machine-readable [OpenAPI 3.0.3 document](openapi.json) is generated from registered routes and served at `/api/openapi.json`. Request schemas are strict: unknown JSON fields are rejected. Runtime Zod performs the format/context refinements that JSON Schema cannot express. OpenAPI responses are intentionally generic objects; the exact encrypted domain types are in `packages/shared/schema.ts`, and route response fields are documented below.

## Authentication and request rules

- Browser sessions: `HttpOnly; SameSite=Strict; Path=/; Secure` in HTTPS deployments. Cookie name `__Host-sv_session`; local loopback HTTP uses `sv_session`. Authentication flow cookie follows the same policy.
- Browser mutations: canonical `Origin` and `X-CSRF-Token`, retrieved by signed-in `/account`. CSRF exists only in UI memory and is HMAC-bound to the current session. Account-authentication challenge endpoints require Origin even before login; no password-based login endpoint exists.
- Extension requests: `Authorization: Bearer <32-byte random base64url device token>`, obtained once by pairing. No cookies and no CSRF header; server checks that the session is a device session. Extension CORS origins are not authentication. Devices cannot change master profile, factors/passkeys, read account audit/session inventory or create grants.
- Session expiry: 12-hour absolute maximum and 30-minute API inactivity; security changes need a browser login within 5 minutes. Local vault locking is independent.
- Authentication IP limit: 40 requests/minute; account failed verification backs off 2, 4, 8… seconds capped at 300 seconds. Settings/directory mutation rate limits and failed TOTP-settings backoff also apply. Origin/CSRF/auth failures are generic and do not log request bodies.
- JSON bodies are limited to 256 KiB. No plaintext credential fields are accepted anywhere in vault item/share/profile write requests.

## Endpoints

| Method/path | Access | Request / response |
|---|---|---|
| GET `/health` | Public | `{status:"ok"}`; process readiness after schema migration |
| GET `/openapi.json` | Public | Route-generated specification |
| POST `/auth/register/options` | Origin + invitation | `{email,registrationToken}` → `{options,userId,vaultId}` + flow cookie |
| POST `/auth/register/finish` | Origin + one-use flow | `{response:WebAuthnRegistration,profile}` → `{account,csrfToken}` + session cookie |
| POST `/auth/login/options` | Origin | `{}` → discoverable passkey `{options}` + flow cookie |
| POST `/auth/login/finish` | Origin + one-use flow | `{response:WebAuthnAssertion}` → `{account,csrfToken}` or `{twoFactorRequired:true}` |
| POST `/auth/second-factor` | Origin + pending passkey flow | `{code,recovery:boolean}` → `{account,csrfToken}`; a bad code consumes the flow, requiring a new passkey login |
| POST `/auth/logout` | Session/CSRF or device | `{}` → `{ok:true}`; deletes current session |
| GET `/account` | Authenticated | `{account,csrfToken}`; device response omits CSRF |
| PUT `/account/profile` | Browser; fresh if password changed | `{profile,expectedRevision}` → `{profileRevision}`; identity public key and vault ID cannot change |
| GET `/items` | Authenticated | `{items:[{id,revision,deleted,envelope}]}`; tombstones have null envelope |
| PUT `/items/:id` | Authenticated | `{expectedRevision,envelope}` → `{revision}`; item ID, owner/vault context and next revision must match |
| DELETE `/items/:id` | Authenticated | `{expectedRevision}` → `{revision}`; tombstone + share revocation |
| POST `/directory/lookup` | Authenticated | `{email}` → `{user:{id,email,publicKey}}`; key still requires independent verification |
| POST `/shares` | Authenticated | `{recipientId,itemId,envelope:Share}` → `{id}`; current sender/recipient keys and item revision checked |
| GET `/shares` | Authenticated | `{shares}` of own sent/received snapshots, IDs and parties' emails |
| DELETE `/shares/:id` | Sender | `{}` → `{ok:true}`; recipient copies remain accessible |
| GET `/audit` | Browser | `{events}`; latest 200 own metadata events |
| GET `/sessions` | Browser | `{sessions}`; ID is SHA256 token identifier, never a bearer token |
| DELETE `/sessions/:id` | Fresh browser | `{}` → `{ok:true}`; own token-hash ID only |
| POST `/devices/pairing` | Fresh browser | `{label}` → `{pairingToken,expiresIn:300}`; token displayed once |
| POST `/auth/pair` | One-use grant | `{pairingToken}` → `{token,account}`; creates device session without cookies |
| POST `/account/totp/setup` | Fresh browser | `{}` → `{secret,uri}`; encrypted seed pending 5 minutes; manual authenticator enrollment |
| POST `/account/totp/confirm` | Fresh browser | `{code,recovery:false}` → `{recoveryCodes}` once; enable TOTP and revoke other sessions |
| POST `/account/totp/disable` | Fresh browser + factor | `{code,recovery:boolean}` → `{ok:true}`; deletes factors/recovery codes |
| POST `/account/passkeys/options` | Fresh browser | `{}` → `{options}` + one-use add-passkey flow; excludes existing credentials |
| POST `/account/passkeys/finish` | Fresh browser + flow | `{response}` → `{ok:true}`; expected origin/RP/UV enforced |

Account fields: `{id,email,vaultId,profile,profileRevision,twoFactor}`. No passkey removal endpoint is shipped; add a second passkey before losing the first, and handle administrative account recovery through a reviewed procedure. No password-reset route decrypts a vault.

## Encrypted write example

Create encryption locally, then send the returned envelope without changing its fields. The following shows protocol shape; actual base64url values must come from the client crypto module and match its IDs/AAD.

```ts
const envelope = await vault.seal(itemId, expectedRevision + 1, validatedItem);
const response = await fetch('/api/items/' + itemId, {
  method: 'PUT', credentials: 'same-origin', cache: 'no-store',
  headers: {'Content-Type':'application/json','X-CSRF-Token':csrfToken},
  body: JSON.stringify({expectedRevision,envelope}),
});
if (response.status === 409) throw new Error('Refresh/review conflict before another write.');
if (!response.ok) throw new Error('Encrypted save failed.');
```

Envelope wire fields and byte lengths: see [CRYPTO.md](CRYPTO.md). Server validation cannot certify that a ciphertext is decryptable—only the authorized client authenticates it. A malicious authenticated owner can damage their own encrypted data; they cannot thereby access another account.

## Error behavior

`400` invalid/unknown fields or context; `401` missing/expired authentication or failed verification; `403` Origin/CSRF, wrong session type, stale fresh-auth window or a resource/account limit; `404` absent route/share/recipient; `409` concurrent revision or duplicate conflict; `413` body limit; `429` persistent throttle; `500` generic operation failure. Responses contain `{error:string}` with no input values, stack traces or database error details. Retry network failures after checking current revision; an uncertain request may already have committed. Offline retries never silently overwrite a conflict.
