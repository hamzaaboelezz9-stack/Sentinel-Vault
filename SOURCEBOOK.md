# Sentinel Vault complete source book

Every authored text file and vendored text asset is reproduced below with its full creation path and two-line explanation. The source book itself is excluded from recursive reproduction. Binary WASM/PNG bytes are included as real files in the repository and identified below by length and SHA-256 rather than corrupting them into a text code fence. All fixtures are synthetic. Runtime dependencies are restored from the complete npm lockfile.

## .dockerignore

Full creation path: `/workspace/scratch/ef7b82d54654/sentinel-vault/.dockerignore`

Provides deployment configuration with generated operational secrets and explicit trust boundaries.  
Review the deployment guide and run environment-specific release checks before use.

````text
node_modules
.git
.env
.local-data
releases
test-results
playwright-report
coverage
build
docs/SOURCEBOOK.md
````

## .env.example

Full creation path: `/workspace/scratch/ef7b82d54654/sentinel-vault/.env.example`

Provides deployment configuration with generated operational secrets and explicit trust boundaries.  
Review the deployment guide and run environment-specific release checks before use.

````text
# Local Docker works without this file. Copy to .env to customize your deployment.
# Canonical origin without trailing slash. HTTPS required outside loopback.
PUBLIC_ORIGIN=http://localhost:8080
# WebAuthn relying-party hostname, without port; set to your HTTPS hostname on a VPS.
RP_ID=localhost
# Enable only behind the loopback Nginx configuration in docs/DEPLOYMENT.md.
TRUST_PROXY=false
# Local Node development only: use your own PostgreSQL credentials and database.
# DATABASE_URL=postgresql://sentinel:YOUR_GENERATED_PASSWORD@127.0.0.1:5432/sentinel
# SECRET_DIR=.local-data/secrets
# STATIC_DIR=/absolute/path/to/sentinel-vault/build/web
# BIND_HOST=127.0.0.1
# PORT=8080
````

## .github/dependabot.yml

Full creation path: `/workspace/scratch/ef7b82d54654/sentinel-vault/.github/dependabot.yml`

Defines project configuration, pinned dependencies, licensing or automated repository checks.  
Included in full so the repository can be built and reviewed independently.

````yaml
version: 2
updates:
  - package-ecosystem: npm
    directory: /
    schedule: {interval: weekly}
  - package-ecosystem: docker
    directory: /
    schedule: {interval: weekly}
  - package-ecosystem: github-actions
    directory: /
    schedule: {interval: weekly}
````

## .github/workflows/ci.yml

Full creation path: `/workspace/scratch/ef7b82d54654/sentinel-vault/.github/workflows/ci.yml`

Defines project configuration, pinned dependencies, licensing or automated repository checks.  
Included in full so the repository can be built and reviewed independently.

````yaml
name: security-and-build
on: [push, pull_request]
permissions: {contents: read}
jobs:
  verify:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:17-bookworm
        env: {POSTGRES_USER: sentinel, POSTGRES_PASSWORD: public-ci-only-password, POSTGRES_DB: sentinel_test}
        ports: ["5432:5432"]
        options: --health-cmd "pg_isready -U sentinel -d sentinel_test" --health-interval 5s --health-timeout 5s --health-retries 20
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: {node-version: '24', cache: npm}
      - run: npm ci --ignore-scripts
      - run: npm run check
      - run: npm test
        env: {TEST_DATABASE_URL: 'postgresql://sentinel:public-ci-only-password@localhost:5432/sentinel_test'}
      - run: npm audit --audit-level=moderate
      - run: npm run build
      - run: npx playwright install --with-deps chromium
      - run: npm run test:e2e
      - run: docker compose config --quiet && docker compose up -d --build
      - run: timeout 120 bash -c 'until curl --fail --silent http://localhost:8080/api/health; do sleep 2; done'
      - run: docker compose down
        if: always()
````

## .gitignore

Full creation path: `/workspace/scratch/ef7b82d54654/sentinel-vault/.gitignore`

Defines project configuration, pinned dependencies, licensing or automated repository checks.  
Included in full so the repository can be built and reviewed independently.

````text
node_modules/
build/
releases/
.env
secrets/
test-results/
playwright-report/
coverage/
.local-data/
__pycache__/
*.log
.DS_Store

backups/
````

## .prettierignore

Full creation path: `/workspace/scratch/ef7b82d54654/sentinel-vault/.prettierignore`

Defines project configuration, pinned dependencies, licensing or automated repository checks.  
Included in full so the repository can be built and reviewed independently.

````text
apps/web/public/vendor
build
releases
docs/SOURCEBOOK.md
docs/openapi.json
package-lock.json
````

## Dockerfile

Full creation path: `/workspace/scratch/ef7b82d54654/sentinel-vault/Dockerfile`

Provides deployment configuration with generated operational secrets and explicit trust boundaries.  
Review the deployment guide and run environment-specific release checks before use.

````text
FROM node:24-bookworm-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts
COPY . .
RUN npm run check && npm run build && npm prune --omit=dev --ignore-scripts

FROM node:24-bookworm-slim
ENV NODE_ENV=production BIND_HOST=0.0.0.0 PORT=8080 STATIC_DIR=/app/build/web SECRET_DIR=/run/sentinel-secrets DB_PASSWORD_FILE=/run/sentinel-secrets/database-password
WORKDIR /app
COPY --from=build --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/build ./build
COPY --from=build --chown=node:node /app/db ./db
COPY --from=build --chown=node:node /app/scripts/show-invitation.mjs ./scripts/show-invitation.mjs
COPY --from=build --chown=node:node /app/package.json ./package.json
USER node
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=5s CMD node -e "fetch('http://127.0.0.1:8080/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node","build/api/main.js"]
````

## LICENSE

Full creation path: `/workspace/scratch/ef7b82d54654/sentinel-vault/LICENSE`

Defines project configuration, pinned dependencies, licensing or automated repository checks.  
Included in full so the repository can be built and reviewed independently.

````text
MIT License

Copyright (c) 2026 Sentinel Vault contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
````

## README.md

Full creation path: `/workspace/scratch/ef7b82d54654/sentinel-vault/README.md`

Documents the actual design, usage, interfaces or verification evidence.  
Distinguishes implemented behavior, operational assumptions and manual release gates.

````markdown
# Sentinel Vault

**A self-hosted, client-encrypted password manager for individuals and teams of up to 50 users.**

Passkeys authenticate your account. Your master password unlocks your vault locally. The API receives encrypted vault envelopes and public authentication/routing metadata, never a master password or plaintext vault record during normal operation.

Built with **TypeScript, React, Node.js/Fastify and PostgreSQL**. TypeScript shares versioned schemas and cryptographic formats between clients and API. React provides an accessible responsive interface. Fastify provides bounded requests, validation and OpenAPI. PostgreSQL provides transactions, foreign keys and revision checks for concurrent team/offline use.

> **Release status: security review candidate, not independently audited or certified.** Do not entrust irreplaceable credentials until the release gates in [VALIDATION.md](docs/VALIDATION.md) are met. Browser Argon2 uses the explicitly approved, pinned reference-WASM binding audit exception. AES-256 alone is not FIPS-140 validation. See [SECURITY.md](SECURITY.md).

## Start locally

Install Docker Engine and Docker Compose v2. From this directory:

```sh
docker compose up --build
```

After the first build, `docker compose up` starts the complete application. Initial database and operational secrets are generated automatically; no password defaults are committed. Open **http://localhost:8080** on the machine hosting Docker. Loopback HTTP is for local development only.

Get your operator-controlled registration invitation:

```sh
docker compose exec app node scripts/show-invitation.mjs
```

Create an account using that token, an available platform/security-key passkey, and a strong master password. Keep a second passkey and your master password in a secure place. TOTP recovery codes replace TOTP once after passkey authentication; they **cannot recover a master password or replace a lost passkey**.

For a VPS, follow [DEPLOYMENT.md](docs/DEPLOYMENT.md). Set the final HTTPS origin and WebAuthn hostname **before registration**: changing the relying-party hostname makes existing passkeys unusable on the new hostname. PostgreSQL is private and the app binds the host port to loopback for Nginx.

## Features

| Area | Included behavior |
|---|---|
| Vault | Add/edit/delete site, username, password, URL and notes; folders, tags, favorites, local search; last five password versions |
| Encryption | Argon2id 64 MiB / 3 passes / 4 lanes; master HKDF key, AES-KW vault/item wrapping; fresh AES-256-GCM key and 96-bit IV for every item revision |
| Authentication | Discoverable, user-verified passkeys; TOTP; hashed one-use recovery codes; account/IP limits and exponential failed-login backoff |
| Privacy | Dedicated crypto worker; best-effort buffer erasure; default five-minute inactivity lock; lock on hide; thirty-second clipboard clearing where permitted |
| Passwords | Cryptographic password and passphrase generation; strength/pattern suggestions; empirical Shannon statistics and explicitly modeled attack estimates; local reuse/age checks |
| Breach checks | Explicit opt-in HIBP padded k-anonymity range requests; service sees IP and five-character hash prefix; failures remain “unavailable” |
| Sharing | Authenticated X25519/libsodium boxes, independently verified/pinned fingerprints; separate snapshot keys; history excluded; sender revocation |
| Offline | Installable PWA shell; opt-in encrypted IndexedDB vault and encrypted pending edits; conflict-aware synchronization |
| Portability | Local Bitwarden/LastPass/1Password login CSV parsing and preview; encrypted JSON export; independently bundled Chrome/Firefox autofill client |
| Operations | Metadata-only account audit; session revocation; strict CSP without inline JS/styles; OpenAPI; Docker; CI and security checklists |

Limits are explicit: 50 registered accounts, 1,000 active items per account, CSV up to 2 MiB/1,000 rows, 16 tags per item, 16,000-character notes and 4,096-character credential passwords. Registration uses an operator invitation, not public self-signup. This is individual-vault sharing, not an organization-admin escrow or group ACL system.

## Everyday use

1. Sign in with a passkey, complete TOTP if enabled, then unlock using your master password.
2. Add a credential, select it to reveal/copy, or use the generator. The UI never automatically visits credential URLs.
3. Enable the encrypted offline copy only on a trusted device. Wait for the PWA shell to install while online. Offline writes remain encrypted; synchronization uses server revision checks. A conflict keeps the pending change for review—export a backup before choosing to discard it. Refresh is blocked while edits are pending.
4. Import CSV from **Security settings**. Review supported login entries before encrypting them. Unsupported non-login types are skipped with a count; additional fields are retained in encrypted notes. CSVs themselves contain plaintext: protect and remove those files yourself. Unknown original password age is represented by import time, not a verified rotation date.
5. Export encrypted JSON regularly and back up the database plus operational secrets. Old exports remain decryptable with the old master password after a change. Export is a vault snapshot, not a passkey/account/session/database backup or a synchronization journal; pending deletions are omitted. Current JSON export does not include a server-restore UI: use the documented database recovery procedure or a reviewed client that implements the documented envelope format.
6. For sharing, each party compares the other's **full fingerprint through an independent channel** and pins it. Server revocation cannot erase a recipient's copied plaintext or older encrypted snapshots.

## Browser extension

```sh
npm ci --ignore-scripts
npm run build
```

Chrome: load `build/extension-chrome` using **chrome://extensions → Developer mode → Load unpacked**. Firefox: use **about:debugging → This Firefox → Load Temporary Add-on**, selecting `build/extension-firefox/manifest.json`. Persistent Firefox distribution requires Mozilla signing. Bundles are also included in the release ZIP for convenient review.

Generate a single-use, five-minute pairing token in the web app's Security settings. Enter the server URL and token in the extension and grant that specific backend host permission. Unlock with the master password locally. Select a credential and explicitly click **Fill** while visiting its exact HTTPS origin. One visible password field and a same-origin form action are required; no form is submitted. The page receives the selected credentials after consent. This does not protect you from a malicious page on the correct origin.

The extension packages its own executable code and WASM. It never loads server JavaScript. Its short-lived bearer session is kept in extension `storage.session`, not persistent local storage; no unlocked keys/master password are stored. Account-security changes require a fresh browser passkey session. Popup close/hide locks its worker. The extension does not currently offer an offline persistent vault or credential editing. A desktop wrapper is optional and **not included**; wrapping the hosted web app alone does not solve malicious server code delivery.

## Development and tests

Use Node.js **24.19+** and Python **3.11+** for packaging. Install locally, create `.env`, and supply a local PostgreSQL URL:

```sh
npm ci --ignore-scripts
npm run setup
npm run check
npm test
npm run build
npx playwright install chromium
npm run test:e2e
```

`npm test` uses PostgreSQL compiled to WASM (PGlite) by default, not a mock SQL store. CI runs the same integration suite against PostgreSQL 17 via a dedicated `TEST_DATABASE_URL` ending `_test`. **That suite resets its database schema**; never point it at a live vault. Crypto tests use an independent native Node Argon2 implementation and the actual bundled browser WASM. Browser tests use real WebAuthn verification with a virtual user-verified authenticator and synthetic credentials only.

Run `npm run dev:api` after setting `DATABASE_URL` and `STATIC_DIR` in `.env` to the built web directory. Use the canonical `PUBLIC_ORIGIN` for passkeys. The Vite development server can proxy API calls, but WebAuthn origin and CSRF checks require a matching development origin; prefer the built app on port 8080 for security testing. No source maps, analytics, telemetry or third-party CDN assets are shipped.

API specification: [docs/openapi.json](docs/openapi.json), also served at `/api/openapi.json`. Endpoint rules and examples: [API.md](docs/API.md).

## Requested deliverables

1. [STRIDE threat model](docs/THREAT-MODEL.md)
2. [Architecture and register/login/save/read diagrams](docs/ARCHITECTURE.md)
3. [Byte-level cryptographic design](docs/CRYPTO.md)
4. [Full SQL schema](db/schema.sql)
5. [Complete folder/file inventory](docs/FILES.md)
6. [Complete source book, every authored text file with two-line explanations](docs/SOURCEBOOK.md)
7. [Dockerfile](Dockerfile) and [Docker Compose](docker-compose.yml)
8. [.env.example](.env.example)
9. This README, with setup and screenshots
10. [Responsible disclosure and design decisions](SECURITY.md)
11. [Crypto/API/import/generator tests](tests) and [browser tests](tests/e2e)
12. [OpenAPI](docs/openapi.json) and [API guide](docs/API.md)
13. [VPS/Nginx/HTTPS/Let's Encrypt deployment](docs/DEPLOYMENT.md)
14. [Penetration-test checklist](docs/PENTEST-CHECKLIST.md), [ASVS verification map](docs/ASVS.md) and [validation record](docs/VALIDATION.md)

## Screenshots

Captured from the actual tested Chromium application using public synthetic fixtures; these are not fabricated mockups.

![Locked sign-in screen](docs/screenshots/sign-in.png)
![Encrypted vault interface](docs/screenshots/vault.png)
![Password health](docs/screenshots/health.png)

## Publish on GitHub

Create an empty repository named `sentinel-vault`, then initialize and push this directory using your own GitHub account. Review the packaged file inventory first; `.env`, local data/secrets, `node_modules` and runtime test output are excluded.

Suggested repository description:

> Self-hosted, client-encrypted password manager with Argon2id, AES-256-GCM, passkeys, TOTP, verified X25519 sharing, encrypted offline vaults and browser autofill.

Suggested topics: `password-manager`, `application-security`, `typescript`, `react`, `fastify`, `argon2id`, `webauthn`, `zero-knowledge`, `self-hosted`.

```sh
git init
git add .
git commit -m "Initial Sentinel Vault security review candidate"
git branch -M main
git remote add origin git@github.com:YOUR_GITHUB_ACCOUNT/sentinel-vault.git
git push -u origin main
```

Enable GitHub **private vulnerability reporting**, run the workflow, and meet the release gates before labeling a release production-ready. Dependency versions are locked; vendored Argon2 assets include license, provenance and SHA-256 hashes in [THIRD-PARTY.md](THIRD-PARTY.md). MIT license; third-party components retain their own licenses.
````

## SECURITY.md

Full creation path: `/workspace/scratch/ef7b82d54654/sentinel-vault/SECURITY.md`

Documents the actual design, usage, interfaces or verification evidence.  
Distinguishes implemented behavior, operational assumptions and manual release gates.

````markdown
# Security policy

## Supported release

Version 0.1.0 is a security review candidate. There has been no independent penetration test, source audit, FIPS validation, SOC2 examination, ISO27001 certification or complete ASVS assessment of this project. Only the checks enumerated in [docs/VALIDATION.md](docs/VALIDATION.md) may be treated as completed.

## Responsible disclosure

For a published GitHub repository, enable **Settings → Code security → Private vulnerability reporting** before advertising deployment. Report issues through the repository's **Security → Report a vulnerability** workflow. No nonexistent maintainer address or guaranteed response SLA is claimed. Until private reporting is enabled, contact the actual repository owner privately; do not post live credentials, vault dumps, session cookies or exploitation against other users in a public issue.

Include affected commit/version, safe synthetic reproduction, relevant request shapes with tokens redacted, observed impact and proposed fixes. Test only systems you own or have explicit permission to assess. The maintainer should acknowledge reports, reproduce with synthetic data, develop/test a fix privately, agree a disclosure timeline and publish a security advisory with patched versions.

## Design decisions

- Passkeys authenticate accounts; the master password only derives client encryption keys. TOTP is an additional online factor. Recovery codes cannot derive the vault key.
- The hierarchy is master password → Argon2id root → purpose-separated HKDF AES-KW key → random vault key → fresh per-revision item key. Each AES-GCM record authenticates vault ID, item ID, revision and format via fixed-width AAD.
- Key wrapping uses WebCrypto AES-KW (RFC3394); encryption uses WebCrypto AES-256-GCM with 128-bit tags. Sharing uses libsodium authenticated X25519/XSalsa20-Poly1305 boxes. No new cipher, MAC or asymmetric construction is implemented here.
- Browser Argon2 uses pinned `argon2-browser` 1.18.0 assets from the reference implementation. The exact m/t/p vector is cross-tested against Node native Argon2. The binding's audit status is **not verified**: the user explicitly approved this development exception. Independent review, reproducible/provenance verification and release-artifact hashing are required before sensitive production use.
- Data at rest consists of ciphertext **and necessary metadata**. Email addresses, account IDs, passkey public keys/counters, timestamps, revisions, public sharing keys and relationships, hashed sessions/challenges/recovery codes and audit event names are visible to the server. TOTP seeds are encrypted using a separate server operational key: this is not a vault-decryption key and is not zero-knowledge TOTP. Server compromise can defeat server authentication and access controls.
- No telemetry or analytics. Vault values and request bodies are not logged. Breach requests are optional and go directly from the client to HIBP with a five-character SHA-1 prefix and padding. No password or full hash is sent; query timing/IP/prefix still leak information to HIBP. A lookup failure never means “safe.”
- Crypto workers are terminated on lock. Mutable buffers are overwritten when under application control. JavaScript strings, DOM inputs, browser internal/native key copies, GC, swap, crash dumps, clipboard history and OS memory **cannot be guaranteed zeroed** by a web application. No physical zero-retention claim is made.
- Secret checks use native Node `timingSafeEqual`, WebCrypto HMAC verification or libsodium `memcmp`/authenticated decryption where applicable. Public-length validation and database indexed lookup timings are not concealed; JavaScript UI behavior is not globally constant-time. Recovery/session lookup hashes are random high-entropy values, not fast hashes of user passwords.
- Clipboard clearing compares a native keyed fingerprint before replacing clipboard text, to avoid wiping unrelated later content. It is best effort: permissions, focus, popup closure and clipboard managers can prevent clearing. Autofill avoids copying through the clipboard.
- Encrypted offline cache is opt-in. CSP restricts scripts/styles to local assets, allows WASM compilation via `wasm-unsafe-eval`, and blocks framing, inline JavaScript, `eval`, arbitrary base URLs and plugins. CSP cannot protect against an attacker who controls the trusted same-origin application bundle itself.

## Threat limits and operational response

A stolen database cannot directly decrypt a well-protected vault. It enables offline password guessing and reveals metadata. A malicious web server can deliver password-stealing JavaScript to the browser before or during unlock. Zero-knowledge stored data does not prevent that attack. The independently distributed extension removes server-supplied application code from its client path; compromised devices, extension signing/distribution channels, dependencies and malicious exact-origin autofill pages remain outside this protection.

GCM authenticates record integrity and bound context, not global freshness. Revisions and optimistic concurrency prevent normal stale writes; a compromised server can replay a previously valid profile/record, suppress items or falsify audit logs. There is no external append-only transparency log or signed cross-device freshness checkpoint. Sharing is a snapshot without forward secrecy or organization escrow. Revocation prevents future authorized server retrieval; it cannot revoke a plaintext copy or a box already obtained. Strong master-password changes do not invalidate stolen old backups or recover from a stolen vault key.

If the web server is compromised: stop serving clients; preserve evidence securely; remove the compromise and rebuild from reviewed sources; invalidate account/device sessions and invitations; rotate operational secrets with a planned TOTP re-enrollment; treat credentials unlocked through potentially malicious web code as exposed and replace them at their services. Rewrapping the same vault key alone is insufficient if that key was stolen. Reset recipient trust only after independent fingerprint verification. Restore from a known-good tested backup and reassess all deployment gates.
````

## THIRD-PARTY.md

Full creation path: `/workspace/scratch/ef7b82d54654/sentinel-vault/THIRD-PARTY.md`

Documents the actual design, usage, interfaces or verification evidence.  
Distinguishes implemented behavior, operational assumptions and manual release gates.

````markdown
# Third-party components and vendored integrity

Runtime versions/integrities are locked in `package-lock.json`. No third-party executable CDN assets are loaded. Each component retains its upstream license; the MIT project license does not replace those licenses.

## Browser Argon2 audit exception

Pinned npm package: **argon2-browser 1.18.0** ([upstream](https://github.com/antelle/argon2-browser)). Its upstream Argon2 reference submodule is documented at revision `16d3df6` in that release. The JS binding and build configuration are not asserted independently audited. Development use was explicitly approved; independent implementation/provenance review remains a production release gate. These files are copied byte-for-byte from the pinned package and served locally; our separate disposable-worker wrapper is application code.

| Shipped file | Upstream package path | SHA-256 |
|---|---|---|
| `argon2-api.js` | `argon2-browser/lib/argon2.js` | `ecfe330a8f3c6d491b92197391088f117ab13ad13c784cb01235a1afb5757a3b` |
| `argon2.js` | `argon2-browser/dist/argon2.js` | `cdb6ef704dbc287ffa0056376d9af297c8691ddeb985f9137b96fc9b0ddea8b0` |
| `argon2.wasm` | `argon2-browser/dist/argon2.wasm` | `0c2149886c13e4eae4a6ca25ee71d47423c5c8740a874cf04ff816d1b2c901d7` |
| `ARGON2-LICENSE.txt` | `argon2-browser/LICENSE` | `524a1d77701975a063a590424637abbd7fa519042a113f2bbe2eaf4cde76296d` |

## Principal runtime components

| Component | Role | Upstream license |
|---|---|---|
| `@fastify/cookie 11.0.2` | Client/API runtime | MIT |
| `@fastify/helmet 13.0.2` | Client/API runtime | MIT |
| `@fastify/static 10.1.5` | Client/API runtime | MIT |
| `@fastify/swagger 9.5.1` | Client/API runtime | MIT |
| `@scure/bip39 2.4.0` | Static 2048-word English list only | MIT |
| `@simplewebauthn/browser 14.0.0` | Passkey browser ceremonies | MIT |
| `@simplewebauthn/server 14.0.3` | Server WebAuthn verification | MIT |
| `argon2-browser 1.18.0` | Reference Argon2 WASM binding | MIT |
| `fastify 5.12.5` | Client/API runtime | MIT |
| `libsodium-wrappers-sumo 0.8.4` | Authenticated X25519 boxes / native library comparisons | ISC |
| `otpauth 9.4.1` | Client/API runtime | MIT |
| `papaparse 5.5.3` | Client/API runtime | MIT |
| `pg 8.16.3` | Client/API runtime | MIT |
| `react 19.3.0` | Client/API runtime | MIT |
| `react-dom 19.3.0` | Client/API runtime | MIT |
| `zod 4.1.13` | Client/API runtime | MIT |
| `zxcvbn 4.4.2` | Local dictionary / pattern guess model | MIT |

The full transitive dependency tree is installable from the lockfile. `npm ci --ignore-scripts` avoids dependency lifecycle scripts. Native optional platform packages are supplied by npm; builds must be tested on the target platform. Dev dependencies provide TypeScript, Vitest, PGlite, Playwright and packaging/build tools, never production telemetry. Browser tests use a separate scratch-only Chromium distribution that is not included as a project dependency.
````

## apps/api/src/app.ts

Full creation path: `/workspace/scratch/ef7b82d54654/sentinel-vault/apps/api/src/app.ts`

Implements the bounded, authenticated API or its configuration/database boundary.  
Vault values remain encrypted; authentication metadata is handled separately.

````typescript
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
````

## apps/api/src/config.ts

Full creation path: `/workspace/scratch/ef7b82d54654/sentinel-vault/apps/api/src/config.ts`

Implements the bounded, authenticated API or its configuration/database boundary.  
Vault values remain encrypted; authentication metadata is handled separately.

````typescript
import { readFile, mkdir, writeFile } from "node:fs/promises";
import { randomBytes } from "node:crypto";
import path from "node:path";
export interface Config {
  origin: string;
  rpId: string;
  secure: boolean;
  operationalKey: Buffer;
  registrationToken: string;
  staticDir?: string;
  trustProxy: boolean;
}
async function secret(filename: string, bytes: number) {
  try {
    return await readFile(filename);
  } catch (error: any) {
    if (error.code !== "ENOENT") throw error;
  }
  const value = randomBytes(bytes);
  try {
    await writeFile(filename, value, { flag: "wx", mode: 0o600 });
    return value;
  } catch (error: any) {
    value.fill(0);
    if (error.code !== "EEXIST") throw error;
    return readFile(filename);
  }
}
export async function config(): Promise<Config> {
  const origin = process.env.PUBLIC_ORIGIN || "http://localhost:8080",
    url = new URL(origin);
  if (url.origin !== origin || url.username || url.password)
    throw new Error("PUBLIC_ORIGIN must be a canonical origin.");
  const local = ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname);
  if (url.protocol !== "https:" && !(url.protocol === "http:" && local))
    throw new Error("Non-local deployments require HTTPS.");
  const directory = path.resolve(
    process.env.SECRET_DIR || ".local-data/secrets",
  );
  await mkdir(directory, { recursive: true, mode: 0o700 });
  const operationalKey = await secret(
    path.join(directory, "operational.key"),
    32,
  );
  const registration = await secret(
    path.join(directory, "registration.key"),
    32,
  );
  if (operationalKey.length !== 32 || registration.length !== 32)
    throw new Error("Invalid operational secrets.");
  const registrationToken = registration.toString("base64url");
  registration.fill(0);
  const rpId = process.env.RP_ID || url.hostname;
  if (rpId !== url.hostname)
    throw new Error("RP_ID must match the canonical origin hostname.");
  return {
    origin,
    rpId,
    secure: url.protocol === "https:",
    operationalKey,
    registrationToken,
    staticDir: process.env.STATIC_DIR,
    trustProxy: process.env.TRUST_PROXY === "true",
  };
}
````

## apps/api/src/db.ts

Full creation path: `/workspace/scratch/ef7b82d54654/sentinel-vault/apps/api/src/db.ts`

Implements the bounded, authenticated API or its configuration/database boundary.  
Vault values remain encrypted; authentication metadata is handled separately.

````typescript
import { Pool } from "pg";
import { readFile } from "node:fs/promises";
export interface Connection {
  query(
    text: string,
    values?: unknown[],
  ): Promise<{ rows: any[]; rowCount?: number | null }>;
  release(): void;
}
export interface Database {
  query(
    text: string,
    values?: unknown[],
  ): Promise<{ rows: any[]; rowCount?: number | null }>;
  connect(): Promise<Connection>;
  end(): Promise<void>;
}
export function database(url: string): Database {
  const pool = new Pool({
    connectionString: url,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  });
  // Idle database failures are handled by reconnecting/query errors, never dumped with connection metadata.
  pool.on("error", () => {});
  return pool as Database;
}
export async function migrate(db: Database, filename: string) {
  const sql = await readFile(filename, "utf8");
  await db.query(sql);
}
export async function transaction<T>(
  db: Database,
  fn: (client: Connection) => Promise<T>,
): Promise<T> {
  const c = await db.connect();
  try {
    await c.query("BEGIN");
    const value = await fn(c);
    await c.query("COMMIT");
    return value;
  } catch (error) {
    await c.query("ROLLBACK");
    throw error;
  } finally {
    c.release();
  }
}
````

## apps/api/src/main.ts

Full creation path: `/workspace/scratch/ef7b82d54654/sentinel-vault/apps/api/src/main.ts`

Implements the bounded, authenticated API or its configuration/database boundary.  
Vault values remain encrypted; authentication metadata is handled separately.

````typescript
import { config } from "./config";
import { database, migrate } from "./db";
import { makeApp } from "./app";
import { readFile } from "node:fs/promises";
import path from "node:path";
async function main() {
  const settings = await config();
  let url = process.env.DATABASE_URL;
  if (!url) {
    const password = (
      await readFile(
        process.env.DB_PASSWORD_FILE ||
          path.join(
            process.env.SECRET_DIR || ".local-data/secrets",
            "database-password",
          ),
        "utf8",
      )
    ).trim();
    url = `postgresql://sentinel:${encodeURIComponent(password)}@db:5432/sentinel`;
  }
  const db = database(url);
  await migrate(db, process.env.SCHEMA_FILE || "db/schema.sql");
  const app = await makeApp(db, settings);
  const cleanup = setInterval(() => {
    void db
      .query(
        "DELETE FROM challenges WHERE expires_at<now(); DELETE FROM sessions WHERE expires_at<now(); DELETE FROM device_pairings WHERE expires_at<now(); DELETE FROM auth_throttle WHERE updated_at<now()-interval '7 days'; DELETE FROM audit_events WHERE created_at<now()-interval '90 days'",
      )
      .catch(() => {});
  }, 300000);
  cleanup.unref();
  const stop = async () => {
    clearInterval(cleanup);
    await app.close();
    await db.end();
    settings.operationalKey.fill(0);
    process.exit(0);
  };
  process.on("SIGTERM", stop);
  process.on("SIGINT", stop);
  await app.listen({
    host: process.env.BIND_HOST || "127.0.0.1",
    port: Number(process.env.PORT || 8080),
  });
  process.stdout.write("Sentinel Vault is ready.\n");
}
main().catch(() => {
  process.stderr.write(
    "Sentinel Vault could not start. Verify configuration, secrets and database availability.\n",
  );
  process.exit(1);
});
````

## apps/api/src/security.ts

Full creation path: `/workspace/scratch/ef7b82d54654/sentinel-vault/apps/api/src/security.ts`

Implements the bounded, authenticated API or its configuration/database boundary.  
Vault values remain encrypted; authentication metadata is handled separately.

````typescript
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
````

## apps/web/index.html

Full creation path: `/workspace/scratch/ef7b82d54654/sentinel-vault/apps/web/index.html`

Provides the local React vault interface, crypto worker or static application shell.  
Secrets are decrypted only for deliberate local operations; no telemetry is included.

````html
<!doctype html>
<html lang="en" data-theme="dark">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#101b19" />
    <meta
      name="description"
      content="Your self-hosted, client-encrypted password vault."
    />
    <link rel="icon" href="/icon.svg" type="image/svg+xml" />
    <link rel="manifest" href="/manifest.webmanifest" />
    <title>Sentinel — Your private vault</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
````

## apps/web/public/icon.svg

Full creation path: `/workspace/scratch/ef7b82d54654/sentinel-vault/apps/web/public/icon.svg`

Provides the local React vault interface, crypto worker or static application shell.  
Secrets are decrypted only for deliberate local operations; no telemetry is included.

````text
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192"><rect width="192" height="192" rx="40" fill="#101b19"/><path d="M96 30 150 54v42c0 35-54 66-54 66S42 131 42 96V54Z" fill="none" stroke="#bceec7" stroke-width="8"/><path d="m70 93 19 19 35-41" fill="none" stroke="#bceec7" stroke-width="8" stroke-linecap="round"/></svg>
````

## apps/web/public/kdf-worker.js

Full creation path: `/workspace/scratch/ef7b82d54654/sentinel-vault/apps/web/public/kdf-worker.js`

Provides the local React vault interface, crypto worker or static application shell.  
Secrets are decrypted only for deliberate local operations; no telemetry is included.

````javascript
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
````

## apps/web/public/manifest.webmanifest

Full creation path: `/workspace/scratch/ef7b82d54654/sentinel-vault/apps/web/public/manifest.webmanifest`

Provides the local React vault interface, crypto worker or static application shell.  
Secrets are decrypted only for deliberate local operations; no telemetry is included.

````text
{
  "id": "/",
  "name": "Sentinel Vault",
  "short_name": "Sentinel",
  "start_url": "/",
  "scope": "/",
  "display": "standalone",
  "background_color": "#101b19",
  "theme_color": "#101b19",
  "icons": [
    {
      "src": "/icon.svg",
      "sizes": "any",
      "type": "image/svg+xml",
      "purpose": "any maskable"
    }
  ]
}
````

## apps/web/public/vendor/ARGON2-LICENSE.txt

Full creation path: `/workspace/scratch/ef7b82d54654/sentinel-vault/apps/web/public/vendor/ARGON2-LICENSE.txt`

Pinned upstream Argon2 binding/reference WASM asset, shipped locally.  
Provenance, license and byte hashes are listed in THIRD-PARTY.md.

````text
Copyright © 2021 Antelle

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
````

## apps/web/public/vendor/argon2-api.js

Full creation path: `/workspace/scratch/ef7b82d54654/sentinel-vault/apps/web/public/vendor/argon2-api.js`

Pinned upstream Argon2 binding/reference WASM asset, shipped locally.  
Provenance, license and byte hashes are listed in THIRD-PARTY.md.

````javascript
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        root.argon2 = factory();
    }
})(typeof self !== 'undefined' ? self : this, function () {
    const global = typeof self !== 'undefined' ? self : this;

    /**
     * @enum
     */
    const ArgonType = {
        Argon2d: 0,
        Argon2i: 1,
        Argon2id: 2,
    };

    function loadModule(mem) {
        if (loadModule._promise) {
            return loadModule._promise;
        }
        if (loadModule._module) {
            return Promise.resolve(loadModule._module);
        }
        let promise;
        if (
            global.process &&
            global.process.versions &&
            global.process.versions.node
        ) {
            promise = loadWasmModule().then(
                (Module) =>
                    new Promise((resolve) => {
                        Module.postRun = () => resolve(Module);
                    })
            );
        } else {
            promise = loadWasmBinary().then((wasmBinary) => {
                const wasmMemory = mem ? createWasmMemory(mem) : undefined;
                return initWasm(wasmBinary, wasmMemory);
            });
        }
        loadModule._promise = promise;
        return promise.then((Module) => {
            loadModule._module = Module;
            delete loadModule._promise;
            return Module;
        });
    }

    function initWasm(wasmBinary, wasmMemory) {
        return new Promise((resolve) => {
            global.Module = {
                wasmBinary,
                wasmMemory,
                postRun() {
                    resolve(Module);
                },
            };
            return loadWasmModule();
        });
    }

    function loadWasmModule() {
        if (global.loadArgon2WasmModule) {
            return global.loadArgon2WasmModule();
        }
        if (typeof require === 'function') {
            return Promise.resolve(require('../dist/argon2.js'));
        }
        return import('../dist/argon2.js');
    }

    function loadWasmBinary() {
        if (global.loadArgon2WasmBinary) {
            return global.loadArgon2WasmBinary();
        }
        if (typeof require === 'function') {
            return Promise.resolve(require('../dist/argon2.wasm')).then(
                (wasmModule) => {
                    return decodeWasmBinary(wasmModule);
                }
            );
        }
        const wasmPath =
            global.argon2WasmPath ||
            'node_modules/argon2-browser/dist/argon2.wasm';
        return fetch(wasmPath)
            .then((response) => response.arrayBuffer())
            .then((ab) => new Uint8Array(ab));
    }

    function decodeWasmBinary(base64) {
        const text = atob(base64);
        const binary = new Uint8Array(new ArrayBuffer(text.length));
        for (let i = 0; i < text.length; i++) {
            binary[i] = text.charCodeAt(i);
        }
        return binary;
    }

    function createWasmMemory(mem) {
        const KB = 1024;
        const MB = 1024 * KB;
        const GB = 1024 * MB;
        const WASM_PAGE_SIZE = 64 * KB;

        const totalMemory = (2 * GB - 64 * KB) / WASM_PAGE_SIZE;
        const initialMemory = Math.min(
            Math.max(Math.ceil((mem * KB) / WASM_PAGE_SIZE), 256) + 256,
            totalMemory
        );

        return new WebAssembly.Memory({
            initial: initialMemory,
            maximum: totalMemory,
        });
    }

    function allocateArray(Module, arr) {
        return Module.allocate(arr, 'i8', Module.ALLOC_NORMAL);
    }

    function allocateArrayStr(Module, arr) {
        const nullTerminatedArray = new Uint8Array([...arr, 0]);
        return allocateArray(Module, nullTerminatedArray);
    }

    function encodeUtf8(str) {
        if (typeof str !== 'string') {
            return str;
        }
        if (typeof TextEncoder === 'function') {
            return new TextEncoder().encode(str);
        } else if (typeof Buffer === 'function') {
            return Buffer.from(str);
        } else {
            throw new Error("Don't know how to encode UTF8");
        }
    }

    /**
     * Argon2 hash
     * @param {string|Uint8Array} params.pass - password string
     * @param {string|Uint8Array} params.salt - salt string
     * @param {number} [params.time=1] - the number of iterations
     * @param {number} [params.mem=1024] - used memory, in KiB
     * @param {number} [params.hashLen=24] - desired hash length
     * @param {number} [params.parallelism=1] - desired parallelism
     * @param {number} [params.type=argon2.ArgonType.Argon2d] - hash type:
     *      argon2.ArgonType.Argon2d
     *      argon2.ArgonType.Argon2i
     *      argon2.ArgonType.Argon2id
     *
     * @return Promise
     *
     * @example
     *  argon2.hash({ pass: 'password', salt: 'somesalt' })
     *      .then(h => console.log(h.hash, h.hashHex, h.encoded))
     *      .catch(e => console.error(e.message, e.code))
     */
    function argon2Hash(params) {
        const mCost = params.mem || 1024;
        return loadModule(mCost).then((Module) => {
            const tCost = params.time || 1;
            const parallelism = params.parallelism || 1;
            const pwdEncoded = encodeUtf8(params.pass);
            const pwd = allocateArrayStr(Module, pwdEncoded);
            const pwdlen = pwdEncoded.length;
            const saltEncoded = encodeUtf8(params.salt);
            const salt = allocateArrayStr(Module, saltEncoded);
            const saltlen = saltEncoded.length;
            const argon2Type = params.type || ArgonType.Argon2d;
            const hash = Module.allocate(
                new Array(params.hashLen || 24),
                'i8',
                Module.ALLOC_NORMAL
            );
            const secret = params.secret
                ? allocateArray(Module, params.secret)
                : 0;
            const secretlen = params.secret ? params.secret.byteLength : 0;
            const ad = params.ad ? allocateArray(Module, params.ad) : 0;
            const adlen = params.ad ? params.ad.byteLength : 0;
            const hashlen = params.hashLen || 24;
            const encodedlen = Module._argon2_encodedlen(
                tCost,
                mCost,
                parallelism,
                saltlen,
                hashlen,
                argon2Type
            );
            const encoded = Module.allocate(
                new Array(encodedlen + 1),
                'i8',
                Module.ALLOC_NORMAL
            );
            const version = 0x13;
            let err;
            let res;
            try {
                res = Module._argon2_hash_ext(
                    tCost,
                    mCost,
                    parallelism,
                    pwd,
                    pwdlen,
                    salt,
                    saltlen,
                    hash,
                    hashlen,
                    encoded,
                    encodedlen,
                    argon2Type,
                    secret,
                    secretlen,
                    ad,
                    adlen,
                    version
                );
            } catch (e) {
                err = e;
            }
            let result;
            if (res === 0 && !err) {
                let hashStr = '';
                const hashArr = new Uint8Array(hashlen);
                for (let i = 0; i < hashlen; i++) {
                    const byte = Module.HEAP8[hash + i];
                    hashArr[i] = byte;
                    hashStr += ('0' + (0xff & byte).toString(16)).slice(-2);
                }
                const encodedStr = Module.UTF8ToString(encoded);
                result = {
                    hash: hashArr,
                    hashHex: hashStr,
                    encoded: encodedStr,
                };
            } else {
                try {
                    if (!err) {
                        err = Module.UTF8ToString(
                            Module._argon2_error_message(res)
                        );
                    }
                } catch (e) {}
                result = { message: err, code: res };
            }
            try {
                Module._free(pwd);
                Module._free(salt);
                Module._free(hash);
                Module._free(encoded);
                if (ad) {
                    Module._free(ad);
                }
                if (secret) {
                    Module._free(secret);
                }
            } catch (e) {}
            if (err) {
                throw result;
            } else {
                return result;
            }
        });
    }

    /**
     * Argon2 verify function
     * @param {string} params.pass - password string
     * @param {string|Uint8Array} params.encoded - encoded hash
     * @param {number} [params.type=argon2.ArgonType.Argon2d] - hash type:
     *      argon2.ArgonType.Argon2d
     *      argon2.ArgonType.Argon2i
     *      argon2.ArgonType.Argon2id
     *
     * @returns Promise
     *
     * @example
     *  argon2.verify({ pass: 'password', encoded: 'encoded-hash' })
     *      .then(() => console.log('OK'))
     *      .catch(e => console.error(e.message, e.code))
     */
    function argon2Verify(params) {
        return loadModule().then((Module) => {
            const pwdEncoded = encodeUtf8(params.pass);
            const pwd = allocateArrayStr(Module, pwdEncoded);
            const pwdlen = pwdEncoded.length;
            const secret = params.secret
                ? allocateArray(Module, params.secret)
                : 0;
            const secretlen = params.secret ? params.secret.byteLength : 0;
            const ad = params.ad ? allocateArray(Module, params.ad) : 0;
            const adlen = params.ad ? params.ad.byteLength : 0;
            const encEncoded = encodeUtf8(params.encoded);
            const enc = allocateArrayStr(Module, encEncoded);
            let argon2Type = params.type;
            if (argon2Type === undefined) {
                let typeStr = params.encoded.split('$')[1];
                if (typeStr) {
                    typeStr = typeStr.replace('a', 'A');
                    argon2Type = ArgonType[typeStr] || ArgonType.Argon2d;
                }
            }
            let err;
            let res;
            try {
                res = Module._argon2_verify_ext(
                    enc,
                    pwd,
                    pwdlen,
                    secret,
                    secretlen,
                    ad,
                    adlen,
                    argon2Type
                );
            } catch (e) {
                err = e;
            }
            let result;
            if (res || err) {
                try {
                    if (!err) {
                        err = Module.UTF8ToString(
                            Module._argon2_error_message(res)
                        );
                    }
                } catch (e) {}
                result = { message: err, code: res };
            }
            try {
                Module._free(pwd);
                Module._free(enc);
            } catch (e) {}
            if (err) {
                throw result;
            } else {
                return result;
            }
        });
    }

    function unloadRuntime() {
        if (loadModule._module) {
            loadModule._module.unloadRuntime();
            delete loadModule._promise;
            delete loadModule._module;
        }
    }

    return {
        ArgonType,
        hash: argon2Hash,
        verify: argon2Verify,
        unloadRuntime,
    };
});
````

## apps/web/public/vendor/argon2.js

Full creation path: `/workspace/scratch/ef7b82d54654/sentinel-vault/apps/web/public/vendor/argon2.js`

Pinned upstream Argon2 binding/reference WASM asset, shipped locally.  
Provenance, license and byte hashes are listed in THIRD-PARTY.md.

````javascript
var Module=typeof self!=="undefined"&&typeof self.Module!=="undefined"?self.Module:{};var jsModule=Module;var moduleOverrides={};var key;for(key in Module){if(Module.hasOwnProperty(key)){moduleOverrides[key]=Module[key]}}var arguments_=[];var thisProgram="./this.program";var quit_=function(status,toThrow){throw toThrow};var ENVIRONMENT_IS_WEB=false;var ENVIRONMENT_IS_WORKER=false;var ENVIRONMENT_IS_NODE=false;var ENVIRONMENT_IS_SHELL=false;ENVIRONMENT_IS_WEB=typeof window==="object";ENVIRONMENT_IS_WORKER=typeof importScripts==="function";ENVIRONMENT_IS_NODE=typeof process==="object"&&typeof process.versions==="object"&&typeof process.versions.node==="string";ENVIRONMENT_IS_SHELL=!ENVIRONMENT_IS_WEB&&!ENVIRONMENT_IS_NODE&&!ENVIRONMENT_IS_WORKER;var scriptDirectory="";function locateFile(path){if(Module["locateFile"]){return Module["locateFile"](path,scriptDirectory)}return scriptDirectory+path}var read_,readAsync,readBinary,setWindowTitle;var nodeFS;var nodePath;if(ENVIRONMENT_IS_NODE){if(ENVIRONMENT_IS_WORKER){scriptDirectory=require("path").dirname(scriptDirectory)+"/"}else{scriptDirectory=__dirname+"/"}read_=function shell_read(filename,binary){if(!nodeFS)nodeFS=require("fs");if(!nodePath)nodePath=require("path");filename=nodePath["normalize"](filename);return nodeFS["readFileSync"](filename,binary?null:"utf8")};readBinary=function readBinary(filename){var ret=read_(filename,true);if(!ret.buffer){ret=new Uint8Array(ret)}assert(ret.buffer);return ret};if(process["argv"].length>1){thisProgram=process["argv"][1].replace(/\\/g,"/")}arguments_=process["argv"].slice(2);if(typeof module!=="undefined"){module["exports"]=Module}process["on"]("uncaughtException",function(ex){if(!(ex instanceof ExitStatus)){throw ex}});process["on"]("unhandledRejection",abort);quit_=function(status){process["exit"](status)};Module["inspect"]=function(){return"[Emscripten Module object]"}}else if(ENVIRONMENT_IS_SHELL){if(typeof read!="undefined"){read_=function shell_read(f){return read(f)}}readBinary=function readBinary(f){var data;if(typeof readbuffer==="function"){return new Uint8Array(readbuffer(f))}data=read(f,"binary");assert(typeof data==="object");return data};if(typeof scriptArgs!="undefined"){arguments_=scriptArgs}else if(typeof arguments!="undefined"){arguments_=arguments}if(typeof quit==="function"){quit_=function(status){quit(status)}}if(typeof print!=="undefined"){if(typeof console==="undefined")console={};console.log=print;console.warn=console.error=typeof printErr!=="undefined"?printErr:print}}else if(ENVIRONMENT_IS_WEB||ENVIRONMENT_IS_WORKER){if(ENVIRONMENT_IS_WORKER){scriptDirectory=self.location.href}else if(typeof document!=="undefined"&&document.currentScript){scriptDirectory=document.currentScript.src}if(scriptDirectory.indexOf("blob:")!==0){scriptDirectory=scriptDirectory.substr(0,scriptDirectory.lastIndexOf("/")+1)}else{scriptDirectory=""}{read_=function(url){var xhr=new XMLHttpRequest;xhr.open("GET",url,false);xhr.send(null);return xhr.responseText};if(ENVIRONMENT_IS_WORKER){readBinary=function(url){var xhr=new XMLHttpRequest;xhr.open("GET",url,false);xhr.responseType="arraybuffer";xhr.send(null);return new Uint8Array(xhr.response)}}readAsync=function(url,onload,onerror){var xhr=new XMLHttpRequest;xhr.open("GET",url,true);xhr.responseType="arraybuffer";xhr.onload=function(){if(xhr.status==200||xhr.status==0&&xhr.response){onload(xhr.response);return}onerror()};xhr.onerror=onerror;xhr.send(null)}}setWindowTitle=function(title){document.title=title}}else{}var out=Module["print"]||console.log.bind(console);var err=Module["printErr"]||console.warn.bind(console);for(key in moduleOverrides){if(moduleOverrides.hasOwnProperty(key)){Module[key]=moduleOverrides[key]}}moduleOverrides=null;if(Module["arguments"])arguments_=Module["arguments"];if(Module["thisProgram"])thisProgram=Module["thisProgram"];if(Module["quit"])quit_=Module["quit"];var wasmBinary;if(Module["wasmBinary"])wasmBinary=Module["wasmBinary"];var noExitRuntime=Module["noExitRuntime"]||true;if(typeof WebAssembly!=="object"){abort("no native wasm support detected")}var wasmMemory;var ABORT=false;var EXITSTATUS;function assert(condition,text){if(!condition){abort("Assertion failed: "+text)}}var ALLOC_NORMAL=0;var ALLOC_STACK=1;function allocate(slab,allocator){var ret;if(allocator==ALLOC_STACK){ret=stackAlloc(slab.length)}else{ret=_malloc(slab.length)}if(slab.subarray||slab.slice){HEAPU8.set(slab,ret)}else{HEAPU8.set(new Uint8Array(slab),ret)}return ret}var UTF8Decoder=typeof TextDecoder!=="undefined"?new TextDecoder("utf8"):undefined;function UTF8ArrayToString(heap,idx,maxBytesToRead){var endIdx=idx+maxBytesToRead;var endPtr=idx;while(heap[endPtr]&&!(endPtr>=endIdx))++endPtr;if(endPtr-idx>16&&heap.subarray&&UTF8Decoder){return UTF8Decoder.decode(heap.subarray(idx,endPtr))}else{var str="";while(idx<endPtr){var u0=heap[idx++];if(!(u0&128)){str+=String.fromCharCode(u0);continue}var u1=heap[idx++]&63;if((u0&224)==192){str+=String.fromCharCode((u0&31)<<6|u1);continue}var u2=heap[idx++]&63;if((u0&240)==224){u0=(u0&15)<<12|u1<<6|u2}else{u0=(u0&7)<<18|u1<<12|u2<<6|heap[idx++]&63}if(u0<65536){str+=String.fromCharCode(u0)}else{var ch=u0-65536;str+=String.fromCharCode(55296|ch>>10,56320|ch&1023)}}}return str}function UTF8ToString(ptr,maxBytesToRead){return ptr?UTF8ArrayToString(HEAPU8,ptr,maxBytesToRead):""}function alignUp(x,multiple){if(x%multiple>0){x+=multiple-x%multiple}return x}var buffer,HEAP8,HEAPU8,HEAP16,HEAPU16,HEAP32,HEAPU32,HEAPF32,HEAPF64;function updateGlobalBufferAndViews(buf){buffer=buf;Module["HEAP8"]=HEAP8=new Int8Array(buf);Module["HEAP16"]=HEAP16=new Int16Array(buf);Module["HEAP32"]=HEAP32=new Int32Array(buf);Module["HEAPU8"]=HEAPU8=new Uint8Array(buf);Module["HEAPU16"]=HEAPU16=new Uint16Array(buf);Module["HEAPU32"]=HEAPU32=new Uint32Array(buf);Module["HEAPF32"]=HEAPF32=new Float32Array(buf);Module["HEAPF64"]=HEAPF64=new Float64Array(buf)}var INITIAL_MEMORY=Module["INITIAL_MEMORY"]||16777216;var wasmTable;var __ATPRERUN__=[];var __ATINIT__=[];var __ATPOSTRUN__=[];var runtimeInitialized=false;function preRun(){if(Module["preRun"]){if(typeof Module["preRun"]=="function")Module["preRun"]=[Module["preRun"]];while(Module["preRun"].length){addOnPreRun(Module["preRun"].shift())}}callRuntimeCallbacks(__ATPRERUN__)}function initRuntime(){runtimeInitialized=true;callRuntimeCallbacks(__ATINIT__)}function postRun(){if(Module["postRun"]){if(typeof Module["postRun"]=="function")Module["postRun"]=[Module["postRun"]];while(Module["postRun"].length){addOnPostRun(Module["postRun"].shift())}}callRuntimeCallbacks(__ATPOSTRUN__)}function addOnPreRun(cb){__ATPRERUN__.unshift(cb)}function addOnInit(cb){__ATINIT__.unshift(cb)}function addOnPostRun(cb){__ATPOSTRUN__.unshift(cb)}var runDependencies=0;var runDependencyWatcher=null;var dependenciesFulfilled=null;function addRunDependency(id){runDependencies++;if(Module["monitorRunDependencies"]){Module["monitorRunDependencies"](runDependencies)}}function removeRunDependency(id){runDependencies--;if(Module["monitorRunDependencies"]){Module["monitorRunDependencies"](runDependencies)}if(runDependencies==0){if(runDependencyWatcher!==null){clearInterval(runDependencyWatcher);runDependencyWatcher=null}if(dependenciesFulfilled){var callback=dependenciesFulfilled;dependenciesFulfilled=null;callback()}}}Module["preloadedImages"]={};Module["preloadedAudios"]={};function abort(what){if(Module["onAbort"]){Module["onAbort"](what)}what+="";err(what);ABORT=true;EXITSTATUS=1;what="abort("+what+"). Build with -s ASSERTIONS=1 for more info.";var e=new WebAssembly.RuntimeError(what);throw e}var dataURIPrefix="data:application/octet-stream;base64,";function isDataURI(filename){return filename.startsWith(dataURIPrefix)}function isFileURI(filename){return filename.startsWith("file://")}var wasmBinaryFile="argon2.wasm";if(!isDataURI(wasmBinaryFile)){wasmBinaryFile=locateFile(wasmBinaryFile)}function getBinary(file){try{if(file==wasmBinaryFile&&wasmBinary){return new Uint8Array(wasmBinary)}if(readBinary){return readBinary(file)}else{throw"both async and sync fetching of the wasm failed"}}catch(err){abort(err)}}function getBinaryPromise(){if(!wasmBinary&&(ENVIRONMENT_IS_WEB||ENVIRONMENT_IS_WORKER)){if(typeof fetch==="function"&&!isFileURI(wasmBinaryFile)){return fetch(wasmBinaryFile,{credentials:"same-origin"}).then(function(response){if(!response["ok"]){throw"failed to load wasm binary file at '"+wasmBinaryFile+"'"}return response["arrayBuffer"]()}).catch(function(){return getBinary(wasmBinaryFile)})}else{if(readAsync){return new Promise(function(resolve,reject){readAsync(wasmBinaryFile,function(response){resolve(new Uint8Array(response))},reject)})}}}return Promise.resolve().then(function(){return getBinary(wasmBinaryFile)})}function createWasm(){var info={"a":asmLibraryArg};function receiveInstance(instance,module){var exports=instance.exports;Module["asm"]=exports;wasmMemory=Module["asm"]["c"];updateGlobalBufferAndViews(wasmMemory.buffer);wasmTable=Module["asm"]["k"];addOnInit(Module["asm"]["d"]);removeRunDependency("wasm-instantiate")}addRunDependency("wasm-instantiate");function receiveInstantiationResult(result){receiveInstance(result["instance"])}function instantiateArrayBuffer(receiver){return getBinaryPromise().then(function(binary){var result=WebAssembly.instantiate(binary,info);return result}).then(receiver,function(reason){err("failed to asynchronously prepare wasm: "+reason);abort(reason)})}function instantiateAsync(){if(!wasmBinary&&typeof WebAssembly.instantiateStreaming==="function"&&!isDataURI(wasmBinaryFile)&&!isFileURI(wasmBinaryFile)&&typeof fetch==="function"){return fetch(wasmBinaryFile,{credentials:"same-origin"}).then(function(response){var result=WebAssembly.instantiateStreaming(response,info);return result.then(receiveInstantiationResult,function(reason){err("wasm streaming compile failed: "+reason);err("falling back to ArrayBuffer instantiation");return instantiateArrayBuffer(receiveInstantiationResult)})})}else{return instantiateArrayBuffer(receiveInstantiationResult)}}if(Module["instantiateWasm"]){try{var exports=Module["instantiateWasm"](info,receiveInstance);return exports}catch(e){err("Module.instantiateWasm callback failed with error: "+e);return false}}instantiateAsync();return{}}function callRuntimeCallbacks(callbacks){while(callbacks.length>0){var callback=callbacks.shift();if(typeof callback=="function"){callback(Module);continue}var func=callback.func;if(typeof func==="number"){if(callback.arg===undefined){wasmTable.get(func)()}else{wasmTable.get(func)(callback.arg)}}else{func(callback.arg===undefined?null:callback.arg)}}}function _emscripten_memcpy_big(dest,src,num){HEAPU8.copyWithin(dest,src,src+num)}function emscripten_realloc_buffer(size){try{wasmMemory.grow(size-buffer.byteLength+65535>>>16);updateGlobalBufferAndViews(wasmMemory.buffer);return 1}catch(e){}}function _emscripten_resize_heap(requestedSize){var oldSize=HEAPU8.length;requestedSize=requestedSize>>>0;var maxHeapSize=2147418112;if(requestedSize>maxHeapSize){return false}for(var cutDown=1;cutDown<=4;cutDown*=2){var overGrownHeapSize=oldSize*(1+.2/cutDown);overGrownHeapSize=Math.min(overGrownHeapSize,requestedSize+100663296);var newSize=Math.min(maxHeapSize,alignUp(Math.max(requestedSize,overGrownHeapSize),65536));var replacement=emscripten_realloc_buffer(newSize);if(replacement){return true}}return false}var asmLibraryArg={"a":_emscripten_memcpy_big,"b":_emscripten_resize_heap};var asm=createWasm();var ___wasm_call_ctors=Module["___wasm_call_ctors"]=function(){return(___wasm_call_ctors=Module["___wasm_call_ctors"]=Module["asm"]["d"]).apply(null,arguments)};var _argon2_hash=Module["_argon2_hash"]=function(){return(_argon2_hash=Module["_argon2_hash"]=Module["asm"]["e"]).apply(null,arguments)};var _malloc=Module["_malloc"]=function(){return(_malloc=Module["_malloc"]=Module["asm"]["f"]).apply(null,arguments)};var _free=Module["_free"]=function(){return(_free=Module["_free"]=Module["asm"]["g"]).apply(null,arguments)};var _argon2_verify=Module["_argon2_verify"]=function(){return(_argon2_verify=Module["_argon2_verify"]=Module["asm"]["h"]).apply(null,arguments)};var _argon2_error_message=Module["_argon2_error_message"]=function(){return(_argon2_error_message=Module["_argon2_error_message"]=Module["asm"]["i"]).apply(null,arguments)};var _argon2_encodedlen=Module["_argon2_encodedlen"]=function(){return(_argon2_encodedlen=Module["_argon2_encodedlen"]=Module["asm"]["j"]).apply(null,arguments)};var _argon2_hash_ext=Module["_argon2_hash_ext"]=function(){return(_argon2_hash_ext=Module["_argon2_hash_ext"]=Module["asm"]["l"]).apply(null,arguments)};var _argon2_verify_ext=Module["_argon2_verify_ext"]=function(){return(_argon2_verify_ext=Module["_argon2_verify_ext"]=Module["asm"]["m"]).apply(null,arguments)};var stackAlloc=Module["stackAlloc"]=function(){return(stackAlloc=Module["stackAlloc"]=Module["asm"]["n"]).apply(null,arguments)};Module["allocate"]=allocate;Module["UTF8ToString"]=UTF8ToString;Module["ALLOC_NORMAL"]=ALLOC_NORMAL;var calledRun;function ExitStatus(status){this.name="ExitStatus";this.message="Program terminated with exit("+status+")";this.status=status}dependenciesFulfilled=function runCaller(){if(!calledRun)run();if(!calledRun)dependenciesFulfilled=runCaller};function run(args){args=args||arguments_;if(runDependencies>0){return}preRun();if(runDependencies>0){return}function doRun(){if(calledRun)return;calledRun=true;Module["calledRun"]=true;if(ABORT)return;initRuntime();if(Module["onRuntimeInitialized"])Module["onRuntimeInitialized"]();postRun()}if(Module["setStatus"]){Module["setStatus"]("Running...");setTimeout(function(){setTimeout(function(){Module["setStatus"]("")},1);doRun()},1)}else{doRun()}}Module["run"]=run;if(Module["preInit"]){if(typeof Module["preInit"]=="function")Module["preInit"]=[Module["preInit"]];while(Module["preInit"].length>0){Module["preInit"].pop()()}}run();if(typeof module!=="undefined")module.exports=Module;Module.unloadRuntime=function(){if(typeof self!=="undefined"){delete self.Module}Module=jsModule=wasmMemory=wasmTable=asm=buffer=HEAP8=HEAPU8=HEAP16=HEAPU16=HEAP32=HEAPU32=HEAPF32=HEAPF64=undefined;if(typeof module!=="undefined"){delete module.exports}};
````

## apps/web/public/vendor/argon2.wasm

Full creation path: `/workspace/scratch/ef7b82d54654/sentinel-vault/apps/web/public/vendor/argon2.wasm`

Pinned upstream Argon2 binding/reference WASM asset, shipped locally.  
Provenance, license and byte hashes are listed in THIRD-PARTY.md.

Binary artifact: 25725 bytes; SHA-256 `0c2149886c13e4eae4a6ca25ee71d47423c5c8740a874cf04ff816d1b2c901d7`.

## apps/web/src/App.tsx

Full creation path: `/workspace/scratch/ef7b82d54654/sentinel-vault/apps/web/src/App.tsx`

Provides the local React vault interface, crypto worker or static application shell.  
Secrets are decrypted only for deliberate local operations; no telemetry is included.

````tsx
import React, { useEffect, useRef, useState } from "react";
import {
  startRegistration,
  startAuthentication,
} from "@simplewebauthn/browser";
import zxcvbn from "zxcvbn";
import type { Analysis } from "../../../packages/crypto/analyze";
import { api, ApiError, setCsrf } from "./api";
import { CryptoClient } from "./worker-client";
import { clearCache, readCache, writeCache, type CachedVault } from "./storage";
import { copySecret } from "./clipboard";
import { passwordBytes } from "../../../packages/crypto/bytes";
import { importCsv } from "../../../packages/shared/import-csv";
import {
  EnvelopeSchema,
  ExportSchema,
  type Account,
  type Envelope,
  type Profile,
  type Share,
  type SharedRow,
  type VaultItem,
} from "../../../packages/shared/schema";

interface Card {
  id: string;
  revision: number;
  site: string;
  username: string;
  url: string;
  folder: string;
  tags: string[];
  favorite: boolean;
  score: number;
  old: boolean;
  reused: boolean;
}
type Row = {
  id: string;
  revision: number;
  envelope: Envelope | null;
  deleted: boolean;
};
type Pending = CachedVault["pending"][number];
const engine = new CryptoClient();
const empty = (): VaultItem => ({
  site: "",
  username: "",
  password: "",
  notes: "",
  url: "",
  folder: "",
  tags: [],
  favorite: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  passwordChangedAt: new Date().toISOString(),
  history: [],
});
function download(name: string, value: unknown) {
  const url = URL.createObjectURL(
    new Blob([JSON.stringify(value, null, 2)], { type: "application/json" }),
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export default function App() {
  const [account, setAccount] = useState<Account>(),
    [unlocked, setUnlocked] = useState(false),
    [cards, setCards] = useState<Card[]>([]),
    [page, setPage] = useState("vault"),
    [notice, setNotice] = useState(""),
    [busy, setBusy] = useState(false),
    [offline, setOffline] = useState(false),
    [cacheEnabled, setCacheEnabled] = useState(
      localStorage.getItem("sv-cache") === "true",
    ),
    [pending, setPending] = useState<Pending[]>([]);
  const [query, setQuery] = useState(""),
    [folder, setFolder] = useState(""),
    [favorites, setFavorites] = useState(false),
    [editing, setEditing] = useState<{ id?: string; item: VaultItem }>(),
    [detail, setDetail] = useState<{ card: Card; item: VaultItem }>(),
    [shares, setShares] = useState<SharedRow[]>([]),
    [breaches, setBreaches] = useState<Record<string, string>>({}),
    [importing, setImporting] = useState<{
      items: VaultItem[];
      skipped: number;
    }>();
  const [lockMinutes, setLockMinutes] = useState(
      [1, 2, 5, 10, 15, 30].includes(Number(localStorage.getItem("sv-lock")))
        ? Number(localStorage.getItem("sv-lock"))
        : 5,
    ),
    [theme, setTheme] = useState(localStorage.getItem("sv-theme") || "dark");
  const rows = useRef<Row[]>([]),
    lastActivity = useRef(Date.now()),
    lockChannel = useRef<BroadcastChannel | undefined>(undefined),
    current = useRef({ account, pending, cacheEnabled });
  current.current = { account, pending, cacheEnabled };
  const notify = (message: string) => setNotice(message);
  const lock = (broadcast = true) => {
    engine.lock();
    setUnlocked(false);
    setCards([]);
    setDetail(undefined);
    setEditing(undefined);
    setImporting(undefined);
    setBreaches({});
    setPage("vault");
    setQuery("");
    if (broadcast) lockChannel.current?.postMessage("lock");
  };
  async function action(fn: () => Promise<void>) {
    setBusy(true);
    setNotice("");
    try {
      await fn();
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Operation failed.");
    } finally {
      setBusy(false);
    }
  }
  const exportValue = (user: Account, list = rows.current) =>
    ExportSchema.parse({
      format: "sentinel-vault",
      version: 1,
      userId: user.id,
      profile: user.profile,
      profileRevision: user.profileRevision,
      items: list.filter((r) => !r.deleted).map((r) => r.envelope),
      exportedAt: new Date().toISOString(),
    });
  async function persist(
    user = account,
    list = rows.current,
    queue = current.current.pending,
  ) {
    if (current.current.cacheEnabled && user)
      await writeCache({
        export: exportValue(user, list),
        email: user.email,
        twoFactor: user.twoFactor,
        pending: queue,
      });
  }
  async function renderCards(list = rows.current) {
    setCards(
      await engine.call("list", {
        items: list.filter((r) => !r.deleted).map((r) => r.envelope),
      }),
    );
  }
  async function load(user = account) {
    if (!user) return;
    if (current.current.pending.length)
      throw new Error(
        "Synchronize or discard pending changes before refreshing.",
      );
    const result = await api("/items");
    rows.current = result.items;
    await renderCards();
    setShares((await api("/shares")).shares);
    setOffline(false);
    await persist(user);
  }
  useEffect(() => {
    void (async () => {
      try {
        const result = await api("/account");
        await signedIn(result);
      } catch {
        /* A locked cache is opened only by the user's explicit action. */
      }
    })();
    return () => engine.lock();
  }, []);
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("sv-theme", theme);
  }, [theme]);
  useEffect(() => {
    const channel = new BroadcastChannel("sentinel-lock");
    lockChannel.current = channel;
    channel.onmessage = () => lock(false);
    return () => {
      channel.close();
      lockChannel.current = undefined;
    };
  }, []);
  useEffect(() => {
    if (!unlocked) return;
    lastActivity.current = Date.now();
    const activity = () => {
      lastActivity.current = Date.now();
    };
    const hidden = () => {
      if (document.hidden) lock();
    };
    const leaving = () => lock();
    for (const event of ["pointerdown", "keydown", "touchstart"])
      window.addEventListener(event, activity, { passive: true });
    document.addEventListener("visibilitychange", hidden);
    window.addEventListener("pagehide", leaving);
    const timer = setInterval(() => {
      if (Date.now() - lastActivity.current >= lockMinutes * 60000) lock();
    }, 1000);
    return () => {
      clearInterval(timer);
      for (const event of ["pointerdown", "keydown", "touchstart"])
        window.removeEventListener(event, activity);
      document.removeEventListener("visibilitychange", hidden);
      window.removeEventListener("pagehide", leaving);
    };
  }, [unlocked, lockMinutes]);
  async function signedIn(result: any) {
    if (result.twoFactorRequired) {
      setPage("second-factor");
      return;
    }
    setAccount(result.account);
    setCsrf(result.csrfToken || "");
    const cached = await readCache(result.account.id);
    if (
      cached &&
      cached.export.userId === result.account.id &&
      cached.pending.length
    ) {
      rows.current = cached.export.items.map((envelope) => ({
        id: envelope.id,
        revision: envelope.revision,
        envelope,
        deleted: false,
      }));
      setPending(cached.pending);
      current.current.pending = cached.pending;
      setOffline(true);
    } else {
      setPending([]);
      current.current.pending = [];
      setOffline(false);
    }
    setPage("vault");
  }
  async function signIn() {
    lock();
    setAccount(undefined);
    setCsrf("");
    await signedIn(
      await api("/auth/login/finish", "POST", {
        response: await startAuthentication({
          optionsJSON: (await api("/auth/login/options", "POST", {})).options,
        }),
      }),
    );
  }
  async function register(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget,
      data = new FormData(form),
      master = String(data.get("master") || ""),
      confirm = String(data.get("confirm") || "");
    if (
      !(await engine.call("compare", {
        a: passwordBytes(master),
        b: passwordBytes(confirm),
      }))
    ) {
      notify("The master passwords do not match.");
      return;
    }
    if (zxcvbn(master.slice(0, 256)).score < 3) {
      notify(
        "Choose a stronger master password, preferably a long random passphrase.",
      );
      return;
    }
    const password = passwordBytes(master);
    form.reset();
    await action(async () => {
      const begin = await api("/auth/register/options", "POST", {
        email: data.get("email"),
        registrationToken: data.get("registrationToken"),
      });
      const response = await startRegistration({ optionsJSON: begin.options });
      const profile = await engine.call<Profile>("create", {
        vaultId: begin.vaultId,
        password,
      });
      const result = await api("/auth/register/finish", "POST", {
        response,
        profile,
      });
      await signedIn(result);
      rows.current = [];
      setCards([]);
      setUnlocked(true);
      await persist(result.account, [], []);
    });
    if (!current.current.account) {
      engine.lock();
      setUnlocked(false);
    }
    if (password.byteLength) password.fill(0);
  }
  async function unlock(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget,
      password = passwordBytes(String(new FormData(form).get("master") || ""));
    form.reset();
    await action(async () => {
      if (!account) return;
      await engine.call("unlock", { profile: account.profile, password });
      setUnlocked(true);
      if (offline) {
        await renderCards();
        notify(
          "Offline vault unlocked. Changes remain encrypted until you synchronize.",
        );
      } else {
        await load();
      }
    });
    if (password.byteLength) password.fill(0);
  }
  async function openOffline() {
    const cached = await readCache();
    if (!cached)
      throw new Error("No encrypted offline vault is saved on this device.");
    setAccount({
      id: cached.export.userId,
      email: cached.email,
      vaultId: cached.export.profile.vaultId,
      profile: cached.export.profile,
      profileRevision: cached.export.profileRevision,
      twoFactor: cached.twoFactor,
    });
    rows.current = cached.export.items.map((envelope) => ({
      id: envelope.id,
      revision: envelope.revision,
      envelope,
      deleted: false,
    }));
    setPending(cached.pending);
    current.current.pending = cached.pending;
    setOffline(true);
  }
  async function save(id: string, item: VaultItem) {
    if (!account) throw new Error("Account unavailable.");
    const existing = rows.current.find((r) => r.id === id),
      queued = current.current.pending.find((p) => p.id === id),
      expected = queued?.expectedRevision ?? existing?.revision ?? 0;
    const envelope = await engine.call<Envelope>("save", {
      id,
      revision: expected + 1,
      item,
      previous: existing?.envelope,
    });
    let queue = current.current.pending;
    if (offline) {
      if (!cacheEnabled)
        throw new Error(
          "Enable encrypted offline storage before editing offline.",
        );
      queue = [
        ...current.current.pending.filter((p) => p.id !== id),
        { id, expectedRevision: expected, envelope, deleted: false },
      ];
      setPending(queue);
      current.current.pending = queue;
    } else {
      await api("/items/" + id, "PUT", {
        expectedRevision: expected,
        envelope,
      });
    }
    rows.current = [
      ...rows.current.filter((r) => r.id !== id),
      { id, revision: envelope.revision, envelope, deleted: false },
    ];
    await persist(account, rows.current, queue);
    await renderCards();
    setEditing(undefined);
    setDetail(undefined);
    notify(offline ? "Saved encrypted offline change." : "Credential saved.");
  }
  async function remove(id: string) {
    if (
      !window.confirm(
        "Delete this credential and revoke its server-side shares? Existing copies and backups may remain.",
      )
    )
      return;
    const existing = rows.current.find((r) => r.id === id);
    if (!existing || !account) return;
    const queued = current.current.pending.find((p) => p.id === id),
      expected = queued?.expectedRevision ?? existing.revision;
    let queue = current.current.pending.filter((p) => p.id !== id);
    if (offline) {
      if (expected > 0)
        queue.push({
          id,
          expectedRevision: expected,
          envelope: null,
          deleted: true,
        });
      setPending(queue);
      current.current.pending = queue;
    } else await api("/items/" + id, "DELETE", { expectedRevision: expected });
    rows.current = rows.current.filter((r) => r.id !== id);
    await persist(account, rows.current, queue);
    await renderCards();
    setDetail(undefined);
    notify(
      offline ? "Deletion queued for synchronization." : "Credential deleted.",
    );
  }
  async function sync() {
    const fresh = await api("/account");
    if (fresh.account.id !== account?.id)
      throw new Error(
        "Sign in with the cached vault’s account before synchronization.",
      );
    setCsrf(fresh.csrfToken || "");
    await engine.call("refreshProfile", { profile: fresh.account.profile });
    setAccount(fresh.account);
    let remaining = [...pending];
    for (const change of [...pending]) {
      await api(
        "/items/" + change.id,
        change.deleted ? "DELETE" : "PUT",
        change.deleted
          ? { expectedRevision: change.expectedRevision }
          : {
              expectedRevision: change.expectedRevision,
              envelope: change.envelope,
            },
      );
      remaining = remaining.filter((p) => p.id !== change.id);
      setPending(remaining);
      current.current.pending = remaining;
      await persist(fresh.account, rows.current, remaining);
    }
    await load(fresh.account);
    setOffline(false);
    notify("Encrypted changes synchronized.");
  }
  async function discardPending() {
    if (
      !window.confirm(
        "Discard pending offline changes and fetch the server copy? Export an encrypted backup first.",
      )
    )
      return;
    const fresh = await api("/account");
    if (fresh.account.id !== account?.id)
      throw new Error("Sign in with this account first.");
    setCsrf(fresh.csrfToken || "");
    setAccount(fresh.account);
    await engine.call("refreshProfile", { profile: fresh.account.profile });
    setPending([]);
    current.current.pending = [];
    await load(fresh.account);
    await persist(fresh.account, rows.current, []);
  }
  async function updateProfile(profile: Profile) {
    if (!account) throw new Error("Account unavailable.");
    try {
      const result = await api("/account/profile", "PUT", {
        profile,
        expectedRevision: account.profileRevision,
      });
      const next = {
        ...account,
        profile,
        profileRevision: result.profileRevision,
      };
      await engine.call("refreshProfile", { profile });
      setAccount(next);
      await persist(next);
    } catch (error) {
      await engine.call("refreshProfile", { profile: account.profile });
      throw error;
    }
  }
  const visible = cards.filter(
    (c) =>
      (!query ||
        [c.site, c.username, c.url, ...c.tags]
          .join(" ")
          .toLowerCase()
          .includes(query.toLowerCase())) &&
      (!folder || c.folder === folder) &&
      (!favorites || c.favorite),
  );
  const health = {
    weak: cards.filter((c) => c.score < 3).length,
    reused: cards.filter((c) => c.reused).length,
    old: cards.filter((c) => c.old).length,
    breached: Object.values(breaches).filter((v) => v === "breached").length,
  };
  const header = (
    <header className="topbar">
      <div className="brand">
        <svg viewBox="0 0 32 32" aria-hidden="true">
          <path d="M16 3 27 8v8c0 7-11 13-11 13S5 23 5 16V8Z" />
          <path d="m11 15 4 4 7-8" />
        </svg>
        <span>
          Sentinel<small>PRIVATE VAULT</small>
        </span>
      </div>
      <div className="top-actions">
        <span className="status-dot">
          {unlocked
            ? offline
              ? "Offline · encrypted"
              : "Vault unlocked"
            : "Vault locked"}
        </span>
        <button
          className="icon"
          aria-label="Toggle dark mode"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          {theme === "dark" ? "☀" : "☾"}
        </button>
        {unlocked && <button onClick={() => lock()}>Lock vault</button>}
      </div>
    </header>
  );
  if (!account || !unlocked)
    return (
      <>
        {header}
        <main className="welcome">
          <div className="welcome-copy">
            <span className="eyebrow">
              YOUR DIGITAL LIFE. UNDER YOUR CONTROL.
            </span>
            <h1>
              A private place
              <br />
              for every password<span>.</span>
            </h1>
            <p>
              Your credentials are encrypted on your device. Your master
              password stays with you.
            </p>
            <div className="welcome-features">
              <span>◇ Client encryption</span>
              <span>◇ Passkey sign-in</span>
              <span>◇ Private sharing</span>
            </div>
            <div className="vault-art" aria-hidden="true">
              <div className="art-orbit" />
              <div className="art-safe">
                <span>◈</span>
                <i />
                <i />
                <i />
              </div>
              <div className="art-label">Protected by your master password</div>
            </div>
          </div>
          <section className="auth-card">
            <span className="eyebrow">SENTINEL VAULT</span>
            <h2>
              {account
                ? "Unlock your vault"
                : page === "register"
                  ? "Create your private vault"
                  : page === "second-factor"
                    ? "Verify your sign-in"
                    : "Welcome back"}
            </h2>
            {notice && (
              <p className="notice" role="status">
                {notice}
              </p>
            )}
            {account ? (
              <>
                <p>
                  {account.email}
                  {offline ? " · Offline copy" : ""}
                </p>
                <form onSubmit={unlock}>
                  <label>
                    Master password
                    <input
                      name="master"
                      type="password"
                      autoComplete="off"
                      required
                      maxLength={1024}
                    />
                  </label>
                  <button className="primary full" disabled={busy}>
                    {busy ? "Unlocking…" : "Unlock vault"}
                  </button>
                </form>
                <button
                  className="secondary full"
                  disabled={busy}
                  onClick={() => action(signIn)}
                >
                  Sign in again with passkey
                </button>
                <button
                  className="text"
                  disabled={busy}
                  onClick={() =>
                    action(async () => {
                      lock();
                      setAccount(undefined);
                      setPending([]);
                      rows.current = [];
                      await api("/auth/logout", "POST", {});
                      setCsrf("");
                    })
                  }
                >
                  Sign out
                </button>
              </>
            ) : page === "register" ? (
              <Registration
                busy={busy}
                submit={register}
                back={() => setPage("vault")}
              />
            ) : page === "second-factor" ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const f = e.currentTarget,
                    d = new FormData(f);
                  f.reset();
                  void action(async () =>
                    signedIn(
                      await api("/auth/second-factor", "POST", {
                        code: d.get("code"),
                        recovery: d.get("recovery") === "on",
                      }),
                    ),
                  );
                }}
              >
                <label>
                  Authenticator or recovery code
                  <input
                    name="code"
                    autoComplete="one-time-code"
                    required
                    maxLength={80}
                  />
                </label>
                <label className="check">
                  <input type="checkbox" name="recovery" />
                  Use a recovery code
                </label>
                <button className="primary full" disabled={busy}>
                  Verify
                </button>
                <button
                  type="button"
                  className="text"
                  onClick={() => setPage("vault")}
                >
                  Start sign-in again
                </button>
              </form>
            ) : (
              <>
                <p>
                  Sign in with your passkey, then unlock with your master
                  password.
                </p>
                <button
                  className="primary full"
                  disabled={busy}
                  onClick={() => action(signIn)}
                >
                  {busy ? "Signing in…" : "Sign in with passkey"}
                </button>
                <button
                  className="secondary full"
                  disabled={busy}
                  onClick={() => action(openOffline)}
                >
                  Open encrypted offline vault
                </button>
                <button className="text" onClick={() => setPage("register")}>
                  Create an account
                </button>
                <p className="small">
                  Registration requires your self-hosted server’s invitation
                  token.
                </p>
              </>
            )}
          </section>
        </main>
        <footer className="public-footer">
          No analytics. No third-party scripts. Your vault, your server.
        </footer>
      </>
    );
  return (
    <>
      {header}
      <div className="workspace">
        <aside className="sidebar">
          <p className="nav-label">WORKSPACE</p>
          {[
            ["vault", "◈", "All credentials"],
            ["health", "◉", "Password health"],
            ["generator", "✧", "Generator"],
            ["sharing", "⇄", "Secure sharing"],
            ["security", "◇", "Security settings"],
            ["activity", "≋", "Activity log"],
          ].map(([key, icon, label]) => (
            <button
              key={key}
              className={page === key ? "active" : ""}
              onClick={() => {
                setPage(key);
                setDetail(undefined);
                setEditing(undefined);
              }}
            >
              <span>{icon}</span>
              {label}
              {key === "vault" && <b>{cards.length}</b>}
            </button>
          ))}
          <div className="sidebar-bottom">
            <div className="avatar">{account.email[0].toUpperCase()}</div>
            <strong>{account.email}</strong>
            <small>Auto-lock after {lockMinutes} min</small>
            <button
              className="text"
              onClick={() =>
                action(async () => {
                  await api("/auth/logout", "POST", {});
                  lock();
                  setAccount(undefined);
                  rows.current = [];
                  setPending([]);
                  await clearCache();
                  setCsrf("");
                })
              }
            >
              Sign out & clear offline copy
            </button>
          </div>
        </aside>
        <main className="content">
          <div className="page-heading">
            <div>
              <span className="eyebrow">YOUR SECURITY WORKSPACE</span>
              <h1>
                {
                  (
                    {
                      vault: "All credentials",
                      health: "Password health",
                      generator: "Password generator",
                      sharing: "Secure sharing",
                      security: "Security settings",
                      activity: "Activity log",
                    } as any
                  )[page]
                }
              </h1>
              <p>
                {
                  (
                    {
                      vault:
                        "Organized, encrypted, and ready when you need them.",
                      health:
                        "Find passwords that deserve a stronger replacement.",
                      generator:
                        "Create something unpredictable. Keep it somewhere private.",
                      sharing:
                        "Send an encrypted snapshot to a verified recipient.",
                      security:
                        "Control access, recovery, and this device’s privacy.",
                      activity: "Review account and vault API events.",
                    } as any
                  )[page]
                }
              </p>
            </div>
            {page === "vault" && (
              <button
                className="primary"
                disabled={busy}
                onClick={() => {
                  setDetail(undefined);
                  setEditing({ item: empty() });
                }}
              >
                ＋ Add credential
              </button>
            )}
          </div>
          {notice && (
            <div className="notice" role="status">
              {notice}
              <button
                aria-label="Dismiss notification"
                onClick={() => setNotice("")}
              >
                ×
              </button>
            </div>
          )}
          {pending.length > 0 && (
            <div className="sync-banner">
              <span>
                {pending.length} encrypted offline change(s) awaiting sync.
              </span>
              <button disabled={busy} onClick={() => action(sync)}>
                Synchronize
              </button>
              <button disabled={busy} onClick={() => action(discardPending)}>
                Discard pending changes
              </button>
            </div>
          )}
          {page === "vault" && (
            <>
              <div className="vault-toolbar">
                <input
                  className="search"
                  aria-label="Search vault"
                  placeholder="Search names, usernames, URLs or tags…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
                <select
                  aria-label="Filter folder"
                  value={folder}
                  onChange={(e) => setFolder(e.target.value)}
                >
                  <option value="">All folders</option>
                  {[...new Set(cards.map((c) => c.folder).filter(Boolean))].map(
                    (f) => (
                      <option key={f}>{f}</option>
                    ),
                  )}
                </select>
                <button
                  className={favorites ? "selected" : ""}
                  onClick={() => setFavorites(!favorites)}
                >
                  ☆ Favorites
                </button>
                <button
                  disabled={busy || pending.length > 0}
                  onClick={() => action(() => load())}
                >
                  Refresh
                </button>
              </div>
              <div className="vault-layout">
                <section className="credential-list">
                  {!visible.length ? (
                    <div className="empty-state">
                      <span>◈</span>
                      <h3>
                        {cards.length
                          ? "No matching credentials"
                          : "Your vault starts here"}
                      </h3>
                      <p>
                        {cards.length
                          ? "Try a different search or folder."
                          : "Add a credential or import your existing passwords."}
                      </p>
                      <button onClick={() => setPage("security")}>
                        Import credentials
                      </button>
                    </div>
                  ) : (
                    visible.map((card) => (
                      <button
                        className={
                          "credential-row " +
                          (detail?.card.id === card.id ? "chosen" : "")
                        }
                        key={card.id}
                        onClick={() =>
                          action(async () => {
                            const item = await engine.call<VaultItem>("item", {
                              envelope: rows.current.find(
                                (r) => r.id === card.id,
                              )!.envelope,
                            });
                            setEditing(undefined);
                            setDetail({ card, item });
                          })
                        }
                      >
                        <span className="site-icon">
                          {card.site[0].toUpperCase()}
                        </span>
                        <span className="credential-name">
                          <strong>{card.site}</strong>
                          <small>
                            {card.username || "No username"}
                            {card.folder ? " · " + card.folder : ""}
                          </small>
                        </span>
                        <span
                          className={"strength-pill strength-" + card.score}
                        >
                          {
                            [
                              "Very weak",
                              "Weak",
                              "Fair",
                              "Strong",
                              "Very strong",
                            ][card.score]
                          }
                        </span>
                        <span>{card.favorite ? "★" : "›"}</span>
                      </button>
                    ))
                  )}
                </section>
                {editing ? (
                  <Editor
                    key={editing.id || "new"}
                    item={editing.item}
                    busy={busy}
                    close={() => setEditing(undefined)}
                    submit={(item) =>
                      action(() =>
                        save(editing.id || crypto.randomUUID(), item),
                      )
                    }
                  />
                ) : detail ? (
                  <Detail
                    detail={detail}
                    copy={(value) => action(() => copySecret(value, notify))}
                    edit={() => {
                      setEditing({ id: detail.card.id, item: detail.item });
                      setDetail(undefined);
                    }}
                    remove={() => action(() => remove(detail.card.id))}
                  />
                ) : (
                  <section className="detail-placeholder">
                    <span>◇</span>
                    <h3>Everything in its place.</h3>
                    <p>Select a credential to view its details.</p>
                    <p className="small">Search happens on your device.</p>
                  </section>
                )}
              </div>
            </>
          )}
          {page === "health" && (
            <>
              <div className="health-grid">
                {[
                  ["Weak", health.weak, "score below Strong"],
                  ["Reused", health.reused, "same password, multiple items"],
                  ["Old", health.old, "unchanged for 180+ days"],
                  ["Breached", health.breached, "confirmed by opted-in checks"],
                ].map(([label, note, desc]) => (
                  <div className="health-card" key={label}>
                    <span>{label}</span>
                    <strong>{note}</strong>
                    <small>{desc}</small>
                  </div>
                ))}
              </div>
              <div className="help-box">
                <h3>Breach checks are optional.</h3>
                <p>
                  HIBP receives your IP address and a five-character SHA-1
                  prefix, never the password or full hash. A miss is not proof
                  that a password has never leaked.
                </p>
                <button
                  disabled={busy}
                  onClick={() =>
                    action(async () => {
                      if (
                        !window.confirm(
                          "Query HIBP using a five-character hash prefix for each current password? HIBP will see your IP address.",
                        )
                      )
                        return;
                      for (const card of cards) {
                        const result = await engine.call("breach", {
                          envelope: rows.current.find((r) => r.id === card.id)!
                            .envelope,
                        });
                        setBreaches((previous) => ({
                          ...previous,
                          [card.id]: result.status,
                        }));
                      }
                    })
                  }
                >
                  Run breach checks
                </button>
              </div>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Credential</th>
                      <th>Strength</th>
                      <th>Reuse</th>
                      <th>Age</th>
                      <th>Breach lookup</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cards.map((c) => (
                      <tr key={c.id}>
                        <td>{c.site}</td>
                        <td>
                          {
                            [
                              "Very weak",
                              "Weak",
                              "Fair",
                              "Strong",
                              "Very strong",
                            ][c.score]
                          }
                        </td>
                        <td>{c.reused ? "Reused" : "Unique in this vault"}</td>
                        <td>{c.old ? "180+ days" : "Recent"}</td>
                        <td>{breaches[c.id] || "Not checked"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="small">
                Age alone is not a reason to rotate a strong, unique password.
                Replace compromised, reused or weak passwords first.
              </p>
            </>
          )}
          {page === "generator" && (
            <Generator busy={busy} action={action} notify={notify} />
          )}
          {page === "sharing" && (
            <Sharing
              account={account}
              cards={cards}
              shares={shares}
              busy={busy}
              action={action}
              updateProfile={updateProfile}
              rows={rows.current}
              refresh={async () => setShares((await api("/shares")).shares)}
              notify={notify}
            />
          )}
          {page === "security" && (
            <Security
              account={account}
              busy={busy}
              action={action}
              notify={notify}
              cacheEnabled={cacheEnabled}
              toggleCache={async (enabled: boolean) => {
                if (!enabled && pending.length)
                  throw new Error(
                    "Synchronize pending changes before disabling offline storage.",
                  );
                localStorage.setItem("sv-cache", String(enabled));
                setCacheEnabled(enabled);
                if (enabled)
                  await writeCache({
                    export: exportValue(account),
                    email: account.email,
                    twoFactor: account.twoFactor,
                    pending,
                  });
                else await clearCache();
              }}
              lockMinutes={lockMinutes}
              setLockMinutes={(n: number) => {
                setLockMinutes(n);
                localStorage.setItem("sv-lock", String(n));
              }}
              exportVault={() =>
                download("sentinel-encrypted-vault.json", exportValue(account))
              }
              updateProfile={updateProfile}
              updateAccount={setAccount}
              imported={setImporting}
            />
          )}
          {page === "activity" && <Activity action={action} />}
          {importing && (
            <section className="panel import-review">
              <h2>Review CSV import</h2>
              <p>
                {importing.items.length} login entries; {importing.skipped}{" "}
                unsupported item(s) skipped. Password history and
                provider-specific non-login records are not converted.
                Additional login fields are retained in encrypted notes.
              </p>
              <ul>
                {importing.items.slice(0, 20).map((item, i) => (
                  <li key={i}>
                    {item.site} · {item.username}
                  </li>
                ))}
              </ul>
              <button
                className="primary"
                disabled={busy}
                onClick={() =>
                  action(async () => {
                    const items = importing.items;
                    setImporting(undefined);
                    let completed = 0;
                    try {
                      for (const item of items) {
                        await save(crypto.randomUUID(), item);
                        completed++;
                      }
                    } catch {
                      throw new Error(
                        "Imported " +
                          completed +
                          " of " +
                          items.length +
                          " credentials before an error. Check the vault before retrying.",
                      );
                    }
                    notify("Imported " + completed + " encrypted credentials.");
                  })
                }
              >
                Encrypt and import
              </button>
              <button onClick={() => setImporting(undefined)}>Cancel</button>
            </section>
          )}
        </main>
      </div>
    </>
  );
}

function Registration({
  busy,
  submit,
  back,
}: {
  busy: boolean;
  submit: (e: React.FormEvent<HTMLFormElement>) => void;
  back: () => void;
}) {
  const [score, setScore] = useState(0);
  return (
    <form onSubmit={submit}>
      <label>
        Email
        <input
          name="email"
          type="email"
          required
          maxLength={254}
          autoComplete="email"
        />
      </label>
      <label>
        Invitation token
        <input
          name="registrationToken"
          type="password"
          required
          autoComplete="off"
        />
      </label>
      <label>
        Master password
        <input
          name="master"
          type="password"
          required
          maxLength={1024}
          autoComplete="new-password"
          onChange={(e) => setScore(zxcvbn(e.target.value.slice(0, 256)).score)}
        />
      </label>
      <div className={"strength-meter strength-" + score}>
        <i />
        <span>
          {["Very weak", "Weak", "Fair", "Strong", "Very strong"][score]}
        </span>
      </div>
      <label>
        Confirm master password
        <input
          name="confirm"
          type="password"
          required
          maxLength={1024}
          autoComplete="new-password"
        />
      </label>
      <p className="small">
        Store your master password safely. Neither the server nor recovery codes
        can restore it. Your passkey authenticates the account separately.
      </p>
      <button className="primary full" disabled={busy}>
        {busy ? "Creating vault…" : "Create vault & passkey"}
      </button>
      <button type="button" className="text" onClick={back}>
        Back to sign-in
      </button>
    </form>
  );
}
function Editor({
  item,
  busy,
  close,
  submit,
}: {
  item: VaultItem;
  busy: boolean;
  close: () => void;
  submit: (item: VaultItem) => void;
}) {
  return (
    <form
      className="panel editor"
      onSubmit={(e) => {
        e.preventDefault();
        const d = new FormData(e.currentTarget);
        submit({
          ...item,
          site: String(d.get("site")),
          username: String(d.get("username")),
          password: String(d.get("password")),
          url: String(d.get("url")),
          notes: String(d.get("notes")),
          folder: String(d.get("folder")),
          tags: String(d.get("tags"))
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
          favorite: d.get("favorite") === "on",
        });
      }}
    >
      <div className="panel-heading">
        <h2>Credential details</h2>
        <button type="button" onClick={close} aria-label="Close editor">
          ×
        </button>
      </div>
      {[
        ["site", "Name", "text", 300],
        ["username", "Username", "text", 512],
        ["password", "Password", "password", 4096],
        ["url", "Website URL", "url", 2048],
        ["folder", "Folder", "text", 128],
        ["tags", "Tags, separated by commas", "text", 528],
      ].map(([key, label, type, max]) => (
        <label key={key}>
          {label}
          <input
            name={String(key)}
            type={String(type)}
            maxLength={Number(max)}
            required={key === "site"}
            autoComplete="off"
            defaultValue={
              key === "tags" ? item.tags.join(", ") : (item as any)[key]
            }
          />
        </label>
      ))}
      <label>
        Notes
        <textarea
          name="notes"
          rows={4}
          maxLength={16000}
          defaultValue={item.notes}
        />
      </label>
      <label className="check">
        <input name="favorite" type="checkbox" defaultChecked={item.favorite} />
        Favorite
      </label>
      <button className="primary full" disabled={busy}>
        Save encrypted credential
      </button>
    </form>
  );
}
function Detail({
  detail,
  copy,
  edit,
  remove,
}: {
  detail: { card: Card; item: VaultItem };
  copy: (v: string) => void;
  edit: () => void;
  remove: () => void;
}) {
  const [reveal, setReveal] = useState(false);
  const [analysis, setAnalysis] = useState<Analysis>();
  useEffect(() => {
    let active = true;
    setAnalysis(undefined);
    void engine
      .call<Analysis>("analyze", { password: detail.item.password })
      .then((value) => {
        if (active) setAnalysis(value);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [detail.card.id, detail.card.revision]);

  useEffect(() => {
    setReveal(false);
  }, [detail.card.id]);
  useEffect(() => {
    if (!reveal) return;
    const t = setTimeout(() => setReveal(false), 10000);
    return () => clearTimeout(t);
  }, [reveal]);
  return (
    <section className="panel details">
      <span className="site-icon large">{detail.item.site[0]}</span>
      <h2>{detail.item.site}</h2>
      <p className="small">{detail.item.folder || "No folder"}</p>
      <label>
        Username
        <div className="copy-field">
          <span>{detail.item.username || "—"}</span>
          <button
            aria-label="Copy username"
            onClick={() => copy(detail.item.username)}
          >
            Copy
          </button>
        </div>
      </label>
      <label>
        Password
        <div className="copy-field">
          <span className="secret">
            {reveal ? detail.item.password : "••••••••••••••••"}
          </span>
          <button
            aria-label="Copy password"
            onClick={() => copy(detail.item.password)}
          >
            Copy
          </button>
        </div>
      </label>
      <button className="text" onClick={() => setReveal(!reveal)}>
        {reveal ? "Hide password" : "Reveal for 10 seconds"}
      </button>
      {detail.item.url && (
        <label>
          Website<p className="wrap">{detail.item.url}</p>
        </label>
      )}
      {detail.item.notes && (
        <label>
          Notes<p className="notes">{detail.item.notes}</p>
        </label>
      )}
      <div className="tags">
        {detail.item.tags.map((t) => (
          <span key={t}>{t}</span>
        ))}
      </div>
      <details>
        <summary>Password history ({detail.item.history.length})</summary>
        {detail.item.history.map((h, i) => (
          <div className="history" key={i}>
            <span>{new Date(h.changedAt).toLocaleDateString()}</span>
            <span>••••••••</span>
            <button onClick={() => copy(h.password)}>
              Copy previous password
            </button>
          </div>
        ))}
      </details>
      {analysis && (
        <details>
          <summary>Strength analysis & suggestions</summary>
          <p className="small">
            {analysis.patterns.join(" · ") || "No obvious pattern detected"}
          </p>
          <ul>
            {analysis.suggestions.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
          <p className="small">
            Empirical Shannon statistic:{" "}
            {analysis.shannonBitsPerCharacter.toFixed(2)} bits/character;{" "}
            {analysis.empiricalBits.toFixed(1)} bits across this string.
            Character frequencies cannot measure how unpredictably you chose it.
          </p>
          <p className="small">
            Illustrative guess-time models: GPU at 10¹⁰ guesses/s ≈{" "}
            {analysis.offlineGpuSeconds.toExponential(1)} s; ordered dictionary
            at 10⁸ guesses/s ≈{" "}
            {analysis.offlineDictionarySeconds.toExponential(1)} s. These assume
            a fast target hash, not this vault’s Argon2 cost. Actual attacks
            vary by hash, hardware and password distribution.
          </p>
        </details>
      )}
      <div className="detail-actions">
        <button className="primary" onClick={edit}>
          Edit
        </button>
        <button className="danger" onClick={remove}>
          Delete
        </button>
      </div>
    </section>
  );
}
function Generator({ busy, action, notify }: any) {
  const [mode, setMode] = useState<"password" | "passphrase">("password"),
    [value, setValue] = useState(""),
    [entropy, setEntropy] = useState(0);
  return (
    <section className="panel generator">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const d = new FormData(e.currentTarget);
          void action(async () => {
            const result = await engine.call("generate", {
              mode,
              length: Number(d.get("length")),
              lower: d.get("lower") === "on",
              upper: d.get("upper") === "on",
              digits: d.get("digits") === "on",
              symbols: d.get("symbols") === "on",
            });
            setValue(result.text);
            setEntropy(result.entropyBits);
          });
        }}
      >
        <label>
          Mode
          <select
            value={mode}
            onChange={(e) => {
              setMode(e.target.value as any);
              setValue("");
            }}
          >
            <option value="password">Random password</option>
            <option value="passphrase">Random passphrase</option>
          </select>
        </label>
        <label>
          {mode === "password" ? "Characters" : "Words"}
          <input
            key={mode}
            name="length"
            type="number"
            min={mode === "password" ? 8 : 4}
            max={mode === "password" ? 128 : 16}
            defaultValue={mode === "password" ? 24 : 8}
            required
          />
        </label>
        {mode === "password" && (
          <div className="charset">
            {[
              ["lower", "Lowercase"],
              ["upper", "Uppercase"],
              ["digits", "Digits"],
              ["symbols", "Symbols"],
            ].map(([name, label]) => (
              <label className="check" key={name}>
                <input type="checkbox" name={name} defaultChecked />
                {label}
              </label>
            ))}
          </div>
        )}
        <button className="primary" disabled={busy}>
          Generate
        </button>
      </form>
      {value && (
        <div className="generated">
          <output>{value}</output>
          <p>
            {entropy} bits{" "}
            {mode === "passphrase"
              ? "of generator entropy"
              : "conservative generator entropy estimate"}
          </p>
          <button onClick={() => action(() => copySecret(value, notify))}>
            Copy generated password
          </button>
        </div>
      )}
      <p className="small">
        Generated here using your device’s cryptographic random source.
        Passphrases use a locally bundled 2048-word English list. Generated
        values clear when you leave this view or lock.
      </p>
    </section>
  );
}
function Sharing({
  account,
  cards,
  shares,
  busy,
  action,
  updateProfile,
  rows,
  refresh,
  notify,
}: any) {
  const [ownFingerprint, setOwnFingerprint] = useState("");
  useEffect(() => {
    void engine
      .call<string>("fingerprint", { publicKey: account.profile.publicKey })
      .then(setOwnFingerprint)
      .catch(() => {});
  }, [account.profile.publicKey]);
  const [recipient, setRecipient] = useState<any>(),
    [fingerprint, setFingerprint] = useState(""),
    [opened, setOpened] = useState<VaultItem>();
  async function lookup(email: string) {
    const result = await api("/directory/lookup", "POST", { email });
    setRecipient(result.user);
    setFingerprint(
      await engine.call("fingerprint", { publicKey: result.user.publicKey }),
    );
  }
  return (
    <>
      <section className="panel">
        <h2>Verify a contact</h2>
        <p>Your public identity fingerprint:</p>
        <code className="fingerprint">{ownFingerprint}</code>
        <p>
          Compare the full fingerprint through an independent channel, such as
          an in-person conversation. A fingerprint displayed by this server
          alone does not verify identity.
        </p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const d = new FormData(e.currentTarget);
            void action(() => lookup(String(d.get("email"))));
          }}
        >
          <div className="inline-form">
            <label>
              Recipient email
              <input type="email" name="email" required />
            </label>
            <button disabled={busy}>Find contact</button>
          </div>
        </form>
        {recipient && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const d = new FormData(e.currentTarget);
              if (
                String(d.get("verified")).replace(/\s/g, "").toLowerCase() !==
                fingerprint.replace(/\s/g, "")
              ) {
                notify("The fingerprint does not match.");
                return;
              }
              void action(async () => {
                await updateProfile(
                  await engine.call("trust", {
                    userId: recipient.id,
                    publicKey: recipient.publicKey,
                    label: recipient.email,
                  }),
                );
                notify("Contact fingerprint pinned in your encrypted vault.");
              });
            }}
          >
            <p>
              <strong>{recipient.email}</strong>
            </p>
            <code className="fingerprint">{fingerprint}</code>
            <label>
              Enter the fingerprint verified independently
              <input name="verified" required autoComplete="off" />
            </label>
            <button disabled={busy}>Pin verified contact</button>
          </form>
        )}
      </section>
      <section className="panel">
        <h2>Share a credential snapshot</h2>
        <p>
          The recipient receives the current credential fields and notes.
          Password history is excluded. Revocation blocks future server
          retrieval, but cannot erase copies already obtained.
        </p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const d = new FormData(e.currentTarget);
            void action(async () => {
              if (!recipient)
                throw new Error("Find and verify a recipient first.");
              const record = rows.find((r: any) => r.id === d.get("item"));
              if (!record) throw new Error("Select a credential.");
              const envelope = await engine.call<Share>("share", {
                envelope: record.envelope,
                recipientId: recipient.id,
                publicKey: recipient.publicKey,
              });
              await api("/shares", "POST", {
                recipientId: recipient.id,
                itemId: record.id,
                envelope,
              });
              await refresh();
              notify("Encrypted snapshot shared.");
            });
          }}
        >
          <label>
            Credential
            <select name="item" required>
              <option value="">Choose a credential</option>
              {cards.map((c: Card) => (
                <option key={c.id} value={c.id}>
                  {c.site}
                </option>
              ))}
            </select>
          </label>
          <button className="primary" disabled={busy || !recipient}>
            Share with verified contact
          </button>
        </form>
      </section>
      <section className="panel">
        <h2>Shared items</h2>
        {!shares.length ? (
          <p>No shared items.</p>
        ) : (
          shares.map((s: SharedRow) => (
            <div className="share-row" key={s.id}>
              <span>
                {s.sender_id === account.id
                  ? "To " + s.recipient_email
                  : "From " + s.sender_email}
              </span>
              {s.sender_id === account.id ? (
                <button
                  className="danger"
                  disabled={busy}
                  onClick={() =>
                    action(async () => {
                      if (
                        !window.confirm(
                          "Revoke this server-side share? Existing copies remain accessible.",
                        )
                      )
                        return;
                      await api("/shares/" + s.id, "DELETE", {});
                      await refresh();
                    })
                  }
                >
                  Revoke
                </button>
              ) : (
                <button
                  disabled={busy}
                  onClick={() =>
                    action(async () =>
                      setOpened(
                        await engine.call("openShare", {
                          envelope: s.envelope,
                          senderId: s.sender_id,
                        }),
                      ),
                    )
                  }
                >
                  Decrypt verified snapshot
                </button>
              )}
            </div>
          ))
        )}
        {opened && (
          <div className="shared-detail">
            <h3>{opened.site}</h3>
            <p>{opened.username}</p>
            <button
              onClick={() => action(() => copySecret(opened.password, notify))}
            >
              Copy shared password
            </button>
            <p className="notes">{opened.notes}</p>
            <button onClick={() => setOpened(undefined)}>Close</button>
          </div>
        )}
      </section>
    </>
  );
}
function Security({
  account,
  busy,
  action,
  notify,
  cacheEnabled,
  toggleCache,
  lockMinutes,
  setLockMinutes,
  exportVault,
  updateProfile,
  updateAccount,
  imported,
}: any) {
  const [setup, setSetup] = useState<{ secret: string; uri: string }>(),
    [codes, setCodes] = useState<string[]>([]),
    [pairing, setPairing] = useState(""),
    [sessions, setSessions] = useState<any[]>([]);
  useEffect(() => {
    void api("/sessions")
      .then((r) => setSessions(r.sessions))
      .catch(() => {});
  }, []);
  return (
    <div className="settings-grid">
      <section className="panel">
        <h2>Device privacy</h2>
        <label>
          Auto-lock after inactivity
          <select
            value={lockMinutes}
            onChange={(e) => setLockMinutes(Number(e.target.value))}
          >
            {[1, 2, 5, 10, 15, 30].map((n) => (
              <option value={n} key={n}>
                {n} minutes
              </option>
            ))}
          </select>
        </label>
        <p className="small">
          The vault also locks when this tab is hidden. Other tabs receive a
          lock signal.
        </p>
        <label className="check">
          <input
            type="checkbox"
            checked={cacheEnabled}
            onChange={(e) => action(() => toggleCache(e.target.checked))}
          />
          Keep an encrypted offline copy on this device
        </label>
        <p className="small">
          Only encrypted vault content and necessary public account metadata are
          stored. Never enable this on a shared or untrusted device.
        </p>
        <button onClick={exportVault}>Export encrypted JSON backup</button>
        <label className="file-label">
          Import CSV
          <input
            type="file"
            accept=".csv,text/csv"
            onChange={(e) => {
              const file = e.target.files?.[0];
              e.target.value = "";
              if (file)
                void action(async () => {
                  if (file.size > 2097152)
                    throw new Error("CSV exceeds 2 MiB.");
                  imported(importCsv(await file.text()));
                });
            }}
          />
        </label>
        <p className="small">
          Bitwarden, LastPass and 1Password login CSVs are parsed locally.
          Review before importing. Protect and remove the original plaintext CSV
          yourself.
        </p>
      </section>
      <section className="panel">
        <h2>Master password</h2>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const f = e.currentTarget,
              d = new FormData(f),
              old = String(d.get("old") || ""),
              next = String(d.get("next") || "");
            if (
              !(await engine.call("compare", {
                a: passwordBytes(next),
                b: passwordBytes(String(d.get("confirm") || "")),
              })) ||
              zxcvbn(next.slice(0, 256)).score < 3
            ) {
              notify("Use a strong matching new master password.");
              return;
            }
            const oldPassword = passwordBytes(old),
              newPassword = passwordBytes(next);
            f.reset();
            void action(async () => {
              await updateProfile(
                await engine.call("changePassword", {
                  oldPassword,
                  newPassword,
                }),
              );
              notify(
                "Master password changed. Other sessions were revoked. Old backups still require the old password.",
              );
            });
          }}
        >
          <label>
            Current master password
            <input name="old" type="password" required autoComplete="off" />
          </label>
          <label>
            New master password
            <input
              name="next"
              type="password"
              required
              autoComplete="new-password"
            />
          </label>
          <label>
            Confirm new master password
            <input
              name="confirm"
              type="password"
              required
              autoComplete="new-password"
            />
          </label>
          <button disabled={busy}>Change master password</button>
        </form>
        <p className="small">
          Sign in again first if your authenticated session is older than five
          minutes.
        </p>
      </section>
      <section className="panel">
        <h2>Authenticator protection</h2>
        <p>
          {account.twoFactor
            ? "TOTP authentication is enabled."
            : "TOTP authentication is not enabled."}
        </p>
        {!account.twoFactor && !setup && (
          <button
            disabled={busy}
            onClick={() =>
              action(async () =>
                setSetup(await api("/account/totp/setup", "POST", {})),
              )
            }
          >
            Set up authenticator
          </button>
        )}
        {setup && (
          <>
            <p>
              In Google Authenticator or another TOTP app, choose manual setup:
              time-based, six digits, 30 seconds.
            </p>
            <code className="fingerprint">{setup.secret}</code>
            <details>
              <summary>Authenticator URI</summary>
              <code className="wrap">{setup.uri}</code>
            </details>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const f = e.currentTarget,
                  d = new FormData(f);
                f.reset();
                void action(async () => {
                  const result = await api("/account/totp/confirm", "POST", {
                    code: d.get("code"),
                    recovery: false,
                  });
                  setCodes(result.recoveryCodes);
                  setSetup(undefined);
                  updateAccount({ ...account, twoFactor: true });
                });
              }}
            >
              <label>
                Current authenticator code
                <input
                  name="code"
                  inputMode="numeric"
                  pattern="[0-9]{6}"
                  autoComplete="one-time-code"
                  required
                />
              </label>
              <button disabled={busy}>Enable TOTP</button>
            </form>
          </>
        )}
        {codes.length > 0 && (
          <div className="recovery">
            <h3>Save these recovery codes now</h3>
            <p>
              Each code bypasses TOTP once after passkey sign-in. They cannot
              unlock a vault or recover a lost master password.
            </p>
            {codes.map((c) => (
              <code key={c}>{c}</code>
            ))}
            <button onClick={() => setCodes([])}>I saved them safely</button>
          </div>
        )}
        {account.twoFactor && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const f = e.currentTarget,
                d = new FormData(f);
              f.reset();
              void action(async () => {
                await api("/account/totp/disable", "POST", {
                  code: d.get("code"),
                  recovery: d.get("recovery") === "on",
                });
                updateAccount({ ...account, twoFactor: false });
                setCodes([]);
                notify("TOTP disabled; recovery codes invalidated.");
              });
            }}
          >
            <label>
              Authenticator or recovery code
              <input name="code" required autoComplete="one-time-code" />
            </label>
            <label className="check">
              <input name="recovery" type="checkbox" />
              Use recovery code
            </label>
            <button className="danger" disabled={busy}>
              Disable TOTP
            </button>
          </form>
        )}
        <button
          disabled={busy}
          onClick={() =>
            action(async () => {
              const begin = await api("/account/passkeys/options", "POST", {});
              await api("/account/passkeys/finish", "POST", {
                response: await startRegistration({
                  optionsJSON: begin.options,
                }),
              });
              notify("Additional passkey registered.");
            })
          }
        >
          Add another passkey
        </button>
      </section>
      <section className="panel">
        <h2>Pair your browser extension</h2>
        <p>
          Create a five-minute, single-use pairing token. Paste it into the
          independently installed Sentinel extension and unlock locally with
          your master password.
        </p>
        <button
          disabled={busy}
          onClick={() =>
            action(async () => {
              const result = await api("/devices/pairing", "POST", {
                label: "Browser extension",
              });
              setPairing(result.pairingToken);
            })
          }
        >
          Create pairing token
        </button>
        {pairing && (
          <>
            <code className="fingerprint">{pairing}</code>
            <button onClick={() => action(() => copySecret(pairing, notify))}>
              Copy pairing token
            </button>
            <button onClick={() => setPairing("")}>Hide token</button>
          </>
        )}
        <h3>Account sessions</h3>
        {sessions.map((s) => (
          <div className="share-row" key={s.id}>
            <span>
              {s.label}
              <small>{new Date(s.last_seen).toLocaleString()}</small>
            </span>
            <button
              disabled={busy}
              onClick={() =>
                action(async () => {
                  await api("/sessions/" + s.id, "DELETE", {});
                  setSessions(sessions.filter((v) => v.id !== s.id));
                  notify("Session revoked.");
                })
              }
            >
              Revoke
            </button>
          </div>
        ))}
      </section>
    </div>
  );
}
function Activity({ action }: any) {
  const [events, setEvents] = useState<any[]>([]);
  useEffect(() => {
    void action(async () => setEvents((await api("/audit")).events));
  }, []);
  return (
    <section className="panel">
      <p>
        Only event metadata is recorded. Offline reads are not visible to the
        server, and a compromised server can falsify its own logs.
      </p>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Time</th>
              <th>Event</th>
              <th>Result</th>
            </tr>
          </thead>
          <tbody>
            {events.map((e) => (
              <tr key={e.id}>
                <td>{new Date(e.created_at).toLocaleString()}</td>
                <td>{e.action}</td>
                <td>{e.success ? "Success" : "Failed"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
````

## apps/web/src/api.ts

Full creation path: `/workspace/scratch/ef7b82d54654/sentinel-vault/apps/web/src/api.ts`

Provides the local React vault interface, crypto worker or static application shell.  
Secrets are decrypted only for deliberate local operations; no telemetry is included.

````typescript
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
export let csrfToken = "";
export function setCsrf(value: string) {
  csrfToken = value;
}
export async function api<T = any>(
  path: string,
  method = "GET",
  data?: unknown,
): Promise<T> {
  const controller = new AbortController(),
    timer = setTimeout(() => controller.abort(), 20000);
  try {
    const response = await fetch("/api" + path, {
      method,
      credentials: "same-origin",
      cache: "no-store",
      redirect: "error",
      signal: controller.signal,
      headers: {
        ...(data !== undefined ? { "Content-Type": "application/json" } : {}),
        ...(!["GET", "HEAD"].includes(method) && csrfToken
          ? { "X-CSRF-Token": csrfToken }
          : {}),
      },
      ...(data !== undefined ? { body: JSON.stringify(data) } : {}),
    });
    const result = await response.json();
    if (!response.ok)
      throw new ApiError(response.status, result.error || "Request failed.");
    return result;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(
      0,
      "Connection unavailable. Your encrypted offline copy is unchanged.",
    );
  } finally {
    clearTimeout(timer);
  }
}
````

## apps/web/src/clipboard.ts

Full creation path: `/workspace/scratch/ef7b82d54654/sentinel-vault/apps/web/src/clipboard.ts`

Provides the local React vault interface, crypto worker or static application shell.  
Secrets are decrypted only for deliberate local operations; no telemetry is included.

````typescript
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
````

## apps/web/src/crypto-worker.ts

Full creation path: `/workspace/scratch/ef7b82d54654/sentinel-vault/apps/web/src/crypto-worker.ts`

Provides the local React vault interface, crypto worker or static application shell.  
Secrets are decrypted only for deliberate local operations; no telemetry is included.

````typescript
/// <reference lib="webworker" />
import sodium from "libsodium-wrappers-sumo";
import { prepareRevision } from "../../../packages/crypto/history";
import { VaultCrypto, fingerprint } from "../../../packages/crypto/vault";
import { browserKdf } from "../../../packages/crypto/browser-kdf";
import { generate } from "../../../packages/crypto/generator";
import { breachCheck } from "../../../packages/crypto/breach";
import { analyze } from "../../../packages/crypto/analyze";
import { buffer, utf8, wipe } from "../../../packages/crypto/bytes";
import {
  ItemSchema,
  EnvelopeSchema,
  type Envelope,
} from "../../../packages/shared/schema";
const scope = self as unknown as DedicatedWorkerGlobalScope;
const vault = new VaultCrypto(
  browserKdf(new URL("../kdf-worker.js", scope.location.href).href),
);
async function execute(action: string, args: any): Promise<any> {
  switch (action) {
    case "compare":
      await sodium.ready;
      try {
        return args.a.length === args.b.length && sodium.memcmp(args.a, args.b);
      } finally {
        wipe(args.a, args.b);
      }
    case "create":
      return vault.create(args.vaultId, args.password);
    case "unlock":
      await vault.unlock(args.profile, args.password);
      return true;
    case "lock":
      vault.lock();
      return true;
    case "refreshProfile":
      await vault.refreshProfile(args.profile);
      return true;
    case "contacts":
      return vault.contacts();
    case "trust":
      return vault.trustContact(args.userId, args.publicKey, args.label);
    case "fingerprint":
      return fingerprint(args.publicKey);
    case "changePassword":
      return vault.changePassword(args.oldPassword, args.newPassword);
    case "generate":
      return generate(args);
    case "item":
      return vault.open(args.envelope);
    case "share":
      return vault.share(args.envelope, args.recipientId, args.publicKey);
    case "openShare":
      return vault.openShare(args.envelope, args.senderId);
    case "breach":
      return breachCheck((await vault.open(args.envelope)).password);
    case "analyze":
      return analyze(args.password);
    case "save": {
      const previous = args.previous
        ? await vault.open(args.previous)
        : undefined;
      const value = await prepareRevision(args.item, previous);
      return vault.seal(args.id, args.revision, value);
    }
    case "list": {
      if (!Array.isArray(args.items) || args.items.length > 1000)
        throw new Error("Invalid vault size.");
      // Keyed ephemeral fingerprints identify reuse without returning password hashes or passwords to the UI.
      const key = await crypto.subtle.generateKey(
          { name: "HMAC", hash: "SHA-256" },
          false,
          ["sign"],
        ),
        groups = new Map<string, number>(),
        cards: any[] = [];
      for (const input of args.items) {
        const envelope = EnvelopeSchema.parse(input),
          item = await vault.open(envelope),
          bytes = utf8(item.password);
        let tag: string;
        try {
          const digest = new Uint8Array(
            await crypto.subtle.sign("HMAC", key, buffer(bytes)),
          );
          tag = Array.from(digest, (b) => b.toString(16).padStart(2, "0")).join(
            "",
          );
          digest.fill(0);
        } finally {
          bytes.fill(0);
        }
        const score = analyze(item.password).score;
        groups.set(tag!, (groups.get(tag!) || 0) + 1);
        cards.push({
          id: envelope.id,
          revision: envelope.revision,
          site: item.site,
          username: item.username,
          url: item.url,
          folder: item.folder,
          tags: item.tags,
          favorite: item.favorite,
          updatedAt: item.updatedAt,
          score,
          old: Date.now() - Date.parse(item.passwordChangedAt) > 180 * 86400000,
          tag: tag!,
        });
      }
      return cards.map(({ tag, ...card }) => ({
        ...card,
        reused: groups.get(tag)! > 1,
      }));
    }
    default:
      throw new Error("Unsupported crypto operation.");
  }
}
let chain = Promise.resolve();
scope.onmessage = (event) => {
  const { id, action, args } = event.data || {};
  // Serialize mutations; trust updates cannot race with unlock, key rotation or another item operation.
  chain = chain.then(async () => {
    try {
      const value = await execute(action, args);
      scope.postMessage({ id, value });
    } catch (error) {
      scope.postMessage({
        id,
        error:
          error instanceof Error ? error.message : "Crypto operation failed.",
      });
    } finally {
      for (const value of Object.values(args || {}))
        if (value instanceof Uint8Array) value.fill(0);
    }
  });
};
````

## apps/web/src/main.tsx

Full creation path: `/workspace/scratch/ef7b82d54654/sentinel-vault/apps/web/src/main.tsx`

Provides the local React vault interface, crypto worker or static application shell.  
Secrets are decrypted only for deliberate local operations; no telemetry is included.

````tsx
import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles.css";

createRoot(document.getElementById("root")!).render(<App />);
// The service worker caches application files only; vault persistence is explicit and encrypted.
if (import.meta.env.PROD && "serviceWorker" in navigator) {
  navigator.serviceWorker.register("/sw.js").catch(() => {
    // Offline installation failure must not send telemetry or prevent online use.
  });
}
````

## apps/web/src/storage.ts

Full creation path: `/workspace/scratch/ef7b82d54654/sentinel-vault/apps/web/src/storage.ts`

Provides the local React vault interface, crypto worker or static application shell.  
Secrets are decrypted only for deliberate local operations; no telemetry is included.

````typescript
import { z } from "zod";
import {
  EnvelopeSchema,
  ExportSchema,
  uuid,
  type EncryptedExport,
} from "../../../packages/shared/schema";
const PendingSchema = z
  .array(
    z
      .strictObject({
        id: uuid,
        expectedRevision: z.number().int().min(0).max(2147483646),
        envelope: EnvelopeSchema.nullable(),
        deleted: z.boolean(),
      })
      .refine((p) =>
        p.deleted
          ? p.envelope === null
          : p.envelope?.id === p.id &&
            p.envelope.revision === p.expectedRevision + 1,
      ),
  )
  .max(1000);
export interface CachedVault {
  export: EncryptedExport;
  email: string;
  twoFactor: boolean;
  pending: {
    id: string;
    expectedRevision: number;
    envelope: any;
    deleted: boolean;
  }[];
}
function database(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("sentinel-encrypted-vault", 1);
    request.onupgradeneeded = () =>
      request.result.createObjectStore("vaults", { keyPath: "export.userId" });
    request.onsuccess = () => resolve(request.result);
    request.onerror = () =>
      reject(new Error("Encrypted offline storage unavailable."));
  });
}
export async function readCache(
  userId?: string,
): Promise<CachedVault | undefined> {
  const db = await database();
  try {
    return await new Promise((resolve, reject) => {
      const store = db.transaction("vaults").objectStore("vaults");
      const req = userId ? store.get(userId) : store.getAll();
      req.onsuccess = () => {
        try {
          const latest = userId
            ? req.result
            : req.result.sort((a: CachedVault, b: CachedVault) =>
                b.export.exportedAt.localeCompare(a.export.exportedAt),
              )[0];
          if (latest) {
            ExportSchema.parse(latest.export);
            PendingSchema.parse(latest.pending);
          }
          resolve(latest);
        } catch {
          reject(new Error("Offline cache failed validation."));
        }
      };
      req.onerror = () => reject(new Error("Unable to read offline vault."));
    });
  } finally {
    db.close();
  }
}
export async function writeCache(value: CachedVault) {
  ExportSchema.parse(value.export);
  PendingSchema.parse(value.pending);
  const db = await database();
  try {
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction("vaults", "readwrite");
      tx.objectStore("vaults").put(value);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(new Error("Offline save failed."));
    });
  } finally {
    db.close();
  }
}
export async function clearCache() {
  const db = await database();
  try {
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction("vaults", "readwrite");
      tx.objectStore("vaults").clear();
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(new Error("Unable to clear offline cache."));
    });
  } finally {
    db.close();
  }
}
````

## apps/web/src/styles.css

Full creation path: `/workspace/scratch/ef7b82d54654/sentinel-vault/apps/web/src/styles.css`

Provides the local React vault interface, crypto worker or static application shell.  
Secrets are decrypted only for deliberate local operations; no telemetry is included.

````css
@import url("./theme.css");
* {
  box-sizing: border-box;
}
body {
  margin: 0;
  background: var(--bg);
  color: var(--text);
  font-family:
    Inter,
    ui-sans-serif,
    system-ui,
    -apple-system,
    sans-serif;
  font-size: 14px;
  line-height: 1.6;
}
button,
input,
textarea,
select {
  font: inherit;
}
button {
  cursor: pointer;
  border: 1px solid var(--line);
  border-radius: 8px;
  background: var(--panel);
  color: var(--text);
  padding: 9px 14px;
  transition: background 0.15s;
}
button:hover {
  background: var(--hover);
}
button:disabled {
  opacity: 0.45;
  cursor: wait;
}
button.primary {
  background: var(--accent);
  color: #17261c;
  border-color: var(--accent);
  font-weight: 650;
}
button.primary:hover {
  background: #d0f7d7;
}
.secondary {
  margin-top: 12px;
}
.full {
  width: 100%;
}
.text {
  background: none;
  border: 0;
  color: var(--muted);
  padding: 10px 0;
}
.danger {
  color: var(--danger);
}
input,
textarea,
select {
  display: block;
  width: 100%;
  border: 1px solid var(--line);
  border-radius: 7px;
  background: var(--field);
  color: var(--text);
  padding: 10px 12px;
  margin-top: 6px;
}
input:focus,
textarea:focus,
select:focus {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}
label {
  display: block;
  color: var(--muted);
  font-size: 12px;
  margin-bottom: 16px;
}
.check {
  display: flex;
  align-items: center;
  gap: 9px;
}
.check input {
  width: 16px;
  margin: 0;
  accent-color: var(--accent);
}
h1,
h2,
h3,
p {
  margin-top: 0;
}
h1 {
  font-size: 30px;
  line-height: 1.2;
  font-weight: 550;
  letter-spacing: -1px;
}
h2 {
  font-size: 23px;
  font-weight: 550;
  letter-spacing: -0.6px;
}
h3 {
  font-size: 16px;
  font-weight: 600;
}
p {
  color: var(--muted);
}
.small,
small {
  font-size: 11px;
  color: var(--muted);
}
.eyebrow {
  display: block;
  font-size: 10px;
  letter-spacing: 2px;
  font-weight: 650;
  color: var(--subtle);
  margin-bottom: 14px;
}
.topbar {
  height: 84px;
  padding: 0 40px;
  border-bottom: 1px solid var(--line);
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.brand {
  display: flex;
  align-items: center;
  gap: 11px;
  font-size: 23px;
  letter-spacing: -0.8px;
}
.brand svg {
  width: 32px;
  fill: none;
  stroke: var(--accent);
  stroke-width: 1.7;
}
.brand small {
  display: block;
  font-size: 8px;
  letter-spacing: 3px;
  line-height: 1.2;
}
.top-actions {
  display: flex;
  gap: 18px;
  align-items: center;
}
.icon {
  width: 37px;
  height: 37px;
  padding: 0;
}
.status-dot {
  font-size: 11px;
  color: var(--muted);
}
.status-dot:before {
  content: "";
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--accent);
  margin-right: 8px;
}
.welcome {
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: 80px;
  max-width: 1180px;
  margin: 75px auto 30px;
  padding: 0 45px;
}
.welcome h1 {
  font-size: 56px;
  line-height: 1.13;
  margin-bottom: 22px;
}
.welcome h1 span {
  color: var(--accent);
}
.welcome-copy > p {
  max-width: 400px;
  font-size: 15px;
}
.welcome-features {
  display: flex;
  gap: 22px;
  color: var(--muted);
  font-size: 11px;
}
.auth-card {
  background: var(--panel);
  border: 1px solid var(--line);
  border-radius: 16px;
  padding: 35px;
  align-self: start;
  box-shadow: 0 25px 70px #0001;
}
.auth-card > p {
  font-size: 13px;
}
.vault-art {
  height: 275px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  max-width: 440px;
  margin-top: 15px;
}
.art-orbit {
  position: absolute;
  width: 260px;
  height: 260px;
  border: 1px solid var(--line);
  border-radius: 50%;
  box-shadow:
    0 0 0 32px var(--orbit),
    0 0 0 33px var(--line);
}
.art-safe {
  width: 150px;
  height: 158px;
  border: 1px solid var(--line);
  background: var(--panel);
  border-radius: 17px;
  transform: rotate(-8deg);
  box-shadow: 12px 16px 0 var(--orbit);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
.art-safe span {
  font-size: 66px;
  color: var(--accent);
  line-height: 1;
}
.art-safe i {
  width: 45px;
  height: 3px;
  background: var(--line);
  margin-top: 8px;
}
.art-label {
  position: absolute;
  bottom: 0;
  letter-spacing: 1px;
  text-transform: uppercase;
  font-size: 9px;
  color: var(--subtle);
}
.public-footer {
  text-align: center;
  font-size: 10px;
  color: var(--muted);
  padding: 30px;
}
.workspace {
  display: grid;
  grid-template-columns: 230px 1fr;
  min-height: calc(100vh - 84px);
}
.sidebar {
  padding: 33px 20px;
  border-right: 1px solid var(--line);
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.nav-label {
  font-size: 9px;
  letter-spacing: 2px;
  padding-left: 13px;
  color: var(--subtle);
}
.sidebar > button {
  border: 0;
  background: none;
  text-align: left;
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 12px;
  padding: 12px;
}
.sidebar > button.active {
  background: var(--hover);
  color: var(--accent);
}
.sidebar > button span {
  font-size: 19px;
  width: 20px;
}
.sidebar > button b {
  margin-left: auto;
  font-size: 10px;
  border: 1px solid var(--line);
  padding: 0 6px;
  border-radius: 5px;
}
.sidebar-bottom {
  margin-top: auto;
  padding-top: 60px;
  font-size: 11px;
  overflow-wrap: anywhere;
}
.sidebar-bottom strong,
.sidebar-bottom small {
  display: block;
}
.avatar {
  background: var(--hover);
  color: var(--accent);
  width: 32px;
  height: 32px;
  border-radius: 10px;
  text-align: center;
  padding: 5px;
  margin-bottom: 12px;
}
.content {
  padding: 42px;
  max-width: 1450px;
  width: 100%;
}
.page-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 25px;
}
.page-heading h1 {
  margin-bottom: 10px;
}
.page-heading p {
  font-size: 12px;
  margin: 0;
}
.page-heading .eyebrow {
  font-size: 9px;
}
.notice,
.sync-banner {
  background: var(--hover);
  border: 1px solid var(--line);
  padding: 13px 15px;
  border-radius: 8px;
  margin-bottom: 20px;
  font-size: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 15px;
}
.notice button {
  border: 0;
  padding: 0;
  background: none;
}
.vault-toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 18px;
}
.vault-toolbar input {
  flex: 1;
  margin: 0;
}
.vault-toolbar select {
  width: 145px;
  margin: 0;
}
.selected {
  color: var(--accent);
  border-color: var(--accent);
}
.vault-layout {
  display: grid;
  grid-template-columns: minmax(320px, 1.4fr) minmax(280px, 1fr);
  gap: 20px;
}
.credential-list,
.detail-placeholder,
.panel {
  border: 1px solid var(--line);
  border-radius: 12px;
  background: var(--panel);
}
.credential-list {
  align-self: start;
  overflow: hidden;
}
.credential-row {
  border: 0;
  border-bottom: 1px solid var(--line);
  border-radius: 0;
  background: none;
  width: 100%;
  display: flex;
  text-align: left;
  gap: 14px;
  align-items: center;
  padding: 19px;
}
.credential-row:last-child {
  border-bottom: 0;
}
.credential-row.chosen {
  background: var(--hover);
}
.credential-name {
  flex: 1;
  min-width: 0;
}
.credential-name strong {
  display: block;
  font-size: 13px;
  font-weight: 550;
}
.credential-name small {
  display: block;
  font-size: 10px;
  overflow: hidden;
  text-overflow: ellipsis;
}
.site-icon {
  width: 38px;
  height: 38px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  background: var(--hover);
  color: var(--accent);
  font-weight: 600;
  flex-shrink: 0;
}
.site-icon.large {
  width: 52px;
  height: 52px;
  font-size: 23px;
  margin-bottom: 18px;
}
.strength-pill {
  font-size: 9px;
  border: 1px solid var(--line);
  border-radius: 5px;
  padding: 3px 7px;
}
.strength-0,
.strength-1 {
  color: var(--danger);
}
.strength-2 {
  color: var(--warning);
}
.strength-3,
.strength-4 {
  color: var(--accent);
}
.strength-meter {
  display: flex;
  gap: 10px;
  align-items: center;
  font-size: 10px;
  margin: -4px 0 14px;
}
.strength-meter i {
  height: 3px;
  background: currentColor;
  flex: 1;
}
.detail-placeholder {
  min-height: 420px;
  text-align: center;
  padding: 100px 40px;
}
.detail-placeholder > span,
.empty-state > span {
  font-size: 44px;
  color: var(--subtle);
}
.detail-placeholder h3 {
  margin: 20px 0 8px;
  font-size: 17px;
}
.detail-placeholder p,
.empty-state p {
  font-size: 12px;
}
.empty-state {
  text-align: center;
  padding: 70px 30px;
}
.panel {
  padding: 25px;
  margin-bottom: 20px;
}
.panel-heading {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.panel-heading button {
  border: 0;
  background: none;
}
.copy-field {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  align-items: center;
  background: var(--field);
  border: 1px solid var(--line);
  border-radius: 7px;
  padding: 10px;
  margin-top: 6px;
  color: var(--text);
}
.copy-field span {
  overflow-wrap: anywhere;
  min-width: 0;
}
.copy-field button {
  font-size: 10px;
  padding: 4px 8px;
}
.secret {
  font-family: monospace;
}
.notes {
  white-space: pre-wrap;
  color: var(--text);
  overflow-wrap: anywhere;
}
.wrap {
  overflow-wrap: anywhere;
}
.tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin: 20px 0;
}
.tags span {
  font-size: 10px;
  background: var(--hover);
  padding: 3px 8px;
  border-radius: 5px;
}
.detail-actions {
  display: flex;
  gap: 10px;
  margin-top: 25px;
}
.history,
.share-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  padding: 12px 0;
  border-bottom: 1px solid var(--line);
  font-size: 11px;
}
.history button {
  font-size: 10px;
}
.share-row small {
  display: block;
}
.health-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 18px;
  margin-bottom: 25px;
}
.health-card {
  border: 1px solid var(--line);
  background: var(--panel);
  border-radius: 12px;
  padding: 23px;
}
.health-card span,
.health-card strong,
.health-card small {
  display: block;
}
.health-card span {
  font-size: 12px;
  color: var(--muted);
}
.health-card strong {
  font-size: 39px;
  font-weight: 500;
  margin: 6px 0;
}
.health-card small {
  font-size: 10px;
}
.help-box {
  background: var(--hover);
  border: 1px solid var(--line);
  border-radius: 12px;
  padding: 25px;
  margin-bottom: 25px;
}
.help-box p {
  max-width: 650px;
  font-size: 12px;
}
.table-wrap {
  overflow: auto;
}
table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
  text-align: left;
}
th {
  color: var(--muted);
  font-weight: 500;
  font-size: 10px;
}
td,
th {
  padding: 16px;
  border-bottom: 1px solid var(--line);
}
.generator {
  max-width: 670px;
  padding: 35px;
}
.charset {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}
.generated {
  border-top: 1px solid var(--line);
  margin-top: 25px;
  padding-top: 25px;
}
.generated output {
  display: block;
  font-family: monospace;
  font-size: 24px;
  overflow-wrap: anywhere;
  color: var(--accent);
}
.generated p {
  font-size: 11px;
}
.inline-form {
  display: flex;
  gap: 20px;
  align-items: center;
}
.inline-form label {
  flex: 1;
}
.fingerprint {
  display: block;
  overflow-wrap: anywhere;
  background: var(--field);
  border: 1px solid var(--line);
  border-radius: 8px;
  padding: 13px;
  margin-bottom: 18px;
  font-size: 12px;
  color: var(--accent);
}
.settings-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  align-items: start;
}
.file-label {
  margin: 22px 0;
}
.recovery {
  padding: 20px;
  border: 1px solid var(--warning);
  border-radius: 10px;
  margin: 20px 0;
}
.recovery code {
  display: block;
  overflow-wrap: anywhere;
  font-size: 11px;
}
.recovery button {
  margin-top: 16px;
}
summary {
  cursor: pointer;
  color: var(--muted);
  font-size: 12px;
}
details {
  margin: 18px 0;
}
.import-review {
  border-color: var(--accent);
}
:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 3px;
}
@media (max-width: 1100px) {
  .content {
    padding: 28px;
  }
  .workspace {
    grid-template-columns: 200px 1fr;
  }
  .strength-pill {
    display: none;
  }
  .welcome {
    gap: 40px;
  }
  .welcome h1 {
    font-size: 46px;
  }
  .vault-toolbar {
    flex-wrap: wrap;
  }
  .vault-toolbar input {
    flex-basis: 100%;
  }
}
@media (max-width: 800px) {
  .topbar {
    height: 72px;
    padding: 0 20px;
  }
  .status-dot {
    display: none;
  }
  .welcome {
    grid-template-columns: 1fr;
    margin: 35px auto;
    padding: 0 22px;
    max-width: 550px;
  }
  .welcome h1 {
    font-size: 42px;
  }
  .vault-art {
    display: none;
  }
  .welcome-features {
    margin-bottom: 15px;
    gap: 14px;
  }
  .auth-card {
    padding: 25px;
  }
  .workspace {
    grid-template-columns: 1fr;
  }
  .sidebar {
    border-right: 0;
    border-bottom: 1px solid var(--line);
    flex-direction: row;
    padding: 10px;
    overflow: auto;
  }
  .sidebar > button {
    white-space: nowrap;
    gap: 7px;
    font-size: 10px;
  }
  .nav-label,
  .sidebar-bottom {
    display: none;
  }
  .content {
    padding: 24px 18px;
  }
  .page-heading {
    align-items: start;
  }
  .page-heading h1 {
    font-size: 25px;
  }
  .page-heading > button {
    white-space: nowrap;
    font-size: 11px;
  }
  .vault-layout {
    grid-template-columns: 1fr;
  }
  .detail-placeholder {
    display: none;
  }
  .health-grid {
    grid-template-columns: 1fr 1fr;
  }
  .settings-grid {
    grid-template-columns: 1fr;
  }
  .sync-banner {
    flex-wrap: wrap;
  }
  .charset {
    gap: 12px;
  }
}
@media (prefers-reduced-motion: reduce) {
  * {
    transition: none !important;
  }
}
````

## apps/web/src/theme.css

Full creation path: `/workspace/scratch/ef7b82d54654/sentinel-vault/apps/web/src/theme.css`

Provides the local React vault interface, crypto worker or static application shell.  
Secrets are decrypted only for deliberate local operations; no telemetry is included.

````css
:root {
  color-scheme: dark;
  --bg: #101b19;
  --panel: #15221f;
  --field: #11201c;
  --hover: #20332a;
  --text: #ebeee7;
  --muted: #a2afa6;
  --subtle: #75897e;
  --line: #2b3c34;
  --accent: #bceec7;
  --danger: #f0a59f;
  --warning: #eac489;
  --orbit: #162720;
}
:root[data-theme="light"] {
  color-scheme: light;
  --bg: #f4f5f0;
  --panel: #fff;
  --field: #f8f9f5;
  --hover: #e8f1e8;
  --text: #1c2b22;
  --muted: #647568;
  --subtle: #708777;
  --line: #dce5dc;
  --accent: #81ce95;
  --danger: #ac4339;
  --warning: #99721a;
  --orbit: #eef2eb;
}
````

## apps/web/src/worker-client.ts

Full creation path: `/workspace/scratch/ef7b82d54654/sentinel-vault/apps/web/src/worker-client.ts`

Provides the local React vault interface, crypto worker or static application shell.  
Secrets are decrypted only for deliberate local operations; no telemetry is included.

````typescript
export class CryptoClient {
  private worker?: Worker;
  private sequence = 0;
  private requests = new Map<
    number,
    {
      resolve: (v: any) => void;
      reject: (e: Error) => void;
      timer: ReturnType<typeof setTimeout>;
    }
  >();
  private start() {
    if (this.worker) return;
    this.worker = new Worker(new URL("./crypto-worker.ts", import.meta.url), {
      type: "module",
    });
    this.worker.onmessage = ({ data }) => {
      const request = this.requests.get(data.id);
      if (!request) return;
      clearTimeout(request.timer);
      this.requests.delete(data.id);
      data.error
        ? request.reject(new Error(data.error))
        : request.resolve(data.value);
    };
    this.worker.onerror = () => this.lock();
  }
  call<T = any>(action: string, args: any = {}): Promise<T> {
    this.start();
    const id = ++this.sequence;
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.lock();
        reject(new Error("Crypto operation timed out. Unlock again."));
      }, 150000);
      this.requests.set(id, { resolve, reject, timer });
      const transfers = Object.values(args)
        .filter((v): v is Uint8Array<ArrayBuffer> => v instanceof Uint8Array)
        .map((v) => v.buffer);
      this.worker!.postMessage({ id, action, args }, transfers);
    });
  }
  lock() {
    this.worker?.terminate();
    this.worker = undefined;
    for (const pending of this.requests.values()) {
      clearTimeout(pending.timer);
      pending.reject(new Error("Vault locked."));
    }
    this.requests.clear();
  }
}
````

## apps/web/vite.config.ts

Full creation path: `/workspace/scratch/ef7b82d54654/sentinel-vault/apps/web/vite.config.ts`

Provides the local React vault interface, crypto worker or static application shell.  
Secrets are decrypted only for deliberate local operations; no telemetry is included.

````typescript
import { defineConfig } from "vite";
import { fileURLToPath } from "node:url";
export default defineConfig({
  root: fileURLToPath(new URL(".", import.meta.url)),
  build: {
    outDir: "../../build/web",
    emptyOutDir: true,
    target: "es2022",
    sourcemap: false,
  },
  worker: { format: "es" },
  server: { proxy: { "/api": "http://127.0.0.1:8080" } },
});
````

## db/schema.sql

Full creation path: `/workspace/scratch/ef7b82d54654/sentinel-vault/db/schema.sql`

Defines project configuration, pinned dependencies, licensing or automated repository checks.  
Included in full so the repository can be built and reviewed independently.

````sql
BEGIN;
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY, email VARCHAR(254) NOT NULL UNIQUE, vault_id UUID NOT NULL UNIQUE,
  profile JSONB NOT NULL CHECK (COALESCE(profile->>'version','') = '1' AND octet_length(profile::text) < 140000),
  profile_revision INTEGER NOT NULL DEFAULT 1 CHECK (profile_revision > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS passkeys (
  id VARCHAR(1024) PRIMARY KEY, user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  public_key BYTEA NOT NULL CHECK (octet_length(public_key) BETWEEN 32 AND 4096),
  counter BIGINT NOT NULL DEFAULT 0 CHECK (counter >= 0), transports TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS passkeys_user_idx ON passkeys(user_id);
CREATE TABLE IF NOT EXISTS challenges (
  token_hash BYTEA PRIMARY KEY CHECK (octet_length(token_hash)=32), purpose VARCHAR(32) NOT NULL,
  payload JSONB NOT NULL, expires_at TIMESTAMPTZ NOT NULL
);
CREATE INDEX IF NOT EXISTS challenges_expiry_idx ON challenges(expires_at);
CREATE TABLE IF NOT EXISTS sessions (
  token_hash BYTEA PRIMARY KEY CHECK (octet_length(token_hash)=32),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  device BOOLEAN NOT NULL DEFAULT false, label VARCHAR(120) NOT NULL DEFAULT 'Browser',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), authenticated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_seen TIMESTAMPTZ NOT NULL DEFAULT now(), expires_at TIMESTAMPTZ NOT NULL
);
CREATE INDEX IF NOT EXISTS sessions_user_idx ON sessions(user_id);
CREATE INDEX IF NOT EXISTS sessions_expiry_idx ON sessions(expires_at);
CREATE TABLE IF NOT EXISTS two_factor (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  encrypted_seed BYTEA NOT NULL CHECK(octet_length(encrypted_seed) BETWEEN 48 AND 128),
  enabled BOOLEAN NOT NULL DEFAULT false, last_counter BIGINT NOT NULL DEFAULT -1,
  pending_expires_at TIMESTAMPTZ, created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS recovery_codes (
  id UUID PRIMARY KEY, user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  code_hash BYTEA NOT NULL CHECK(octet_length(code_hash)=32), used_at TIMESTAMPTZ,
  UNIQUE(user_id,code_hash)
);
CREATE INDEX IF NOT EXISTS recovery_user_idx ON recovery_codes(user_id) WHERE used_at IS NULL;
CREATE TABLE IF NOT EXISTS vault_items (
  id UUID PRIMARY KEY, user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  revision INTEGER NOT NULL CHECK(revision > 0), deleted BOOLEAN NOT NULL DEFAULT false,
  envelope JSONB, updated_at TIMESTAMPTZ NOT NULL DEFAULT now(), UNIQUE(user_id,id),
  CHECK ((deleted AND envelope IS NULL) OR (NOT deleted AND envelope IS NOT NULL AND COALESCE(envelope->>'version','')='1' AND octet_length(envelope::text)<140000))
);
CREATE INDEX IF NOT EXISTS items_user_idx ON vault_items(user_id,updated_at);
CREATE TABLE IF NOT EXISTS shares (
  id UUID PRIMARY KEY, sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE, item_id UUID NOT NULL,
  envelope JSONB NOT NULL CHECK(octet_length(envelope::text)<145000),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), CHECK(sender_id<>recipient_id),
  FOREIGN KEY(sender_id,item_id) REFERENCES vault_items(user_id,id) ON DELETE CASCADE,
  UNIQUE(sender_id,recipient_id,item_id)
);
CREATE INDEX IF NOT EXISTS shares_recipient_idx ON shares(recipient_id);
CREATE TABLE IF NOT EXISTS audit_events (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL, action VARCHAR(80) NOT NULL,
  success BOOLEAN NOT NULL, object_id UUID, created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS audit_user_time_idx ON audit_events(user_id,created_at DESC);
CREATE TABLE IF NOT EXISTS auth_throttle (
  key_hash BYTEA PRIMARY KEY CHECK(octet_length(key_hash)=32), attempts INTEGER NOT NULL DEFAULT 0,
  failures INTEGER NOT NULL DEFAULT 0, window_started TIMESTAMPTZ NOT NULL DEFAULT now(),
  next_allowed TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS throttle_updated_idx ON auth_throttle(updated_at);
CREATE TABLE IF NOT EXISTS device_pairings (
  token_hash BYTEA PRIMARY KEY CHECK(octet_length(token_hash)=32),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  label VARCHAR(120) NOT NULL, expires_at TIMESTAMPTZ NOT NULL
);
COMMIT;
````

## deploy/init-secrets.sh

Full creation path: `/workspace/scratch/ef7b82d54654/sentinel-vault/deploy/init-secrets.sh`

Provides deployment configuration with generated operational secrets and explicit trust boundaries.  
Review the deployment guide and run environment-specific release checks before use.

````sh
#!/bin/sh
set -eu
umask 077
directory=/run/sentinel-secrets
mkdir -p "$directory"
if [ ! -f "$directory/database-password" ]; then
  # Kernel CSPRNG; no default or hardcoded database password.
  head -c 32 /dev/urandom | base64 | tr -d '\n' > "$directory/database-password"
fi
# PostgreSQL's startup script runs as root before dropping privileges; the app is uid 1000.
chown -R 1000:1000 "$directory"
chmod 700 "$directory"
chmod 600 "$directory/database-password"
````

## deploy/nginx-http.conf

Full creation path: `/workspace/scratch/ef7b82d54654/sentinel-vault/deploy/nginx-http.conf`

Provides deployment configuration with generated operational secrets and explicit trust boundaries.  
Review the deployment guide and run environment-specific release checks before use.

````text
server {
    listen 80;
    listen [::]:80;
    server_name vault.example.com;
    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-For $remote_addr;
        client_max_body_size 256k;
        proxy_read_timeout 30s;
        proxy_request_buffering on;
        access_log off;
    }
}
````

## deploy/nginx-https.conf

Full creation path: `/workspace/scratch/ef7b82d54654/sentinel-vault/deploy/nginx-https.conf`

Provides deployment configuration with generated operational secrets and explicit trust boundaries.  
Review the deployment guide and run environment-specific release checks before use.

````text
server {
    listen 80;
    listen [::]:80;
    server_name vault.example.com;
    return 301 https://$host$request_uri;
}
server {
    listen 443 ssl;
    listen [::]:443 ssl;
    http2 on;
    server_name vault.example.com;
    ssl_certificate /etc/letsencrypt/live/vault.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/vault.example.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_session_tickets off;
    proxy_hide_header Strict-Transport-Security;
    add_header Strict-Transport-Security "max-age=31536000" always;
    client_max_body_size 256k;
    access_log off;
    # Application errors are generic. Do not add request-body, Cookie, or Authorization logging.
    error_log /var/log/nginx/sentinel-error.log warn;
    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-Proto https;
        proxy_set_header X-Forwarded-For $remote_addr;
        proxy_read_timeout 30s;
        proxy_request_buffering on;
        proxy_buffering off;
    }
}
````

## docker-compose.yml

Full creation path: `/workspace/scratch/ef7b82d54654/sentinel-vault/docker-compose.yml`

Provides deployment configuration with generated operational secrets and explicit trust boundaries.  
Review the deployment guide and run environment-specific release checks before use.

````yaml
services:
  init:
    image: alpine:3.22
    restart: "no"
    entrypoint: ["/bin/sh", "/init-secrets.sh"]
    volumes:
      - secrets:/run/sentinel-secrets
      - ./deploy/init-secrets.sh:/init-secrets.sh:ro
    network_mode: none
  db:
    image: postgres:17-bookworm
    restart: unless-stopped
    environment:
      POSTGRES_DB: sentinel
      POSTGRES_USER: sentinel
      POSTGRES_PASSWORD_FILE: /run/sentinel-secrets/database-password
    depends_on:
      init: { condition: service_completed_successfully }
    volumes:
      - database:/var/lib/postgresql/data
      - secrets:/run/sentinel-secrets:ro
    networks: [private]
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U sentinel -d sentinel"]
      interval: 5s
      timeout: 5s
      retries: 20
  app:
    build: .
    restart: unless-stopped
    environment:
      PUBLIC_ORIGIN: ${PUBLIC_ORIGIN:-http://localhost:8080}
      RP_ID: ${RP_ID:-localhost}
      TRUST_PROXY: ${TRUST_PROXY:-false}
    depends_on:
      db: { condition: service_healthy }
    ports: ["127.0.0.1:8080:8080"]
    volumes: ["secrets:/run/sentinel-secrets"]
    networks: [private, outbound]
    read_only: true
    tmpfs: ["/tmp:size=64m,noexec,nosuid"]
    cap_drop: [ALL]
    security_opt: ["no-new-privileges:true"]
volumes:
  secrets:
  database:
networks:
  private: { internal: true }
  outbound:
````

## docs/API.md

Full creation path: `/workspace/scratch/ef7b82d54654/sentinel-vault/docs/API.md`

Documents the actual design, usage, interfaces or verification evidence.  
Distinguishes implemented behavior, operational assumptions and manual release gates.

````markdown
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
````

## docs/ARCHITECTURE.md

Full creation path: `/workspace/scratch/ef7b82d54654/sentinel-vault/docs/ARCHITECTURE.md`

Documents the actual design, usage, interfaces or verification evidence.  
Distinguishes implemented behavior, operational assumptions and manual release gates.

````markdown
# Architecture and data flow

## Components

```mermaid
flowchart TD
  UI["Browser UI / independent extension"] --> CW["Crypto worker"]
  CW --> KDF["Disposable Argon2 WASM worker"]
  CW --> WC["WebCrypto + libsodium"]
  UI --> API["HTTPS API"]
  API --> DB["PostgreSQL ciphertext + metadata"]
  API --> AUTH["WebAuthn verification / TOTP"]
  UI --> CACHE["Opt-in encrypted IndexedDB"]
  UI --> SW["PWA static shell cache"]
  CW --> HIBP["Optional HIBP prefix lookup"]
```

Only the UI/crypto worker sees unlocked credential values. A selected record is decrypted for its view/editor; the worker returns secret-free list/health summaries. The master is transferred as a mutable byte buffer to a disposable Argon2 worker through the crypto worker. Transfer detaches the originating copy; controlled buffers and WASM heap are wiped and the KDF worker is terminated. On lock, the persistent crypto worker is terminated and secret views are unmounted. Native keys are nonextractable except during initial creation/wrapping, local password rewrapping or deliberate sharing-key transfer.

## Registration

```mermaid
sequenceDiagram
  participant UI as Browser
  participant AU as Authenticator
  participant CW as Crypto worker
  participant API as API / PostgreSQL
  UI->>API: Email + operator invitation
  API-->>UI: Registration challenge + UUIDs
  UI->>AU: Create discoverable user-verified passkey
  AU-->>UI: Public credential response
  UI->>CW: Master bytes + vault UUID
  CW->>CW: Argon2id, HKDF, random vault / identity keys
  CW-->>UI: Wrapped vault key + encrypted identity + public key
  UI->>API: WebAuthn response + encrypted profile
  API->>API: Verify origin, RP, challenge, UV; admit at most 50 users
  API-->>UI: HttpOnly session + CSRF token
```

The invitation is an operator credential controlling account creation, not a vault password. Registration uses a five-minute single-use challenge; accounts and initial passkeys/session are committed transactionally. The master never participates in a server login verifier.

## Login and local unlock

```mermaid
sequenceDiagram
  participant UI as Client
  participant AU as Authenticator
  participant API as API / PostgreSQL
  participant CW as Crypto worker
  UI->>API: Request discoverable challenge
  API-->>UI: Challenge, RP ID, UV required
  UI->>AU: Sign origin-bound challenge
  AU-->>UI: Assertion
  UI->>API: Assertion, then TOTP or recovery code if enabled
  API->>API: Consume challenge; verify signature/counter; rate/backoff
  API-->>UI: Session + encrypted profile
  UI->>CW: Profile + master bytes
  CW->>CW: Argon2id + HKDF; unwrap vault key; verify identity GCM
  CW-->>UI: Unlock result only
```

A public username lookup is not required for login. Sessions last at most twelve hours and have a thirty-minute server-idle timeout. Sensitive settings require authentication within five minutes. Client auto-lock is separate: five minutes by default, configurable to 1/2/5/10/15/30 minutes, and immediate when the tab is hidden. TOTP counters reject reuse across the ±1 accepted time-step window; recovery codes are atomically consumed after an already verified passkey.

## Save an item

```mermaid
sequenceDiagram
  participant UI as Editor
  participant CW as Crypto worker
  participant API as API
  participant DB as PostgreSQL
  UI->>CW: Item + previous envelope + next revision
  CW->>CW: Retain last 5 password versions; fresh item key + IV
  CW->>CW: AES-GCM payload + AES-KW wrapped item key
  CW-->>UI: Versioned encrypted envelope
  UI->>API: Envelope + expected server revision
  API->>DB: Owner check, row lock, revision comparison, encrypted write
  DB-->>API: New revision or conflict
  API-->>UI: Result; never decrypted fields
```

Offline writes take the same crypto path, then persist only encrypted envelopes plus expected base revisions. Further offline edits replace the queued envelope while retaining its original base revision and generating a new key/IV. Synchronization submits those changes individually. Conflicts stop rather than merge secrets automatically. Deletion creates a server tombstone and revokes server-hosted shares; old recipient copies/backups remain possible.

## Retrieve an item

```mermaid
sequenceDiagram
  participant UI as Client
  participant API as API / PostgreSQL
  participant CW as Crypto worker
  UI->>API: Authorized list request
  API-->>UI: Owned encrypted envelopes + revisions / tombstones
  UI->>CW: Envelopes
  CW->>CW: Unwrap item keys and verify context/tag
  CW-->>UI: Searchable cards and aggregate health
  UI->>CW: Selected envelope
  CW-->>UI: Selected credential for view/edit/copy
```

## Extension and PWA boundaries

The extension contains an independently built popup, crypto bundle, worker and WASM. A fresh web account session creates a five-minute single-use pairing grant; the extension exchanges it for a device bearer token. This token expires/idle-times out like other sessions, cannot change account security settings, and is kept only in extension `storage.session`. The extension asks permission for its selected backend host, not every visited website. `activeTab` allows a user-clicked, exact-origin top-frame autofill; the page is rechecked inside the injected function to close navigation races. No remote script, background polling, automatic filling or submission is used.

The PWA service worker precaches only an explicit list of generated application assets. It never intercepts `/api` for caching, never puts vault values in CacheStorage, and never provides a plaintext vault fallback. Ciphertext in IndexedDB is opt-in and remains decryptable offline with the master. The web app cannot detect malicious replacement of its own trusted origin or globally prevent rollback of previously valid encrypted records.
````

## docs/ASVS.md

Full creation path: `/workspace/scratch/ef7b82d54654/sentinel-vault/docs/ASVS.md`

Documents the actual design, usage, interfaces or verification evidence.  
Distinguishes implemented behavior, operational assumptions and manual release gates.

````markdown
# ASVS Level 2 verification map

Target: **OWASP ASVS 5.0 Level 2**. This is an implementation/verification map, not a certificate or a claim that every numbered requirement is satisfied. An independent assessor must apply the official full requirement list to the final release and deployment. Broad areas below intentionally avoid inventing requirement IDs or mapping evidence to unchecked clauses.

| Area | Implemented control / evidence | Remaining assessment |
|---|---|---|
| Architecture and threat analysis | Documented boundaries, STRIDE, exact formats and assurance limits | Independent design review; all relevant ASVS requirements traced individually |
| Encoding/sanitization | React text rendering, no raw HTML/eval; field limits; master input preserved | Manual DOM XSS, prototype/CSV edge cases, browser-specific inputs |
| Validation/business logic | Strict Zod schemas + bounded Fastify JSON, limits, transactions and revisions | Full route fuzzing, account-admission concurrency on PostgreSQL, future migrations |
| API security | Authentication, owner predicates, CSRF/Origin, device flags, no-store, generated OpenAPI | Complete authorization matrix and malformed-path/header fuzzing |
| Files | Local bounded CSV parser, no server upload of raw CSV; ciphertext export | Plaintext import source handling; export recovery and user-device policy |
| Authentication | UV-required passkeys; TOTP/replay prevention; one-use random recovery codes; persistent backoff | Real devices/providers, recovery processes, abuse/availability analysis |
| Sessions | HttpOnly/Secure/Strict cookies, random hashed tokens, idle/absolute expiry, recent auth, revocation | Real HTTPS proxy/cookie tests and browser extensions' permissions/storage |
| Authorization | User-scoped CRUD/shares/audit; fresh browser-only settings; device token restrictions | Every route with two users, PostgreSQL races, organizational requirements outside this individual-vault model |
| Cryptography | Native WebCrypto, libsodium box/memcmp, exact Argon2 reference-WASM/native cross-test | Argon2 binding audit exception; independent implementation/build review; no FIPS claim |
| Data protection | Ciphertext at rest, no master verifier, opt-in ciphertext offline cache, metadata-only logging | Compromised-origin risk acceptance, device/browser memory and backup retention policy |
| Secure communications | HTTPS required for nonloopback config; documented Nginx/Let's Encrypt | Deployment TLS/certificate renewal scan; DNS/proxy correctness |
| Configuration | No embedded production secrets; nonroot/read-only Docker app; private DB; pinned npm lockfile | Compose/VPS runtime verification, signed releases, image digests, patch process |
| Logging and errors | Generic errors, no body/input logs; own metadata audit | Monitoring policy, deployment log inspection and server-controlled audit limitations |
| Frontend | Strict CSP, no CDNs/telemetry, worker lock, no automatic autofill/submission | Browser/extension-store review, accessibility and actual Firefox compatibility |

Level 2 is the target because the application holds high-value secrets. No selected-controls table substitutes for a complete assessment. Publication should present the project as a security engineering portfolio/review candidate until the release gates are satisfied.
````

## docs/CRYPTO.md

Full creation path: `/workspace/scratch/ef7b82d54654/sentinel-vault/docs/CRYPTO.md`

Documents the actual design, usage, interfaces or verification evidence.  
Distinguishes implemented behavior, operational assumptions and manual release gates.

````markdown
# Cryptographic design, format v1

## Hierarchy and primitive choices

| Material | Bytes / representation | Purpose and lifetime |
|---|---|---|
| Master password | Exact well-formed UTF-8; 1–1,024 UTF-16 code units; controls rejected | User-entered locally; never normalized or used as account authentication |
| Argon2 salt | 16 random bytes; 22 canonical unpadded base64url chars | Public, fresh at registration/master change |
| Argon2 root | 32 bytes | Derived only in a disposable client worker; overwritten after HKDF import |
| Master wrapping key | Nonextractable AES-KW 256-bit native key | HKDF-SHA256 purpose-separated derivation, not sent/stored |
| Vault key | 32 random bytes, AES-KW | Wrapped by master key; nonextractable while unlocked |
| Wrapped vault key | 40 bytes; 54 base64url chars | AES-KW RFC3394 wraps a 32-byte vault key |
| Item revision key | 32 new random bytes for **every save**, AES-GCM | Wrapped by vault key; not shared as the owner's original item key |
| Wrapped item key | 40 bytes; 54 base64url chars | AES-KW under the random vault key |
| Item IV | 12 random bytes; 16 base64url chars | Unique for its fresh revision key; AES-GCM standard 96-bit nonce |
| GCM tag | 16 bytes | Appended to ciphertext by WebCrypto; tagLength=128 |
| X25519 identity key pair | 32-byte public + 32-byte private | libsodium `crypto_box_keypair`; private half in encrypted identity record |
| Sharing nonce | 24 random bytes; 32 base64url chars | libsodium box nonce; fresh per share snapshot |
| Sharing plaintext box payload | 64 bytes | Snapshot item key[32] + SHA256(AAD)[32] |
| Sharing authenticated box | 80 bytes; 107 base64url chars | libsodium `crypto_box_easy` adds a 16-byte authentication tag |

Master password → **Argon2id v=0x13, m=65,536 KiB, t=3, p=4, output=32 bytes** → HKDF-SHA256 → master wrapping key → AES-KW-wrapped random vault key → AES-KW-wrapped fresh item key → AES-256-GCM encrypted payload.

64 MiB is a deliberate memory cost that increases per-guess memory pressure while remaining practical on supported clients. Three passes increase computational work. Four lanes preserve the requested/RFC9106 second profile; lanes are part of the algorithm even where a particular WASM build executes them without four operating-system threads. Parameters are fixed and validated in format v1: no silent reduction on mobile or attacker-chosen high-cost profile. These costs are not a promise against weak master passwords. Failure to allocate/derive fails closed; the worker has a 120-second deadline and a 4,096-byte input bound.

HKDF input key material is the 32-byte Argon2 result. `salt` is the same 16-byte Argon2 salt. `info` is exact UTF-8:

```text
SENTINEL-VAULT/v1/master-wrap/ + lowercase vault UUID
```

WebCrypto HKDF derives a nonextractable AES-KW256 key with `wrapKey`/`unwrapKey` usage. Domain separation binds that derived purpose to the vault and prevents accidentally reusing the Argon2 root directly for another protocol. Salt uniqueness and the random vault key allow password changes without reencrypting every credential.

AES-KW needs no application-managed IV. RFC3394's authenticated unwrap rejects invalid wraps; decryption of the encrypted identity adds a full GCM authentication check for successful unlock. A fresh item key makes each item revision single-use under AES-GCM; random IVs remain required and are generated independently using `crypto.getRandomValues`. There is no item counter state that can accidentally be reset during offline editing.

## Authenticated byte layout

GCM additional authenticated data is **44 bytes**, not loosely concatenated strings:

| Offset | Length | Meaning |
|---|---:|---|
| 0 | 4 | ASCII `SVI1`: `53 56 49 31` |
| 4 | 16 | Vault UUID as binary hex bytes, hyphens removed |
| 20 | 16 | Item UUID as binary hex bytes, hyphens removed |
| 36 | 8 | Unsigned revision, 64-bit big endian; app range 1–2,147,483,647 |

Payload: exact UTF-8 encoding of `JSON.stringify` on a validated record. Encryption returns `ciphertext || tag[16]`. No compression or plaintext length padding is applied: approximate record size is leaked. Maximum plaintext payload is 90,000 bytes, even when individual field limits would otherwise permit a larger aggregate UTF-8 representation. All binary JSON fields are canonical unpadded base64url; clients decode/reencode to reject equivalent alternate encodings.

The encrypted item envelope contains only `version`, `vaultId`, `id`, `revision`, `iv`, `wrappedKey`, `ciphertext`. The API additionally stores owner, deleted flag and update timestamp. It does not receive site, login, password, notes, URL, folder, tags, favorites or history. Identity uses the reserved `id=vaultId`, the same authenticated layout and its own fresh key/IV for each update; user credentials cannot use that reserved ID.

The profile contains `version`, `vaultId`, fixed `kdf` and salt, `wrappedVaultKey`, public sharing key and encrypted `identity` envelope. Encrypted identity plaintext contains version, X25519 private key and up to fifty independently pinned contact keys. On unlock, libsodium derives the public key from the encrypted private key and constant-time compares it with the public profile key. This prevents silently binding a legitimate private identity to an inconsistent public profile key.

## Password change

Reauthenticate the old password **locally**, unwrap the vault key with temporary extractability needed by native `wrapKey`, create a fresh salt, derive the new wrapping key and rewrap the same random vault key. A recent online passkey session and CSRF are required to commit the new profile with optimistic profile revision. Revoke other sessions after successful server commit, refresh the client worker's profile, and update enabled offline caches. Record keys/ciphertext and sharing identity do not change.

An old database snapshot or export still uses the old password. Password change cannot erase those copies or repair disclosure of a vault key. Full rekeying after key theft is outside this MVP; treat unlocked credentials as exposed and replace them at their services. TOTP/session recovery never derives the vault key.

## Authenticated sharing

The sender must have pinned the recipient's exact public key after verifying its full SHA256 fingerprint independently. The recipient must similarly pin the sender before decryption. Fingerprints use all 32 digest bytes, displayed as sixteen groups of four hexadecimal characters; the public directory is not identity evidence by itself.

Decrypt the selected item locally, clear history from its share plaintext, encrypt a **new snapshot with a new key/IV**, then box its 32-byte snapshot key together with SHA256 of the snapshot AAD. The libsodium construction is authenticated `crypto_box_easy`/`crypto_box_open_easy`: X25519 plus XSalsa20-Poly1305, not a custom raw ECDH/AES concatenation. The recipient verifies the sender key, recipient key, box authentication and AAD digest before native AES-GCM snapshot decryption.

The box is 80 bytes. Snapshot `record.wrappedKey` is still a sender-vault-wrapped copy but recipients use the independently boxed snapshot key. Knowledge of that key does not disclose original item keys or other vault items. Notes are intentionally shared; a user should remove sensitive notes before sharing if inappropriate. Boxes have no forward secrecy against later compromise of a sharing identity; revocation cannot delete a downloaded box or plaintext.

## Authentication secrets

Passkeys are verified using SimpleWebAuthn with expected challenge/origin/RP, `userVerification=required`, discoverable credentials and signature counters. Challenge tokens are 32 random bytes, hashed by SHA256, one-use and expire after five minutes; pending TOTP login expires after two minutes. Session and device tokens are 32 random bytes and stored only as SHA256 hashes. Because these values are high-entropy random tokens, fast hashing is suitable; user master passwords are never SHA256-verifier hashes.

CSRF is HMAC-SHA256 under the separate operational key over `SV-CSRF/v1\0` plus the raw session token. A browser mutation requires canonical Origin and native constant-time CSRF verification. TOTP: 20 random seed bytes, HMAC-SHA1, six digits, thirty-second steps; accept previous/current/next step while rejecting counters already consumed. Server seed storage is `IV[12] || encryptedSeed[20] || tag[16]`, AES256GCM under the operational key, AAD UTF-8 `SV-TOTP/v1/` plus account UUID. SHA1 here is the established TOTP/HIBP protocol component, never vault password storage.

Ten recovery codes contain 20 random bytes each, uppercase hex grouped for transcription. Only SHA256 of canonical hex is stored; `UPDATE ... WHERE used_at IS NULL RETURNING` consumes them atomically. TOTP enrollment revokes other sessions. Operation-key rotation requires a deliberate TOTP re-enrollment plan; it cannot simply be deleted during maintenance without breaking existing factors.

## Health, memory and assurance

Reuse summaries use a fresh nonextractable HMAC-SHA256 key per analysis run; no reusable password hash is returned to the UI or server. Local zxcvbn dictionary/spatial/repeat/date/leet modeling supplies strength feedback. To bound CPU work, pattern matching/guess estimation evaluates the first 256 UTF-16 code units; Shannon frequencies cover the whole bounded input. This is heuristic feedback, not a proof of full-password unpredictability. Empirical Shannon `H=-Σpᵢlog₂pᵢ` describes character frequencies, not human selection entropy. Crack estimates use explicitly labeled 10¹⁰ GPU/10⁸ ordered dictionary guesses per second against a hypothetical fast hash, not a claim about this Argon2-protected vault. Random passphrase entropy is meaningful: eight independent uniform selections from a 2,048-word list give 88 bits; human-picked sentences do not.

Buffers, Argon2 heap and transferred secret byte arrays are wiped where controlled; lock terminates the worker and unmounts secret views. Native key memory, JS immutable strings, browser internals and OS copies are not guaranteed erasure. Cryptographic verification uses native/library constant-time functions; no claim is made that an entire JavaScript application or SQL lookup is constant-time.

Primitive references: [RFC9106](https://www.rfc-editor.org/rfc/rfc9106), [WebCrypto](https://www.w3.org/TR/WebCryptoAPI/), [RFC3394](https://www.rfc-editor.org/rfc/rfc3394), [libsodium authenticated encryption](https://doc.libsodium.org/public-key_cryptography/authenticated_encryption), [WebAuthn](https://www.w3.org/TR/webauthn-3/), [Argon2 browser provenance](https://github.com/antelle/argon2-browser). These describe primitives/protocols, not an audit of this implementation. Exact deployed WASM/JS hashes are in THIRD-PARTY.md.
````

## docs/DEPLOYMENT.md

Full creation path: `/workspace/scratch/ef7b82d54654/sentinel-vault/docs/DEPLOYMENT.md`

Documents the actual design, usage, interfaces or verification evidence.  
Distinguishes implemented behavior, operational assumptions and manual release gates.

````markdown
# VPS deployment and recovery

Use a maintained Linux VPS, Docker Engine/Compose v2, a hostname you control and DNS pointing to the server. This guide uses `vault.example.com` as an example hostname; replace it with your real hostname everywhere before enabling registration. Port 5432 must never be exposed. Keep the app's host binding at `127.0.0.1:8080`.

## Configure and start

Install Docker using the [official Docker Engine instructions](https://docs.docker.com/engine/install/). Use the [current distribution packages for Nginx and Certbot](https://certbot.eff.org/instructions). On a Debian/Ubuntu host with these packages available:

```sh
sudo apt-get update
sudo apt-get install nginx certbot python3-certbot-nginx
cp .env.example .env
chmod 600 .env
```

Edit `.env`:

```dotenv
PUBLIC_ORIGIN=https://vault.example.com
RP_ID=vault.example.com
TRUST_PROXY=true
```

`PUBLIC_ORIGIN` has no trailing slash or path. `RP_ID` is the hostname only. `TRUST_PROXY=true` is appropriate only with the supplied loopback Nginx boundary; Nginx replaces `X-Forwarded-For` with the direct client address, preventing client-supplied chains from controlling throttle identity. Do not open port 8080 publicly or add an untrusted proxy hop without revisiting this setting.

```sh
docker compose up -d --build
docker compose ps
curl --fail http://127.0.0.1:8080/api/health
```

Initial secrets are generated in a named volume; never commit, print in generic logs or use `.env` to hold a master password. Containers run the API as uid 1000, with read-only root filesystem, dropped capabilities and `no-new-privileges`. PostgreSQL uses an internal network and persistent volume. The separate outbound network allows infrastructure connectivity; the API has no automatic HIBP/telemetry calls.

## TLS with Let's Encrypt

Permit inbound TCP 80/443 and your actual SSH management port at the provider firewall. Verify SSH access remains available before activating a host firewall. Copy the HTTP bootstrap config after replacing the example hostname:

```sh
sudo cp deploy/nginx-http.conf /etc/nginx/sites-available/sentinel
sudo ln -s /etc/nginx/sites-available/sentinel /etc/nginx/sites-enabled/sentinel
sudo nginx -t
sudo systemctl reload nginx
sudo certbot --nginx -d vault.example.com --redirect
```

Once the certificate exists, install `deploy/nginx-https.conf` with the real hostname/certificate paths. Its `http2 on` directive requires Nginx 1.25.1+; for an older supported distribution package replace it with `listen 443 ssl http2;` / `listen [::]:443 ssl http2;` and remove `http2 on`. Do not copy configuration blindly past `nginx -t`.

```sh
sudo cp deploy/nginx-https.conf /etc/nginx/sites-available/sentinel
sudo nginx -t
sudo systemctl reload nginx
sudo certbot renew --dry-run
curl --fail --head https://vault.example.com/
```

Check Secure/HttpOnly/Strict cookies, HTTPS-only nonlocal access, strict CSP, `frame-ancestors 'none'`, no inline scripts/styles and HSTS. HSTS is enabled for this hostname only; do not preload or include unrelated subdomains without reviewing them. TLS redirects and certificates alone do not protect a compromised application origin.

Retrieve the invitation with the operator command, register a synthetic account first, enroll two passkeys and TOTP, and test the checklist before adding real credentials. Use the final hostname consistently for passkeys. Revoke all synthetic sessions and remove fixture credentials after validation.

## Back up and test restoration

Back up **both** PostgreSQL and the operational secret volume. The master password is not stored there. Operational secrets are needed to preserve TOTP decryptability and invitations; database snapshots contain ciphertext and metadata but still require strong access controls. Use an independently encrypted backup destination, restrictive permissions and off-host storage. Ciphertext backups retain password history and old master wrappers; deletion/master changes do not erase historical backups.

To capture a consistent complete self-hosted snapshot, stop application writes first:

```sh
umask 077
mkdir -p backups
docker compose stop app
docker compose exec -T db pg_dump -U sentinel -d sentinel -Fc > backups/sentinel.dump
docker compose run --rm --no-deps --entrypoint tar app -C /run/sentinel-secrets -czf - . > backups/operational-secrets.tar.gz
docker compose start app
```

Encrypt the two files before off-host transfer. Do not put `backups/` into a Git repository. The supplied `.gitignore` excludes it. A bare encrypted JSON export is a vault-content snapshot, not a database/passkey/factor/session backup; it cannot recreate account authentication on a fresh host. Its format is documented for local recovery with the correct master password.

Restore into a **separate isolated instance** first. Create/start its database and secret volume, stop its app, restore the operational files into the existing secret mount as uid1000, then restore the database:

```sh
docker compose stop app
docker compose run --rm --no-deps --entrypoint tar app -C /run/sentinel-secrets -xzf - < backups/operational-secrets.tar.gz
docker compose exec -T db pg_restore -U sentinel -d sentinel --clean --if-exists < backups/sentinel.dump
docker compose exec -T db psql -U sentinel -d sentinel -c 'DELETE FROM sessions; DELETE FROM challenges; DELETE FROM device_pairings;'
docker compose start app
```

These commands intentionally replace the selected instance's records/secrets; use only on the intended recovery instance. Verify schema compatibility and that restored `database-password` matches the database's existing role password. A clean destination initialized with different generated secrets needs the original database password installed **before** database initialization, or an explicit role-password rotation using a secure administrator procedure. `pg_restore --clean` does not change the PostgreSQL role password. Test passkey login at the same RP hostname, TOTP, correct-master unlock, representative records/history, shares and export. Do not reactivate stale sessions. Record restore time/object counts and retain a verified backup.

## Upgrade and incident handling

Pin a reviewed source commit, back up, run CI, build in a clean environment and review lockfile/vendor changes. Build/release signing and container-image digest pinning should be added to your release process; base image tags in this candidate track their maintenance streams and are not immutable digests. Run the new build against a restored staging copy before replacing production. Version 1 uses idempotent initial DDL, not a general future migration framework; future schema changes need explicit versioned migrations and rollback plans.

Do not delete/rotate `operational.key` casually: existing TOTP seeds require it. A deliberate rotation procedure must decrypt/reencrypt those seeds under a new key or force authenticated factor re-enrollment after incident response. Rotate invitations separately by replacing only `registration.key` with 32 CSPRNG bytes and restarting the app; distribute the new invitation through a private channel. Rotation of authentication secrets cannot decrypt or rekey vaults.

Review [SECURITY.md](../SECURITY.md) for a compromised-origin response. Maintain OS/browser updates, least-privilege administrator access, availability monitoring that never captures secrets, and tested recovery. HIBP availability is optional; the vault does not depend on external services for encryption/login/unlock.
````

## docs/FILES.md

Full creation path: `/workspace/scratch/ef7b82d54654/sentinel-vault/docs/FILES.md`

Documents the actual design, usage, interfaces or verification evidence.  
Distinguishes implemented behavior, operational assumptions and manual release gates.

````markdown
# Complete folder and file inventory

All paths are relative to the repository root. Build outputs and runtime secrets are deliberately excluded.

```text
.dockerignore
.env.example
.github/dependabot.yml
.github/workflows/ci.yml
.gitignore
.prettierignore
Dockerfile
LICENSE
README.md
SECURITY.md
THIRD-PARTY.md
apps/api/src/app.ts
apps/api/src/config.ts
apps/api/src/db.ts
apps/api/src/main.ts
apps/api/src/security.ts
apps/web/index.html
apps/web/public/icon.svg
apps/web/public/kdf-worker.js
apps/web/public/manifest.webmanifest
apps/web/public/vendor/ARGON2-LICENSE.txt
apps/web/public/vendor/argon2-api.js
apps/web/public/vendor/argon2.js
apps/web/public/vendor/argon2.wasm
apps/web/src/App.tsx
apps/web/src/api.ts
apps/web/src/clipboard.ts
apps/web/src/crypto-worker.ts
apps/web/src/main.tsx
apps/web/src/storage.ts
apps/web/src/styles.css
apps/web/src/theme.css
apps/web/src/worker-client.ts
apps/web/vite.config.ts
db/schema.sql
deploy/init-secrets.sh
deploy/nginx-http.conf
deploy/nginx-https.conf
docker-compose.yml
docs/API.md
docs/ARCHITECTURE.md
docs/ASVS.md
docs/CRYPTO.md
docs/DEPLOYMENT.md
docs/PENTEST-CHECKLIST.md
docs/THREAT-MODEL.md
docs/VALIDATION.md
docs/openapi.json
docs/screenshots/health.png
docs/screenshots/sign-in.png
docs/screenshots/vault.png
extensions/browser/index.html
extensions/browser/src/autofill.ts
extensions/browser/src/popup.css
extensions/browser/src/popup.tsx
extensions/browser/vite.config.ts
package-lock.json
package.json
packages/crypto/analyze.ts
packages/crypto/breach.ts
packages/crypto/browser-kdf.ts
packages/crypto/bytes.ts
packages/crypto/generator.ts
packages/crypto/history.ts
packages/crypto/vault.ts
packages/shared/import-csv.ts
packages/shared/schema.ts
playwright.config.ts
scripts/build.mjs
scripts/package.py
scripts/setup.mjs
scripts/show-invitation.mjs
scripts/source-book.py
scripts/test-server.ts
tests/analysis.test.ts
tests/api.test.ts
tests/crypto.test.ts
tests/database.ts
tests/e2e/security.spec.ts
tests/e2e/vault.spec.ts
tests/fixtures.ts
tests/history.test.ts
tests/kdf.test.ts
tests/utilities.test.ts
tsconfig.json
vitest.config.ts
docs/FILES.md
docs/SOURCEBOOK.md
```

`npm run build` additionally generates `build/api`, `build/web`, `build/extension-chrome` and `build/extension-firefox`. These compiled extension clients are packaged separately under `clients/` in the downloadable release.
````

## docs/PENTEST-CHECKLIST.md

Full creation path: `/workspace/scratch/ef7b82d54654/sentinel-vault/docs/PENTEST-CHECKLIST.md`

Documents the actual design, usage, interfaces or verification evidence.  
Distinguishes implemented behavior, operational assumptions and manual release gates.

````markdown
# Authorized penetration-test checklist

Use a disposable deployment with two synthetic accounts and explicit authorization. Preserve only redacted evidence. This is a verification plan, **not a report claiming tests or findings that were not observed**. Record version, environment, scope, assessor, expected behavior, actual result and evidence for each case.

## Client and crypto

- [ ] Capture registration/login/save/update/share traffic. Search raw bodies for unique synthetic master/credential markers. Only encrypted envelopes and documented auth metadata should leave the client; optional TOTP/auth tokens are separate account secrets.
- [ ] Independently verify bundled WASM against native/reference Argon2id at 64MiB/3/4. Review WASM provenance, imports, compiler flags and binding memory handling. Confirm no default-p=1 fallback and bounded failed allocation.
- [ ] Mutate IV, ciphertext/tag, wrapped key, vault/item ID and revision individually. Clients must reject; test mixed-account and reserved identity IDs.
- [ ] Save/edit many versions. Check fresh item keys/IVs, last-five history limit, authenticated timestamps and correct-password/incorrect-password behavior. Profile contact writes after master rotation must preserve the new wrapper.
- [ ] Lock via button, inactivity, hidden tab, popup close and cross-tab broadcast. Inspect worker lifecycle and UI secret unmounting. Record that JS/OS/native memory erasure cannot be guaranteed, rather than treating a heap snapshot as universal proof.
- [ ] Copy secrets and inspect clipboard at 30 seconds with permission granted, denied, focus changed and newer clipboard content. Confirm unrelated clipboard content survives and blocked cleanup is reported.
- [ ] Inspect localStorage, IndexedDB, CacheStorage, browser history, downloads and console. Persistent vault fields must be encrypted; caches must not include API responses/plaintext or auth bearer cookies. Protect plaintext import source files independently.
- [ ] Confirm zero remote executable assets, telemetry, source-map leakage, inline handlers and unsafe-eval. SRI is not needed for absent external assets; local trust/release integrity is still required.

## Authentication and sessions

- [ ] Reject wrong origin, RP ID, challenge, signature, missing user verification and malformed WebAuthn responses. Replay consumed/expired challenges. Validate discoverable credentials and increasing counters with actual supported authenticators.
- [ ] Try missing/incorrect/reused TOTP, ±1-step skew, clock drift and concurrent requests. Verify monotonic counters and setup expiry. Verify one-use recovery consumption under concurrency and that codes cannot replace passkeys or unlock a master-encrypted vault.
- [ ] Measure rate limits and 2/4/8…300s failed-auth backoff, restart persistence, forged `X-Forwarded-For`, settings-factor limits and distributed-IP limitations. Do not brute-force another user's factor.
- [ ] Confirm HttpOnly/Secure/Strict/__Host cookies on HTTPS, session fixation resistance, logout, 12h absolute/30min idle expiry and recent-auth requirements. Revoking one account's session must not revoke another account's session.
- [ ] Replay/expire pairing grants. Check device bearer flag enforcement, short-lived storage.session retention, account-security route denial and unauthorized CORS requests. Treat leaked bearer tokens as auth compromise even though they do not decrypt vaults.

## Authorization and persistence

- [ ] Account A cannot enumerate, read, update, delete, share or revoke B's records by changing IDs; inspect SQL owner predicates and foreign keys. Device sessions cannot access account audit/session settings.
- [ ] Race concurrent writes/deletes and offline synchronization. Verify expected-revision conflicts and tombstones. Pending ciphertext should survive reload/relogin; refresh/discard must never silently lose it.
- [ ] Verify authenticated limits: 50-account concurrent admission, 1,000 active-item bound, profile/vault/public-key immutability and maximum body/field sizes. Verify malformed data does not log raw input or return SQL/stack traces.
- [ ] Dump the synthetic database and operational secrets. Vault fields should remain encrypted; enumerate honestly visible metadata. Assess offline guessing against a weak synthetic master and absence of an online-master verifier.
- [ ] Validate metadata audit scope and retention. Offline local reads are not server-observable; a server administrator can falsify/remove its log. Do not describe it as a forensic non-repudiation guarantee.

## Sharing and extension

- [ ] Reject unpinned/changed recipient and sender keys. Attempt malicious directory substitution and mismatched box recipient/context/nonce/tag. Compare fingerprints through a separate trusted channel.
- [ ] Verify snapshot keys differ from original keys and password history is absent. Include notes intentionally. Test sender-only revocation, cross-user share IDs and recipient copies retained after revocation.
- [ ] Install both Chromium and Firefox builds in their actual browsers. Verify packaging/signing policy, host-permission prompts, CSP, local WASM, storage.session behavior and no remote code loading. These real installation tests remain release gates until recorded.
- [ ] Autofill exact origin only, top frame only, one visible writable password field, same-origin form action, explicit selection/confirmation, no automatic submission. Test navigation races, hidden inputs, cross-origin forms, frames, ambiguous/multiple forms and page-side event listeners.

## Deployment and recovery

- [ ] Test Docker Compose first boot, no-default secrets, restart, nonroot/read-only/capability restrictions, private PostgreSQL, loopback-only app binding and bounded logs. Run with a real PostgreSQL instance, not only PGlite.
- [ ] Verify TLS configuration, certificate renewal, canonical HTTPS origin/RP, proxy trust, secure headers and firewall. Use a staging hostname for authorized dynamic scanning and document any out-of-scope systems.
- [ ] Perform backup/restore with operational secrets and discarded old sessions; verify master rotation/old-backup behavior. Test unavailable HIBP as “unavailable,” not “not breached.”
- [ ] Review dependency advisories, pinned WASM hashes, clean reproducible builds, signed extension releases and container digest provenance. Run OWASP ASVS 5.0 Level 2 requirements individually with recorded evidence.

Reference methodologies: [OWASP ASVS](https://owasp.org/www-project-application-security-verification-standard/), [OWASP WSTG](https://owasp.org/www-project-web-security-testing-guide/), [NIST SP800-115](https://csrc.nist.gov/pubs/sp/800/115/final). Any actual pentest report must use only observed findings; missing facts/PoCs should be marked **[Needs manual verification]** rather than invented.
````

## docs/THREAT-MODEL.md

Full creation path: `/workspace/scratch/ef7b82d54654/sentinel-vault/docs/THREAT-MODEL.md`

Documents the actual design, usage, interfaces or verification evidence.  
Distinguishes implemented behavior, operational assumptions and manual release gates.

````markdown
# Threat model — STRIDE

## Assets and trust boundaries

Protect master passwords, derived/root/vault/item keys, X25519 secret keys, credential fields and history, TOTP seeds, one-use recovery codes, passkey private keys, session/pairing grants, encrypted backups and availability. Public metadata includes emails, IDs, sharing relationships, revisions and timestamps. Passkey private keys remain in the user's authenticator and are not generated/stored by this application.

Boundary A: trusted browser/extension and device ↔ untrusted network. Boundary B: client cryptography ↔ API/database. Boundary C: independently verified recipient ↔ server key directory. Boundary D: source/build/signing channel ↔ executing client. Boundary E: user consent ↔ exact-origin autofill page. The API/database can be compromised; the actively delivered web client cannot simultaneously be considered trusted when its serving origin is compromised.

| STRIDE | Example threat | Implemented defense | Residual risk / verification |
|---|---|---|---|
| Spoofing | Stolen account password, passkey challenge replay, forged recipient public key | No password-based account verifier; origin/RP-bound, user-verified passkeys; one-use challenges; optional TOTP; independently pinned X25519 fingerprints | Stolen live sessions, malicious origin/code delivery, compromised authenticator, social engineering and incorrectly verified fingerprints remain possible |
| Tampering | Change ciphertext, swap item/vault IDs, overwrite a stale offline revision | AES-GCM 128-bit tags, fixed-width authenticated context, AES-KW, runtime schemas, row-locked optimistic concurrency | Valid historical ciphertext can be replayed by a compromised server; global freshness/transparency is not implemented |
| Repudiation | Deny a share or administrative/session action | Metadata audit of API events; user-scoped audit view; timestamps and object IDs | Server audit is not signed/notarized; local offline accesses and actual clipboard/reveal operations are not authoritative server events |
| Information disclosure | Database theft, logs, backups, XSS, clipboard history, shared-item over-disclosure | Client encryption, no request/body logging, memory-only crypto workers, strict CSP and React escaping, opt-in ciphertext cache, snapshot sharing without password history | Metadata exposed; low-entropy passwords vulnerable to offline guessing; active malicious JS/device reads unlocked secrets; recipient copies cannot be recalled |
| Denial of service | Expensive Argon2 requests, login floods, huge ciphertext/imports, registration exhaustion | KDF only in bounded disposable clients; rate limits/backoff; 50-account invitation gate; body/item/import bounds; SQL limits | Distributed DoS needs VPS/provider protection; browser local analysis of maximum-size data can consume CPU/RAM; compromised server can delete/withhold records |
| Elevation of privilege | Access another user's vault/shares, device bearer changes account settings, CSRF | Ownership predicates/FKs; authenticated session flags; browser-only fresh auth for sensitive account changes; Origin+CSRF with Strict cookies; device grants scoped by route | SQL/admin/host compromise bypasses server enforcement; independently verified encryption keys remain the vault confidentiality boundary |

## Attacker capabilities

- Network attacker: can observe/block traffic but cannot break correctly configured TLS or WebAuthn origin binding. Loopback HTTP is explicitly only for local use.
- Database thief: receives encrypted profiles/items/shares, metadata and hashed auth state. Can run offline guesses against Argon2 plus authenticated vault data; no practical confidentiality guarantee for a weak master password.
- Compromised API/DB: can bypass server authentication, substitute directory keys, withhold/replay valid data and falsify logs. Pinned fingerprints stop silently accepting changed sharing identities. Authenticated encryption detects invalid record modifications.
- Compromised web origin: can modify the page, workers, CSP and service worker. Can steal a master password or unlocked vault key. **Browser-served zero-knowledge encryption does not defend against this.** Use an independently reviewed and independently distributed extension for a different code-delivery boundary.
- Recipient: can decrypt a deliberately shared snapshot and keep it indefinitely. Snapshot history is excluded; notes, URL and username are included intentionally.

## Outside the defended scope

Device malware/keyloggers, OS/browser exploits, malicious same-origin autofill pages, compromised dependency/build/signing channels, physical memory inspection/swap/crash dumps, guaranteed clipboard deletion, passkey provider compromise, coercion, forwarding by recipients, provider-scale distributed DoS, organization escrow, forward secrecy, externally witnessed freshness and certified compliance are outside the implemented guarantees.

Security assumptions: strong unique master passphrases; trusted client code/device at unlock; independently verified recipient fingerprints; protected release distribution; correct HTTPS/DNS/RP configuration; reviewed upgrades and tested backups. See the deployment and penetration-test checklists for operational verification.
````

## docs/VALIDATION.md

Full creation path: `/workspace/scratch/ef7b82d54654/sentinel-vault/docs/VALIDATION.md`

Documents the actual design, usage, interfaces or verification evidence.  
Distinguishes implemented behavior, operational assumptions and manual release gates.

````markdown
# Validation record and release gates

Prepared 2026-10-05. All fixtures are public synthetic credentials; no real user's secret was used. This record describes work actually performed, not a penetration-test report or a finding-free guarantee.

## Executed checks

| Check | Result / environment |
|---|---|
| TypeScript strict check | `npm run check` passes on Node 24.19.0 |
| Crypto/unit/API suite | Native and real reference-WASM Argon2 cross-check; authenticated crypto, sharing, generator, HIBP, CSV, strength analysis and API security tests; **20 passing tests in six files** |
| SQL integration | PGlite 0.5.8 runs actual PostgreSQL SQL semantics in WASM with a serialized connection adapter; not a SQL mock or SQLite substitution |
| OpenAPI | Route-generated 3.0.3 specification passes independent Swagger Parser schema/reference validation |
| Client builds | React web, module/classic workers, API and independent Chrome/Firefox bundles build successfully; static assets local, no external CDN |
| Browser flow | **3 passing tests**; Chromium 153 headless with real WebAuthn verification and a virtual user-verified discoverable authenticator; registration/unlock/CRUD/offline/online-reload queue continuity/sync/export/lock; native clipboard clearing and newer-content preservation; TOTP enrollment/recovery login/master rotation/contact update; exact-origin autofill function behavior |
| Privacy/CSP browser assertions | Synthetic master/current password markers absent from outgoing request bodies; no CSP violation during checked flow; this is bounded observed evidence, not proof of all memory/network paths |
| Screenshots | Actual tested client captured with public fixture labels; no password/TOTP/recovery code displayed in images |
| Dependency audit | Known static-plugin advisories found and patched by pinning @fastify/static 10.1.5; final full npm audit reports **0 known advisories**; no claim about undisclosed vulnerabilities |
| Packaging | Source file inventory, vendored binary hashes/licenses, source book and ZIP exclusions checked; runtime secrets, .env, backups, dependencies and test recordings excluded |

The standard Playwright browser CDN download was unavailable in this environment. A separately installed npm Chromium distribution was used for the actual browser tests; it is not an app dependency and is not shipped. The original bundled Argon2 files are kept byte-identical to pinned upstream assets and are not reformatted.

## Not executed here

Docker Engine, Nginx, Certbot and a native PostgreSQL service were not available in this build environment. Docker Compose and real PostgreSQL checks are provided in CI but **CI has not been run on the user's GitHub repository**. VPS TLS/renewal/firewall/restore operations and actual Chrome/Firefox extension installation/permission flows require the final deployment/browser environment. The autofill function is tested in Chromium DOM; that does not certify browser-store installation compatibility. No third-party audit, full ASVS test, fuzz campaign, load/availability test, FIPS validation or certification was performed.

## Production release gates

1. Independent crypto/design review of the full code and the approved browser Argon2 binding exception; verify vendored build provenance and final release hashes.
2. Run provided CI against PostgreSQL 17 and Docker, including first start/restart and secret permissions. Resolve failures before release; do not interpret unrun workflow files as passing results.
3. Install/test independently built extension packages in actual supported Chrome/Firefox versions, including host permission, storage.session expiry, local KDF/CSP and user-initiated autofill. Sign/review distribution packages and protect the release channel.
4. Execute the ASVS 5.0 Level 2/WSTG plan on final HTTPS deployment with real authenticators, TOTP/recovery abuse cases, authorization/fuzz/race/load tests, offline conflict cases and backup/restore.
5. Enable private vulnerability reporting and assign an actual maintainer/patch process. Pin reviewed releases/container digests, monitor advisories and document backup retention and incident response.
6. Explicitly accept the compromised-web-origin, physical memory/clipboard, snapshot-revocation and global rollback limitations. If the threat model cannot accept malicious origin-delivered code, use an independently reviewed/distributed client.

Unsupported claims to avoid in a portfolio: “unhackable,” “all plaintext zeroed from RAM,” “FIPS compliant because AES-256,” “SOC2/ISO/PCI certified,” “audited Argon2 binding,” “complete Level 2 compliance,” or a pentest risk rating without an actual scoped assessment.
````

## docs/openapi.json

Full creation path: `/workspace/scratch/ef7b82d54654/sentinel-vault/docs/openapi.json`

Documents the actual design, usage, interfaces or verification evidence.  
Distinguishes implemented behavior, operational assumptions and manual release gates.

````json
{
  "openapi": "3.0.3",
  "info": {
    "title": "Sentinel Vault API",
    "version": "0.1.0",
    "description": "The API accepts encrypted vault envelopes only. Cookie mutations require Origin and X-CSRF-Token. Device bearer tokens are restricted to vault operations."
  },
  "components": {
    "securitySchemes": {
      "sessionCookie": {
        "type": "apiKey",
        "in": "cookie",
        "name": "sv_session"
      },
      "deviceBearer": {
        "type": "http",
        "scheme": "bearer"
      }
    },
    "schemas": {}
  },
  "paths": {
    "/api/health": {
      "get": {
        "tags": [
          "Operations"
        ],
        "responses": {
          "200": {
            "description": "Default Response",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "additionalProperties": true
                }
              }
            }
          }
        }
      }
    },
    "/api/auth/register/options": {
      "post": {
        "tags": [
          "Authentication"
        ],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "email": {},
                  "registrationToken": {
                    "type": "string",
                    "maxLength": 100
                  }
                },
                "required": [
                  "email",
                  "registrationToken"
                ],
                "additionalProperties": false
              }
            }
          },
          "required": true
        },
        "responses": {
          "200": {
            "description": "Default Response",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "additionalProperties": true
                }
              }
            }
          },
          "201": {
            "description": "Default Response",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "additionalProperties": true
                }
              }
            }
          },
          "400": {
            "description": "Default Response",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "additionalProperties": true
                }
              }
            }
          },
          "401": {
            "description": "Default Response",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "additionalProperties": true
                }
              }
            }
          },
          "403": {
            "description": "Default Response",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "additionalProperties": true
                }
              }
            }
          },
          "409": {
            "description": "Default Response",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "additionalProperties": true
                }
              }
            }
          },
          "429": {
            "description": "Default Response",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "additionalProperties": true
                }
              }
            }
          }
        }
      }
    },
    "/api/auth/register/finish": {
      "post": {
        "tags": [
          "Authentication"
        ],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "response": {
                    "type": "object",
                    "additionalProperties": {}
                  },
                  "profile": {
                    "type": "object",
                    "properties": {
                      "version": {
                        "type": "number",
                        "enum": [
                          1
                        ]
                      },
                      "vaultId": {
                        "type": "string",
                        "format": "uuid",
                        "pattern": "^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$"
                      },
                      "kdf": {
                        "type": "object",
                        "properties": {
                          "algorithm": {
                            "type": "string",
                            "enum": [
                              "argon2id"
                            ]
                          },
                          "version": {
                            "type": "number",
                            "enum": [
                              19
                            ]
                          },
                          "memoryKiB": {
                            "type": "number",
                            "enum": [
                              65536
                            ]
                          },
                          "iterations": {
                            "type": "number",
                            "enum": [
                              3
                            ]
                          },
                          "parallelism": {
                            "type": "number",
                            "enum": [
                              4
                            ]
                          },
                          "salt": {
                            "type": "string",
                            "minLength": 22,
                            "maxLength": 22,
                            "pattern": "^[A-Za-z0-9_-]+$"
                          }
                        },
                        "required": [
                          "algorithm",
                          "version",
                          "memoryKiB",
                          "iterations",
                          "parallelism",
                          "salt"
                        ],
                        "additionalProperties": false
                      },
                      "wrappedVaultKey": {
                        "type": "string",
                        "minLength": 54,
                        "maxLength": 54,
                        "pattern": "^[A-Za-z0-9_-]+$"
                      },
                      "publicKey": {
                        "type": "string",
                        "minLength": 43,
                        "maxLength": 43,
                        "pattern": "^[A-Za-z0-9_-]+$"
                      },
                      "identity": {
                        "type": "object",
                        "properties": {
                          "version": {
                            "type": "number",
                            "enum": [
                              1
                            ]
                          },
                          "vaultId": {
                            "type": "string",
                            "format": "uuid",
                            "pattern": "^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$"
                          },
                          "id": {
                            "type": "string",
                            "format": "uuid",
                            "pattern": "^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$"
                          },
                          "revision": {
                            "type": "integer",
                            "minimum": 1,
                            "maximum": 2147483647
                          },
                          "iv": {
                            "type": "string",
                            "minLength": 16,
                            "maxLength": 16,
                            "pattern": "^[A-Za-z0-9_-]+$"
                          },
                          "wrappedKey": {
                            "type": "string",
                            "minLength": 54,
                            "maxLength": 54,
                            "pattern": "^[A-Za-z0-9_-]+$"
                          },
                          "ciphertext": {
                            "type": "string",
                            "minLength": 22,
                            "maxLength": 131072,
                            "pattern": "^[A-Za-z0-9_-]+$"
                          }
                        },
                        "required": [
                          "version",
                          "vaultId",
                          "id",
                          "revision",
                          "iv",
                          "wrappedKey",
                          "ciphertext"
                        ],
                        "additionalProperties": false
                      }
                    },
                    "required": [
                      "version",
                      "vaultId",
                      "kdf",
                      "wrappedVaultKey",
                      "publicKey",
                      "identity"
                    ],
                    "additionalProperties": false
                  }
                },
                "required": [
                  "response",
                  "profile"
                ],
                "additionalProperties": false
              }
            }
          },
          "required": true
        },
        "responses": {
          "200": {
            "description": "Default Response",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "additionalProperties": true
                }
              }
            }
          },
          "201": {
            "description": "Default Response",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "additionalProperties": true
                }
              }
            }
          },
          "400": {
            "description": "Default Response",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "additionalProperties": true
                }
              }
            }
          },
          "401": {
            "description": "Default Response",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "additionalProperties": true
                }
              }
            }
          },
          "403": {
            "description": "Default Response",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "additionalProperties": true
                }
              }
            }
          },
          "409": {
            "description": "Default Response",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "additionalProperties": true
                }
              }
            }
          },
          "429": {
            "description": "Default Response",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "additionalProperties": true
                }
              }
            }
          }
        }
      }
    },
    "/api/auth/login/options": {
      "post": {
        "tags": [
          "Authentication"
        ],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {},
                "additionalProperties": false
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Default Response",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "additionalProperties": true
                }
              }
            }
          },
          "201": {
            "description": "Default Response",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "additionalProperties": true
                }
              }
            }
          },
          "400": {
            "description": "Default Response",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "additionalProperties": true
                }
              }
            }
          },
          "401": {
            "description": "Default Response",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "additionalProperties": true
                }
              }
            }
          },
          "403": {
            "description": "Default Response",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "additionalProperties": true
                }
              }
            }
          },
          "409": {
            "description": "Default Response",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "additionalProperties": true
                }
              }
            }
          },
          "429": {
            "description": "Default Response",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "additionalProperties": true
                }
              }
            }
          }
        }
      }
    },
    "/api/auth/login/finish": {
      "post": {
        "tags": [
          "Authentication"
        ],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "response": {
                    "type": "object",
                    "additionalProperties": {}
                  }
                },
                "required": [
                  "response"
                ],
                "additionalProperties": false
              }
            }
          },
          "required": true
        },
        "responses": {
          "200": {
            "description": "Default Response",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "additionalProperties": true
                }
              }
            }
          },
          "201": {
            "description": "Default Response",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "additionalProperties": true
                }
              }
            }
          },
          "400": {
            "description": "Default Response",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "additionalProperties": true
                }
              }
            }
          },
          "401": {
            "description": "Default Response",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "additionalProperties": true
                }
              }
            }
          },
          "403": {
            "description": "Default Response",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "additionalProperties": true
                }
              }
            }
          },
          "409": {
            "description": "Default Response",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "additionalProperties": true
                }
              }
            }
          },
          "429": {
            "description": "Default Response",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "additionalProperties": true
                }
              }
            }
          }
        }
      }
    },
    "/api/auth/second-factor": {
      "post": {
        "tags": [
          "Authentication"
        ],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "code": {
                    "type": "string",
                    "maxLength": 80
                  },
                  "recovery": {
                    "default": false,
                    "type": "boolean"
                  }
                },
                "required": [
                  "code",
                  "recovery"
                ],
                "additionalProperties": false
              }
            }
          },
          "required": true
        },
        "responses": {
          "200": {
            "description": "Default Response",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "additionalProperties": true
                }
              }
            }
          },
          "201": {
            "description": "Default Response",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "additionalProperties": true
                }
              }
            }
          },
          "400": {
            "description": "Default Response",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "additionalProperties": true
                }
              }
            }
          },
          "401": {
            "description": "Default Response",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "additionalProperties": true
                }
              }
            }
          },
          "403": {
            "description": "Default Response",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "additionalProperties": true
                }
              }
            }
          },
          "409": {
            "description": "Default Response",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "additionalProperties": true
                }
              }
            }
          },
          "429": {
            "description": "Default Response",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "additionalProperties": true
                }
              }
            }
          }
        }
      }
    },
    "/api/account": {
      "get": {
        "tags": [
          "Account"
        ],
        "parameters": [
          {
            "schema": {
              "type": "string"
            },
            "in": "header",
            "name": "x-csrf-token",
            "required": false,
            "description": "Required on browser-session mutations together with the canonical Origin. Device bearer requests omit it."
          }
        ],
        "security": [
          {
            "sessionCookie": []
          },
          {
            "deviceBearer": []
          }
        ],
        "responses": {
          "200": {
            "description": "Default Response",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "additionalProperties": true
                }
              }
            }
          },
          "201": {
            "description": "Default Response",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "additionalProperties": true
                }
              }
            }
          },
          "400": {
            "description": "Default Response",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "additionalProperties": true
                }
              }
            }
          },
          "401": {
            "description": "Default Response",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "additionalProperties": true
                }
              }
            }
          },
          "403": {
            "description": "Default Response",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "additionalProperties": true
                }
              }
            }
          },
          "409": {
            "description": "Default Response",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "additionalProperties": true
                }
              }
            }
          },
          "429": {
            "description": "Default Response",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "additionalProperties": true
                }
              }
            }
          }
        }
      }
    },
    "/api/auth/logout": {
      "post": {
        "tags": [
          "Authentication"
        ],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {},
                "additionalProperties": false
              }
            }
          }
        },
        "parameters": [
          {
            "schema": {
              "type": "string"
            },
            "in": "header",
            "name": "x-csrf-token",
            "required": false,
            "description": "Required on browser-session mutations together with the canonical Origin. Device bearer requests omit it."
          }
        ],
        "security": [
          {
            "sessionCookie": []
          },
          {
            "deviceBearer": []
          }
        ],
        "responses": {
          "200": {
            "description": "Default Response",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "additionalProperties": true
                }
              }
            }
          },
          "201": {
            "description": "Default Response",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "additionalProperties": true
                }
              }
            }
          },
          "400": {
            "description": "Default Response",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "additionalProperties": true
                }
              }
            }
          },
          "401": {
            "description": "Default Response",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "additionalProperties": true
                }
              }
            }
          },
          "403": {
            "description": "Default Response",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "additionalProperties": true
                }
              }
            }
          },
          "409": {
            "description": "Default Response",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "additionalProperties": true
                }
              }
            }
          },
          "429": {
            "description": "Default Response",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "additionalProperties": true
                }
              }
            }
          }
        }
      }
    },
    "/api/account/profile": {
      "put": {
        "tags": [
          "Account"
        ],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "profile": {
                    "type": "object",
                    "properties": {
                      "version": {
                        "type": "number",
                        "enum": [
                          1
                        ]
                      },
                      "vaultId": {
                        "type": "string",
                        "format": "uuid",
                        "pattern": "^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$"
                      },
                      "kdf": {
                        "type": "object",
                        "properties": {
                          "algorithm": {
                            "type": "string",
                            "enum": [
                              "argon2id"
                            ]
                          },
                          "version": {
                            "type": "number",
                            "enum": [
                              19
                            ]
                          },
                          "memoryKiB": {
                            "type": "number",
                            "enum": [
                              65536
                            ]
                          },
                          "iterations": {
                            "type": "number",
                            "enum": [
                              3
                            ]
                          },
                          "parallelism": {
                            "type": "number",
                            "enum": [
                              4
                            ]
                          },
                          "salt": {
                            "type": "string",
                            "minLength": 22,
                            "maxLength": 22,
                            "pattern": "^[A-Za-z0-9_-]+$"
                          }
                        },
                        "required": [
                          "algorithm",
                          "version",
                          "memoryKiB",
                          "iterations",
                          "parallelism",
                          "salt"
                        ],
                        "additionalProperties": false
                      },
                      "wrappedVaultKey": {
                        "type": "string",
                        "minLength": 54,
                        "maxLength": 54,
                        "pattern": "^[A-Za-z0-9_-]+$"
                      },
                      "publicKey": {
                        "type": "string",
                        "minLength": 43,
                        "maxLength": 43,
                        "pattern": "^[A-Za-z0-9_-]+$"
                      },
                      "identity": {
                        "type": "object",
                        "properties": {
                          "version": {
                            "type": "number",
                            "enum": [
                              1
                            ]
                          },
                          "vaultId": {
                            "type": "string",
                            "format": "uuid",
                            "pattern": "^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$"
                          },
                          "id": {
                            "type": "string",
                            "format": "uuid",
                            "pattern": "^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$"
                          },
                          "revision": {
                            "type": "integer",
                            "minimum": 1,
                            "maximum": 2147483647
                          },
                          "iv": {
                            "type": "string",
                            "minLength": 16,
                            "maxLength": 16,
                            "pattern": "^[A-Za-z0-9_-]+$"
                          },
                          "wrappedKey": {
                            "type": "string",
                            "minLength": 54,
                            "maxLength": 54,
                            "pattern": "^[A-Za-z0-9_-]+$"
                          },
                          "ciphertext": {
                            "type": "string",
                            "minLength": 22,
                            "maxLength": 131072,
                            "pattern": "^[A-Za-z0-9_-]+$"
                          }
                        },
                        "required": [
                          "version",
                          "vaultId",
                          "id",
                          "revision",
                          "iv",
                          "wrappedKey",
                          "ciphertext"
                        ],
                        "additionalProperties": false
                      }
                    },
                    "required": [
                      "version",
                      "vaultId",
                      "kdf",
                      "wrappedVaultKey",
                      "publicKey",
                      "identity"
                    ],
                    "additionalProperties": false
                  },
                  "expectedRevision": {
                    "type": "integer",
                    "exclusiveMinimum": true,
                    "maximum": 9007199254740991,
                    "minimum": 0
                  }
                },
                "required": [
                  "profile",
                  "expectedRevision"
                ],
                "additionalProperties": false
              }
            }
          },
          "required": true
        },
        "parameters": [
          {
            "schema": {
              "type": "string"
            },
            "in": "header",
            "name": "x-csrf-token",
            "required": false,
            "description": "Required on browser-session mutations together with the canonical Origin. Device bearer requests omit it."
          }
        ],
        "security": [
          {
            "sessionCookie": []
          },
          {
            "deviceBearer": []
          }
        ],
        "responses": {
          "200": {
            "description": "Default Response",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "additionalProperties": true
                }
              }
            }
          },
          "201": {
            "description": "Default Response",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "additionalProperties": true
                }
              }
            }
          },
          "400": {
            "description": "Default Response",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "additionalProperties": true
                }
              }
            }
          },
          "401": {
            "description": "Default Response",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "additionalProperties": true
                }
              }
            }
          },
          "403": {
            "description": "Default Response",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "additionalProperties": true
                }
              }
            }
          },
          "409": {
            "description": "Default Response",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "additionalProperties": true
                }
              }
            }
          },
          "429": {
            "description": "Default Response",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "additionalProperties": true
                }
              }
            }
          }
        }
      }
    },
    "/api/items": {
      "get": {
        "tags": [
          "Vault"
        ],
        "parameters": [
          {
            "schema": {
              "type": "string"
            },
            "in": "header",
            "name": "x-csrf-token",
            "required": false,
            "description": "Required on browser-session mutations together with the canonical Origin. Device bearer requests omit it."
          }
        ],
        "security": [
          {
            "sessionCookie": []
          },
          {
            "deviceBearer": []
          }
        ],
        "responses": {
          "200": {
            "description": "Default Response",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "additionalProperties": true
                }
              }
            }
          },
          "201": {
            "description": "Default Response",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "additionalProperties": true
                }
              }
            }
          },
          "400": {
            "description": "Default Response",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "additionalProperties": true
                }
              }
            }
          },
          "401": {
            "description": "Default Response",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "additionalProperties": true
                }
              }
            }
          },
          "403": {
            "description": "Default Response",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "additionalProperties": true
                }
              }
            }
          },
          "409": {
            "description": "Default Response",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "additionalProperties": true
                }
              }
            }
          },
          "429": {
            "description": "Default Response",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "additionalProperties": true
                }
              }
            }
          }
        }
      }
    },
    "/api/items/{id}": {
      "put": {
        "tags": [
          "Vault"
        ],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "expectedRevision": {
                    "type": "integer",
                    "minimum": 0,
                    "maximum": 2147483646
                  },
                  "envelope": {
                    "type": "object",
                    "properties": {
                      "version": {
                        "type": "number",
                        "enum": [
                          1
                        ]
                      },
                      "vaultId": {
                        "type": "string",
                        "format": "uuid",
                        "pattern": "^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$"
                      },
                      "id": {
                        "type": "string",
                        "format": "uuid",
                        "pattern": "^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$"
                      },
                      "revision": {
                        "type": "integer",
                        "minimum": 1,
                        "maximum": 2147483647
                      },
                      "iv": {
                        "type": "string",
                        "minLength": 16,
                        "maxLength": 16,
                        "pattern": "^[A-Za-z0-9_-]+$"
                      },
                      "wrappedKey": {
                        "type": "string",
                        "minLength": 54,
                        "maxLength": 54,
                        "pattern": "^[A-Za-z0-9_-]+$"
                      },
                      "ciphertext": {
                        "type": "string",
                        "minLength": 22,
                        "maxLength": 131072,
                        "pattern": "^[A-Za-z0-9_-]+$"
                      }
                    },
                    "required": [
                      "version",
                      "vaultId",
                      "id",
                      "revision",
                      "iv",
                      "wrappedKey",
                      "ciphertext"
                    ],
                    "additionalProperties": false
                  }
                },
                "required": [
                  "expectedRevision",
                  "envelope"
                ],
                "additionalProperties": false
              }
            }
          },
          "required": true
        },
        "parameters": [
          {
            "schema": {
              "type": "string",
              "format": "uuid",
              "pattern": "^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$"
            },
            "in": "path",
            "name": "id",
            "required": true
          },
          {
            "schema": {
              "type": "string"
            },
            "in": "header",
            "name": "x-csrf-token",
            "required": false,
            "description": "Required on browser-session mutations together with the canonical Origin. Device bearer requests omit it."
          }
        ],
        "security": [
          {
            "sessionCookie": []
          },
          {
            "deviceBearer": []
          }
        ],
        "responses": {
          "200": {
            "description": "Default Response",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "additionalProperties": true
                }
              }
            }
          },
          "201": {
            "description": "Default Response",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "additionalProperties": true
                }
              }
            }
          },
          "400": {
            "description": "Default Response",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "additionalProperties": true
                }
              }
            }
          },
          "401": {
            "description": "Default Response",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "additionalProperties": true
                }
              }
            }
          },
          "403": {
            "description": "Default Response",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "additionalProperties": true
                }
              }
            }
          },
          "409": {
            "description": "Default Response",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "additionalProperties": true
                }
              }
            }
          },
          "429": {
            "description": "Default Response",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "additionalProperties": true
                }
              }
            }
          }
        }
      },
      "delete": {
        "tags": [
          "Vault"
        ],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "expectedRevision": {
                    "type": "integer",
                    "exclusiveMinimum": true,
                    "maximum": 2147483646,
                    "minimum": 0
                  }
                },
                "required": [
                  "expectedRevision"
                ],
                "additionalProperties": false
              }
            }
          },
          "required": true
        },
        "parameters": [
          {
            "schema": {
              "type": "string",
              "format": "uuid",
              "pattern": "^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$"
            },
            "in": "path",
            "name": "id",
            "required": true
          },
          {
            "schema": {
              "type": "string"
            },
            "in": "header",
            "name": "x-csrf-token",
            "required": false,
            "description": "Required on browser-session mutations together with the canonical Origin. Device bearer requests omit it."
          }
        ],
        "security": [
          {
            "sessionCookie": []
          },
          {
            "deviceBearer": []
          }
        ],
        "responses": {
          "200": {
            "description": "Default Response",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "additionalProperties": true
                }
              }
            }
          },
          "201": {
            "description": "Default Response",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "additionalProperties": true
                }
              }
            }
          },
          "400": {
            "description": "Default Response",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "additionalProperties": true
                }
              }
            }
          },
          "401": {
            "description": "Default Response",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "additionalProperties": true
                }
              }
            }
          },
          "403": {
            "description": "Default Response",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "additionalProperties": true
                }
              }
            }
          },
          "409": {
            "description": "Default Response",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "additionalProperties": true
                }
              }
            }
          },
          "429": {
            "description": "Default Response",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "additionalProperties": true
                }
              }
            }
          }
        }
      }
    },
    "/api/directory/lookup": {
      "post": {
        "tags": [
          "Sharing"
        ],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "email": {}
                },
                "required": [
                  "email"
                ],
                "additionalProperties": false
              }
            }
          },
          "required": true
        },
        "parameters": [
          {
            "schema": {
              "type": "string"
            },
            "in": "header",
            "name": "x-csrf-token",
            "required": false,
            "description": "Required on browser-session mutations together with the canonical Origin. Device bearer requests omit it."
          }
        ],
        "security": [
          {
            "sessionCookie": []
          },
          {
            "deviceBearer": []
          }
        ],
        "responses": {
          "200": {
            "description": "Default Response",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "additionalProperties": true
                }
              }
            }
          },
          "201": {
            "description": "Default Response",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "additionalProperties": true
                }
              }
            }
          },
          "400": {
            "description": "Default Response",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "additionalProperties": true
                }
              }
            }
          },
          "401": {
            "description": "Default Response",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "additionalProperties": true
                }
              }
            }
          },
          "403": {
            "description": "Default Response",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "additionalProperties": true
                }
              }
            }
          },
          "409": {
            "description": "Default Response",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "additionalProperties": true
                }
              }
            }
          },
          "429": {
            "description": "Default Response",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "additionalProperties": true
                }
              }
            }
          }
        }
      }
    },
    "/api/shares": {
      "post": {
        "tags": [
          "Sharing"
        ],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "recipientId": {
                    "type": "string",
                    "format": "uuid",
                    "pattern": "^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$"
                  },
                  "itemId": {
                    "type": "string",
                    "format": "uuid",
                    "pattern": "^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$"
                  },
                  "envelope": {
                    "type": "object",
                    "properties": {
                      "version": {
                        "type": "number",
                        "enum": [
                          1
                        ]
                      },
                      "senderPublicKey": {
                        "type": "string",
                        "minLength": 43,
                        "maxLength": 43,
                        "pattern": "^[A-Za-z0-9_-]+$"
                      },
                      "recipientPublicKey": {
                        "type": "string",
                        "minLength": 43,
                        "maxLength": 43,
                        "pattern": "^[A-Za-z0-9_-]+$"
                      },
                      "nonce": {
                        "type": "string",
                        "minLength": 32,
                        "maxLength": 32,
                        "pattern": "^[A-Za-z0-9_-]+$"
                      },
                      "box": {
                        "type": "string",
                        "minLength": 107,
                        "maxLength": 107,
                        "pattern": "^[A-Za-z0-9_-]+$"
                      },
                      "record": {
                        "type": "object",
                        "properties": {
                          "version": {
                            "type": "number",
                            "enum": [
                              1
                            ]
                          },
                          "vaultId": {
                            "type": "string",
                            "format": "uuid",
                            "pattern": "^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$"
                          },
                          "id": {
                            "type": "string",
                            "format": "uuid",
                            "pattern": "^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$"
                          },
                          "revision": {
                            "type": "integer",
                            "minimum": 1,
                            "maximum": 2147483647
                          },
                          "iv": {
                            "type": "string",
                            "minLength": 16,
                            "maxLength": 16,
                            "pattern": "^[A-Za-z0-9_-]+$"
                          },
                          "wrappedKey": {
                            "type": "string",
                            "minLength": 54,
                            "maxLength": 54,
                            "pattern": "^[A-Za-z0-9_-]+$"
                          },
                          "ciphertext": {
                            "type": "string",
                            "minLength": 22,
                            "maxLength": 131072,
                            "pattern": "^[A-Za-z0-9_-]+$"
                          }
                        },
                        "required": [
                          "version",
                          "vaultId",
                          "id",
                          "revision",
                          "iv",
                          "wrappedKey",
                          "ciphertext"
                        ],
                        "additionalProperties": false
                      }
                    },
                    "required": [
                      "version",
                      "senderPublicKey",
                      "recipientPublicKey",
                      "nonce",
                      "box",
                      "record"
                    ],
                    "additionalProperties": false
                  }
                },
                "required": [
                  "recipientId",
                  "itemId",
                  "envelope"
                ],
                "additionalProperties": false
              }
            }
          },
          "required": true
        },
        "parameters": [
          {
            "schema": {
              "type": "string"
            },
            "in": "header",
            "name": "x-csrf-token",
            "required": false,
            "description": "Required on browser-session mutations together with the canonical Origin. Device bearer requests omit it."
          }
        ],
        "security": [
          {
            "sessionCookie": []
          },
          {
            "deviceBearer": []
          }
        ],
        "responses": {
          "200": {
            "description": "Default Response",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "additionalProperties": true
                }
              }
            }
          },
          "201": {
            "description": "Default Response",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "additionalProperties": true
                }
              }
            }
          },
          "400": {
            "description": "Default Response",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "additionalProperties": true
                }
              }
            }
          },
          "401": {
            "description": "Default Response",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "additionalProperties": true
                }
              }
            }
          },
          "403": {
            "description": "Default Response",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "additionalProperties": true
                }
              }
            }
          },
          "409": {
            "description": "Default Response",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "additionalProperties": true
                }
              }
            }
          },
          "429": {
            "description": "Default Response",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "additionalProperties": true
                }
              }
            }
          }
        }
      },
      "get": {
        "tags": [
          "Sharing"
        ],
        "parameters": [
          {
            "schema": {
              "type": "string"
            },
            "in": "header",
            "name": "x-csrf-token",
            "required": false,
            "description": "Required on browser-session mutations together with the canonical Origin. Device bearer requests omit it."
          }
        ],
        "security": [
          {
            "sessionCookie": []
          },
          {
            "deviceBearer": []
          }
        ],
        "responses": {
          "200": {
            "description": "Default Response",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "additionalProperties": true
                }
              }
            }
          },
          "201": {
            "description": "Default Response",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "additionalProperties": true
                }
              }
            }
          },
          "400": {
            "description": "Default Response",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "additionalProperties": true
                }
              }
            }
          },
          "401": {
            "description": "Default Response",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "additionalProperties": true
                }
              }
            }
          },
          "403": {
            "description": "Default Response",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "additionalProperties": true
                }
              }
            }
          },
          "409": {
            "description": "Default Response",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "additionalProperties": true
                }
              }
            }
          },
          "429": {
            "description": "Default Response",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "additionalProperties": true
                }
              }
            }
          }
        }
      }
    },
    "/api/shares/{id}": {
      "delete": {
        "tags": [
          "Sharing"
        ],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {},
                "additionalProperties": false
              }
            }
          }
        },
        "parameters": [
          {
            "schema": {
              "type": "string",
              "format": "uuid",
              "pattern": "^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$"
            },
            "in": "path",
            "name": "id",
            "required": true
          },
          {
            "schema": {
              "type": "string"
            },
            "in": "header",
            "name": "x-csrf-token",
            "required": false,
            "description": "Required on browser-session mutations together with the canonical Origin. Device bearer requests omit it."
          }
        ],
        "security": [
          {
            "sessionCookie": []
          },
          {
            "deviceBearer": []
          }
        ],
        "responses": {
          "200": {
            "description": "Default Response",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "additionalProperties": true
                }
              }
            }
          },
          "201": {
            "description": "Default Response",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "additionalProperties": true
                }
              }
            }
          },
          "400": {
            "description": "Default Response",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "additionalProperties": true
                }
              }
            }
          },
          "401": {
            "description": "Default Response",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "additionalProperties": true
                }
              }
            }
          },
          "403": {
            "description": "Default Response",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "additionalProperties": true
                }
              }
            }
          },
          "409": {
            "description": "Default Response",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "additionalProperties": true
                }
              }
            }
          },
          "429": {
            "description": "Default Response",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "additionalProperties": true
                }
              }
            }
          }
        }
      }
    },
    "/api/audit": {
      "get": {
        "tags": [
          "Account"
        ],
        "parameters": [
          {
            "schema": {
              "type": "string"
            },
            "in": "header",
            "name": "x-csrf-token",
            "required": false,
            "description": "Required on browser-session mutations together with the canonical Origin. Device bearer requests omit it."
          }
        ],
        "security": [
          {
            "sessionCookie": []
          },
          {
            "deviceBearer": []
          }
        ],
        "responses": {
          "200": {
            "description": "Default Response",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "additionalProperties": true
                }
              }
            }
          },
          "201": {
            "description": "Default Response",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "additionalProperties": true
                }
              }
            }
          },
          "400": {
            "description": "Default Response",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "additionalProperties": true
                }
              }
            }
          },
          "401": {
            "description": "Default Response",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "additionalProperties": true
                }
              }
            }
          },
          "403": {
            "description": "Default Response",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "additionalProperties": true
                }
              }
            }
          },
          "409": {
            "description": "Default Response",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "additionalProperties": true
                }
              }
            }
          },
          "429": {
            "description": "Default Response",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "additionalProperties": true
                }
              }
            }
          }
        }
      }
    },
    "/api/sessions": {
      "get": {
        "tags": [
          "Account"
        ],
        "parameters": [
          {
            "schema": {
              "type": "string"
            },
            "in": "header",
            "name": "x-csrf-token",
            "required": false,
            "description": "Required on browser-session mutations together with the canonical Origin. Device bearer requests omit it."
          }
        ],
        "security": [
          {
            "sessionCookie": []
          },
          {
            "deviceBearer": []
          }
        ],
        "responses": {
          "200": {
            "description": "Default Response",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "additionalProperties": true
                }
              }
            }
          },
          "201": {
            "description": "Default Response",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "additionalProperties": true
                }
              }
            }
          },
          "400": {
            "description": "Default Response",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "additionalProperties": true
                }
              }
            }
          },
          "401": {
            "description": "Default Response",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "additionalProperties": true
                }
              }
            }
          },
          "403": {
            "description": "Default Response",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "additionalProperties": true
                }
              }
            }
          },
          "409": {
            "description": "Default Response",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "additionalProperties": true
                }
              }
            }
          },
          "429": {
            "description": "Default Response",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "additionalProperties": true
                }
              }
            }
          }
        }
      }
    },
    "/api/sessions/{id}": {
      "delete": {
        "tags": [
          "Account"
        ],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {},
                "additionalProperties": false
              }
            }
          }
        },
        "parameters": [
          {
            "schema": {
              "type": "string",
              "pattern": "^[0-9a-f]{64}$"
            },
            "in": "path",
            "name": "id",
            "required": true
          },
          {
            "schema": {
              "type": "string"
            },
            "in": "header",
            "name": "x-csrf-token",
            "required": false,
            "description": "Required on browser-session mutations together with the canonical Origin. Device bearer requests omit it."
          }
        ],
        "security": [
          {
            "sessionCookie": []
          },
          {
            "deviceBearer": []
          }
        ],
        "responses": {
          "200": {
            "description": "Default Response",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "additionalProperties": true
                }
              }
            }
          },
          "201": {
            "description": "Default Response",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "additionalProperties": true
                }
              }
            }
          },
          "400": {
            "description": "Default Response",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "additionalProperties": true
                }
              }
            }
          },
          "401": {
            "description": "Default Response",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "additionalProperties": true
                }
              }
            }
          },
          "403": {
            "description": "Default Response",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "additionalProperties": true
                }
              }
            }
          },
          "409": {
            "description": "Default Response",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "additionalProperties": true
                }
              }
            }
          },
          "429": {
            "description": "Default Response",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "additionalProperties": true
                }
              }
            }
          }
        }
      }
    },
    "/api/devices/pairing": {
      "post": {
        "tags": [
          "Devices"
        ],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "label": {
                    "type": "string",
                    "minLength": 1,
                    "maxLength": 120
                  }
                },
                "required": [
                  "label"
                ],
                "additionalProperties": false
              }
            }
          },
          "required": true
        },
        "parameters": [
          {
            "schema": {
              "type": "string"
            },
            "in": "header",
            "name": "x-csrf-token",
            "required": false,
            "description": "Required on browser-session mutations together with the canonical Origin. Device bearer requests omit it."
          }
        ],
        "security": [
          {
            "sessionCookie": []
          },
          {
            "deviceBearer": []
          }
        ],
        "responses": {
          "200": {
            "description": "Default Response",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "additionalProperties": true
                }
              }
            }
          },
          "201": {
            "description": "Default Response",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "additionalProperties": true
                }
              }
            }
          },
          "400": {
            "description": "Default Response",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "additionalProperties": true
                }
              }
            }
          },
          "401": {
            "description": "Default Response",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "additionalProperties": true
                }
              }
            }
          },
          "403": {
            "description": "Default Response",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "additionalProperties": true
                }
              }
            }
          },
          "409": {
            "description": "Default Response",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "additionalProperties": true
                }
              }
            }
          },
          "429": {
            "description": "Default Response",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "additionalProperties": true
                }
              }
            }
          }
        }
      }
    },
    "/api/auth/pair": {
      "post": {
        "tags": [
          "Devices"
        ],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "pairingToken": {
                    "type": "string",
                    "pattern": "^[A-Za-z0-9_-]{43}$"
                  }
                },
                "required": [
                  "pairingToken"
                ],
                "additionalProperties": false
              }
            }
          },
          "required": true
        },
        "responses": {
          "200": {
            "description": "Default Response",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "additionalProperties": true
                }
              }
            }
          },
          "201": {
            "description": "Default Response",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "additionalProperties": true
                }
              }
            }
          },
          "400": {
            "description": "Default Response",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "additionalProperties": true
                }
              }
            }
          },
          "401": {
            "description": "Default Response",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "additionalProperties": true
                }
              }
            }
          },
          "403": {
            "description": "Default Response",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "additionalProperties": true
                }
              }
            }
          },
          "409": {
            "description": "Default Response",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "additionalProperties": true
                }
              }
            }
          },
          "429": {
            "description": "Default Response",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "additionalProperties": true
                }
              }
            }
          }
        }
      }
    },
    "/api/account/totp/setup": {
      "post": {
        "tags": [
          "Two-factor"
        ],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {},
                "additionalProperties": false
              }
            }
          }
        },
        "parameters": [
          {
            "schema": {
              "type": "string"
            },
            "in": "header",
            "name": "x-csrf-token",
            "required": false,
            "description": "Required on browser-session mutations together with the canonical Origin. Device bearer requests omit it."
          }
        ],
        "security": [
          {
            "sessionCookie": []
          },
          {
            "deviceBearer": []
          }
        ],
        "responses": {
          "200": {
            "description": "Default Response",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "additionalProperties": true
                }
              }
            }
          },
          "201": {
            "description": "Default Response",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "additionalProperties": true
                }
              }
            }
          },
          "400": {
            "description": "Default Response",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "additionalProperties": true
                }
              }
            }
          },
          "401": {
            "description": "Default Response",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "additionalProperties": true
                }
              }
            }
          },
          "403": {
            "description": "Default Response",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "additionalProperties": true
                }
              }
            }
          },
          "409": {
            "description": "Default Response",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "additionalProperties": true
                }
              }
            }
          },
          "429": {
            "description": "Default Response",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "additionalProperties": true
                }
              }
            }
          }
        }
      }
    },
    "/api/account/totp/confirm": {
      "post": {
        "tags": [
          "Two-factor"
        ],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "code": {
                    "type": "string",
                    "maxLength": 80
                  },
                  "recovery": {
                    "default": false,
                    "type": "boolean"
                  }
                },
                "required": [
                  "code",
                  "recovery"
                ],
                "additionalProperties": false
              }
            }
          },
          "required": true
        },
        "parameters": [
          {
            "schema": {
              "type": "string"
            },
            "in": "header",
            "name": "x-csrf-token",
            "required": false,
            "description": "Required on browser-session mutations together with the canonical Origin. Device bearer requests omit it."
          }
        ],
        "security": [
          {
            "sessionCookie": []
          },
          {
            "deviceBearer": []
          }
        ],
        "responses": {
          "200": {
            "description": "Default Response",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "additionalProperties": true
                }
              }
            }
          },
          "201": {
            "description": "Default Response",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "additionalProperties": true
                }
              }
            }
          },
          "400": {
            "description": "Default Response",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "additionalProperties": true
                }
              }
            }
          },
          "401": {
            "description": "Default Response",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "additionalProperties": true
                }
              }
            }
          },
          "403": {
            "description": "Default Response",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "additionalProperties": true
                }
              }
            }
          },
          "409": {
            "description": "Default Response",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "additionalProperties": true
                }
              }
            }
          },
          "429": {
            "description": "Default Response",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "additionalProperties": true
                }
              }
            }
          }
        }
      }
    },
    "/api/account/totp/disable": {
      "post": {
        "tags": [
          "Two-factor"
        ],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "code": {
                    "type": "string",
                    "maxLength": 80
                  },
                  "recovery": {
                    "default": false,
                    "type": "boolean"
                  }
                },
                "required": [
                  "code",
                  "recovery"
                ],
                "additionalProperties": false
              }
            }
          },
          "required": true
        },
        "parameters": [
          {
            "schema": {
              "type": "string"
            },
            "in": "header",
            "name": "x-csrf-token",
            "required": false,
            "description": "Required on browser-session mutations together with the canonical Origin. Device bearer requests omit it."
          }
        ],
        "security": [
          {
            "sessionCookie": []
          },
          {
            "deviceBearer": []
          }
        ],
        "responses": {
          "200": {
            "description": "Default Response",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "additionalProperties": true
                }
              }
            }
          },
          "201": {
            "description": "Default Response",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "additionalProperties": true
                }
              }
            }
          },
          "400": {
            "description": "Default Response",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "additionalProperties": true
                }
              }
            }
          },
          "401": {
            "description": "Default Response",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "additionalProperties": true
                }
              }
            }
          },
          "403": {
            "description": "Default Response",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "additionalProperties": true
                }
              }
            }
          },
          "409": {
            "description": "Default Response",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "additionalProperties": true
                }
              }
            }
          },
          "429": {
            "description": "Default Response",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "additionalProperties": true
                }
              }
            }
          }
        }
      }
    },
    "/api/account/passkeys/options": {
      "post": {
        "tags": [
          "Authentication"
        ],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {},
                "additionalProperties": false
              }
            }
          }
        },
        "parameters": [
          {
            "schema": {
              "type": "string"
            },
            "in": "header",
            "name": "x-csrf-token",
            "required": false,
            "description": "Required on browser-session mutations together with the canonical Origin. Device bearer requests omit it."
          }
        ],
        "security": [
          {
            "sessionCookie": []
          },
          {
            "deviceBearer": []
          }
        ],
        "responses": {
          "200": {
            "description": "Default Response",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "additionalProperties": true
                }
              }
            }
          },
          "201": {
            "description": "Default Response",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "additionalProperties": true
                }
              }
            }
          },
          "400": {
            "description": "Default Response",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "additionalProperties": true
                }
              }
            }
          },
          "401": {
            "description": "Default Response",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "additionalProperties": true
                }
              }
            }
          },
          "403": {
            "description": "Default Response",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "additionalProperties": true
                }
              }
            }
          },
          "409": {
            "description": "Default Response",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "additionalProperties": true
                }
              }
            }
          },
          "429": {
            "description": "Default Response",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "additionalProperties": true
                }
              }
            }
          }
        }
      }
    },
    "/api/account/passkeys/finish": {
      "post": {
        "tags": [
          "Authentication"
        ],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "response": {
                    "type": "object",
                    "additionalProperties": {}
                  }
                },
                "required": [
                  "response"
                ],
                "additionalProperties": false
              }
            }
          },
          "required": true
        },
        "parameters": [
          {
            "schema": {
              "type": "string"
            },
            "in": "header",
            "name": "x-csrf-token",
            "required": false,
            "description": "Required on browser-session mutations together with the canonical Origin. Device bearer requests omit it."
          }
        ],
        "security": [
          {
            "sessionCookie": []
          },
          {
            "deviceBearer": []
          }
        ],
        "responses": {
          "200": {
            "description": "Default Response",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "additionalProperties": true
                }
              }
            }
          },
          "201": {
            "description": "Default Response",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "additionalProperties": true
                }
              }
            }
          },
          "400": {
            "description": "Default Response",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "additionalProperties": true
                }
              }
            }
          },
          "401": {
            "description": "Default Response",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "additionalProperties": true
                }
              }
            }
          },
          "403": {
            "description": "Default Response",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "additionalProperties": true
                }
              }
            }
          },
          "409": {
            "description": "Default Response",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "additionalProperties": true
                }
              }
            }
          },
          "429": {
            "description": "Default Response",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "additionalProperties": true
                }
              }
            }
          }
        }
      }
    }
  }
}
````

## docs/screenshots/health.png

Full creation path: `/workspace/scratch/ef7b82d54654/sentinel-vault/docs/screenshots/health.png`

Documents the actual design, usage, interfaces or verification evidence.  
Distinguishes implemented behavior, operational assumptions and manual release gates.

Binary artifact: 95748 bytes; SHA-256 `129911cafbbce1d8e622329c0a0beba28fd308d06c740303fdf3f8c2690f5fdd`.

## docs/screenshots/sign-in.png

Full creation path: `/workspace/scratch/ef7b82d54654/sentinel-vault/docs/screenshots/sign-in.png`

Documents the actual design, usage, interfaces or verification evidence.  
Distinguishes implemented behavior, operational assumptions and manual release gates.

Binary artifact: 101855 bytes; SHA-256 `086aa7f687b044186c47180f65397707d6e142ac515c5db1c6f979c4dd9571f2`.

## docs/screenshots/vault.png

Full creation path: `/workspace/scratch/ef7b82d54654/sentinel-vault/docs/screenshots/vault.png`

Documents the actual design, usage, interfaces or verification evidence.  
Distinguishes implemented behavior, operational assumptions and manual release gates.

Binary artifact: 73259 bytes; SHA-256 `4eb885cf1fba9ac077908a69718516d627a127adaea943228fe41e3329c42dfa`.

## extensions/browser/index.html

Full creation path: `/workspace/scratch/ef7b82d54654/sentinel-vault/extensions/browser/index.html`

Builds the independently packaged browser extension and explicit autofill interface.  
Restricts filling to a selected exact-origin top-frame login form without submission.

````html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>Sentinel Vault</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/popup.tsx"></script>
  </body>
</html>
````

## extensions/browser/src/autofill.ts

Full creation path: `/workspace/scratch/ef7b82d54654/sentinel-vault/extensions/browser/src/autofill.ts`

Builds the independently packaged browser extension and explicit autofill interface.  
Restricts filling to a selected exact-origin top-frame login form without submission.

````typescript
export function allowedOrigin(value: string): string {
  const url = new URL(value);
  if (
    url.username ||
    url.password ||
    !(
      url.protocol === "https:" ||
      (url.protocol === "http:" &&
        ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname))
    )
  )
    throw new Error("An HTTPS or localhost URL is required.");
  return url.origin;
}
// Runs only in the selected top frame after the user's explicit click. No automatic submission.
export function fillLogin({
  expectedOrigin,
  username,
  password,
}: {
  expectedOrigin: string;
  username: string;
  password: string;
}): boolean {
  if (location.origin !== expectedOrigin || window.top !== window.self)
    return false;
  const visible = (input: HTMLInputElement) =>
    !input.disabled &&
    !input.readOnly &&
    input.getClientRects().length > 0 &&
    getComputedStyle(input).visibility !== "hidden";
  const passwords = Array.from(
    document.querySelectorAll<HTMLInputElement>('input[type="password"]'),
  ).filter(visible);
  if (passwords.length !== 1) return false; // Ambiguous forms require the user to paste manually.
  const secret = passwords[0],
    root: ParentNode = secret.form || document;
  if (secret.form) {
    const action = new URL(secret.form.action || location.href);
    if (action.origin !== expectedOrigin) return false;
  }
  const candidates = Array.from(
    root.querySelectorAll<HTMLInputElement>("input"),
  ).filter((i) => visible(i) && ["text", "email", "tel"].includes(i.type));
  const login =
    candidates.find(
      (i) => i.autocomplete === "username" || i.autocomplete === "email",
    ) ||
    candidates.find((i) => /user|email|login/i.test(i.name)) ||
    (candidates.length === 1 ? candidates[0] : undefined);
  const setter = Object.getOwnPropertyDescriptor(
    HTMLInputElement.prototype,
    "value",
  )?.set;
  if (!setter) return false;
  const set = (input: HTMLInputElement, value: string) => {
    setter.call(input, value);
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.dispatchEvent(new Event("change", { bubbles: true }));
  };
  if (login) set(login, username);
  set(secret, password);
  return true;
}
````

## extensions/browser/src/popup.css

Full creation path: `/workspace/scratch/ef7b82d54654/sentinel-vault/extensions/browser/src/popup.css`

Builds the independently packaged browser extension and explicit autofill interface.  
Restricts filling to a selected exact-origin top-frame login form without submission.

````css
body {
  margin: 0;
  width: 390px;
  min-height: 380px;
  background: #101b19;
  color: #ebeee7;
  font:
    13px/1.6 system-ui,
    sans-serif;
}
main {
  padding: 24px;
}
header {
  display: flex;
  align-items: center;
  gap: 12px;
  border-bottom: 1px solid #2b3c34;
  padding-bottom: 20px;
  margin-bottom: 25px;
  font-size: 22px;
}
header > span {
  font-size: 33px;
  color: #bceec7;
}
header button {
  margin-left: auto;
}
small {
  display: block;
  color: #a2afa6;
  font-size: 10px;
}
header small {
  font-size: 8px;
  letter-spacing: 1px;
}
h1 {
  font-size: 23px;
}
p {
  color: #a2afa6;
  overflow-wrap: anywhere;
}
label {
  display: block;
  margin-bottom: 17px;
  font-size: 11px;
  color: #a2afa6;
}
input {
  box-sizing: border-box;
  display: block;
  width: 100%;
  padding: 11px;
  margin-top: 7px;
  background: #15221f;
  color: #ebeee7;
  border: 1px solid #2b3c34;
  border-radius: 8px;
  font: inherit;
}
button {
  cursor: pointer;
  background: #20332a;
  color: #ebeee7;
  border: 1px solid #2b3c34;
  border-radius: 7px;
  padding: 9px 13px;
  font: inherit;
}
.primary {
  background: #bceec7;
  color: #17261c;
  width: 100%;
  margin-bottom: 15px;
}
button:disabled {
  opacity: 0.5;
}
.entry {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 13px 0;
  border-bottom: 1px solid #2b3c34;
}
.notice {
  padding: 12px;
  background: #20332a;
  border-radius: 7px;
}
.note {
  font-size: 10px;
}
:focus-visible {
  outline: 2px solid #bceec7;
  outline-offset: 2px;
}
````

## extensions/browser/src/popup.tsx

Full creation path: `/workspace/scratch/ef7b82d54654/sentinel-vault/extensions/browser/src/popup.tsx`

Builds the independently packaged browser extension and explicit autofill interface.  
Restricts filling to a selected exact-origin top-frame login form without submission.

````tsx
import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { CryptoClient } from "../../../apps/web/src/worker-client";
import { passwordBytes } from "../../../packages/crypto/bytes";
import {
  EnvelopeSchema,
  ProfileSchema,
  type Envelope,
  type Profile,
  type VaultItem,
} from "../../../packages/shared/schema";
import { allowedOrigin, fillLogin } from "./autofill";
import "./popup.css";
const browser = (globalThis as any).browser || (globalThis as any).chrome;
const engine = new CryptoClient();
interface Connection {
  origin: string;
  token: string;
}
function Popup() {
  const [connection, setConnection] = useState<Connection>(),
    [profile, setProfile] = useState<Profile>(),
    [unlocked, setUnlocked] = useState(false),
    [cards, setCards] = useState<any[]>([]),
    [records, setRecords] = useState<Envelope[]>([]),
    [notice, setNotice] = useState(""),
    [busy, setBusy] = useState(false),
    [query, setQuery] = useState("");
  const lock = () => {
    engine.lock();
    setCards([]);
    setRecords([]);
    setUnlocked(false);
  };
  async function request(
    path: string,
    method = "GET",
    body?: unknown,
    active = connection,
  ) {
    if (!active) throw new Error("Pair the extension first.");
    const res = await fetch(active.origin + "/api" + path, {
      method,
      credentials: "omit",
      cache: "no-store",
      redirect: "error",
      referrerPolicy: "no-referrer",
      signal: AbortSignal.timeout(15000),
      headers: {
        Authorization: "Bearer " + active.token,
        ...(body ? { "Content-Type": "application/json" } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!res.ok)
      throw new Error(
        res.status === 401
          ? "Pairing session expired. Pair again."
          : "Server request failed.",
      );
    return res.json();
  }
  async function act(fn: () => Promise<void>) {
    setBusy(true);
    setNotice("");
    try {
      await fn();
    } catch (e) {
      setNotice(e instanceof Error ? e.message : "Operation failed.");
    } finally {
      setBusy(false);
    }
  }
  useEffect(() => {
    void browser.storage.session.get("connection").then(async (result: any) => {
      try {
        if (result.connection) {
          const active = result.connection;
          allowedOrigin(active.origin);
          const account = await request("/account", "GET", undefined, active);
          setProfile(ProfileSchema.parse(account.account.profile));
          setConnection(active);
        }
      } catch {
        setNotice("Pairing session is unavailable. Pair again.");
      }
    });
    const hide = () => {
      if (document.hidden) lock();
    };
    document.addEventListener("visibilitychange", hide);
    return () => {
      document.removeEventListener("visibilitychange", hide);
      engine.lock();
    };
  }, []);
  useEffect(() => {
    if (!unlocked) return;
    let last = Date.now();
    const activity = () => {
      last = Date.now();
    };
    window.addEventListener("pointerdown", activity);
    window.addEventListener("keydown", activity);
    const timer = setInterval(() => {
      if (Date.now() - last > 300000) lock();
    }, 1000);
    return () => {
      clearInterval(timer);
      window.removeEventListener("pointerdown", activity);
      window.removeEventListener("keydown", activity);
    };
  }, [unlocked]);
  async function autofill(id: string) {
    const envelope = records.find((r) => r.id === id);
    if (!envelope) throw new Error("Credential unavailable.");
    const item = await engine.call<VaultItem>("item", { envelope });
    const origin = allowedOrigin(item.url);
    const tabs = await browser.tabs.query({
      active: true,
      currentWindow: true,
    });
    const tab = tabs[0];
    if (!tab?.id || !tab.url || allowedOrigin(tab.url) !== origin)
      throw new Error(
        "The active tab must exactly match the credential website origin.",
      );
    if (
      !window.confirm(
        "Fill the login form on " +
          origin +
          "? This page will receive the selected credentials.",
      )
    )
      return;
    const result = await browser.scripting.executeScript({
      target: { tabId: tab.id },
      func: fillLogin,
      args: [
        {
          expectedOrigin: origin,
          username: item.username,
          password: item.password,
        },
      ],
    });
    if (!result[0]?.result)
      throw new Error("No unambiguous, same-origin login form found.");
    setNotice("Filled the selected form. It was not submitted.");
    lock();
  }
  return (
    <main>
      <header>
        <span>◇</span>
        <div>
          Sentinel<small>INDEPENDENT VAULT CLIENT</small>
        </div>
        {unlocked && <button onClick={lock}>Lock</button>}
      </header>
      {notice && (
        <p role="status" className="notice">
          {notice}
        </p>
      )}
      {!connection ? (
        <>
          <h1>Pair your vault</h1>
          <p>Create a pairing token in your vault’s Security settings.</p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const form = e.currentTarget,
                d = new FormData(form);
              form.reset();
              void act(async () => {
                const origin = allowedOrigin(String(d.get("server")));
                const permitted = await browser.permissions.request({
                  origins: [
                    new URL(origin).protocol +
                      "//" +
                      new URL(origin).hostname +
                      "/*",
                  ],
                });
                if (!permitted)
                  throw new Error("Server access permission was declined.");
                const res = await fetch(origin + "/api/auth/pair", {
                  method: "POST",
                  credentials: "omit",
                  cache: "no-store",
                  redirect: "error",
                  signal: AbortSignal.timeout(15000),
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ pairingToken: d.get("token") }),
                });
                if (!res.ok)
                  throw new Error("Pairing failed. Generate a new token.");
                const result = await res.json(),
                  active = { origin, token: result.token };
                await browser.storage.session.set({ connection: active });
                const account = await request(
                  "/account",
                  "GET",
                  undefined,
                  active,
                );
                setProfile(ProfileSchema.parse(account.account.profile));
                setConnection(active);
              });
            }}
          >
            <label>
              Server URL
              <input
                name="server"
                type="url"
                placeholder="https://vault.example.com"
                required
              />
            </label>
            <label>
              Single-use pairing token
              <input
                name="token"
                type="password"
                required
                autoComplete="off"
                maxLength={100}
              />
            </label>
            <button className="primary" disabled={busy}>
              Pair extension
            </button>
          </form>
        </>
      ) : !unlocked ? (
        <>
          <h1>Unlock locally</h1>
          <p>{connection.origin}</p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const f = e.currentTarget,
                password = passwordBytes(
                  String(new FormData(f).get("password") || ""),
                );
              f.reset();
              void act(async () => {
                await engine.call("unlock", { profile, password });
                const result = await request("/items");
                const items = result.items
                  .filter((r: any) => !r.deleted)
                  .map((r: any) => EnvelopeSchema.parse(r.envelope));
                setRecords(items);
                setCards(await engine.call("list", { items }));
                setUnlocked(true);
              });
            }}
          >
            <label>
              Master password
              <input
                name="password"
                type="password"
                required
                autoComplete="off"
                maxLength={1024}
              />
            </label>
            <button className="primary" disabled={busy}>
              Unlock vault
            </button>
          </form>
          <button
            onClick={() =>
              act(async () => {
                await request("/auth/logout", "POST", {});
                await browser.storage.session.remove("connection");
                lock();
                setConnection(undefined);
                setProfile(undefined);
              })
            }
          >
            Disconnect extension
          </button>
        </>
      ) : (
        <>
          <label>
            Search credentials
            <input
              placeholder="Name or username"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
          {cards
            .filter((c) =>
              [c.site, c.username]
                .join(" ")
                .toLowerCase()
                .includes(query.toLowerCase()),
            )
            .map((c) => (
              <div className="entry" key={c.id}>
                <div>
                  <strong>{c.site}</strong>
                  <small>{c.username}</small>
                </div>
                <button
                  disabled={busy}
                  onClick={() => act(() => autofill(c.id))}
                >
                  Fill
                </button>
              </div>
            ))}
          <p className="note">
            Explicit fill only. Exact origin match. No automatic submission.
            Locks when closed or hidden.
          </p>
        </>
      )}
    </main>
  );
}
createRoot(document.getElementById("root")!).render(<Popup />);
````

## extensions/browser/vite.config.ts

Full creation path: `/workspace/scratch/ef7b82d54654/sentinel-vault/extensions/browser/vite.config.ts`

Builds the independently packaged browser extension and explicit autofill interface.  
Restricts filling to a selected exact-origin top-frame login form without submission.

````typescript
import { defineConfig } from "vite";
import { fileURLToPath } from "node:url";
export default defineConfig({
  root: fileURLToPath(new URL(".", import.meta.url)),
  publicDir: "../../apps/web/public",
  build: {
    outDir: "../../build/extension",
    emptyOutDir: true,
    target: "es2022",
  },
  worker: { format: "es" },
});
````

## package-lock.json

Full creation path: `/workspace/scratch/ef7b82d54654/sentinel-vault/package-lock.json`

Defines project configuration, pinned dependencies, licensing or automated repository checks.  
Included in full so the repository can be built and reviewed independently.

````json
{
  "name": "sentinel-vault",
  "version": "0.1.0",
  "lockfileVersion": 3,
  "requires": true,
  "packages": {
    "": {
      "name": "sentinel-vault",
      "version": "0.1.0",
      "license": "MIT",
      "dependencies": {
        "@fastify/cookie": "11.0.2",
        "@fastify/helmet": "13.0.2",
        "@fastify/static": "10.1.5",
        "@fastify/swagger": "9.5.1",
        "@scure/bip39": "2.4.0",
        "@simplewebauthn/browser": "14.0.0",
        "@simplewebauthn/server": "14.0.3",
        "argon2-browser": "1.18.0",
        "fastify": "5.12.5",
        "libsodium-wrappers-sumo": "0.8.4",
        "otpauth": "9.4.1",
        "papaparse": "5.5.3",
        "pg": "8.16.3",
        "react": "19.3.0",
        "react-dom": "19.3.0",
        "zod": "4.1.13",
        "zxcvbn": "4.4.2"
      },
      "devDependencies": {
        "@electric-sql/pglite": "0.5.8",
        "@playwright/test": "1.58.2",
        "@types/argon2-browser": "1.18.4",
        "@types/node": "24.10.1",
        "@types/papaparse": "5.5.1",
        "@types/pg": "8.15.6",
        "@types/react": "19.2.7",
        "@types/react-dom": "19.2.3",
        "@types/zxcvbn": "4.4.5",
        "esbuild": "0.27.2",
        "prettier": "3.9.9",
        "tsx": "4.21.0",
        "typescript": "5.9.3",
        "vite": "8.3.2",
        "vitest": "5.0.3"
      },
      "engines": {
        "node": ">=24.19.0"
      }
    },
    "node_modules/@electric-sql/pglite": {
      "version": "0.5.8",
      "resolved": "https://registry.npmjs.org/@electric-sql/pglite/-/pglite-0.5.8.tgz",
      "integrity": "sha512-n9tsbUOhwx2epK1V0ZG9Ar4SHWUju04dhmzZXiSBXwBoleOvIfals33NAaWgagQVAL4Rbvx/Ptsu3P+pA09f6Q==",
      "dev": true,
      "license": "Apache-2.0"
    },
    "node_modules/@esbuild/aix-ppc64": {
      "version": "0.27.2",
      "resolved": "https://registry.npmjs.org/@esbuild/aix-ppc64/-/aix-ppc64-0.27.2.tgz",
      "integrity": "sha512-GZMB+a0mOMZs4MpDbj8RJp4cw+w1WV5NYD6xzgvzUJ5Ek2jerwfO2eADyI6ExDSUED+1X8aMbegahsJi+8mgpw==",
      "cpu": [
        "ppc64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "aix"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/android-arm": {
      "version": "0.27.2",
      "resolved": "https://registry.npmjs.org/@esbuild/android-arm/-/android-arm-0.27.2.tgz",
      "integrity": "sha512-DVNI8jlPa7Ujbr1yjU2PfUSRtAUZPG9I1RwW4F4xFB1Imiu2on0ADiI/c3td+KmDtVKNbi+nffGDQMfcIMkwIA==",
      "cpu": [
        "arm"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "android"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/android-arm64": {
      "version": "0.27.2",
      "resolved": "https://registry.npmjs.org/@esbuild/android-arm64/-/android-arm64-0.27.2.tgz",
      "integrity": "sha512-pvz8ZZ7ot/RBphf8fv60ljmaoydPU12VuXHImtAs0XhLLw+EXBi2BLe3OYSBslR4rryHvweW5gmkKFwTiFy6KA==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "android"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/android-x64": {
      "version": "0.27.2",
      "resolved": "https://registry.npmjs.org/@esbuild/android-x64/-/android-x64-0.27.2.tgz",
      "integrity": "sha512-z8Ank4Byh4TJJOh4wpz8g2vDy75zFL0TlZlkUkEwYXuPSgX8yzep596n6mT7905kA9uHZsf/o2OJZubl2l3M7A==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "android"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/darwin-arm64": {
      "version": "0.27.2",
      "resolved": "https://registry.npmjs.org/@esbuild/darwin-arm64/-/darwin-arm64-0.27.2.tgz",
      "integrity": "sha512-davCD2Zc80nzDVRwXTcQP/28fiJbcOwvdolL0sOiOsbwBa72kegmVU0Wrh1MYrbuCL98Omp5dVhQFWRKR2ZAlg==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "darwin"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/darwin-x64": {
      "version": "0.27.2",
      "resolved": "https://registry.npmjs.org/@esbuild/darwin-x64/-/darwin-x64-0.27.2.tgz",
      "integrity": "sha512-ZxtijOmlQCBWGwbVmwOF/UCzuGIbUkqB1faQRf5akQmxRJ1ujusWsb3CVfk/9iZKr2L5SMU5wPBi1UWbvL+VQA==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "darwin"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/freebsd-arm64": {
      "version": "0.27.2",
      "resolved": "https://registry.npmjs.org/@esbuild/freebsd-arm64/-/freebsd-arm64-0.27.2.tgz",
      "integrity": "sha512-lS/9CN+rgqQ9czogxlMcBMGd+l8Q3Nj1MFQwBZJyoEKI50XGxwuzznYdwcav6lpOGv5BqaZXqvBSiB/kJ5op+g==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "freebsd"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/freebsd-x64": {
      "version": "0.27.2",
      "resolved": "https://registry.npmjs.org/@esbuild/freebsd-x64/-/freebsd-x64-0.27.2.tgz",
      "integrity": "sha512-tAfqtNYb4YgPnJlEFu4c212HYjQWSO/w/h/lQaBK7RbwGIkBOuNKQI9tqWzx7Wtp7bTPaGC6MJvWI608P3wXYA==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "freebsd"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/linux-arm": {
      "version": "0.27.2",
      "resolved": "https://registry.npmjs.org/@esbuild/linux-arm/-/linux-arm-0.27.2.tgz",
      "integrity": "sha512-vWfq4GaIMP9AIe4yj1ZUW18RDhx6EPQKjwe7n8BbIecFtCQG4CfHGaHuh7fdfq+y3LIA2vGS/o9ZBGVxIDi9hw==",
      "cpu": [
        "arm"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/linux-arm64": {
      "version": "0.27.2",
      "resolved": "https://registry.npmjs.org/@esbuild/linux-arm64/-/linux-arm64-0.27.2.tgz",
      "integrity": "sha512-hYxN8pr66NsCCiRFkHUAsxylNOcAQaxSSkHMMjcpx0si13t1LHFphxJZUiGwojB1a/Hd5OiPIqDdXONia6bhTw==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/linux-ia32": {
      "version": "0.27.2",
      "resolved": "https://registry.npmjs.org/@esbuild/linux-ia32/-/linux-ia32-0.27.2.tgz",
      "integrity": "sha512-MJt5BRRSScPDwG2hLelYhAAKh9imjHK5+NE/tvnRLbIqUWa+0E9N4WNMjmp/kXXPHZGqPLxggwVhz7QP8CTR8w==",
      "cpu": [
        "ia32"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/linux-loong64": {
      "version": "0.27.2",
      "resolved": "https://registry.npmjs.org/@esbuild/linux-loong64/-/linux-loong64-0.27.2.tgz",
      "integrity": "sha512-lugyF1atnAT463aO6KPshVCJK5NgRnU4yb3FUumyVz+cGvZbontBgzeGFO1nF+dPueHD367a2ZXe1NtUkAjOtg==",
      "cpu": [
        "loong64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/linux-mips64el": {
      "version": "0.27.2",
      "resolved": "https://registry.npmjs.org/@esbuild/linux-mips64el/-/linux-mips64el-0.27.2.tgz",
      "integrity": "sha512-nlP2I6ArEBewvJ2gjrrkESEZkB5mIoaTswuqNFRv/WYd+ATtUpe9Y09RnJvgvdag7he0OWgEZWhviS1OTOKixw==",
      "cpu": [
        "mips64el"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/linux-ppc64": {
      "version": "0.27.2",
      "resolved": "https://registry.npmjs.org/@esbuild/linux-ppc64/-/linux-ppc64-0.27.2.tgz",
      "integrity": "sha512-C92gnpey7tUQONqg1n6dKVbx3vphKtTHJaNG2Ok9lGwbZil6DrfyecMsp9CrmXGQJmZ7iiVXvvZH6Ml5hL6XdQ==",
      "cpu": [
        "ppc64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/linux-riscv64": {
      "version": "0.27.2",
      "resolved": "https://registry.npmjs.org/@esbuild/linux-riscv64/-/linux-riscv64-0.27.2.tgz",
      "integrity": "sha512-B5BOmojNtUyN8AXlK0QJyvjEZkWwy/FKvakkTDCziX95AowLZKR6aCDhG7LeF7uMCXEJqwa8Bejz5LTPYm8AvA==",
      "cpu": [
        "riscv64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/linux-s390x": {
      "version": "0.27.2",
      "resolved": "https://registry.npmjs.org/@esbuild/linux-s390x/-/linux-s390x-0.27.2.tgz",
      "integrity": "sha512-p4bm9+wsPwup5Z8f4EpfN63qNagQ47Ua2znaqGH6bqLlmJ4bx97Y9JdqxgGZ6Y8xVTixUnEkoKSHcpRlDnNr5w==",
      "cpu": [
        "s390x"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/linux-x64": {
      "version": "0.27.2",
      "resolved": "https://registry.npmjs.org/@esbuild/linux-x64/-/linux-x64-0.27.2.tgz",
      "integrity": "sha512-uwp2Tip5aPmH+NRUwTcfLb+W32WXjpFejTIOWZFw/v7/KnpCDKG66u4DLcurQpiYTiYwQ9B7KOeMJvLCu/OvbA==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/netbsd-arm64": {
      "version": "0.27.2",
      "resolved": "https://registry.npmjs.org/@esbuild/netbsd-arm64/-/netbsd-arm64-0.27.2.tgz",
      "integrity": "sha512-Kj6DiBlwXrPsCRDeRvGAUb/LNrBASrfqAIok+xB0LxK8CHqxZ037viF13ugfsIpePH93mX7xfJp97cyDuTZ3cw==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "netbsd"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/netbsd-x64": {
      "version": "0.27.2",
      "resolved": "https://registry.npmjs.org/@esbuild/netbsd-x64/-/netbsd-x64-0.27.2.tgz",
      "integrity": "sha512-HwGDZ0VLVBY3Y+Nw0JexZy9o/nUAWq9MlV7cahpaXKW6TOzfVno3y3/M8Ga8u8Yr7GldLOov27xiCnqRZf0tCA==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "netbsd"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/openbsd-arm64": {
      "version": "0.27.2",
      "resolved": "https://registry.npmjs.org/@esbuild/openbsd-arm64/-/openbsd-arm64-0.27.2.tgz",
      "integrity": "sha512-DNIHH2BPQ5551A7oSHD0CKbwIA/Ox7+78/AWkbS5QoRzaqlev2uFayfSxq68EkonB+IKjiuxBFoV8ESJy8bOHA==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "openbsd"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/openbsd-x64": {
      "version": "0.27.2",
      "resolved": "https://registry.npmjs.org/@esbuild/openbsd-x64/-/openbsd-x64-0.27.2.tgz",
      "integrity": "sha512-/it7w9Nb7+0KFIzjalNJVR5bOzA9Vay+yIPLVHfIQYG/j+j9VTH84aNB8ExGKPU4AzfaEvN9/V4HV+F+vo8OEg==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "openbsd"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/openharmony-arm64": {
      "version": "0.27.2",
      "resolved": "https://registry.npmjs.org/@esbuild/openharmony-arm64/-/openharmony-arm64-0.27.2.tgz",
      "integrity": "sha512-LRBbCmiU51IXfeXk59csuX/aSaToeG7w48nMwA6049Y4J4+VbWALAuXcs+qcD04rHDuSCSRKdmY63sruDS5qag==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "openharmony"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/sunos-x64": {
      "version": "0.27.2",
      "resolved": "https://registry.npmjs.org/@esbuild/sunos-x64/-/sunos-x64-0.27.2.tgz",
      "integrity": "sha512-kMtx1yqJHTmqaqHPAzKCAkDaKsffmXkPHThSfRwZGyuqyIeBvf08KSsYXl+abf5HDAPMJIPnbBfXvP2ZC2TfHg==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "sunos"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/win32-arm64": {
      "version": "0.27.2",
      "resolved": "https://registry.npmjs.org/@esbuild/win32-arm64/-/win32-arm64-0.27.2.tgz",
      "integrity": "sha512-Yaf78O/B3Kkh+nKABUF++bvJv5Ijoy9AN1ww904rOXZFLWVc5OLOfL56W+C8F9xn5JQZa3UX6m+IktJnIb1Jjg==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "win32"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/win32-ia32": {
      "version": "0.27.2",
      "resolved": "https://registry.npmjs.org/@esbuild/win32-ia32/-/win32-ia32-0.27.2.tgz",
      "integrity": "sha512-Iuws0kxo4yusk7sw70Xa2E2imZU5HoixzxfGCdxwBdhiDgt9vX9VUCBhqcwY7/uh//78A1hMkkROMJq9l27oLQ==",
      "cpu": [
        "ia32"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "win32"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/win32-x64": {
      "version": "0.27.2",
      "resolved": "https://registry.npmjs.org/@esbuild/win32-x64/-/win32-x64-0.27.2.tgz",
      "integrity": "sha512-sRdU18mcKf7F+YgheI/zGf5alZatMUTKj/jNS6l744f9u3WFu4v7twcUI9vu4mknF4Y9aDlblIie0IM+5xxaqQ==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "win32"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@fastify/accept-negotiator": {
      "version": "2.1.0",
      "resolved": "https://registry.npmjs.org/@fastify/accept-negotiator/-/accept-negotiator-2.1.0.tgz",
      "integrity": "sha512-F3EVbzWt+xcnVaOHmWyIlpuFtbxOln7HDZQsh09MtMmMm/CipMayNt8hnIL8VQi54u2ZociDbf+iluGYkf7B1A==",
      "funding": [
        {
          "type": "github",
          "url": "https://github.com/sponsors/fastify"
        },
        {
          "type": "opencollective",
          "url": "https://opencollective.com/fastify"
        }
      ],
      "license": "MIT"
    },
    "node_modules/@fastify/ajv-compiler": {
      "version": "4.0.6",
      "resolved": "https://registry.npmjs.org/@fastify/ajv-compiler/-/ajv-compiler-4.0.6.tgz",
      "integrity": "sha512-NtuzM0SfaMJbGlnjr9LWQUN5LzgSrbB8tf/wRZNas+4E1O/Nmzl53e7ruT61HDZyRCJGC6FxIogmNZO1c5ETBA==",
      "funding": [
        {
          "type": "github",
          "url": "https://github.com/sponsors/fastify"
        },
        {
          "type": "opencollective",
          "url": "https://opencollective.com/fastify"
        }
      ],
      "license": "MIT",
      "dependencies": {
        "ajv": "^8.12.0",
        "ajv-formats": "^3.0.1",
        "fast-uri": "^4.0.0"
      }
    },
    "node_modules/@fastify/cookie": {
      "version": "11.0.2",
      "resolved": "https://registry.npmjs.org/@fastify/cookie/-/cookie-11.0.2.tgz",
      "integrity": "sha512-GWdwdGlgJxyvNv+QcKiGNevSspMQXncjMZ1J8IvuDQk0jvkzgWWZFNC2En3s+nHndZBGV8IbLwOI/sxCZw/mzA==",
      "funding": [
        {
          "type": "github",
          "url": "https://github.com/sponsors/fastify"
        },
        {
          "type": "opencollective",
          "url": "https://opencollective.com/fastify"
        }
      ],
      "license": "MIT",
      "dependencies": {
        "cookie": "^1.0.0",
        "fastify-plugin": "^5.0.0"
      }
    },
    "node_modules/@fastify/error": {
      "version": "4.2.0",
      "resolved": "https://registry.npmjs.org/@fastify/error/-/error-4.2.0.tgz",
      "integrity": "sha512-RSo3sVDXfHskiBZKBPRgnQTtIqpi/7zhJOEmAxCiBcM7d0uwdGdxLlsCaLzGs8v8NnxIRlfG0N51p5yFaOentQ==",
      "funding": [
        {
          "type": "github",
          "url": "https://github.com/sponsors/fastify"
        },
        {
          "type": "opencollective",
          "url": "https://opencollective.com/fastify"
        }
      ],
      "license": "MIT"
    },
    "node_modules/@fastify/fast-json-stringify-compiler": {
      "version": "5.1.0",
      "resolved": "https://registry.npmjs.org/@fastify/fast-json-stringify-compiler/-/fast-json-stringify-compiler-5.1.0.tgz",
      "integrity": "sha512-PxcYtKLbQ8Z+yApiqjK8FwxIwvEj38k2OiLc17u8dkJSlmfi2wHHPaSnaoqBPQqtvF8YVsDgDpP2snDCfFrpfw==",
      "funding": [
        {
          "type": "github",
          "url": "https://github.com/sponsors/fastify"
        },
        {
          "type": "opencollective",
          "url": "https://opencollective.com/fastify"
        }
      ],
      "license": "MIT",
      "dependencies": {
        "fast-json-stringify": "^7.0.0"
      }
    },
    "node_modules/@fastify/forwarded": {
      "version": "3.0.2",
      "resolved": "https://registry.npmjs.org/@fastify/forwarded/-/forwarded-3.0.2.tgz",
      "integrity": "sha512-NE8HgKLgYejV9lDpqkEFaDKMLYelJBVfHekhB0UKvX0ghagXRJqg68feg8er1NPXxG4N9i6vPxzt8E+3wHfcmA==",
      "funding": [
        {
          "type": "github",
          "url": "https://github.com/sponsors/fastify"
        },
        {
          "type": "opencollective",
          "url": "https://opencollective.com/fastify"
        }
      ],
      "license": "MIT"
    },
    "node_modules/@fastify/helmet": {
      "version": "13.0.2",
      "resolved": "https://registry.npmjs.org/@fastify/helmet/-/helmet-13.0.2.tgz",
      "integrity": "sha512-tO1QMkOfNeCt9l4sG/FiWErH4QMm+RjHzbMTrgew1DYOQ2vb/6M1G2iNABBrD7Xq6dUk+HLzWW8u+rmmhQHifA==",
      "funding": [
        {
          "type": "github",
          "url": "https://github.com/sponsors/fastify"
        },
        {
          "type": "opencollective",
          "url": "https://opencollective.com/fastify"
        }
      ],
      "license": "MIT",
      "dependencies": {
        "fastify-plugin": "^5.0.0",
        "helmet": "^8.0.0"
      }
    },
    "node_modules/@fastify/merge-json-schemas": {
      "version": "0.2.1",
      "resolved": "https://registry.npmjs.org/@fastify/merge-json-schemas/-/merge-json-schemas-0.2.1.tgz",
      "integrity": "sha512-OA3KGBCy6KtIvLf8DINC5880o5iBlDX4SxzLQS8HorJAbqluzLRn80UXU0bxZn7UOFhFgpRJDasfwn9nG4FG4A==",
      "funding": [
        {
          "type": "github",
          "url": "https://github.com/sponsors/fastify"
        },
        {
          "type": "opencollective",
          "url": "https://opencollective.com/fastify"
        }
      ],
      "license": "MIT",
      "dependencies": {
        "dequal": "^2.0.3"
      }
    },
    "node_modules/@fastify/proxy-addr": {
      "version": "5.1.1",
      "resolved": "https://registry.npmjs.org/@fastify/proxy-addr/-/proxy-addr-5.1.1.tgz",
      "integrity": "sha512-zv07Y9GEuDsJPegZoDFd4SDWaZOW8N2pa0GSrYmKpId/tjt1Hgo3BjZBVjdVpfVrHaA+Qv5jawtS2O50J5xM9g==",
      "funding": [
        {
          "type": "github",
          "url": "https://github.com/sponsors/fastify"
        },
        {
          "type": "opencollective",
          "url": "https://opencollective.com/fastify"
        }
      ],
      "license": "MIT",
      "dependencies": {
        "@fastify/forwarded": "^3.0.0",
        "ipaddr.js": "^2.1.0"
      }
    },
    "node_modules/@fastify/send": {
      "version": "4.1.1",
      "resolved": "https://registry.npmjs.org/@fastify/send/-/send-4.1.1.tgz",
      "integrity": "sha512-BYo+EiaKwlxH+WetGk6hAs1d39iP0y1gqB8lGF/qwkJ9ZZ/cBY1vx5NvExb9Sc3yRMFjD5X4Eyh4e4+TzRkzdw==",
      "funding": [
        {
          "type": "github",
          "url": "https://github.com/sponsors/fastify"
        },
        {
          "type": "opencollective",
          "url": "https://opencollective.com/fastify"
        }
      ],
      "license": "MIT",
      "dependencies": {
        "@lukeed/ms": "^2.0.2",
        "escape-html": "~1.0.3",
        "fast-decode-uri-component": "^1.0.1",
        "http-errors": "^2.0.0",
        "mime": "^3"
      }
    },
    "node_modules/@fastify/static": {
      "version": "10.1.5",
      "resolved": "https://registry.npmjs.org/@fastify/static/-/static-10.1.5.tgz",
      "integrity": "sha512-3r0ZFXo82nKlPzySOUYhwWVfPZStfiwjmyevkX7cJWL2yXmEzl0Rpxv+L6L1R4OxqvlDGqf3g8OdBzILKgqe6w==",
      "funding": [
        {
          "type": "github",
          "url": "https://github.com/sponsors/fastify"
        },
        {
          "type": "opencollective",
          "url": "https://opencollective.com/fastify"
        }
      ],
      "license": "MIT",
      "dependencies": {
        "@fastify/accept-negotiator": "^2.0.0",
        "@fastify/error": "^4.0.0",
        "@fastify/send": "^4.0.0",
        "content-disposition": "^3.0.0",
        "fastify-plugin": "^6.0.0",
        "fastq": "^1.17.1",
        "glob": "^13.0.0"
      }
    },
    "node_modules/@fastify/static/node_modules/fastify-plugin": {
      "version": "6.0.0",
      "resolved": "https://registry.npmjs.org/fastify-plugin/-/fastify-plugin-6.0.0.tgz",
      "integrity": "sha512-fZOty7z3O7vOliF6d8bHE3wiEh1KcNnKEQensSgTk9C1DvN6nRLS++XVd86v33Hw/8u9Un8A1zDrQ8ujcQDHEg==",
      "funding": [
        {
          "type": "github",
          "url": "https://github.com/sponsors/fastify"
        },
        {
          "type": "opencollective",
          "url": "https://opencollective.com/fastify"
        }
      ],
      "license": "MIT"
    },
    "node_modules/@fastify/swagger": {
      "version": "9.5.1",
      "resolved": "https://registry.npmjs.org/@fastify/swagger/-/swagger-9.5.1.tgz",
      "integrity": "sha512-EGjYLA7vDmCPK7XViAYMF6y4+K3XUy5soVTVxsyXolNe/Svb4nFQxvtuQvvoQb2Gzc9pxiF3+ZQN/iZDHhKtTg==",
      "funding": [
        {
          "type": "github",
          "url": "https://github.com/sponsors/fastify"
        },
        {
          "type": "opencollective",
          "url": "https://opencollective.com/fastify"
        }
      ],
      "license": "MIT",
      "dependencies": {
        "fastify-plugin": "^5.0.0",
        "json-schema-resolver": "^3.0.0",
        "openapi-types": "^12.1.3",
        "rfdc": "^1.3.1",
        "yaml": "^2.4.2"
      }
    },
    "node_modules/@hexagon/base64": {
      "version": "1.1.28",
      "resolved": "https://registry.npmjs.org/@hexagon/base64/-/base64-1.1.28.tgz",
      "integrity": "sha512-lhqDEAvWixy3bZ+UOYbPwUbBkwBq5C1LAJ/xPC8Oi+lL54oyakv/npbA0aU2hgCsx/1NUd4IBvV03+aUBWxerw==",
      "license": "MIT"
    },
    "node_modules/@jridgewell/resolve-uri": {
      "version": "3.1.2",
      "resolved": "https://registry.npmjs.org/@jridgewell/resolve-uri/-/resolve-uri-3.1.2.tgz",
      "integrity": "sha512-bRISgCIjP20/tbWSPWMEi54QVPRZExkuD9lJL+UIxUKtwVJA8wW1Trb1jMs1RFXo1CBTNZ/5hpC9QvmKWdopKw==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=6.0.0"
      }
    },
    "node_modules/@jridgewell/sourcemap-codec": {
      "version": "1.6.0",
      "resolved": "https://registry.npmjs.org/@jridgewell/sourcemap-codec/-/sourcemap-codec-1.6.0.tgz",
      "integrity": "sha512-T7jf+5zgsZHwNJ4lvQ7/aezbyk0nNX+zJVWpmHA7VYsEx7a7qr5Rg5IbtJFqkgze5Y2sruq1RUY8Q837Od7iFw==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/@jridgewell/trace-mapping": {
      "version": "0.3.31",
      "resolved": "https://registry.npmjs.org/@jridgewell/trace-mapping/-/trace-mapping-0.3.31.tgz",
      "integrity": "sha512-zzNR+SdQSDJzc8joaeP8QQoCQr8NuYx2dIIytl1QeBEZHJ9uW6hebsrYgbz8hJwUQao3TWCMtmfV8Nu1twOLAw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@jridgewell/resolve-uri": "^3.1.0",
        "@jridgewell/sourcemap-codec": "^1.4.14"
      }
    },
    "node_modules/@levischuck/tiny-cbor": {
      "version": "0.2.11",
      "resolved": "https://registry.npmjs.org/@levischuck/tiny-cbor/-/tiny-cbor-0.2.11.tgz",
      "integrity": "sha512-llBRm4dT4Z89aRsm6u2oEZ8tfwL/2l6BwpZ7JcyieouniDECM5AqNgr/y08zalEIvW3RSK4upYyybDcmjXqAow==",
      "license": "MIT"
    },
    "node_modules/@lukeed/ms": {
      "version": "2.0.2",
      "resolved": "https://registry.npmjs.org/@lukeed/ms/-/ms-2.0.2.tgz",
      "integrity": "sha512-9I2Zn6+NJLfaGoz9jN3lpwDgAYvfGeNYdbAIjJOqzs4Tpc+VU3Jqq4IofSUBKajiDS8k9fZIg18/z13mpk1bsA==",
      "license": "MIT",
      "engines": {
        "node": ">=8"
      }
    },
    "node_modules/@noble/hashes": {
      "version": "1.8.0",
      "resolved": "https://registry.npmjs.org/@noble/hashes/-/hashes-1.8.0.tgz",
      "integrity": "sha512-jCs9ldd7NwzpgXDIf6P3+NrHh9/sD6CQdxHyjQI+h/6rDNo88ypBxxz45UDuZHz9r3tNz7N/VInSVoVdtXEI4A==",
      "license": "MIT",
      "engines": {
        "node": "^14.21.3 || >=16"
      },
      "funding": {
        "url": "https://paulmillr.com/funding/"
      }
    },
    "node_modules/@oxc-project/types": {
      "version": "0.152.0",
      "resolved": "https://registry.npmjs.org/@oxc-project/types/-/types-0.152.0.tgz",
      "integrity": "sha512-oM/5rLBm2tPkg0iBgkH/FOeR3PCDpY19GTgAZjMFM8h9WI9VW7cLgzp6nwtarYKmovavIQZ+Fe/RKX/8C8O/Rw==",
      "dev": true,
      "license": "MIT",
      "funding": {
        "url": "https://github.com/sponsors/oxc-project"
      }
    },
    "node_modules/@peculiar/asn1-android": {
      "version": "2.10.0",
      "resolved": "https://registry.npmjs.org/@peculiar/asn1-android/-/asn1-android-2.10.0.tgz",
      "integrity": "sha512-IHKdYL5MRW76DOQCv2HSE/vUMOf2jqH4E7yhtQYe/xx+RxpPiXfkUdhex0N4/s5crsnXCGftRNzy4RJn1s6CZA==",
      "license": "MIT",
      "dependencies": {
        "@peculiar/asn1-schema": "^2.10.0",
        "asn1js": "^3.0.10",
        "tslib": "^2.8.1"
      },
      "engines": {
        "node": ">=14"
      }
    },
    "node_modules/@peculiar/asn1-asym-key": {
      "version": "2.10.0",
      "resolved": "https://registry.npmjs.org/@peculiar/asn1-asym-key/-/asn1-asym-key-2.10.0.tgz",
      "integrity": "sha512-1R8xUTeqcUTSMLFTTCzJyFuKiq3y25EQKs9DezUetJ8qMqbJyxo3XkzykiwwT/Xzlt5/vRzS/sW4M1r+pq1FTg==",
      "license": "MIT",
      "dependencies": {
        "@peculiar/asn1-pkcs8": "^2.10.0",
        "@peculiar/asn1-schema": "^2.10.0",
        "@peculiar/asn1-x509": "^2.10.0",
        "asn1js": "^3.0.10",
        "tslib": "^2.8.1"
      },
      "engines": {
        "node": ">=14"
      }
    },
    "node_modules/@peculiar/asn1-cms": {
      "version": "2.10.0",
      "resolved": "https://registry.npmjs.org/@peculiar/asn1-cms/-/asn1-cms-2.10.0.tgz",
      "integrity": "sha512-CkX0H4NCIOMHOU3rh2xXZywinYZ/EnJlaOlJiGI0e5L4XjFqHf4iH30LMbXWChVppdA9ljbanjtzQFOhDNfTWg==",
      "license": "MIT",
      "dependencies": {
        "@peculiar/asn1-schema": "^2.10.0",
        "@peculiar/asn1-x509": "^2.10.0",
        "@peculiar/asn1-x509-attr": "^2.10.0",
        "asn1js": "^3.0.10",
        "tslib": "^2.8.1"
      },
      "engines": {
        "node": ">=14"
      }
    },
    "node_modules/@peculiar/asn1-csr": {
      "version": "2.10.0",
      "resolved": "https://registry.npmjs.org/@peculiar/asn1-csr/-/asn1-csr-2.10.0.tgz",
      "integrity": "sha512-jTPTr/9rxKM+niQLMF3jiAMb0lWHUhUHIuSOhdGCIfpB4FAQYf9SoiXOgxP8bS/68IB+bj+1OHvVnDVCQfVUZw==",
      "license": "MIT",
      "dependencies": {
        "@peculiar/asn1-schema": "^2.10.0",
        "@peculiar/asn1-x509": "^2.10.0",
        "asn1js": "^3.0.10",
        "tslib": "^2.8.1"
      },
      "engines": {
        "node": ">=14"
      }
    },
    "node_modules/@peculiar/asn1-ecc": {
      "version": "2.10.0",
      "resolved": "https://registry.npmjs.org/@peculiar/asn1-ecc/-/asn1-ecc-2.10.0.tgz",
      "integrity": "sha512-GFd3iOjFrWX+QWH2R2dO5QSJyyRGv9CIBKtRlGlPNCvb2RvmCbBDexe91MJgV76c69d998Xsa+CvuQ98seoiPg==",
      "license": "MIT",
      "dependencies": {
        "@peculiar/asn1-schema": "^2.10.0",
        "@peculiar/asn1-x509": "^2.10.0",
        "asn1js": "^3.0.10",
        "tslib": "^2.8.1"
      },
      "engines": {
        "node": ">=14"
      }
    },
    "node_modules/@peculiar/asn1-pfx": {
      "version": "2.10.0",
      "resolved": "https://registry.npmjs.org/@peculiar/asn1-pfx/-/asn1-pfx-2.10.0.tgz",
      "integrity": "sha512-1y3QK9ZH1IPleAMmRoJlPS10eGkAWnULETW8zDFNUK1ffqpG7zmDY+kYBMYQgwlcQZ2iitLm2z2EBP0xzRXpaA==",
      "license": "MIT",
      "dependencies": {
        "@peculiar/asn1-cms": "^2.10.0",
        "@peculiar/asn1-pkcs8": "^2.10.0",
        "@peculiar/asn1-rsa": "^2.10.0",
        "@peculiar/asn1-schema": "^2.10.0",
        "asn1js": "^3.0.10",
        "tslib": "^2.8.1"
      },
      "engines": {
        "node": ">=14"
      }
    },
    "node_modules/@peculiar/asn1-pkcs8": {
      "version": "2.10.0",
      "resolved": "https://registry.npmjs.org/@peculiar/asn1-pkcs8/-/asn1-pkcs8-2.10.0.tgz",
      "integrity": "sha512-Ri+BZT9bnwqlHWmhs7lvWjvJRxKev2hA2+4EbZajgeYWCbR8hyv0znF4DhsFouOhMj2nSDV/iGJ6DMQtwITnCw==",
      "license": "MIT",
      "dependencies": {
        "@peculiar/asn1-schema": "^2.10.0",
        "@peculiar/asn1-x509": "^2.10.0",
        "asn1js": "^3.0.10",
        "tslib": "^2.8.1"
      },
      "engines": {
        "node": ">=14"
      }
    },
    "node_modules/@peculiar/asn1-pkcs9": {
      "version": "2.10.0",
      "resolved": "https://registry.npmjs.org/@peculiar/asn1-pkcs9/-/asn1-pkcs9-2.10.0.tgz",
      "integrity": "sha512-XIXsbDQFezYk6fudczkuvawkRD4GNpISGCqfYhdkJlvcGF/RFknU+0DDJagOaJqBf+PdPzk4J9oMqDGcvfR9HQ==",
      "license": "MIT",
      "dependencies": {
        "@peculiar/asn1-cms": "^2.10.0",
        "@peculiar/asn1-pfx": "^2.10.0",
        "@peculiar/asn1-pkcs8": "^2.10.0",
        "@peculiar/asn1-schema": "^2.10.0",
        "@peculiar/asn1-x509": "^2.10.0",
        "@peculiar/asn1-x509-attr": "^2.10.0",
        "asn1js": "^3.0.10",
        "tslib": "^2.8.1"
      },
      "engines": {
        "node": ">=14"
      }
    },
    "node_modules/@peculiar/asn1-rsa": {
      "version": "2.10.0",
      "resolved": "https://registry.npmjs.org/@peculiar/asn1-rsa/-/asn1-rsa-2.10.0.tgz",
      "integrity": "sha512-4Jvmwlh3gZAhNZ4/u7JSyLuce9hofOFZ4o3PYKAccCImGnyaT5CMym/ATgvAvqpOYFNW531oPZvJlEBhJy9VfA==",
      "license": "MIT",
      "dependencies": {
        "@peculiar/asn1-schema": "^2.10.0",
        "@peculiar/asn1-x509": "^2.10.0",
        "asn1js": "^3.0.10",
        "tslib": "^2.8.1"
      },
      "engines": {
        "node": ">=14"
      }
    },
    "node_modules/@peculiar/asn1-schema": {
      "version": "2.10.0",
      "resolved": "https://registry.npmjs.org/@peculiar/asn1-schema/-/asn1-schema-2.10.0.tgz",
      "integrity": "sha512-GhokD41lV4gQrrLYm3wCkHfBOnJrnhDMgt4XeMW8gzfE1UdJqIuSwsE+ggf82XBjUXRJylcm+KIGQFa4utIVLw==",
      "license": "MIT",
      "dependencies": {
        "@peculiar/utils": "^2.0.2",
        "asn1js": "^3.0.10",
        "tslib": "^2.8.1"
      },
      "engines": {
        "node": ">=14"
      }
    },
    "node_modules/@peculiar/asn1-x509": {
      "version": "2.10.0",
      "resolved": "https://registry.npmjs.org/@peculiar/asn1-x509/-/asn1-x509-2.10.0.tgz",
      "integrity": "sha512-ucNVg8+ANveTpMN3fy9lA2alryONdXc2A4cEG2hMniWbvQt+YOZoe8BI80YYNO8FBcuDY1qbDQ4uQGQVraHxGA==",
      "license": "MIT",
      "dependencies": {
        "@peculiar/asn1-schema": "^2.10.0",
        "@peculiar/utils": "^2.0.2",
        "asn1js": "^3.0.10",
        "tslib": "^2.8.1"
      },
      "engines": {
        "node": ">=14"
      }
    },
    "node_modules/@peculiar/asn1-x509-attr": {
      "version": "2.10.0",
      "resolved": "https://registry.npmjs.org/@peculiar/asn1-x509-attr/-/asn1-x509-attr-2.10.0.tgz",
      "integrity": "sha512-/85GtKOKmgvuSJNlaFfwGWNdRSZZ+hpF02NyM01XiCdzpaZONiBltDyfluFPvFx966CR+ZHNSG1jniwpy07oGg==",
      "license": "MIT",
      "dependencies": {
        "@peculiar/asn1-schema": "^2.10.0",
        "@peculiar/asn1-x509": "^2.10.0",
        "asn1js": "^3.0.10",
        "tslib": "^2.8.1"
      },
      "engines": {
        "node": ">=14"
      }
    },
    "node_modules/@peculiar/asn1-x509-post-quantum": {
      "version": "2.10.0",
      "resolved": "https://registry.npmjs.org/@peculiar/asn1-x509-post-quantum/-/asn1-x509-post-quantum-2.10.0.tgz",
      "integrity": "sha512-cXKcZ30wKbUkRK5RK4Z3W1imewXvHAB9apEAuIqJ0OOkOQCpJrwLOuN38QlsEXqOI+3gtUv8Kf3UZohUmCbf3w==",
      "license": "MIT",
      "dependencies": {
        "@peculiar/asn1-asym-key": "^2.10.0",
        "@peculiar/asn1-schema": "^2.10.0",
        "@peculiar/asn1-x509": "^2.10.0",
        "asn1js": "^3.0.10",
        "tslib": "^2.8.1"
      },
      "engines": {
        "node": ">=14"
      }
    },
    "node_modules/@peculiar/utils": {
      "version": "2.0.3",
      "resolved": "https://registry.npmjs.org/@peculiar/utils/-/utils-2.0.3.tgz",
      "integrity": "sha512-+oL3HPFRIZ1St2K50lWCXiioIgSoxzz7R1J3uF6neO2yl1sgmpgY6XXJH4BdpoDkMWznQTeYF6oWNDZLCdQ4eQ==",
      "license": "MIT",
      "dependencies": {
        "tslib": "^2.8.1"
      }
    },
    "node_modules/@peculiar/x509": {
      "version": "2.1.0",
      "resolved": "https://registry.npmjs.org/@peculiar/x509/-/x509-2.1.0.tgz",
      "integrity": "sha512-IYbg1R03CSQGWwl24kGyqrdVtixNSbRaDvBg1r5wyYjTP+VwPQkka1BzTgU5+vxiuwqg04OxdvdJ1xYYFIdUSA==",
      "license": "MIT",
      "dependencies": {
        "@peculiar/asn1-cms": "^2.9.4",
        "@peculiar/asn1-csr": "^2.9.4",
        "@peculiar/asn1-ecc": "^2.9.4",
        "@peculiar/asn1-pkcs9": "^2.9.4",
        "@peculiar/asn1-rsa": "^2.9.4",
        "@peculiar/asn1-schema": "^2.9.4",
        "@peculiar/asn1-x509": "^2.9.4",
        "@peculiar/asn1-x509-post-quantum": "^2.9.4",
        "pvtsutils": "^1.3.6",
        "tslib": "^2.8.1",
        "tsyringe": "^4.10.0"
      },
      "engines": {
        "node": ">=20.0.0"
      }
    },
    "node_modules/@pinojs/redact": {
      "version": "0.4.0",
      "resolved": "https://registry.npmjs.org/@pinojs/redact/-/redact-0.4.0.tgz",
      "integrity": "sha512-k2ENnmBugE/rzQfEcdWHcCY+/FM3VLzH9cYEsbdsoqrvzAKRhUZeRNhAZvB8OitQJ1TBed3yqWtdjzS6wJKBwg==",
      "license": "MIT"
    },
    "node_modules/@playwright/test": {
      "version": "1.58.2",
      "resolved": "https://registry.npmjs.org/@playwright/test/-/test-1.58.2.tgz",
      "integrity": "sha512-akea+6bHYBBfA9uQqSYmlJXn61cTa+jbO87xVLCWbTqbWadRVmhxlXATaOjOgcBaWU4ePo0wB41KMFv3o35IXA==",
      "dev": true,
      "license": "Apache-2.0",
      "dependencies": {
        "playwright": "1.58.2"
      },
      "bin": {
        "playwright": "cli.js"
      },
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@rolldown/binding-android-arm-eabi": {
      "version": "1.2.12",
      "resolved": "https://registry.npmjs.org/@rolldown/binding-android-arm-eabi/-/binding-android-arm-eabi-1.2.12.tgz",
      "integrity": "sha512-dB/a1214qKfHMXCpgqR4OZT+jS4kTyEXbQGJPqzobt5EwH5rX080pxE37alt3RzvR1bf1Yz/yGqRfrYAxuPw0A==",
      "cpu": [
        "arm"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "android"
      ],
      "engines": {
        "node": "^20.19.0 || >=22.12.0"
      }
    },
    "node_modules/@rolldown/binding-android-arm64": {
      "version": "1.2.12",
      "resolved": "https://registry.npmjs.org/@rolldown/binding-android-arm64/-/binding-android-arm64-1.2.12.tgz",
      "integrity": "sha512-7KHFgQ5VJxIHcLlrwrc3Xbds7oTNQT7Pgi9gQCJKrd2VGab/UksIOYp6VD8MzCstGxOKMgNamPwUCfxPdP1OHg==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "android"
      ],
      "engines": {
        "node": "^20.19.0 || >=22.12.0"
      }
    },
    "node_modules/@rolldown/binding-darwin-arm64": {
      "version": "1.2.12",
      "resolved": "https://registry.npmjs.org/@rolldown/binding-darwin-arm64/-/binding-darwin-arm64-1.2.12.tgz",
      "integrity": "sha512-3YIhqHD96nA5SaYNRBR16HnGv4oavZvXfD/ayHM+oYZ0WD/8lBAtf6zQua4kEyAvpqrluKXl0lnOBoiNby7x9w==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "darwin"
      ],
      "engines": {
        "node": "^20.19.0 || >=22.12.0"
      }
    },
    "node_modules/@rolldown/binding-darwin-x64": {
      "version": "1.2.12",
      "resolved": "https://registry.npmjs.org/@rolldown/binding-darwin-x64/-/binding-darwin-x64-1.2.12.tgz",
      "integrity": "sha512-UuuJ35MFw4gmFOrE9pEqIV+K3syIKveph+Qc1/ljHZVdoDW4pz/JHR/eMVom+TZGl/5OOvGJOWaOCVt3ZfqhxA==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "darwin"
      ],
      "engines": {
        "node": "^20.19.0 || >=22.12.0"
      }
    },
    "node_modules/@rolldown/binding-freebsd-x64": {
      "version": "1.2.12",
      "resolved": "https://registry.npmjs.org/@rolldown/binding-freebsd-x64/-/binding-freebsd-x64-1.2.12.tgz",
      "integrity": "sha512-uMvssit0a4W+/7D8CbHUvG719mH3R2jwXAlh/XcPvuHTE0g++LymF88DCGNX0HM2rBOn0xrzgXktIB6fLSJBTQ==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "freebsd"
      ],
      "engines": {
        "node": "^20.19.0 || >=22.12.0"
      }
    },
    "node_modules/@rolldown/binding-linux-arm-gnueabihf": {
      "version": "1.2.12",
      "resolved": "https://registry.npmjs.org/@rolldown/binding-linux-arm-gnueabihf/-/binding-linux-arm-gnueabihf-1.2.12.tgz",
      "integrity": "sha512-XcFu0R0xWnwzSf4IQgFH1rJIckPN1pLy2R+4r9IDB7Yfu/ys9cVqfa4pBrMHj7a3gl8mIR4nRNPg0e5IvEVs6g==",
      "cpu": [
        "arm"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": "^20.19.0 || >=22.12.0"
      }
    },
    "node_modules/@rolldown/binding-linux-arm64-gnu": {
      "version": "1.2.12",
      "resolved": "https://registry.npmjs.org/@rolldown/binding-linux-arm64-gnu/-/binding-linux-arm64-gnu-1.2.12.tgz",
      "integrity": "sha512-260UrKgn8tz39ak+SMDOirKzr7V04M9dWPw5llW00SwBivCZoWcRBKV1d8cXnRkUmSZA3BdiUmBHWk7734Ulpw==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": "^20.19.0 || >=22.12.0"
      }
    },
    "node_modules/@rolldown/binding-linux-arm64-musl": {
      "version": "1.2.12",
      "resolved": "https://registry.npmjs.org/@rolldown/binding-linux-arm64-musl/-/binding-linux-arm64-musl-1.2.12.tgz",
      "integrity": "sha512-5YK1I9SqDkbPgc1IA8BgDl34suqUS2q0KWnBrirm0E51YjOs6eo6dV6jbQfNE/argHRSvd0QUGgtpIoYx+WWpw==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": "^20.19.0 || >=22.12.0"
      }
    },
    "node_modules/@rolldown/binding-linux-ppc64-gnu": {
      "version": "1.2.12",
      "resolved": "https://registry.npmjs.org/@rolldown/binding-linux-ppc64-gnu/-/binding-linux-ppc64-gnu-1.2.12.tgz",
      "integrity": "sha512-Rkcrmp7eFRg74yL5fXEU91JEWbdEPLevWwGtXpmhbjlD1StScbWTmO94Bhly+Mo+ketKYkdmM1vNUKeWSlx8cQ==",
      "cpu": [
        "ppc64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": "^20.19.0 || >=22.12.0"
      }
    },
    "node_modules/@rolldown/binding-linux-s390x-gnu": {
      "version": "1.2.12",
      "resolved": "https://registry.npmjs.org/@rolldown/binding-linux-s390x-gnu/-/binding-linux-s390x-gnu-1.2.12.tgz",
      "integrity": "sha512-qvK4DuAsQc2BSjlx+Xr+IzOIvvxbGZqxFwdWfG6F518Erj0GGISyQbJ6pIappnOxlNPzNHvo/L0BwB30GZ+zVw==",
      "cpu": [
        "s390x"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": "^20.19.0 || >=22.12.0"
      }
    },
    "node_modules/@rolldown/binding-linux-x64-gnu": {
      "version": "1.2.12",
      "resolved": "https://registry.npmjs.org/@rolldown/binding-linux-x64-gnu/-/binding-linux-x64-gnu-1.2.12.tgz",
      "integrity": "sha512-Q9uLBO53Xd4QIq1WOycVQyPP1O4HhraEV2qqb3uTrnVw6QZih9duY4vNXOivL1xoUS1/z+W8eF4NMfl2a8Sdjw==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": "^20.19.0 || >=22.12.0"
      }
    },
    "node_modules/@rolldown/binding-linux-x64-musl": {
      "version": "1.2.12",
      "resolved": "https://registry.npmjs.org/@rolldown/binding-linux-x64-musl/-/binding-linux-x64-musl-1.2.12.tgz",
      "integrity": "sha512-3IBxWFMjbOZskDPKv8Lf9BCnahlKuHthWkYnyIxOH/QcJrFcS4EmcenthApkwr/5+nEqZlLzeYbxeMaX7A5u4g==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": "^20.19.0 || >=22.12.0"
      }
    },
    "node_modules/@rolldown/binding-openharmony-arm64": {
      "version": "1.2.12",
      "resolved": "https://registry.npmjs.org/@rolldown/binding-openharmony-arm64/-/binding-openharmony-arm64-1.2.12.tgz",
      "integrity": "sha512-xtX61xg4LKPkPWilZU1ynKClz5Gj4bf74LML4r3eVLWumKnGjoEr1OSHQhMdbBDoYTi+yjrujvpZe2pUnqCrrA==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "openharmony"
      ],
      "engines": {
        "node": "^20.19.0 || >=22.12.0"
      }
    },
    "node_modules/@rolldown/binding-win32-arm64-msvc": {
      "version": "1.2.12",
      "resolved": "https://registry.npmjs.org/@rolldown/binding-win32-arm64-msvc/-/binding-win32-arm64-msvc-1.2.12.tgz",
      "integrity": "sha512-At7fPB6PCaIjzgIhEZFxuT+BBFqiQibJDT4d3PhiR3f4E7bbMZF4aKblbFfEM3sETRDd1YiQx/+U/g/B/ou5Ew==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "win32"
      ],
      "engines": {
        "node": "^20.19.0 || >=22.12.0"
      }
    },
    "node_modules/@rolldown/binding-win32-x64-msvc": {
      "version": "1.2.12",
      "resolved": "https://registry.npmjs.org/@rolldown/binding-win32-x64-msvc/-/binding-win32-x64-msvc-1.2.12.tgz",
      "integrity": "sha512-WIw2haVKwjuYdXkHaoC0mF8Le71TuCBxjrdKqLbJGctbBABj+ClfmNvtbOnzpq3RokNo5+V1qhtSzJyXorsklQ==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "win32"
      ],
      "engines": {
        "node": "^20.19.0 || >=22.12.0"
      }
    },
    "node_modules/@rolldown/pluginutils": {
      "version": "1.0.1",
      "resolved": "https://registry.npmjs.org/@rolldown/pluginutils/-/pluginutils-1.0.1.tgz",
      "integrity": "sha512-2j9bGt5Jh8hj+vPtgzPtl72j0yRxHAyumoo6TNfAjsLB04UtpSvPbPcDcBMxz7n+9CYB0c1GxQFxYRg2jimqGw==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/@scure/bip39": {
      "version": "2.4.0",
      "resolved": "https://registry.npmjs.org/@scure/bip39/-/bip39-2.4.0.tgz",
      "integrity": "sha512-82dxFbZUYboyOf0AXiydsQrFQ5Q4h9mX+O2UkE91ROYmsc0BKMGZLwDmy96Jpa2+vrtoxomjUhy1RPIgH/r2nA==",
      "license": "MIT",
      "dependencies": {
        "@noble/hashes": "2.4.0"
      },
      "funding": {
        "url": "https://paulmillr.com/funding/"
      }
    },
    "node_modules/@scure/bip39/node_modules/@noble/hashes": {
      "version": "2.4.0",
      "resolved": "https://registry.npmjs.org/@noble/hashes/-/hashes-2.4.0.tgz",
      "integrity": "sha512-X5XaVWZIBCT7HHZGm5I7ZQXDwLG+bGXuSrMQAW+7Zvl87h1kmc1ZB1VSRJcpUfoUrGQp4Fkoxm5kZ+Ms+aW+eA==",
      "license": "MIT",
      "engines": {
        "node": ">= 20.19.0"
      },
      "funding": {
        "url": "https://paulmillr.com/funding/"
      }
    },
    "node_modules/@simplewebauthn/browser": {
      "version": "14.0.0",
      "resolved": "https://registry.npmjs.org/@simplewebauthn/browser/-/browser-14.0.0.tgz",
      "integrity": "sha512-1odWVqeEBTl7lJ9zMKLEsmTlnyrDO5iRcTvfMKKk1WThUnp/i8JJdffdj2icP+tty159s4PgwE3BiMoEW9NFow==",
      "license": "MIT"
    },
    "node_modules/@simplewebauthn/server": {
      "version": "14.0.3",
      "resolved": "https://registry.npmjs.org/@simplewebauthn/server/-/server-14.0.3.tgz",
      "integrity": "sha512-D39/0fiDiYmGV+nraY9s63D1Ho2AX/waMLy22/9gUadTUuvbAnstfb4bpbHYbwZuV5ZLDYN1SmzDKuiHzKAA4Q==",
      "license": "MIT",
      "dependencies": {
        "@hexagon/base64": "^1.1.27",
        "@levischuck/tiny-cbor": "^0.2.2",
        "@peculiar/asn1-android": "^2.6.0",
        "@peculiar/asn1-ecc": "^2.6.1",
        "@peculiar/asn1-rsa": "^2.6.1",
        "@peculiar/asn1-schema": "^2.6.0",
        "@peculiar/asn1-x509": "^2.6.1",
        "@peculiar/asn1-x509-post-quantum": "^2.9.4",
        "@peculiar/x509": "^2.1.0",
        "reflect-metadata": "^0.2.2"
      },
      "engines": {
        "node": ">=20.0.0"
      }
    },
    "node_modules/@types/argon2-browser": {
      "version": "1.18.4",
      "resolved": "https://registry.npmjs.org/@types/argon2-browser/-/argon2-browser-1.18.4.tgz",
      "integrity": "sha512-K/PHAEKzdCY4mCRhgUTBcuTxeaJyLoPcd5pJ1UFSTb/FAPjj3TCK4EM/DvNmVtDzkQBMD5peJjtch3kVQDf4YQ==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/@types/chai": {
      "version": "5.2.3",
      "resolved": "https://registry.npmjs.org/@types/chai/-/chai-5.2.3.tgz",
      "integrity": "sha512-Mw558oeA9fFbv65/y4mHtXDs9bPnFMZAL/jxdPFUpOHHIXX91mcgEHbS5Lahr+pwZFR8A7GQleRWeI6cGFC2UA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@types/deep-eql": "*",
        "assertion-error": "^2.0.1"
      }
    },
    "node_modules/@types/deep-eql": {
      "version": "4.0.2",
      "resolved": "https://registry.npmjs.org/@types/deep-eql/-/deep-eql-4.0.2.tgz",
      "integrity": "sha512-c9h9dVVMigMPc4bwTvC5dxqtqJZwQPePsWjPlpSOnojbor6pGqdk541lfA7AqFQr5pB1BRdq0juY9db81BwyFw==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/@types/estree": {
      "version": "1.0.9",
      "resolved": "https://registry.npmjs.org/@types/estree/-/estree-1.0.9.tgz",
      "integrity": "sha512-GhdPgy1el4/ImP05X05Uw4cw2/M93BCUmnEvWZNStlCzEKME4Fkk+YpoA5OiHNQmoS7Cafb8Xa3Pya8m1Qrzeg==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/@types/node": {
      "version": "24.10.1",
      "resolved": "https://registry.npmjs.org/@types/node/-/node-24.10.1.tgz",
      "integrity": "sha512-GNWcUTRBgIRJD5zj+Tq0fKOJ5XZajIiBroOF0yvj2bSU1WvNdYS/dn9UxwsujGW4JX06dnHyjV2y9rRaybH0iQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "undici-types": "~7.16.0"
      }
    },
    "node_modules/@types/papaparse": {
      "version": "5.5.1",
      "resolved": "https://registry.npmjs.org/@types/papaparse/-/papaparse-5.5.1.tgz",
      "integrity": "sha512-esEO+VISsLIyE+JZBmb89NzsYYbpwV8lmv2rPo6oX5y9KhBaIP7hhHgjuTut54qjdKVMufTEcrh5fUl9+58huw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@types/node": "*"
      }
    },
    "node_modules/@types/pg": {
      "version": "8.15.6",
      "resolved": "https://registry.npmjs.org/@types/pg/-/pg-8.15.6.tgz",
      "integrity": "sha512-NoaMtzhxOrubeL/7UZuNTrejB4MPAJ0RpxZqXQf2qXuVlTPuG6Y8p4u9dKRaue4yjmC7ZhzVO2/Yyyn25znrPQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@types/node": "*",
        "pg-protocol": "*",
        "pg-types": "^2.2.0"
      }
    },
    "node_modules/@types/react": {
      "version": "19.2.7",
      "resolved": "https://registry.npmjs.org/@types/react/-/react-19.2.7.tgz",
      "integrity": "sha512-MWtvHrGZLFttgeEj28VXHxpmwYbor/ATPYbBfSFZEIRK0ecCFLl2Qo55z52Hss+UV9CRN7trSeq1zbgx7YDWWg==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "csstype": "^3.2.2"
      }
    },
    "node_modules/@types/react-dom": {
      "version": "19.2.3",
      "resolved": "https://registry.npmjs.org/@types/react-dom/-/react-dom-19.2.3.tgz",
      "integrity": "sha512-jp2L/eY6fn+KgVVQAOqYItbF0VY/YApe5Mz2F0aykSO8gx31bYCZyvSeYxCHKvzHG5eZjc+zyaS5BrBWya2+kQ==",
      "dev": true,
      "license": "MIT",
      "peerDependencies": {
        "@types/react": "^19.2.0"
      }
    },
    "node_modules/@types/zxcvbn": {
      "version": "4.4.5",
      "resolved": "https://registry.npmjs.org/@types/zxcvbn/-/zxcvbn-4.4.5.tgz",
      "integrity": "sha512-FZJgC5Bxuqg7Rhsm/bx6gAruHHhDQ55r+s0JhDh8CQ16fD7NsJJ+p8YMMQDhSQoIrSmjpqqYWA96oQVMNkjRyA==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/@vitest/mocker": {
      "version": "5.0.3",
      "resolved": "https://registry.npmjs.org/@vitest/mocker/-/mocker-5.0.3.tgz",
      "integrity": "sha512-T8sWAIbkSyAjkwTcaEc3Iu0o9A27X1/kdXrizhZkGuSKScRQtRzclfAMpOTcGdXCsqxeWlpGy3XjqaW8CpLORg==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@jridgewell/trace-mapping": "0.3.31",
        "@vitest/spy": "5.0.3",
        "estree-walker": "^3.0.3",
        "magic-string": "^1.2.3"
      },
      "funding": {
        "url": "https://opencollective.com/vitest"
      },
      "peerDependencies": {
        "msw": "^2.4.9",
        "vite": "^6.0.0 || ^7.0.0 || ^8.0.0"
      },
      "peerDependenciesMeta": {
        "msw": {
          "optional": true
        },
        "vite": {
          "optional": true
        }
      }
    },
    "node_modules/@vitest/spy": {
      "version": "5.0.3",
      "resolved": "https://registry.npmjs.org/@vitest/spy/-/spy-5.0.3.tgz",
      "integrity": "sha512-XhFysQTB8AZ+P4gMi+Lpo99vg2AZi0qKpaB9yXQl37+CaMEAPO3iH/wGVnSyL5MPERiLezpqTVtrR6UZH5GCXg==",
      "dev": true,
      "license": "MIT",
      "funding": {
        "url": "https://opencollective.com/vitest"
      }
    },
    "node_modules/abstract-logging": {
      "version": "2.0.1",
      "resolved": "https://registry.npmjs.org/abstract-logging/-/abstract-logging-2.0.1.tgz",
      "integrity": "sha512-2BjRTZxTPvheOvGbBslFSYOUkr+SjPtOnrLP33f+VIWLzezQpZcqVg7ja3L4dBXmzzgwT+a029jRx5PCi3JuiA==",
      "license": "MIT"
    },
    "node_modules/ajv": {
      "version": "8.20.0",
      "resolved": "https://registry.npmjs.org/ajv/-/ajv-8.20.0.tgz",
      "integrity": "sha512-Thbli+OlOj+iMPYFBVBfJ3OmCAnaSyNn4M1vz9T6Gka5Jt9ba/HIR56joy65tY6kx/FCF5VXNB819Y7/GUrBGA==",
      "license": "MIT",
      "dependencies": {
        "fast-deep-equal": "^3.1.3",
        "fast-uri": "^3.0.1",
        "json-schema-traverse": "^1.0.0",
        "require-from-string": "^2.0.2"
      },
      "funding": {
        "type": "github",
        "url": "https://github.com/sponsors/epoberezkin"
      }
    },
    "node_modules/ajv-formats": {
      "version": "3.0.1",
      "resolved": "https://registry.npmjs.org/ajv-formats/-/ajv-formats-3.0.1.tgz",
      "integrity": "sha512-8iUql50EUR+uUcdRQ3HDqa6EVyo3docL8g5WJ3FNcWmu62IbkGUue/pEyLBW8VGKKucTPgqeks4fIU1DA4yowQ==",
      "license": "MIT",
      "dependencies": {
        "ajv": "^8.0.0"
      },
      "peerDependencies": {
        "ajv": "^8.0.0"
      },
      "peerDependenciesMeta": {
        "ajv": {
          "optional": true
        }
      }
    },
    "node_modules/ajv/node_modules/fast-uri": {
      "version": "3.1.8",
      "resolved": "https://registry.npmjs.org/fast-uri/-/fast-uri-3.1.8.tgz",
      "integrity": "sha512-GZMtZUTNRpOVIECoXwLNZS5xUGE+mVNbTB8h/7Rwh2TFWcBQiPzTgyZi05BF9UMZKkLJv8XBRJTlU7zg8+ZfMg==",
      "funding": [
        {
          "type": "github",
          "url": "https://github.com/sponsors/fastify"
        },
        {
          "type": "opencollective",
          "url": "https://opencollective.com/fastify"
        }
      ],
      "license": "BSD-3-Clause"
    },
    "node_modules/argon2-browser": {
      "version": "1.18.0",
      "resolved": "https://registry.npmjs.org/argon2-browser/-/argon2-browser-1.18.0.tgz",
      "integrity": "sha512-ImVAGIItnFnvET1exhsQB7apRztcoC5TnlSqernMJDUjbc/DLq3UEYeXFrLPrlaIl8cVfwnXb6wX2KpFf2zxHw==",
      "license": "MIT"
    },
    "node_modules/asn1js": {
      "version": "3.0.10",
      "resolved": "https://registry.npmjs.org/asn1js/-/asn1js-3.0.10.tgz",
      "integrity": "sha512-S2s3aOytiKdFRdulw2qPE51MzjzVOisppcVv7jVFR+Kw0kxwvFrDcYA0h7Ndqbmj0HkMIXYWaoj7fli8kgx1eg==",
      "license": "BSD-3-Clause",
      "dependencies": {
        "pvtsutils": "^1.3.6",
        "pvutils": "^1.1.5",
        "tslib": "^2.8.1"
      },
      "engines": {
        "node": ">=12.0.0"
      }
    },
    "node_modules/assertion-error": {
      "version": "2.0.1",
      "resolved": "https://registry.npmjs.org/assertion-error/-/assertion-error-2.0.1.tgz",
      "integrity": "sha512-Izi8RQcffqCeNVgFigKli1ssklIbpHnCYc6AknXGYoB6grJqyeby7jv12JUQgmTAnIDnbck1uxksT4dzN3PWBA==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=12"
      }
    },
    "node_modules/atomic-sleep": {
      "version": "1.0.0",
      "resolved": "https://registry.npmjs.org/atomic-sleep/-/atomic-sleep-1.0.0.tgz",
      "integrity": "sha512-kNOjDqAh7px0XWNI+4QbzoiR/nTkHAWNud2uvnJquD1/x5a7EQZMJT0AczqK0Qn67oY/TTQ1LbUKajZpp3I9tQ==",
      "license": "MIT",
      "engines": {
        "node": ">=8.0.0"
      }
    },
    "node_modules/avvio": {
      "version": "9.3.0",
      "resolved": "https://registry.npmjs.org/avvio/-/avvio-9.3.0.tgz",
      "integrity": "sha512-g2tQ7LE7oOSqDfwEm3M+ZCMTJc7KiZCdJ4UwyZJb5ckTKyYu50OYmvv0mCFXPuYXoM4zkSt8zM9XQ9KCvxA74A==",
      "funding": [
        {
          "type": "github",
          "url": "https://github.com/sponsors/fastify"
        },
        {
          "type": "opencollective",
          "url": "https://opencollective.com/fastify"
        }
      ],
      "license": "MIT",
      "dependencies": {
        "@fastify/error": "^4.0.0",
        "fastq": "^1.17.1"
      }
    },
    "node_modules/balanced-match": {
      "version": "4.0.4",
      "resolved": "https://registry.npmjs.org/balanced-match/-/balanced-match-4.0.4.tgz",
      "integrity": "sha512-BLrgEcRTwX2o6gGxGOCNyMvGSp35YofuYzw9h1IMTRmKqttAZZVU67bdb9Pr2vUHA8+j3i2tJfjO6C6+4myGTA==",
      "license": "MIT",
      "engines": {
        "node": "18 || 20 || >=22"
      }
    },
    "node_modules/brace-expansion": {
      "version": "5.0.12",
      "resolved": "https://registry.npmjs.org/brace-expansion/-/brace-expansion-5.0.12.tgz",
      "integrity": "sha512-YovQ3rzhaLMIrDjNDMkNS01tea93qhEhG5xy8f6+R0l+dw3Ki+5sCoIoI942iuLZTHWogWktgwVDhU09iNEimQ==",
      "license": "MIT",
      "dependencies": {
        "balanced-match": "^4.0.2"
      },
      "engines": {
        "node": "20 || >=22"
      }
    },
    "node_modules/chai": {
      "version": "6.3.0",
      "resolved": "https://registry.npmjs.org/chai/-/chai-6.3.0.tgz",
      "integrity": "sha512-XWAtwJ6OHO+tj0EKCs0Y2UamnyOxseZWltU4x2U2wh8g4AigdjwvtUjvLP2tqkA/avxHEtzxNaqGq/YGNwckKg==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/content-disposition": {
      "version": "3.0.0",
      "resolved": "https://registry.npmjs.org/content-disposition/-/content-disposition-3.0.0.tgz",
      "integrity": "sha512-ZH/0Xs9rMIFWCOmGdmS9eHBTF62qqQYNz4nVjQhkdIO/a0fCP4UIM3mRz/wiqL0L14YgAz/1xio4OaSY4+ON/A==",
      "license": "MIT",
      "engines": {
        "node": ">=22"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/express"
      }
    },
    "node_modules/cookie": {
      "version": "1.1.1",
      "resolved": "https://registry.npmjs.org/cookie/-/cookie-1.1.1.tgz",
      "integrity": "sha512-ei8Aos7ja0weRpFzJnEA9UHJ/7XQmqglbRwnf2ATjcB9Wq874VKH9kfjjirM6UhU2/E5fFYadylyhFldcqSidQ==",
      "license": "MIT",
      "engines": {
        "node": ">=18"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/express"
      }
    },
    "node_modules/csstype": {
      "version": "3.2.3",
      "resolved": "https://registry.npmjs.org/csstype/-/csstype-3.2.3.tgz",
      "integrity": "sha512-z1HGKcYy2xA8AGQfwrn0PAy+PB7X/GSj3UVJW9qKyn43xWa+gl5nXmU4qqLMRzWVLFC8KusUX8T/0kCiOYpAIQ==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/debug": {
      "version": "4.4.3",
      "resolved": "https://registry.npmjs.org/debug/-/debug-4.4.3.tgz",
      "integrity": "sha512-RGwwWnwQvkVfavKVt22FGLw+xYSdzARwm0ru6DhTVA3umU5hZc28V3kO4stgYryrTlLpuvgI9GiijltAjNbcqA==",
      "license": "MIT",
      "dependencies": {
        "ms": "^2.1.3"
      },
      "engines": {
        "node": ">=6.0"
      },
      "peerDependenciesMeta": {
        "supports-color": {
          "optional": true
        }
      }
    },
    "node_modules/depd": {
      "version": "2.0.0",
      "resolved": "https://registry.npmjs.org/depd/-/depd-2.0.0.tgz",
      "integrity": "sha512-g7nH6P6dyDioJogAAGprGpCtVImJhpPk/roCzdb3fIh61/s/nPsfR6onyMwkCAR/OlC3yBC0lESvUoQEAssIrw==",
      "license": "MIT",
      "engines": {
        "node": ">= 0.8"
      }
    },
    "node_modules/dequal": {
      "version": "2.0.3",
      "resolved": "https://registry.npmjs.org/dequal/-/dequal-2.0.3.tgz",
      "integrity": "sha512-0je+qPKHEMohvfRTCEo3CrPG6cAzAYgmzKyxRiYSSDkS6eGJdyVJm7WaYA5ECaAD9wLB2T4EEeymA5aFVcYXCA==",
      "license": "MIT",
      "engines": {
        "node": ">=6"
      }
    },
    "node_modules/detect-libc": {
      "version": "2.1.2",
      "resolved": "https://registry.npmjs.org/detect-libc/-/detect-libc-2.1.2.tgz",
      "integrity": "sha512-Btj2BOOO83o3WyH59e8MgXsxEQVcarkUOpEYrubB0urwnN10yQ364rsiByU11nZlqWYZm05i/of7io4mzihBtQ==",
      "dev": true,
      "license": "Apache-2.0",
      "engines": {
        "node": ">=8"
      }
    },
    "node_modules/es-module-lexer": {
      "version": "2.3.2",
      "resolved": "https://registry.npmjs.org/es-module-lexer/-/es-module-lexer-2.3.2.tgz",
      "integrity": "sha512-poHGpORABojJJucnV9KbOavETW8lBVnphkW77ER5/BQ5Fz7oXSoCNek7IH3vR5nRjdsEz926ibFYX8KtLQmdyw==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/esbuild": {
      "version": "0.27.2",
      "resolved": "https://registry.npmjs.org/esbuild/-/esbuild-0.27.2.tgz",
      "integrity": "sha512-HyNQImnsOC7X9PMNaCIeAm4ISCQXs5a5YasTXVliKv4uuBo1dKrG0A+uQS8M5eXjVMnLg3WgXaKvprHlFJQffw==",
      "dev": true,
      "hasInstallScript": true,
      "license": "MIT",
      "bin": {
        "esbuild": "bin/esbuild"
      },
      "engines": {
        "node": ">=18"
      },
      "optionalDependencies": {
        "@esbuild/aix-ppc64": "0.27.2",
        "@esbuild/android-arm": "0.27.2",
        "@esbuild/android-arm64": "0.27.2",
        "@esbuild/android-x64": "0.27.2",
        "@esbuild/darwin-arm64": "0.27.2",
        "@esbuild/darwin-x64": "0.27.2",
        "@esbuild/freebsd-arm64": "0.27.2",
        "@esbuild/freebsd-x64": "0.27.2",
        "@esbuild/linux-arm": "0.27.2",
        "@esbuild/linux-arm64": "0.27.2",
        "@esbuild/linux-ia32": "0.27.2",
        "@esbuild/linux-loong64": "0.27.2",
        "@esbuild/linux-mips64el": "0.27.2",
        "@esbuild/linux-ppc64": "0.27.2",
        "@esbuild/linux-riscv64": "0.27.2",
        "@esbuild/linux-s390x": "0.27.2",
        "@esbuild/linux-x64": "0.27.2",
        "@esbuild/netbsd-arm64": "0.27.2",
        "@esbuild/netbsd-x64": "0.27.2",
        "@esbuild/openbsd-arm64": "0.27.2",
        "@esbuild/openbsd-x64": "0.27.2",
        "@esbuild/openharmony-arm64": "0.27.2",
        "@esbuild/sunos-x64": "0.27.2",
        "@esbuild/win32-arm64": "0.27.2",
        "@esbuild/win32-ia32": "0.27.2",
        "@esbuild/win32-x64": "0.27.2"
      }
    },
    "node_modules/escape-html": {
      "version": "1.0.3",
      "resolved": "https://registry.npmjs.org/escape-html/-/escape-html-1.0.3.tgz",
      "integrity": "sha512-NiSupZ4OeuGwr68lGIeym/ksIZMJodUGOSCZ/FSnTxcrekbvqrgdUxlJOMpijaKZVjAJrWrGs/6Jy8OMuyj9ow==",
      "license": "MIT"
    },
    "node_modules/estree-walker": {
      "version": "3.0.3",
      "resolved": "https://registry.npmjs.org/estree-walker/-/estree-walker-3.0.3.tgz",
      "integrity": "sha512-7RUKfXgSMMkzt6ZuXmqapOurLGPPfgj6l9uRZ7lRGolvk0y2yocc35LdcxKC5PQZdn2DMqioAQ2NoWcrTKmm6g==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@types/estree": "^1.0.0"
      }
    },
    "node_modules/expect-type": {
      "version": "1.4.0",
      "resolved": "https://registry.npmjs.org/expect-type/-/expect-type-1.4.0.tgz",
      "integrity": "sha512-KfYbmpRm0VbLjEvVa9yGwCi9GI34xvi7A/HXYWQO65CSD2u3MczUJSuwXKFIxlGsgBQizV9q5J9NHj4VG0n+pA==",
      "dev": true,
      "license": "Apache-2.0",
      "engines": {
        "node": ">=12.0.0"
      }
    },
    "node_modules/fast-decode-uri-component": {
      "version": "1.0.1",
      "resolved": "https://registry.npmjs.org/fast-decode-uri-component/-/fast-decode-uri-component-1.0.1.tgz",
      "integrity": "sha512-WKgKWg5eUxvRZGwW8FvfbaH7AXSh2cL+3j5fMGzUMCxWBJ3dV3a7Wz8y2f/uQ0e3B6WmodD3oS54jTQ9HVTIIg==",
      "license": "MIT"
    },
    "node_modules/fast-deep-equal": {
      "version": "3.1.3",
      "resolved": "https://registry.npmjs.org/fast-deep-equal/-/fast-deep-equal-3.1.3.tgz",
      "integrity": "sha512-f3qQ9oQy9j2AhBe/H9VC91wLmKBCCU/gDOnKNAYG5hswO7BLKj09Hc5HYNz9cGI++xlpDCIgDaitVs03ATR84Q==",
      "license": "MIT"
    },
    "node_modules/fast-json-stringify": {
      "version": "7.0.1",
      "resolved": "https://registry.npmjs.org/fast-json-stringify/-/fast-json-stringify-7.0.1.tgz",
      "integrity": "sha512-eRSayARSbbwlBjpP4vnTTIRD5QPcIrmihPxDeN1DtKnHPg66UuJLx+8hlK1kaFdjvzyQ/dzALoi4vwAQ+T+iZA==",
      "funding": [
        {
          "type": "github",
          "url": "https://github.com/sponsors/fastify"
        },
        {
          "type": "opencollective",
          "url": "https://opencollective.com/fastify"
        }
      ],
      "license": "MIT",
      "dependencies": {
        "@fastify/merge-json-schemas": "^0.2.0",
        "ajv": "^8.12.0",
        "ajv-formats": "^3.0.1",
        "fast-uri": "^4.0.0",
        "json-schema-ref-resolver": "^3.0.0",
        "rfdc": "^1.2.0"
      }
    },
    "node_modules/fast-querystring": {
      "version": "1.1.2",
      "resolved": "https://registry.npmjs.org/fast-querystring/-/fast-querystring-1.1.2.tgz",
      "integrity": "sha512-g6KuKWmFXc0fID8WWH0jit4g0AGBoJhCkJMb1RmbsSEUNvQ+ZC8D6CUZ+GtF8nMzSPXnhiePyyqqipzNNEnHjg==",
      "license": "MIT",
      "dependencies": {
        "fast-decode-uri-component": "^1.0.1"
      }
    },
    "node_modules/fast-uri": {
      "version": "4.2.1",
      "resolved": "https://registry.npmjs.org/fast-uri/-/fast-uri-4.2.1.tgz",
      "integrity": "sha512-TmHQgewjHtMq1E5QKA0tOE0yeYGQs25KZC/ziJpubRtWI15W92e6vPFydWOeZBVROSHBYw/QhD9d5OefdD6LDg==",
      "funding": [
        {
          "type": "github",
          "url": "https://github.com/sponsors/fastify"
        },
        {
          "type": "opencollective",
          "url": "https://opencollective.com/fastify"
        }
      ],
      "license": "BSD-3-Clause"
    },
    "node_modules/fastify": {
      "version": "5.12.5",
      "resolved": "https://registry.npmjs.org/fastify/-/fastify-5.12.5.tgz",
      "integrity": "sha512-OB2k1dlxs5/NAABqeKV2FUHkSD2BbENsCak8yULVcymn3fHIPDVa9TI3SDnJSWYSllZmSYuZXy2gTnsT+Sut1A==",
      "funding": [
        {
          "type": "github",
          "url": "https://github.com/sponsors/fastify"
        },
        {
          "type": "opencollective",
          "url": "https://opencollective.com/fastify"
        }
      ],
      "license": "MIT",
      "dependencies": {
        "@fastify/ajv-compiler": "^4.0.5",
        "@fastify/error": "^4.0.0",
        "@fastify/fast-json-stringify-compiler": "^5.0.0",
        "@fastify/proxy-addr": "^5.0.0",
        "abstract-logging": "^2.0.1",
        "avvio": "^9.0.0",
        "fast-json-stringify": "^7.0.0",
        "find-my-way": "^9.6.0",
        "light-my-request": "^6.0.0",
        "pino": "^9.14.0 || ^10.1.0",
        "process-warning": "^5.1.0",
        "rfdc": "^1.3.1",
        "secure-json-parse": "^4.0.0",
        "semver": "^7.6.0",
        "toad-cache": "^3.7.0"
      }
    },
    "node_modules/fastify-plugin": {
      "version": "5.1.0",
      "resolved": "https://registry.npmjs.org/fastify-plugin/-/fastify-plugin-5.1.0.tgz",
      "integrity": "sha512-FAIDA8eovSt5qcDgcBvDuX/v0Cjz0ohGhENZ/wpc3y+oZCY2afZ9Baqql3g/lC+OHRnciQol4ww7tuthOb9idw==",
      "funding": [
        {
          "type": "github",
          "url": "https://github.com/sponsors/fastify"
        },
        {
          "type": "opencollective",
          "url": "https://opencollective.com/fastify"
        }
      ],
      "license": "MIT"
    },
    "node_modules/fastq": {
      "version": "1.20.3",
      "resolved": "https://registry.npmjs.org/fastq/-/fastq-1.20.3.tgz",
      "integrity": "sha512-XKv5nnLs6nLF71NgiKJLIZFLkPyIEuOselLG7ujZnGrRfQK8HpvY+WqKhAJUAdLomwVHErVS4LfxFlPq0/FTAw==",
      "license": "ISC",
      "dependencies": {
        "reusify": "^1.0.4"
      }
    },
    "node_modules/fdir": {
      "version": "6.5.0",
      "resolved": "https://registry.npmjs.org/fdir/-/fdir-6.5.0.tgz",
      "integrity": "sha512-tIbYtZbucOs0BRGqPJkshJUYdL+SDH7dVM8gjy+ERp3WAUjLEFJE+02kanyHtwjWOnwrKYBiwAmM0p4kLJAnXg==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=12.0.0"
      },
      "peerDependencies": {
        "picomatch": "^3 || ^4"
      },
      "peerDependenciesMeta": {
        "picomatch": {
          "optional": true
        }
      }
    },
    "node_modules/find-my-way": {
      "version": "9.9.0",
      "resolved": "https://registry.npmjs.org/find-my-way/-/find-my-way-9.9.0.tgz",
      "integrity": "sha512-sJsgZ1sQH2UDuowPuMKg8az7Qc8F0jnj+SKkFWU/+T0xcFlgV5skgXOGUqmQzOdmW6ALA7AhJINWx3qFBkbLHA==",
      "license": "MIT",
      "dependencies": {
        "fast-deep-equal": "^3.1.3",
        "fast-querystring": "^1.0.0",
        "safe-regex2": "^5.0.0"
      },
      "engines": {
        "node": ">=20"
      }
    },
    "node_modules/fsevents": {
      "version": "2.3.2",
      "resolved": "https://registry.npmjs.org/fsevents/-/fsevents-2.3.2.tgz",
      "integrity": "sha512-xiqMQR4xAeHTuB9uWm+fFRcIOgKBMiOBP+eXiyT7jsgVCq1bkVygt00oASowB7EdtpOHaaPgKt812P9ab+DDKA==",
      "dev": true,
      "hasInstallScript": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "darwin"
      ],
      "engines": {
        "node": "^8.16.0 || ^10.6.0 || >=11.0.0"
      }
    },
    "node_modules/get-tsconfig": {
      "version": "4.14.3",
      "resolved": "https://registry.npmjs.org/get-tsconfig/-/get-tsconfig-4.14.3.tgz",
      "integrity": "sha512-++QEw4DIY7WGoukz+/+A/8dGYPT9l9yIadnmSgZ8Rjr3YVSVDipQSO9CdnJo9ePqFqUUqh+wk9uIaoiAwsiPkA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "resolve-pkg-maps": "^1.0.0"
      },
      "funding": {
        "url": "https://github.com/privatenumber/get-tsconfig?sponsor=1"
      }
    },
    "node_modules/glob": {
      "version": "13.0.6",
      "resolved": "https://registry.npmjs.org/glob/-/glob-13.0.6.tgz",
      "integrity": "sha512-Wjlyrolmm8uDpm/ogGyXZXb1Z+Ca2B8NbJwqBVg0axK9GbBeoS7yGV6vjXnYdGm6X53iehEuxxbyiKp8QmN4Vw==",
      "license": "BlueOak-1.0.0",
      "dependencies": {
        "minimatch": "^10.2.2",
        "minipass": "^7.1.3",
        "path-scurry": "^2.0.2"
      },
      "engines": {
        "node": "18 || 20 || >=22"
      },
      "funding": {
        "url": "https://github.com/sponsors/isaacs"
      }
    },
    "node_modules/helmet": {
      "version": "8.3.0",
      "resolved": "https://registry.npmjs.org/helmet/-/helmet-8.3.0.tgz",
      "integrity": "sha512-Qgpiaws3Sm30Av8Eah6sjMCZZwjlBu+E68rhpCWBshY1lb09HtLwj5GviX0OyQIn+ulUS0iX0AxN5n3tLZzz1w==",
      "license": "MIT",
      "engines": {
        "node": ">=18.0.0"
      },
      "funding": {
        "url": "https://github.com/sponsors/EvanHahn"
      }
    },
    "node_modules/http-errors": {
      "version": "2.0.1",
      "resolved": "https://registry.npmjs.org/http-errors/-/http-errors-2.0.1.tgz",
      "integrity": "sha512-4FbRdAX+bSdmo4AUFuS0WNiPz8NgFt+r8ThgNWmlrjQjt1Q7ZR9+zTlce2859x4KSXrwIsaeTqDoKQmtP8pLmQ==",
      "license": "MIT",
      "dependencies": {
        "depd": "~2.0.0",
        "inherits": "~2.0.4",
        "setprototypeof": "~1.2.0",
        "statuses": "~2.0.2",
        "toidentifier": "~1.0.1"
      },
      "engines": {
        "node": ">= 0.8"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/express"
      }
    },
    "node_modules/inherits": {
      "version": "2.0.4",
      "resolved": "https://registry.npmjs.org/inherits/-/inherits-2.0.4.tgz",
      "integrity": "sha512-k/vGaX4/Yla3WzyMCvTQOXYeIHvqOKtnqBduzTHpzpQZzAskKMhZ2K+EnBiSM9zGSoIFeMpXKxa4dYeZIQqewQ==",
      "license": "ISC"
    },
    "node_modules/ipaddr.js": {
      "version": "2.5.0",
      "resolved": "https://registry.npmjs.org/ipaddr.js/-/ipaddr.js-2.5.0.tgz",
      "integrity": "sha512-aq+t5NAc+cS6rZQQVWC2x98CPqGtKKTMDd4Gaodv0wShnItdKg/51djkGJ1hqH+Oy0ivDftCbSLCQob8zso01w==",
      "license": "MIT",
      "engines": {
        "node": ">= 10"
      }
    },
    "node_modules/json-schema-ref-resolver": {
      "version": "3.0.0",
      "resolved": "https://registry.npmjs.org/json-schema-ref-resolver/-/json-schema-ref-resolver-3.0.0.tgz",
      "integrity": "sha512-hOrZIVL5jyYFjzk7+y7n5JDzGlU8rfWDuYyHwGa2WA8/pcmMHezp2xsVwxrebD/Q9t8Nc5DboieySDpCp4WG4A==",
      "funding": [
        {
          "type": "github",
          "url": "https://github.com/sponsors/fastify"
        },
        {
          "type": "opencollective",
          "url": "https://opencollective.com/fastify"
        }
      ],
      "license": "MIT",
      "dependencies": {
        "dequal": "^2.0.3"
      }
    },
    "node_modules/json-schema-resolver": {
      "version": "3.0.0",
      "resolved": "https://registry.npmjs.org/json-schema-resolver/-/json-schema-resolver-3.0.0.tgz",
      "integrity": "sha512-HqMnbz0tz2DaEJ3ntsqtx3ezzZyDE7G56A/pPY/NGmrPu76UzsWquOpHFRAf5beTNXoH2LU5cQePVvRli1nchA==",
      "license": "MIT",
      "dependencies": {
        "debug": "^4.1.1",
        "fast-uri": "^3.0.5",
        "rfdc": "^1.1.4"
      },
      "engines": {
        "node": ">=20"
      },
      "funding": {
        "url": "https://github.com/Eomm/json-schema-resolver?sponsor=1"
      }
    },
    "node_modules/json-schema-resolver/node_modules/fast-uri": {
      "version": "3.1.8",
      "resolved": "https://registry.npmjs.org/fast-uri/-/fast-uri-3.1.8.tgz",
      "integrity": "sha512-GZMtZUTNRpOVIECoXwLNZS5xUGE+mVNbTB8h/7Rwh2TFWcBQiPzTgyZi05BF9UMZKkLJv8XBRJTlU7zg8+ZfMg==",
      "funding": [
        {
          "type": "github",
          "url": "https://github.com/sponsors/fastify"
        },
        {
          "type": "opencollective",
          "url": "https://opencollective.com/fastify"
        }
      ],
      "license": "BSD-3-Clause"
    },
    "node_modules/json-schema-traverse": {
      "version": "1.0.0",
      "resolved": "https://registry.npmjs.org/json-schema-traverse/-/json-schema-traverse-1.0.0.tgz",
      "integrity": "sha512-NM8/P9n3XjXhIZn1lLhkFaACTOURQXjWhV4BA/RnOv8xvgqtqpAX9IO4mRQxSx1Rlo4tqzeqb0sOlruaOy3dug==",
      "license": "MIT"
    },
    "node_modules/libsodium-sumo": {
      "version": "0.8.4",
      "resolved": "https://registry.npmjs.org/libsodium-sumo/-/libsodium-sumo-0.8.4.tgz",
      "integrity": "sha512-TMtHShQfVVsaxDygyapvUC3o7YsPgXa/hRWeIgzyFz6w5k/1hirGptCxp1U7XwW3rCskaTTYKgV10v86UiGgNw==",
      "license": "ISC"
    },
    "node_modules/libsodium-wrappers-sumo": {
      "version": "0.8.4",
      "resolved": "https://registry.npmjs.org/libsodium-wrappers-sumo/-/libsodium-wrappers-sumo-0.8.4.tgz",
      "integrity": "sha512-ql7hcgulKZ3ekfa2DGAogcCKsWU0diA/0nArz1CFzh93WQdb46/Kj18ka/Hifq6uA3Ush34Pc6vU/6HXeRwUkg==",
      "license": "ISC",
      "dependencies": {
        "libsodium-sumo": "^0.8.0"
      }
    },
    "node_modules/light-my-request": {
      "version": "6.6.0",
      "resolved": "https://registry.npmjs.org/light-my-request/-/light-my-request-6.6.0.tgz",
      "integrity": "sha512-CHYbu8RtboSIoVsHZ6Ye4cj4Aw/yg2oAFimlF7mNvfDV192LR7nDiKtSIfCuLT7KokPSTn/9kfVLm5OGN0A28A==",
      "funding": [
        {
          "type": "github",
          "url": "https://github.com/sponsors/fastify"
        },
        {
          "type": "opencollective",
          "url": "https://opencollective.com/fastify"
        }
      ],
      "license": "BSD-3-Clause",
      "dependencies": {
        "cookie": "^1.0.1",
        "process-warning": "^4.0.0",
        "set-cookie-parser": "^2.6.0"
      }
    },
    "node_modules/light-my-request/node_modules/process-warning": {
      "version": "4.0.1",
      "resolved": "https://registry.npmjs.org/process-warning/-/process-warning-4.0.1.tgz",
      "integrity": "sha512-3c2LzQ3rY9d0hc1emcsHhfT9Jwz0cChib/QN89oME2R451w5fy3f0afAhERFZAwrbDU43wk12d0ORBpDVME50Q==",
      "funding": [
        {
          "type": "github",
          "url": "https://github.com/sponsors/fastify"
        },
        {
          "type": "opencollective",
          "url": "https://opencollective.com/fastify"
        }
      ],
      "license": "MIT"
    },
    "node_modules/lightningcss": {
      "version": "1.33.0",
      "resolved": "https://registry.npmjs.org/lightningcss/-/lightningcss-1.33.0.tgz",
      "integrity": "sha512-WkUDrojuJs0xkgGf2udWxa3yGBRxPtxUkB79i6aCZLRgc7PM8fZe9TosfPDcvEpQZbuFASnHYmRLBLUbmLOIIA==",
      "dev": true,
      "license": "MPL-2.0",
      "dependencies": {
        "detect-libc": "^2.0.3"
      },
      "engines": {
        "node": ">= 12.0.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/parcel"
      },
      "optionalDependencies": {
        "lightningcss-android-arm64": "1.33.0",
        "lightningcss-darwin-arm64": "1.33.0",
        "lightningcss-darwin-x64": "1.33.0",
        "lightningcss-freebsd-x64": "1.33.0",
        "lightningcss-linux-arm-gnueabihf": "1.33.0",
        "lightningcss-linux-arm64-gnu": "1.33.0",
        "lightningcss-linux-arm64-musl": "1.33.0",
        "lightningcss-linux-x64-gnu": "1.33.0",
        "lightningcss-linux-x64-musl": "1.33.0",
        "lightningcss-win32-arm64-msvc": "1.33.0",
        "lightningcss-win32-x64-msvc": "1.33.0"
      }
    },
    "node_modules/lightningcss-android-arm64": {
      "version": "1.33.0",
      "resolved": "https://registry.npmjs.org/lightningcss-android-arm64/-/lightningcss-android-arm64-1.33.0.tgz",
      "integrity": "sha512-gEpRTalKdosp4Bb8qWtc2iOgE5SeIHlpS1up9bFq2wAyYhl1UdTObYiHe98zEM9SQvSoqQZ1IQD0JNpg3Ml5pg==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MPL-2.0",
      "optional": true,
      "os": [
        "android"
      ],
      "engines": {
        "node": ">= 12.0.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/parcel"
      }
    },
    "node_modules/lightningcss-darwin-arm64": {
      "version": "1.33.0",
      "resolved": "https://registry.npmjs.org/lightningcss-darwin-arm64/-/lightningcss-darwin-arm64-1.33.0.tgz",
      "integrity": "sha512-Sciaz8eenNTKn9b3t7+xr0ipTp9YxKQY4npwQ3mrRuL0BAVHBLyZxofhaKBAVtzmtRZ/zTyo0/to4B1uWG/Djg==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MPL-2.0",
      "optional": true,
      "os": [
        "darwin"
      ],
      "engines": {
        "node": ">= 12.0.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/parcel"
      }
    },
    "node_modules/lightningcss-darwin-x64": {
      "version": "1.33.0",
      "resolved": "https://registry.npmjs.org/lightningcss-darwin-x64/-/lightningcss-darwin-x64-1.33.0.tgz",
      "integrity": "sha512-Z5UPAxzrjlWNNyGy6i65cJzzvgJ5D3T6wMvs+gWpY9d7qRhANrxqAp6LhxIgZhWEw18RfJTGcRxjuLIBr+m8XQ==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MPL-2.0",
      "optional": true,
      "os": [
        "darwin"
      ],
      "engines": {
        "node": ">= 12.0.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/parcel"
      }
    },
    "node_modules/lightningcss-freebsd-x64": {
      "version": "1.33.0",
      "resolved": "https://registry.npmjs.org/lightningcss-freebsd-x64/-/lightningcss-freebsd-x64-1.33.0.tgz",
      "integrity": "sha512-QQM/Ti/hQajJwCY+RiWuCZ9sdtI/XQk7nDK5vC8kkdwixezOlDgvDx7+RT+QjK6FcFT4MpsuoBnHIo/O3StRRg==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MPL-2.0",
      "optional": true,
      "os": [
        "freebsd"
      ],
      "engines": {
        "node": ">= 12.0.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/parcel"
      }
    },
    "node_modules/lightningcss-linux-arm-gnueabihf": {
      "version": "1.33.0",
      "resolved": "https://registry.npmjs.org/lightningcss-linux-arm-gnueabihf/-/lightningcss-linux-arm-gnueabihf-1.33.0.tgz",
      "integrity": "sha512-N7FVBe6iS24MlM6R/4RBTxGhQheZGs7tiQ9U32UtF75NzP5Q7xWPRqLBCKxlRQRk3rY1jCIPLzx7WzOhuUIRLQ==",
      "cpu": [
        "arm"
      ],
      "dev": true,
      "license": "MPL-2.0",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">= 12.0.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/parcel"
      }
    },
    "node_modules/lightningcss-linux-arm64-gnu": {
      "version": "1.33.0",
      "resolved": "https://registry.npmjs.org/lightningcss-linux-arm64-gnu/-/lightningcss-linux-arm64-gnu-1.33.0.tgz",
      "integrity": "sha512-j2v/itmy4HlNxlc6voKXYgBqNi0Ng2LShg4z7GufpEgs05P+2suBVyi9I6YHq5uoVFx9ETin3eCEhLVyXGQnKg==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MPL-2.0",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">= 12.0.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/parcel"
      }
    },
    "node_modules/lightningcss-linux-arm64-musl": {
      "version": "1.33.0",
      "resolved": "https://registry.npmjs.org/lightningcss-linux-arm64-musl/-/lightningcss-linux-arm64-musl-1.33.0.tgz",
      "integrity": "sha512-yiO5ROMuYQgXbC60yjZU5CYSFZGKXL0HFATXt9mHJn1+zW55oCtMI9NfcVhYLMFDL7gV7oBPon/EmMMGg2OvtQ==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MPL-2.0",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">= 12.0.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/parcel"
      }
    },
    "node_modules/lightningcss-linux-x64-gnu": {
      "version": "1.33.0",
      "resolved": "https://registry.npmjs.org/lightningcss-linux-x64-gnu/-/lightningcss-linux-x64-gnu-1.33.0.tgz",
      "integrity": "sha512-ar+Ju7LmcN0Jo4FpL4hpFybwNG9/3A/Br5KW2n2jyODg3MEZXaDYADdemoNS+BDNfMgKvylJLj4S5tyRActuAg==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MPL-2.0",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">= 12.0.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/parcel"
      }
    },
    "node_modules/lightningcss-linux-x64-musl": {
      "version": "1.33.0",
      "resolved": "https://registry.npmjs.org/lightningcss-linux-x64-musl/-/lightningcss-linux-x64-musl-1.33.0.tgz",
      "integrity": "sha512-RYiYbkokw0trfKqqzfF55lginwEPrD3OJDfTuJzFs1MK6iFnDenaz1fqLLtX4ITG3OktJQXOeTaw1awrBAlZPw==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MPL-2.0",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">= 12.0.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/parcel"
      }
    },
    "node_modules/lightningcss-win32-arm64-msvc": {
      "version": "1.33.0",
      "resolved": "https://registry.npmjs.org/lightningcss-win32-arm64-msvc/-/lightningcss-win32-arm64-msvc-1.33.0.tgz",
      "integrity": "sha512-1K+MPfLSFVpphzpdbfkhlWk6wBrTObBzS2T6db10PNOZgR9GoVsAWzwNyuhUYYbTp23j+4RrncfujZ4uAzXvwA==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MPL-2.0",
      "optional": true,
      "os": [
        "win32"
      ],
      "engines": {
        "node": ">= 12.0.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/parcel"
      }
    },
    "node_modules/lightningcss-win32-x64-msvc": {
      "version": "1.33.0",
      "resolved": "https://registry.npmjs.org/lightningcss-win32-x64-msvc/-/lightningcss-win32-x64-msvc-1.33.0.tgz",
      "integrity": "sha512-OlEICDx/Xl0FqSp4bry8zFnCvGpig3Gl4gCquvYwHuqJKEC1+n9NgDniFvqHGmMv1ZkqDJrDqKKSykTDX+ehuA==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MPL-2.0",
      "optional": true,
      "os": [
        "win32"
      ],
      "engines": {
        "node": ">= 12.0.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/parcel"
      }
    },
    "node_modules/lru-cache": {
      "version": "11.5.3",
      "resolved": "https://registry.npmjs.org/lru-cache/-/lru-cache-11.5.3.tgz",
      "integrity": "sha512-U4N8FgzmWxc8k1VH8Kr6lQg18U7Fjvby6wXHVRX/ZZ7IwWbRMgrRbP0Wrb5q5NVinryp4SQampHKdvtecItxUg==",
      "license": "BlueOak-1.0.0",
      "engines": {
        "node": "20 || >=22"
      }
    },
    "node_modules/magic-string": {
      "version": "1.4.3",
      "resolved": "https://registry.npmjs.org/magic-string/-/magic-string-1.4.3.tgz",
      "integrity": "sha512-z12OxmaPGE0F4xlpGdjuAUckipLpQlTAuAmyGhNoD7ODpYUzvDfvtxUbjM/jwznyP178oju/KDdyi220wNJ0RQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@jridgewell/sourcemap-codec": "^1.6.0"
      }
    },
    "node_modules/mime": {
      "version": "3.0.0",
      "resolved": "https://registry.npmjs.org/mime/-/mime-3.0.0.tgz",
      "integrity": "sha512-jSCU7/VB1loIWBZe14aEYHU/+1UMEHoaO7qxCOVJOw9GgH72VAWppxNcjU+x9a2k3GSIBXNKxXQFqRvvZ7vr3A==",
      "license": "MIT",
      "bin": {
        "mime": "cli.js"
      },
      "engines": {
        "node": ">=10.0.0"
      }
    },
    "node_modules/minimatch": {
      "version": "10.2.6",
      "resolved": "https://registry.npmjs.org/minimatch/-/minimatch-10.2.6.tgz",
      "integrity": "sha512-vpLQEs+VLCr1nU0BXS07maYoFwlDAH0gngQuuttxIwutDFEMHq2blX+8vpgxDdK3J1PwjCJiep77OitTZ4Ll1A==",
      "license": "BlueOak-1.0.0",
      "dependencies": {
        "brace-expansion": "^5.0.8"
      },
      "engines": {
        "node": "18 || 20 || >=22"
      },
      "funding": {
        "url": "https://github.com/sponsors/isaacs"
      }
    },
    "node_modules/minipass": {
      "version": "7.1.3",
      "resolved": "https://registry.npmjs.org/minipass/-/minipass-7.1.3.tgz",
      "integrity": "sha512-tEBHqDnIoM/1rXME1zgka9g6Q2lcoCkxHLuc7ODJ5BxbP5d4c2Z5cGgtXAku59200Cx7diuHTOYfSBD8n6mm8A==",
      "license": "BlueOak-1.0.0",
      "engines": {
        "node": ">=16 || 14 >=14.17"
      }
    },
    "node_modules/ms": {
      "version": "2.1.3",
      "resolved": "https://registry.npmjs.org/ms/-/ms-2.1.3.tgz",
      "integrity": "sha512-6FlzubTLZG3J2a/NVCAleEhjzq5oxgHyaCU9yYXvcLsvoVaHJq/s5xXI6/XXP6tz7R9xAOtHnSO/tXtF3WRTlA==",
      "license": "MIT"
    },
    "node_modules/nanoid": {
      "version": "3.3.20",
      "resolved": "https://registry.npmjs.org/nanoid/-/nanoid-3.3.20.tgz",
      "integrity": "sha512-uKdg2G3GNCKQn9byYOpxbGqrT2fGO5KRt5J/8b3pok8rT6qxGWF6hxMyJiEYtAf+FVyYuD9hRaDqX5uPFYJ4ZQ==",
      "dev": true,
      "funding": [
        {
          "type": "github",
          "url": "https://github.com/sponsors/ai"
        }
      ],
      "license": "MIT",
      "bin": {
        "nanoid": "bin/nanoid.cjs"
      },
      "engines": {
        "node": "^10 || ^12 || ^13.7 || ^14 || >=15.0.1"
      }
    },
    "node_modules/obug": {
      "version": "2.2.1",
      "resolved": "https://registry.npmjs.org/obug/-/obug-2.2.1.tgz",
      "integrity": "sha512-XrsrhT5sybtKI6wakr2SPOlGZWWYbUXZ7a0jT8/QOeAPau+1X/bSegNe5YR75oJmEZQbKningirmGOEJCIk61Q==",
      "dev": true,
      "funding": [
        "https://github.com/sponsors/sxzz",
        "https://opencollective.com/debug"
      ],
      "license": "MIT",
      "engines": {
        "node": ">=12.20.0"
      }
    },
    "node_modules/on-exit-leak-free": {
      "version": "2.1.2",
      "resolved": "https://registry.npmjs.org/on-exit-leak-free/-/on-exit-leak-free-2.1.2.tgz",
      "integrity": "sha512-0eJJY6hXLGf1udHwfNftBqH+g73EU4B504nZeKpz1sYRKafAghwxEJunB2O7rDZkL4PGfsMVnTXZ2EjibbqcsA==",
      "license": "MIT",
      "engines": {
        "node": ">=14.0.0"
      }
    },
    "node_modules/openapi-types": {
      "version": "12.1.3",
      "resolved": "https://registry.npmjs.org/openapi-types/-/openapi-types-12.1.3.tgz",
      "integrity": "sha512-N4YtSYJqghVu4iek2ZUvcN/0aqH1kRDuNqzcycDxhOUpg7GdvLa2F3DgS6yBNhInhv2r/6I0Flkn7CqL8+nIcw==",
      "license": "MIT"
    },
    "node_modules/otpauth": {
      "version": "9.4.1",
      "resolved": "https://registry.npmjs.org/otpauth/-/otpauth-9.4.1.tgz",
      "integrity": "sha512-+iVvys36CFsyXEqfNftQm1II7SW23W1wx9RwNk0Cd97lbvorqAhBDksb/0bYry087QMxjiuBS0wokdoZ0iUeAw==",
      "license": "MIT",
      "dependencies": {
        "@noble/hashes": "1.8.0"
      },
      "funding": {
        "url": "https://github.com/hectorm/otpauth?sponsor=1"
      }
    },
    "node_modules/papaparse": {
      "version": "5.5.3",
      "resolved": "https://registry.npmjs.org/papaparse/-/papaparse-5.5.3.tgz",
      "integrity": "sha512-5QvjGxYVjxO59MGU2lHVYpRWBBtKHnlIAcSe1uNFCkkptUh63NFRj0FJQm7nR67puEruUci/ZkjmEFrjCAyP4A==",
      "license": "MIT"
    },
    "node_modules/path-scurry": {
      "version": "2.0.2",
      "resolved": "https://registry.npmjs.org/path-scurry/-/path-scurry-2.0.2.tgz",
      "integrity": "sha512-3O/iVVsJAPsOnpwWIeD+d6z/7PmqApyQePUtCndjatj/9I5LylHvt5qluFaBT3I5h3r1ejfR056c+FCv+NnNXg==",
      "license": "BlueOak-1.0.0",
      "dependencies": {
        "lru-cache": "^11.0.0",
        "minipass": "^7.1.2"
      },
      "engines": {
        "node": "18 || 20 || >=22"
      },
      "funding": {
        "url": "https://github.com/sponsors/isaacs"
      }
    },
    "node_modules/pg": {
      "version": "8.16.3",
      "resolved": "https://registry.npmjs.org/pg/-/pg-8.16.3.tgz",
      "integrity": "sha512-enxc1h0jA/aq5oSDMvqyW3q89ra6XIIDZgCX9vkMrnz5DFTw/Ny3Li2lFQ+pt3L6MCgm/5o2o8HW9hiJji+xvw==",
      "license": "MIT",
      "dependencies": {
        "pg-connection-string": "^2.9.1",
        "pg-pool": "^3.10.1",
        "pg-protocol": "^1.10.3",
        "pg-types": "2.2.0",
        "pgpass": "1.0.5"
      },
      "engines": {
        "node": ">= 16.0.0"
      },
      "optionalDependencies": {
        "pg-cloudflare": "^1.2.7"
      },
      "peerDependencies": {
        "pg-native": ">=3.0.1"
      },
      "peerDependenciesMeta": {
        "pg-native": {
          "optional": true
        }
      }
    },
    "node_modules/pg-cloudflare": {
      "version": "1.4.1",
      "resolved": "https://registry.npmjs.org/pg-cloudflare/-/pg-cloudflare-1.4.1.tgz",
      "integrity": "sha512-6PQbsFWZcp9EmJEwy5cGQ2La+AMWpP46lgbb8X+U/XsHIUweYDNCpeuKck5RxL2MdVFi7krbbEi5nX4Zh7JhrQ==",
      "license": "MIT",
      "optional": true
    },
    "node_modules/pg-connection-string": {
      "version": "2.14.1",
      "resolved": "https://registry.npmjs.org/pg-connection-string/-/pg-connection-string-2.14.1.tgz",
      "integrity": "sha512-qR3kGNPBLpCNtz0evbKA0Y/MRFXwSSdT+pTJvYp/bXTcReZbvX1kzF0IyTc1QnxqF7AZbOeBhNL8R5mYQZV/MA==",
      "license": "MIT"
    },
    "node_modules/pg-int8": {
      "version": "1.0.1",
      "resolved": "https://registry.npmjs.org/pg-int8/-/pg-int8-1.0.1.tgz",
      "integrity": "sha512-WCtabS6t3c8SkpDBUlb1kjOs7l66xsGdKpIPZsg4wR+B3+u9UAum2odSsF9tnvxg80h4ZxLWMy4pRjOsFIqQpw==",
      "license": "ISC",
      "engines": {
        "node": ">=4.0.0"
      }
    },
    "node_modules/pg-pool": {
      "version": "3.14.0",
      "resolved": "https://registry.npmjs.org/pg-pool/-/pg-pool-3.14.0.tgz",
      "integrity": "sha512-gKtPkFdQPU3DksooVLi9LsjZxrsBUZIpa+7aVx+LV5pNh0KzP4Zleud2po+ConrxbuXGBJ6Hfer6hdgpIBpBaw==",
      "license": "MIT",
      "peerDependencies": {
        "pg": ">=8.0"
      }
    },
    "node_modules/pg-protocol": {
      "version": "1.16.1",
      "resolved": "https://registry.npmjs.org/pg-protocol/-/pg-protocol-1.16.1.tgz",
      "integrity": "sha512-p9VOFMiHB/ZbJATetbg+99PxssTVSQRnyuPSQ67mN1+1KBOjZaZ83ZQzltnxPhJwSsC3nwVjJ10DVJlerbFzLg==",
      "license": "MIT"
    },
    "node_modules/pg-types": {
      "version": "2.2.0",
      "resolved": "https://registry.npmjs.org/pg-types/-/pg-types-2.2.0.tgz",
      "integrity": "sha512-qTAAlrEsl8s4OiEQY69wDvcMIdQN6wdz5ojQiOy6YRMuynxenON0O5oCpJI6lshc6scgAY8qvJ2On/p+CXY0GA==",
      "license": "MIT",
      "dependencies": {
        "pg-int8": "1.0.1",
        "postgres-array": "~2.0.0",
        "postgres-bytea": "~1.0.0",
        "postgres-date": "~1.0.4",
        "postgres-interval": "^1.1.0"
      },
      "engines": {
        "node": ">=4"
      }
    },
    "node_modules/pgpass": {
      "version": "1.0.5",
      "resolved": "https://registry.npmjs.org/pgpass/-/pgpass-1.0.5.tgz",
      "integrity": "sha512-FdW9r/jQZhSeohs1Z3sI1yxFQNFvMcnmfuj4WBMUTxOrAyLMaTcE1aAMBiTlbMNaXvBCQuVi0R7hd8udDSP7ug==",
      "license": "MIT",
      "dependencies": {
        "split2": "^4.1.0"
      }
    },
    "node_modules/picocolors": {
      "version": "1.1.1",
      "resolved": "https://registry.npmjs.org/picocolors/-/picocolors-1.1.1.tgz",
      "integrity": "sha512-xceH2snhtb5M9liqDsmEw56le376mTZkEX/jEb/RxNFyegNul7eNslCXP9FDj/Lcu0X8KEyMceP2ntpaHrDEVA==",
      "dev": true,
      "license": "ISC"
    },
    "node_modules/picomatch": {
      "version": "4.0.7",
      "resolved": "https://registry.npmjs.org/picomatch/-/picomatch-4.0.7.tgz",
      "integrity": "sha512-qcJu88Q2IWqJsDD529JKMdwGm/dvInW4HvQnRwiH9JtihJvzGOscDtHE3x1pBKeUOTysQ8kVmLnJ2kJu7yhcGA==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=12"
      },
      "funding": {
        "url": "https://github.com/sponsors/jonschlinkert"
      }
    },
    "node_modules/pino": {
      "version": "10.4.0",
      "resolved": "https://registry.npmjs.org/pino/-/pino-10.4.0.tgz",
      "integrity": "sha512-bk1ZMTwG/Vymx+zPoa28MhNzucFvXJWp3csrSuxuHPSMeUettaCoQ5Jvg07mtC4JGNpcfTwz41oVCnNgBK9+vA==",
      "license": "MIT",
      "dependencies": {
        "@pinojs/redact": "^0.4.0",
        "atomic-sleep": "^1.0.0",
        "on-exit-leak-free": "^2.1.0",
        "pino-abstract-transport": "^3.0.0",
        "pino-std-serializers": "^7.0.0",
        "process-warning": "^5.0.0",
        "quick-format-unescaped": "^4.0.3",
        "real-require": "^1.0.0",
        "safe-stable-stringify": "^2.3.1",
        "sonic-boom": "^4.0.1",
        "thread-stream": "^4.0.0"
      },
      "bin": {
        "pino": "bin.js"
      }
    },
    "node_modules/pino-abstract-transport": {
      "version": "3.0.0",
      "resolved": "https://registry.npmjs.org/pino-abstract-transport/-/pino-abstract-transport-3.0.0.tgz",
      "integrity": "sha512-wlfUczU+n7Hy/Ha5j9a/gZNy7We5+cXp8YL+X+PG8S0KXxw7n/JXA3c46Y0zQznIJ83URJiwy7Lh56WLokNuxg==",
      "license": "MIT",
      "dependencies": {
        "split2": "^4.0.0"
      }
    },
    "node_modules/pino-std-serializers": {
      "version": "7.1.0",
      "resolved": "https://registry.npmjs.org/pino-std-serializers/-/pino-std-serializers-7.1.0.tgz",
      "integrity": "sha512-BndPH67/JxGExRgiX1dX0w1FvZck5Wa4aal9198SrRhZjH3GxKQUKIBnYJTdj2HDN3UQAS06HlfcSbQj2OHmaw==",
      "license": "MIT"
    },
    "node_modules/playwright": {
      "version": "1.58.2",
      "resolved": "https://registry.npmjs.org/playwright/-/playwright-1.58.2.tgz",
      "integrity": "sha512-vA30H8Nvkq/cPBnNw4Q8TWz1EJyqgpuinBcHET0YVJVFldr8JDNiU9LaWAE1KqSkRYazuaBhTpB5ZzShOezQ6A==",
      "dev": true,
      "license": "Apache-2.0",
      "dependencies": {
        "playwright-core": "1.58.2"
      },
      "bin": {
        "playwright": "cli.js"
      },
      "engines": {
        "node": ">=18"
      },
      "optionalDependencies": {
        "fsevents": "2.3.2"
      }
    },
    "node_modules/playwright-core": {
      "version": "1.58.2",
      "resolved": "https://registry.npmjs.org/playwright-core/-/playwright-core-1.58.2.tgz",
      "integrity": "sha512-yZkEtftgwS8CsfYo7nm0KE8jsvm6i/PTgVtB8DL726wNf6H2IMsDuxCpJj59KDaxCtSnrWan2AeDqM7JBaultg==",
      "dev": true,
      "license": "Apache-2.0",
      "bin": {
        "playwright-core": "cli.js"
      },
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/postcss": {
      "version": "8.5.29",
      "resolved": "https://registry.npmjs.org/postcss/-/postcss-8.5.29.tgz",
      "integrity": "sha512-49cGhUbXj8Qenv0iTMxA1cFBzxXoctpC9Ujd77t1WcbJIr6nF/eI7g/8MgxrYldFRuAXvja7xQRwavoW7kgrxQ==",
      "dev": true,
      "funding": [
        {
          "type": "opencollective",
          "url": "https://opencollective.com/postcss/"
        },
        {
          "type": "tidelift",
          "url": "https://tidelift.com/funding/github/npm/postcss"
        },
        {
          "type": "github",
          "url": "https://github.com/sponsors/ai"
        }
      ],
      "license": "MIT",
      "dependencies": {
        "nanoid": "^3.3.19",
        "picocolors": "^1.1.1",
        "source-map-js": "^1.2.2"
      },
      "engines": {
        "node": "^10 || ^12 || >=14"
      }
    },
    "node_modules/postgres-array": {
      "version": "2.0.0",
      "resolved": "https://registry.npmjs.org/postgres-array/-/postgres-array-2.0.0.tgz",
      "integrity": "sha512-VpZrUqU5A69eQyW2c5CA1jtLecCsN2U/bD6VilrFDWq5+5UIEVO7nazS3TEcHf1zuPYO/sqGvUvW62g86RXZuA==",
      "license": "MIT",
      "engines": {
        "node": ">=4"
      }
    },
    "node_modules/postgres-bytea": {
      "version": "1.0.1",
      "resolved": "https://registry.npmjs.org/postgres-bytea/-/postgres-bytea-1.0.1.tgz",
      "integrity": "sha512-5+5HqXnsZPE65IJZSMkZtURARZelel2oXUEO8rH83VS/hxH5vv1uHquPg5wZs8yMAfdv971IU+kcPUczi7NVBQ==",
      "license": "MIT",
      "engines": {
        "node": ">=0.10.0"
      }
    },
    "node_modules/postgres-date": {
      "version": "1.0.7",
      "resolved": "https://registry.npmjs.org/postgres-date/-/postgres-date-1.0.7.tgz",
      "integrity": "sha512-suDmjLVQg78nMK2UZ454hAG+OAW+HQPZ6n++TNDUX+L0+uUlLywnoxJKDou51Zm+zTCjrCl0Nq6J9C5hP9vK/Q==",
      "license": "MIT",
      "engines": {
        "node": ">=0.10.0"
      }
    },
    "node_modules/postgres-interval": {
      "version": "1.2.0",
      "resolved": "https://registry.npmjs.org/postgres-interval/-/postgres-interval-1.2.0.tgz",
      "integrity": "sha512-9ZhXKM/rw350N1ovuWHbGxnGh/SNJ4cnxHiM0rxE4VN41wsg8P8zWn9hv/buK00RP4WvlOyr/RBDiptyxVbkZQ==",
      "license": "MIT",
      "dependencies": {
        "xtend": "^4.0.0"
      },
      "engines": {
        "node": ">=0.10.0"
      }
    },
    "node_modules/prettier": {
      "version": "3.9.9",
      "resolved": "https://registry.npmjs.org/prettier/-/prettier-3.9.9.tgz",
      "integrity": "sha512-Z/CJHIkdujO/OtN7nXUii0Rf3VT5SRuhjBA82Xvu2XhBUgX3nhP67T0LHceBdQLex7OOFGTox+Q5Yg8Jk2Qivg==",
      "dev": true,
      "license": "MIT",
      "bin": {
        "prettier": "bin/prettier.cjs"
      },
      "engines": {
        "node": ">=14"
      },
      "funding": {
        "url": "https://github.com/prettier/prettier?sponsor=1"
      }
    },
    "node_modules/process-warning": {
      "version": "5.1.0",
      "resolved": "https://registry.npmjs.org/process-warning/-/process-warning-5.1.0.tgz",
      "integrity": "sha512-jQSaVHsPgtyw60e1rQ/A+/ArPEj/S8pS/vFnyGa/gYFXrKk/6RuDkoqVDQ5NI5MmS01698ltlAk0NoDBNLujRw==",
      "funding": [
        {
          "type": "github",
          "url": "https://github.com/sponsors/fastify"
        },
        {
          "type": "opencollective",
          "url": "https://opencollective.com/fastify"
        }
      ],
      "license": "MIT"
    },
    "node_modules/pvtsutils": {
      "version": "1.3.6",
      "resolved": "https://registry.npmjs.org/pvtsutils/-/pvtsutils-1.3.6.tgz",
      "integrity": "sha512-PLgQXQ6H2FWCaeRak8vvk1GW462lMxB5s3Jm673N82zI4vqtVUPuZdffdZbPDFRoU8kAhItWFtPCWiPpp4/EDg==",
      "license": "MIT",
      "dependencies": {
        "tslib": "^2.8.1"
      }
    },
    "node_modules/pvutils": {
      "version": "1.2.0",
      "resolved": "https://registry.npmjs.org/pvutils/-/pvutils-1.2.0.tgz",
      "integrity": "sha512-BbubeCEyTuQjVMakvJQ/Sxbc93F2pwmbsxONT/ZRrwU7Ua38d8unYTwXpTVLAKJ4BDuH9IGztCjQcd/N/39Dvg==",
      "license": "MIT",
      "engines": {
        "node": ">=16.0.0"
      }
    },
    "node_modules/quick-format-unescaped": {
      "version": "4.0.4",
      "resolved": "https://registry.npmjs.org/quick-format-unescaped/-/quick-format-unescaped-4.0.4.tgz",
      "integrity": "sha512-tYC1Q1hgyRuHgloV/YXs2w15unPVh8qfu/qCTfhTYamaw7fyhumKa2yGpdSo87vY32rIclj+4fWYQXUMs9EHvg==",
      "license": "MIT"
    },
    "node_modules/react": {
      "version": "19.3.0",
      "resolved": "https://registry.npmjs.org/react/-/react-19.3.0.tgz",
      "integrity": "sha512-E8LUcbtBWt20bbl2YoHfx4ZDBdxVTfOKtCZn9cDSJ4l6/nuoApcpIBcj47t2wZoVX8g2ZHuMHbiShgCR1T5Sog==",
      "license": "MIT",
      "engines": {
        "node": ">=0.10.0"
      }
    },
    "node_modules/react-dom": {
      "version": "19.3.0",
      "resolved": "https://registry.npmjs.org/react-dom/-/react-dom-19.3.0.tgz",
      "integrity": "sha512-JDk8dgif51OjFoDE70+OT9ICyYr+69HlmihNwp1+Nsfbna3t5sIiCa9ZJktDmQ4/1b/rn26hIAR2uYXDMr5r0Q==",
      "license": "MIT",
      "dependencies": {
        "scheduler": "^0.28.0"
      },
      "peerDependencies": {
        "react": "^19.3.0"
      }
    },
    "node_modules/real-require": {
      "version": "1.0.0",
      "resolved": "https://registry.npmjs.org/real-require/-/real-require-1.0.0.tgz",
      "integrity": "sha512-P4nbQYQfePJxRSmY+v/KINxVucm4NF3p3s7pJveMTtom52FR4YGltUQLB8idDXwDDWW+eYrWDFbuzUnjoWHF7g==",
      "license": "MIT"
    },
    "node_modules/reflect-metadata": {
      "version": "0.2.2",
      "resolved": "https://registry.npmjs.org/reflect-metadata/-/reflect-metadata-0.2.2.tgz",
      "integrity": "sha512-urBwgfrvVP/eAyXx4hluJivBKzuEbSQs9rKWCrCkbSxNv8mxPcUZKeuoF3Uy4mJl3Lwprp6yy5/39VWigZ4K6Q==",
      "license": "Apache-2.0"
    },
    "node_modules/require-from-string": {
      "version": "2.0.2",
      "resolved": "https://registry.npmjs.org/require-from-string/-/require-from-string-2.0.2.tgz",
      "integrity": "sha512-Xf0nWe6RseziFMu+Ap9biiUbmplq6S9/p+7w7YXP/JBHhrUDDUhwa+vANyubuqfZWTveU//DYVGsDG7RKL/vEw==",
      "license": "MIT",
      "engines": {
        "node": ">=0.10.0"
      }
    },
    "node_modules/resolve-pkg-maps": {
      "version": "1.0.0",
      "resolved": "https://registry.npmjs.org/resolve-pkg-maps/-/resolve-pkg-maps-1.0.0.tgz",
      "integrity": "sha512-seS2Tj26TBVOC2NIc2rOe2y2ZO7efxITtLZcGSOnHHNOQ7CkiUBfw0Iw2ck6xkIhPwLhKNLS8BO+hEpngQlqzw==",
      "dev": true,
      "license": "MIT",
      "funding": {
        "url": "https://github.com/privatenumber/resolve-pkg-maps?sponsor=1"
      }
    },
    "node_modules/ret": {
      "version": "0.5.0",
      "resolved": "https://registry.npmjs.org/ret/-/ret-0.5.0.tgz",
      "integrity": "sha512-I1XxrZSQ+oErkRR4jYbAyEEu2I0avBvvMM5JN+6EBprOGRCs63ENqZ3vjavq8fBw2+62G5LF5XelKwuJpcvcxw==",
      "license": "MIT",
      "engines": {
        "node": ">=10"
      }
    },
    "node_modules/reusify": {
      "version": "1.1.0",
      "resolved": "https://registry.npmjs.org/reusify/-/reusify-1.1.0.tgz",
      "integrity": "sha512-g6QUff04oZpHs0eG5p83rFLhHeV00ug/Yf9nZM6fLeUrPguBTkTQOdpAWWspMh55TZfVQDPaN3NQJfbVRAxdIw==",
      "license": "MIT",
      "engines": {
        "iojs": ">=1.0.0",
        "node": ">=0.10.0"
      }
    },
    "node_modules/rfdc": {
      "version": "1.4.1",
      "resolved": "https://registry.npmjs.org/rfdc/-/rfdc-1.4.1.tgz",
      "integrity": "sha512-q1b3N5QkRUWUl7iyylaaj3kOpIT0N2i9MqIEQXP73GVsN9cw3fdx8X63cEmWhJGi2PPCF23Ijp7ktmd39rawIA==",
      "license": "MIT"
    },
    "node_modules/rolldown": {
      "version": "1.2.12",
      "resolved": "https://registry.npmjs.org/rolldown/-/rolldown-1.2.12.tgz",
      "integrity": "sha512-8wafseiaG80xmXSfqidUNqZcylTlhmPZZt+za2m+js2sFZ8dTNlhIOV2WcbIPx2hgwPBJpEUGFAMZ9bgBBLTSQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@oxc-project/types": "=0.152.0",
        "@rolldown/pluginutils": "^1.0.0"
      },
      "bin": {
        "rolldown": "bin/cli.mjs"
      },
      "engines": {
        "node": "^20.19.0 || >=22.12.0"
      },
      "optionalDependencies": {
        "@rolldown/binding-android-arm-eabi": "1.2.12",
        "@rolldown/binding-android-arm64": "1.2.12",
        "@rolldown/binding-darwin-arm64": "1.2.12",
        "@rolldown/binding-darwin-x64": "1.2.12",
        "@rolldown/binding-freebsd-x64": "1.2.12",
        "@rolldown/binding-linux-arm-gnueabihf": "1.2.12",
        "@rolldown/binding-linux-arm64-gnu": "1.2.12",
        "@rolldown/binding-linux-arm64-musl": "1.2.12",
        "@rolldown/binding-linux-ppc64-gnu": "1.2.12",
        "@rolldown/binding-linux-s390x-gnu": "1.2.12",
        "@rolldown/binding-linux-x64-gnu": "1.2.12",
        "@rolldown/binding-linux-x64-musl": "1.2.12",
        "@rolldown/binding-openharmony-arm64": "1.2.12",
        "@rolldown/binding-win32-arm64-msvc": "1.2.12",
        "@rolldown/binding-win32-x64-msvc": "1.2.12"
      }
    },
    "node_modules/safe-regex2": {
      "version": "5.1.1",
      "resolved": "https://registry.npmjs.org/safe-regex2/-/safe-regex2-5.1.1.tgz",
      "integrity": "sha512-mOSBvHGDZMuIEZMdOz/aCEYDCv0E7nfcNsIhUF+/P+xC7Hyf3FkvymqgPbg9D1EdSGu+uKbJgy09K/RKKc7kJA==",
      "funding": [
        {
          "type": "github",
          "url": "https://github.com/sponsors/fastify"
        },
        {
          "type": "opencollective",
          "url": "https://opencollective.com/fastify"
        }
      ],
      "license": "MIT",
      "dependencies": {
        "ret": "~0.5.0"
      },
      "bin": {
        "safe-regex2": "bin/safe-regex2.js"
      }
    },
    "node_modules/safe-stable-stringify": {
      "version": "2.5.0",
      "resolved": "https://registry.npmjs.org/safe-stable-stringify/-/safe-stable-stringify-2.5.0.tgz",
      "integrity": "sha512-b3rppTKm9T+PsVCBEOUR46GWI7fdOs00VKZ1+9c1EWDaDMvjQc6tUwuFyIprgGgTcWoVHSKrU8H31ZHA2e0RHA==",
      "license": "MIT",
      "engines": {
        "node": ">=10"
      }
    },
    "node_modules/scheduler": {
      "version": "0.28.0",
      "resolved": "https://registry.npmjs.org/scheduler/-/scheduler-0.28.0.tgz",
      "integrity": "sha512-juorfCmIkIw8tT+p5BXSm6PJjQF/ycEYmKyzURCIt/RaZIhL+PulbQ9Yu2z1HdOJDdqDTlxA1+xKBmHXJsczAw==",
      "license": "MIT"
    },
    "node_modules/secure-json-parse": {
      "version": "4.1.0",
      "resolved": "https://registry.npmjs.org/secure-json-parse/-/secure-json-parse-4.1.0.tgz",
      "integrity": "sha512-l4KnYfEyqYJxDwlNVyRfO2E4NTHfMKAWdUuA8J0yve2Dz/E/PdBepY03RvyJpssIpRFwJoCD55wA+mEDs6ByWA==",
      "funding": [
        {
          "type": "github",
          "url": "https://github.com/sponsors/fastify"
        },
        {
          "type": "opencollective",
          "url": "https://opencollective.com/fastify"
        }
      ],
      "license": "BSD-3-Clause"
    },
    "node_modules/semver": {
      "version": "7.8.5",
      "resolved": "https://registry.npmjs.org/semver/-/semver-7.8.5.tgz",
      "integrity": "sha512-Y7/KDsb8LjooZpwaqGyulO6DQlksgCncchHGk+sZIY4SBvUocMBEFH5Ur1fI4dV+Jvl0w6cjvucaIi40puRioA==",
      "license": "ISC",
      "bin": {
        "semver": "bin/semver.js"
      },
      "engines": {
        "node": ">=10"
      }
    },
    "node_modules/set-cookie-parser": {
      "version": "2.7.2",
      "resolved": "https://registry.npmjs.org/set-cookie-parser/-/set-cookie-parser-2.7.2.tgz",
      "integrity": "sha512-oeM1lpU/UvhTxw+g3cIfxXHyJRc/uidd3yK1P242gzHds0udQBYzs3y8j4gCCW+ZJ7ad0yctld8RYO+bdurlvw==",
      "license": "MIT"
    },
    "node_modules/setprototypeof": {
      "version": "1.2.0",
      "resolved": "https://registry.npmjs.org/setprototypeof/-/setprototypeof-1.2.0.tgz",
      "integrity": "sha512-E5LDX7Wrp85Kil5bhZv46j8jOeboKq5JMmYM3gVGdGH8xFpPWXUMsNrlODCrkoxMEeNi/XZIwuRvY4XNwYMJpw==",
      "license": "ISC"
    },
    "node_modules/sonic-boom": {
      "version": "4.2.1",
      "resolved": "https://registry.npmjs.org/sonic-boom/-/sonic-boom-4.2.1.tgz",
      "integrity": "sha512-w6AxtubXa2wTXAUsZMMWERrsIRAdrK0Sc+FUytWvYAhBJLyuI4llrMIC1DtlNSdI99EI86KZum2MMq3EAZlF9Q==",
      "license": "MIT",
      "dependencies": {
        "atomic-sleep": "^1.0.0"
      }
    },
    "node_modules/source-map-js": {
      "version": "1.2.2",
      "resolved": "https://registry.npmjs.org/source-map-js/-/source-map-js-1.2.2.tgz",
      "integrity": "sha512-KGj/8Y43x35aZVDtt+J4mK1hoLGHULMYfSkODJNQjNDC3oW1PqPoxMwo0pLUsWM/UEGzON/NxeHywEfNXNP3Vw==",
      "dev": true,
      "license": "BSD-3-Clause",
      "engines": {
        "node": ">=0.10.0"
      }
    },
    "node_modules/split2": {
      "version": "4.2.0",
      "resolved": "https://registry.npmjs.org/split2/-/split2-4.2.0.tgz",
      "integrity": "sha512-UcjcJOWknrNkF6PLX83qcHM6KHgVKNkV62Y8a5uYDVv9ydGQVwAHMKqHdJje1VTWpljG0WYpCDhrCdAOYH4TWg==",
      "license": "ISC",
      "engines": {
        "node": ">= 10.x"
      }
    },
    "node_modules/statuses": {
      "version": "2.0.2",
      "resolved": "https://registry.npmjs.org/statuses/-/statuses-2.0.2.tgz",
      "integrity": "sha512-DvEy55V3DB7uknRo+4iOGT5fP1slR8wQohVdknigZPMpMstaKJQWhwiYBACJE3Ul2pTnATihhBYnRhZQHGBiRw==",
      "license": "MIT",
      "engines": {
        "node": ">= 0.8"
      }
    },
    "node_modules/std-env": {
      "version": "4.3.0",
      "resolved": "https://registry.npmjs.org/std-env/-/std-env-4.3.0.tgz",
      "integrity": "sha512-OtU/EgQ1kIm5KwqQpBC6ZEMXrZRui11w8zgfTWp8cdO9B8OaPsbA8bTHO2P+HNo1VlUTGMVBwPhydu6poeXiag==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/thread-stream": {
      "version": "4.2.0",
      "resolved": "https://registry.npmjs.org/thread-stream/-/thread-stream-4.2.0.tgz",
      "integrity": "sha512-e2zZ96wSChazBsbENf/Pcm/4swHt2cEKQ92rhUjkL9GCKiTDJIaTBenjE/m9DXi0QBmTMDkFDdOomUy20A1tDQ==",
      "license": "MIT",
      "dependencies": {
        "real-require": "^1.0.0"
      },
      "engines": {
        "node": ">=20"
      }
    },
    "node_modules/tinybench": {
      "version": "6.2.0",
      "resolved": "https://registry.npmjs.org/tinybench/-/tinybench-6.2.0.tgz",
      "integrity": "sha512-78U2TlB2CnVenajOFzf3BKSm0J6oz5L0NV7g32LCPccvYc0lbWvys4d3uUUCS2B1N8PAf2+aekR8i1KbC3HO7Q==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=20.0.0"
      }
    },
    "node_modules/tinyexec": {
      "version": "1.3.1",
      "resolved": "https://registry.npmjs.org/tinyexec/-/tinyexec-1.3.1.tgz",
      "integrity": "sha512-GCvB3aoys96IuDFBMcTB46JOR6mdMtAToqwiW8JlWhsoh1mhHi/xn9ss/Dg7N555GiJyEt2qzoG/NHCwM6h1EA==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/tinyglobby": {
      "version": "0.2.17",
      "resolved": "https://registry.npmjs.org/tinyglobby/-/tinyglobby-0.2.17.tgz",
      "integrity": "sha512-wXR/dYpcqKmfWpEdZjiKJOwCNFndD0DMnrW/cYjVGttEkBfVgcLFHoNrlj47mjOVic9yyNu65alsgF4NQyTa2g==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "fdir": "^6.5.0",
        "picomatch": "^4.0.4"
      },
      "engines": {
        "node": ">=12.0.0"
      },
      "funding": {
        "url": "https://github.com/sponsors/SuperchupuDev"
      }
    },
    "node_modules/toad-cache": {
      "version": "3.7.4",
      "resolved": "https://registry.npmjs.org/toad-cache/-/toad-cache-3.7.4.tgz",
      "integrity": "sha512-m1TdR/rvT7kgGJZhspNtXdsdYk0fddFpJJFlG5s+UkPFo6lkLoZ3YLOaovPYjq1R75NP5JfeTlSHaOsE09peCg==",
      "license": "MIT",
      "engines": {
        "node": ">=20"
      }
    },
    "node_modules/toidentifier": {
      "version": "1.0.1",
      "resolved": "https://registry.npmjs.org/toidentifier/-/toidentifier-1.0.1.tgz",
      "integrity": "sha512-o5sSPKEkg/DIQNmH43V0/uerLrpzVedkUh8tGNvaeXpfpuwjKenlSox/2O/BTlZUtEe+JG7s5YhEz608PlAHRA==",
      "license": "MIT",
      "engines": {
        "node": ">=0.6"
      }
    },
    "node_modules/tslib": {
      "version": "2.8.1",
      "resolved": "https://registry.npmjs.org/tslib/-/tslib-2.8.1.tgz",
      "integrity": "sha512-oJFu94HQb+KVduSUQL7wnpmqnfmLsOA/nAh6b6EH0wCEoK0/mPeXU6c3wKDV83MkOuHPRHtSXKKU99IBazS/2w==",
      "license": "0BSD"
    },
    "node_modules/tsx": {
      "version": "4.21.0",
      "resolved": "https://registry.npmjs.org/tsx/-/tsx-4.21.0.tgz",
      "integrity": "sha512-5C1sg4USs1lfG0GFb2RLXsdpXqBSEhAaA/0kPL01wxzpMqLILNxIxIOKiILz+cdg/pLnOUxFYOR5yhHU666wbw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "esbuild": "~0.27.0",
        "get-tsconfig": "^4.7.5"
      },
      "bin": {
        "tsx": "dist/cli.mjs"
      },
      "engines": {
        "node": ">=18.0.0"
      },
      "optionalDependencies": {
        "fsevents": "~2.3.3"
      }
    },
    "node_modules/tsx/node_modules/fsevents": {
      "version": "2.3.3",
      "resolved": "https://registry.npmjs.org/fsevents/-/fsevents-2.3.3.tgz",
      "integrity": "sha512-5xoDfX+fL7faATnagmWPpbFtwh/R77WmMMqqHGS65C3vvB0YHrgF+B1YmZ3441tMj5n63k0212XNoJwzlhffQw==",
      "dev": true,
      "hasInstallScript": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "darwin"
      ],
      "engines": {
        "node": "^8.16.0 || ^10.6.0 || >=11.0.0"
      }
    },
    "node_modules/tsyringe": {
      "version": "4.10.0",
      "resolved": "https://registry.npmjs.org/tsyringe/-/tsyringe-4.10.0.tgz",
      "integrity": "sha512-axr3IdNuVIxnaK5XGEUFTu3YmAQ6lllgrvqfEoR16g/HGnYY/6We4oWENtAnzK6/LpJ2ur9PAb80RBt7/U4ugw==",
      "license": "MIT",
      "dependencies": {
        "tslib": "^1.9.3"
      },
      "engines": {
        "node": ">= 6.0.0"
      }
    },
    "node_modules/tsyringe/node_modules/tslib": {
      "version": "1.14.1",
      "resolved": "https://registry.npmjs.org/tslib/-/tslib-1.14.1.tgz",
      "integrity": "sha512-Xni35NKzjgMrwevysHTCArtLDpPvye8zV/0E4EyYn43P7/7qvQwPh9BGkHewbMulVntbigmcT7rdX3BNo9wRJg==",
      "license": "0BSD"
    },
    "node_modules/typescript": {
      "version": "5.9.3",
      "resolved": "https://registry.npmjs.org/typescript/-/typescript-5.9.3.tgz",
      "integrity": "sha512-jl1vZzPDinLr9eUt3J/t7V6FgNEw9QjvBPdysz9KfQDD41fQrC2Y4vKQdiaUpFT4bXlb1RHhLpp8wtm6M5TgSw==",
      "dev": true,
      "license": "Apache-2.0",
      "bin": {
        "tsc": "bin/tsc",
        "tsserver": "bin/tsserver"
      },
      "engines": {
        "node": ">=14.17"
      }
    },
    "node_modules/undici-types": {
      "version": "7.16.0",
      "resolved": "https://registry.npmjs.org/undici-types/-/undici-types-7.16.0.tgz",
      "integrity": "sha512-Zz+aZWSj8LE6zoxD+xrjh4VfkIG8Ya6LvYkZqtUQGJPZjYl53ypCaUwWqo7eI0x66KBGeRo+mlBEkMSeSZ38Nw==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/vite": {
      "version": "8.3.2",
      "resolved": "https://registry.npmjs.org/vite/-/vite-8.3.2.tgz",
      "integrity": "sha512-SQr1x6W5vVSbROg7vsyXIaxK9b0G7zsT68acdWWRmnBUsgDieLCRG+Rep9WdZgcposvv/GSnr4GUUBqB3vXq6w==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "lightningcss": "^1.33.0",
        "picomatch": "^4.0.7",
        "postcss": "^8.5.28",
        "rolldown": "~1.2.11",
        "tinyglobby": "^0.2.17"
      },
      "bin": {
        "vite": "bin/vite.js"
      },
      "engines": {
        "node": "^20.19.0 || >=22.12.0"
      },
      "funding": {
        "url": "https://github.com/vitejs/vite?sponsor=1"
      },
      "optionalDependencies": {
        "fsevents": "~2.3.3"
      },
      "peerDependencies": {
        "@types/node": "^20.19.0 || >=22.12.0",
        "@vitejs/devtools": "^0.7.1",
        "esbuild": "^0.27.0 || ^0.28.0",
        "jiti": ">=1.21.0",
        "less": "^4.0.0",
        "sass": "^1.70.0",
        "sass-embedded": "^1.70.0",
        "stylus": ">=0.54.8",
        "sugarss": "^5.0.0",
        "terser": "^5.16.0",
        "tsx": "^4.8.1",
        "yaml": "^2.4.2"
      },
      "peerDependenciesMeta": {
        "@types/node": {
          "optional": true
        },
        "@vitejs/devtools": {
          "optional": true
        },
        "esbuild": {
          "optional": true
        },
        "jiti": {
          "optional": true
        },
        "less": {
          "optional": true
        },
        "sass": {
          "optional": true
        },
        "sass-embedded": {
          "optional": true
        },
        "stylus": {
          "optional": true
        },
        "sugarss": {
          "optional": true
        },
        "terser": {
          "optional": true
        },
        "tsx": {
          "optional": true
        },
        "yaml": {
          "optional": true
        }
      }
    },
    "node_modules/vite/node_modules/fsevents": {
      "version": "2.3.3",
      "resolved": "https://registry.npmjs.org/fsevents/-/fsevents-2.3.3.tgz",
      "integrity": "sha512-5xoDfX+fL7faATnagmWPpbFtwh/R77WmMMqqHGS65C3vvB0YHrgF+B1YmZ3441tMj5n63k0212XNoJwzlhffQw==",
      "dev": true,
      "hasInstallScript": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "darwin"
      ],
      "engines": {
        "node": "^8.16.0 || ^10.6.0 || >=11.0.0"
      }
    },
    "node_modules/vitest": {
      "version": "5.0.3",
      "resolved": "https://registry.npmjs.org/vitest/-/vitest-5.0.3.tgz",
      "integrity": "sha512-xMw97S3rjdtj5dkVat7jCsqWBpvchs3RlpQctUqwJD0KkERk40vz2fJ77lDwW/Vzh/pk18eItYAzkodhSes3jQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@types/chai": "^5.2.2",
        "@vitest/mocker": "5.0.3",
        "chai": "^6.2.2",
        "es-module-lexer": "^2.3.2",
        "expect-type": "^1.4.0",
        "magic-string": "^1.2.3",
        "obug": "^2.1.4",
        "picomatch": "^4.0.7",
        "std-env": "^4.2.0",
        "tinybench": "^6.1.4",
        "tinyexec": "^1.3.0",
        "tinyglobby": "^0.2.17",
        "why-is-node-running": "3.2.1"
      },
      "bin": {
        "vitest": "vitest.mjs"
      },
      "engines": {
        "node": "^22.12.0 || ^24.0.0 || >=26.0.0"
      },
      "funding": {
        "url": "https://opencollective.com/vitest"
      },
      "peerDependencies": {
        "@edge-runtime/vm": "*",
        "@opentelemetry/api": "^1.9.0",
        "@types/node": "^22.0.0 || >=24.0.0",
        "@vitest/browser-playwright": "5.0.3",
        "@vitest/browser-preview": "5.0.3",
        "@vitest/browser-webdriverio": "^5.0.0-beta.5 || >=5.0.0",
        "@vitest/coverage-istanbul": "5.0.3",
        "@vitest/coverage-v8": "5.0.3",
        "@vitest/ui": "5.0.3",
        "happy-dom": "*",
        "jsdom": "*",
        "vite": "^6.4.0 || ^7.0.0 || ^8.0.0"
      },
      "peerDependenciesMeta": {
        "@edge-runtime/vm": {
          "optional": true
        },
        "@opentelemetry/api": {
          "optional": true
        },
        "@types/node": {
          "optional": true
        },
        "@vitest/browser-playwright": {
          "optional": true
        },
        "@vitest/browser-preview": {
          "optional": true
        },
        "@vitest/browser-webdriverio": {
          "optional": true
        },
        "@vitest/coverage-istanbul": {
          "optional": true
        },
        "@vitest/coverage-v8": {
          "optional": true
        },
        "@vitest/ui": {
          "optional": true
        },
        "happy-dom": {
          "optional": true
        },
        "jsdom": {
          "optional": true
        },
        "vite": {
          "optional": false
        }
      }
    },
    "node_modules/why-is-node-running": {
      "version": "3.2.1",
      "resolved": "https://registry.npmjs.org/why-is-node-running/-/why-is-node-running-3.2.1.tgz",
      "integrity": "sha512-Tb2FUhB4vUsGQlfSquQLYkApkuPAFQXGFzxWKHHumVz2dK+X1RUm/HnID4+TfIGYJ1kTcwOaCk/buYCEJr6YjQ==",
      "dev": true,
      "license": "MIT",
      "bin": {
        "why-is-node-running": "cli.js"
      },
      "engines": {
        "node": ">=20.11"
      }
    },
    "node_modules/xtend": {
      "version": "4.0.2",
      "resolved": "https://registry.npmjs.org/xtend/-/xtend-4.0.2.tgz",
      "integrity": "sha512-LKYU1iAXJXUgAXn9URjiu+MWhyUXHsvfp7mcuYm9dSUKK0/CjtrUwFAxD82/mCWbtLsGjFIad0wIsod4zrTAEQ==",
      "license": "MIT",
      "engines": {
        "node": ">=0.4"
      }
    },
    "node_modules/yaml": {
      "version": "2.9.1",
      "resolved": "https://registry.npmjs.org/yaml/-/yaml-2.9.1.tgz",
      "integrity": "sha512-3NxN8+78OdzbT7C/WjGsyfPAtJaN3FNDsWxv7Y7mcDsT/oOmgW8BpyQQFFBnvZE3j9Y2Sdz1ULFLezL7Eb2yFw==",
      "license": "ISC",
      "bin": {
        "yaml": "bin.mjs"
      },
      "engines": {
        "node": ">= 14.6"
      },
      "funding": {
        "url": "https://github.com/sponsors/eemeli"
      }
    },
    "node_modules/zod": {
      "version": "4.1.13",
      "resolved": "https://registry.npmjs.org/zod/-/zod-4.1.13.tgz",
      "integrity": "sha512-AvvthqfqrAhNH9dnfmrfKzX5upOdjUVJYFqNSlkmGf64gRaTzlPwz99IHYnVs28qYAybvAlBV+H7pn0saFY4Ig==",
      "license": "MIT",
      "funding": {
        "url": "https://github.com/sponsors/colinhacks"
      }
    },
    "node_modules/zxcvbn": {
      "version": "4.4.2",
      "resolved": "https://registry.npmjs.org/zxcvbn/-/zxcvbn-4.4.2.tgz",
      "integrity": "sha512-Bq0B+ixT/DMyG8kgX2xWcI5jUvCwqrMxSFam7m0lAf78nf04hv6lNCsyLYdyYTrCVMqNDY/206K7eExYCeSyUQ==",
      "license": "MIT"
    }
  }
}
````

## package.json

Full creation path: `/workspace/scratch/ef7b82d54654/sentinel-vault/package.json`

Defines project configuration, pinned dependencies, licensing or automated repository checks.  
Included in full so the repository can be built and reviewed independently.

````json
{
  "name": "sentinel-vault",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "description": "Self-hosted client-encrypted password vault with passkeys, encrypted sharing and offline clients",
  "license": "MIT",
  "engines": {
    "node": ">=24.19.0"
  },
  "scripts": {
    "dev": "vite --config apps/web/vite.config.ts --host 127.0.0.1",
    "dev:api": "node --env-file=.env --import tsx apps/api/src/main.ts",
    "build": "node scripts/build.mjs",
    "check": "tsc --noEmit",
    "test": "vitest run",
    "test:e2e": "playwright test",
    "setup": "node scripts/setup.mjs",
    "docs:source": "python scripts/source-book.py",
    "package": "python scripts/package.py",
    "format": "prettier --write apps packages extensions tests scripts *.ts *.json *.yml deploy"
  },
  "dependencies": {
    "@fastify/cookie": "11.0.2",
    "@fastify/helmet": "13.0.2",
    "@fastify/static": "10.1.5",
    "@fastify/swagger": "9.5.1",
    "@scure/bip39": "2.4.0",
    "@simplewebauthn/browser": "14.0.0",
    "@simplewebauthn/server": "14.0.3",
    "argon2-browser": "1.18.0",
    "fastify": "5.12.5",
    "libsodium-wrappers-sumo": "0.8.4",
    "otpauth": "9.4.1",
    "papaparse": "5.5.3",
    "pg": "8.16.3",
    "react": "19.3.0",
    "react-dom": "19.3.0",
    "zod": "4.1.13",
    "zxcvbn": "4.4.2"
  },
  "devDependencies": {
    "@electric-sql/pglite": "0.5.8",
    "@playwright/test": "1.58.2",
    "@types/argon2-browser": "1.18.4",
    "@types/node": "24.10.1",
    "@types/papaparse": "5.5.1",
    "@types/pg": "8.15.6",
    "@types/react": "19.2.7",
    "@types/react-dom": "19.2.3",
    "@types/zxcvbn": "4.4.5",
    "esbuild": "0.27.2",
    "prettier": "3.9.9",
    "tsx": "4.21.0",
    "typescript": "5.9.3",
    "vite": "8.3.2",
    "vitest": "5.0.3"
  }
}
````

## packages/crypto/analyze.ts

Full creation path: `/workspace/scratch/ef7b82d54654/sentinel-vault/packages/crypto/analyze.ts`

Implements a local cryptographic operation using native or library primitives.  
Documents key purpose, input limits and mutable-buffer cleanup at the call boundary.

````typescript
import zxcvbn from "zxcvbn";
export interface Analysis {
  score: number;
  shannonBitsPerCharacter: number;
  empiricalBits: number;
  log10Guesses: number;
  patterns: string[];
  suggestions: string[];
  offlineGpuSeconds: number;
  offlineDictionarySeconds: number;
}
export function analyze(password: string): Analysis {
  if (password.length > 4096)
    throw new Error("Password analysis input is too large.");
  const characters = Array.from(password),
    counts = new Map<string, number>();
  for (const c of characters) counts.set(c, (counts.get(c) || 0) + 1);
  // Empirical Shannon H = -sum(p_i log2 p_i). This is a character-frequency statistic, NOT the entropy of a human's selection process.
  let h = 0;
  for (const n of counts.values()) {
    const p = n / characters.length;
    h -= p * Math.log2(p);
  }
  // Bound the pattern matcher to the first 256 code units to avoid pathological local CPU use; statistics still cover the entire input.
  const result = zxcvbn(password.slice(0, 256)),
    patterns = new Set<string>();
  for (const match of result.sequence as any[]) {
    if (match.pattern === "spatial") patterns.add("Keyboard walk");
    if (match.pattern === "repeat") patterns.add("Repeated sequence");
    if (match.pattern === "sequence") patterns.add("Predictable sequence");
    if (match.pattern === "dictionary")
      patterns.add(
        match.l33t
          ? "Dictionary word with leetspeak"
          : "Dictionary/common password",
      );
    if (match.pattern === "date") patterns.add("Date pattern");
  }
  const suggestions = [...result.feedback.suggestions];
  if (result.feedback.warning) suggestions.unshift(result.feedback.warning);
  if (!suggestions.length)
    suggestions.push(
      "Use a unique, randomly generated password or passphrase.",
    );
  // Illustrative model assumptions, not a guarantee: actual cost depends on the target's hash/KDF and attacker hardware.
  return {
    score: result.score,
    shannonBitsPerCharacter: h,
    empiricalBits: h * characters.length,
    log10Guesses: result.guesses_log10,
    patterns: [...patterns],
    suggestions,
    offlineGpuSeconds: result.guesses / 1e10,
    offlineDictionarySeconds: result.guesses / 1e8,
  };
}
````

## packages/crypto/breach.ts

Full creation path: `/workspace/scratch/ef7b82d54654/sentinel-vault/packages/crypto/breach.ts`

Implements a local cryptographic operation using native or library primitives.  
Documents key purpose, input limits and mutable-buffer cleanup at the call boundary.

````typescript
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
````

## packages/crypto/browser-kdf.ts

Full creation path: `/workspace/scratch/ef7b82d54654/sentinel-vault/packages/crypto/browser-kdf.ts`

Implements a local cryptographic operation using native or library primitives.  
Documents key purpose, input limits and mutable-buffer cleanup at the call boundary.

````typescript
import type { ArgonKdf } from "./vault";
export function browserKdf(workerUrl: string): ArgonKdf {
  return (password, salt) =>
    new Promise((resolve, reject) => {
      const worker = new Worker(workerUrl),
        pass = new Uint8Array(password),
        nonce = new Uint8Array(salt);
      const finish = () => {
        clearTimeout(timer);
        worker.terminate();
        if (pass.byteLength) pass.fill(0);
        if (nonce.byteLength) nonce.fill(0);
      };
      const timer = setTimeout(() => {
        finish();
        reject(new Error("Key derivation timed out."));
      }, 120000);
      worker.onerror = () => {
        finish();
        reject(new Error("Key derivation unavailable."));
      };
      worker.onmessage = (event) => {
        const output = event.data?.output;
        finish();
        if (output instanceof Uint8Array && output.length === 32)
          resolve(output);
        else reject(new Error("Key derivation failed."));
      };
      // Copy before transfer: the main crypto worker remains responsible for wiping its original buffers.
      worker.postMessage({ password: pass, salt: nonce }, [
        pass.buffer,
        nonce.buffer,
      ]);
    });
}
````

## packages/crypto/bytes.ts

Full creation path: `/workspace/scratch/ef7b82d54654/sentinel-vault/packages/crypto/bytes.ts`

Implements a local cryptographic operation using native or library primitives.  
Documents key purpose, input limits and mutable-buffer cleanup at the call boundary.

````typescript
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
````

## packages/crypto/generator.ts

Full creation path: `/workspace/scratch/ef7b82d54654/sentinel-vault/packages/crypto/generator.ts`

Implements a local cryptographic operation using native or library primitives.  
Documents key purpose, input limits and mutable-buffer cleanup at the call boundary.

````typescript
import { wordlist } from "@scure/bip39/wordlists/english.js";
import { random } from "./bytes";
function choose(length: number): number {
  // Rejection sampling removes modulo bias. This is random selection, not a new cryptographic primitive.
  const limit = Math.floor(4294967296 / length) * length;
  let value: number;
  do {
    const bytes = random(4);
    value = new DataView(bytes.buffer).getUint32(0);
    bytes.fill(0);
  } while (value >= limit);
  return value % length;
}
export function generate(options: {
  mode: "password" | "passphrase";
  length: number;
  lower?: boolean;
  upper?: boolean;
  digits?: boolean;
  symbols?: boolean;
}) {
  if (options.mode === "passphrase") {
    if (
      !Number.isInteger(options.length) ||
      options.length < 4 ||
      options.length > 16
    )
      throw new Error("Choose 4–16 words.");
    return {
      text: Array.from(
        { length: options.length },
        () => wordlist[choose(wordlist.length)],
      ).join("-"),
      entropyBits: options.length * Math.log2(wordlist.length),
    };
  }
  if (
    options.mode !== "password" ||
    !Number.isInteger(options.length) ||
    options.length < 8 ||
    options.length > 128
  )
    throw new Error("Choose 8–128 characters.");
  const groups = [
      options.lower ? "abcdefghijklmnopqrstuvwxyz" : "",
      options.upper ? "ABCDEFGHIJKLMNOPQRSTUVWXYZ" : "",
      options.digits ? "0123456789" : "",
      options.symbols ? "!@#$%^&*()-_=+[]{};:,.?" : "",
    ].filter(Boolean),
    alphabet = groups.join("");
  if (!alphabet) throw new Error("Select at least one character group.");
  for (let attempt = 0; attempt < 1000; attempt++) {
    const text = Array.from(
      { length: options.length },
      () => alphabet[choose(alphabet.length)],
    ).join("");
    // Whole-output rejection keeps selection uniform among strings containing all chosen groups.
    if (groups.every((g) => Array.from(text).some((c) => g.includes(c))))
      return {
        text,
        entropyBits: Math.floor(
          (options.length - groups.length) * Math.log2(alphabet.length),
        ),
      };
  }
  throw new Error("Unable to satisfy the generator options.");
}
````

## packages/crypto/history.ts

Full creation path: `/workspace/scratch/ef7b82d54654/sentinel-vault/packages/crypto/history.ts`

Implements a local cryptographic operation using native or library primitives.  
Documents key purpose, input limits and mutable-buffer cleanup at the call boundary.

````typescript
import sodium from "libsodium-wrappers-sumo";
import { ItemSchema, type VaultItem } from "../shared/schema";
import { utf8, wipe } from "./bytes";
export async function prepareRevision(
  input: VaultItem,
  previous?: VaultItem,
  now = new Date().toISOString(),
): Promise<VaultItem> {
  const value = ItemSchema.parse(input);
  value.updatedAt = now;
  if (!previous) {
    value.createdAt = now;
    value.passwordChangedAt = now;
    value.history = [];
    return value;
  }
  await sodium.ready;
  const a = utf8(previous.password),
    b = utf8(value.password);
  let same: boolean;
  try {
    same = a.length === b.length && sodium.memcmp(a, b);
  } finally {
    wipe(a, b);
  }
  value.createdAt = previous.createdAt;
  value.passwordChangedAt = same ? previous.passwordChangedAt : now;
  value.history = same
    ? previous.history
    : [
        { password: previous.password, changedAt: previous.passwordChangedAt },
        ...previous.history,
      ].slice(0, 5);
  return ItemSchema.parse(value);
}
````

## packages/crypto/vault.ts

Full creation path: `/workspace/scratch/ef7b82d54654/sentinel-vault/packages/crypto/vault.ts`

Implements a local cryptographic operation using native or library primitives.  
Documents key purpose, input limits and mutable-buffer cleanup at the call boundary.

````typescript
import sodium from "libsodium-wrappers-sumo";
import {
  EnvelopeSchema,
  IdentitySchema,
  ItemSchema,
  ProfileSchema,
  ShareSchema,
  type Envelope,
  type Identity,
  type Profile,
  type Share,
  type VaultItem,
} from "../shared/schema";
import { buffer, context, fromB64, random, toB64, utf8, wipe } from "./bytes";

export type ArgonKdf = (
  password: Uint8Array,
  salt: Uint8Array,
) => Promise<Uint8Array>;
const WRAP_CONTEXT = "SENTINEL-VAULT/v1/master-wrap/";
async function wrappingKey(
  password: Uint8Array,
  saltText: string,
  vaultId: string,
  kdf: ArgonKdf,
): Promise<CryptoKey> {
  const salt = fromB64(saltText, 16);
  let root: Uint8Array | undefined;
  try {
    // Argon2id's cost is fixed by the validated format; HKDF separates the encryption purpose from any future key use.
    root = await kdf(password, salt);
    if (root.length !== 32) throw new Error("Invalid KDF output.");
    const input = await crypto.subtle.importKey(
      "raw",
      buffer(root),
      "HKDF",
      false,
      ["deriveKey"],
    );
    return await crypto.subtle.deriveKey(
      {
        name: "HKDF",
        hash: "SHA-256",
        salt: buffer(salt),
        info: utf8(WRAP_CONTEXT + vaultId),
      },
      input,
      { name: "AES-KW", length: 256 },
      false,
      ["wrapKey", "unwrapKey"],
    );
  } finally {
    wipe(password, salt, root);
  }
}
async function unwrapVault(
  profile: Profile,
  password: Uint8Array,
  kdf: ArgonKdf,
  extractable = false,
): Promise<CryptoKey> {
  const wrap = await wrappingKey(
    password,
    profile.kdf.salt,
    profile.vaultId,
    kdf,
  );
  const encoded = fromB64(profile.wrappedVaultKey, 40);
  try {
    return await crypto.subtle.unwrapKey(
      "raw",
      buffer(encoded),
      wrap,
      "AES-KW",
      { name: "AES-KW", length: 256 },
      extractable,
      ["wrapKey", "unwrapKey"],
    );
  } finally {
    wipe(encoded);
  }
}
async function sealValue(
  vault: CryptoKey,
  vaultId: string,
  id: string,
  revision: number,
  value: unknown,
): Promise<Envelope> {
  const plaintext = utf8(JSON.stringify(value)),
    raw = random(32),
    iv = random(12);
  try {
    if (plaintext.length > 90000) throw new Error("Item is too large.");
    // A new key for EVERY revision makes the GCM key single-use. AES-KW has no application nonce to accidentally reuse.
    const key = await crypto.subtle.importKey("raw", raw, "AES-GCM", true, [
      "encrypt",
    ]);
    const ciphertext = await crypto.subtle.encrypt(
      {
        name: "AES-GCM",
        iv,
        additionalData: context(vaultId, id, revision),
        tagLength: 128,
      },
      key,
      plaintext,
    );
    const wrapped = await crypto.subtle.wrapKey("raw", key, vault, "AES-KW");
    return EnvelopeSchema.parse({
      version: 1,
      vaultId,
      id,
      revision,
      iv: toB64(iv),
      wrappedKey: toB64(new Uint8Array(wrapped)),
      ciphertext: toB64(new Uint8Array(ciphertext)),
    });
  } finally {
    wipe(raw, iv, plaintext);
  }
}
async function openValue(vault: CryptoKey, input: Envelope): Promise<unknown> {
  const e = EnvelopeSchema.parse(input),
    wrapped = fromB64(e.wrappedKey, 40),
    ciphertext = fromB64(e.ciphertext),
    iv = fromB64(e.iv, 12);
  let plain: Uint8Array | undefined;
  try {
    const key = await crypto.subtle.unwrapKey(
      "raw",
      buffer(wrapped),
      vault,
      "AES-KW",
      { name: "AES-GCM", length: 256 },
      false,
      ["decrypt"],
    );
    plain = new Uint8Array(
      await crypto.subtle.decrypt(
        {
          name: "AES-GCM",
          iv: buffer(iv),
          additionalData: context(e.vaultId, e.id, e.revision),
          tagLength: 128,
        },
        key,
        buffer(ciphertext),
      ),
    );
    return JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(plain));
  } finally {
    wipe(wrapped, ciphertext, iv, plain);
  }
}
export class VaultCrypto {
  private key?: CryptoKey;
  private identity?: Identity;
  private privateKey?: Uint8Array;
  private profile?: Profile;
  constructor(private readonly kdf: ArgonKdf) {}
  get unlocked() {
    return !!this.key;
  }
  lock() {
    wipe(this.privateKey);
    this.privateKey = undefined;
    this.identity = undefined;
    this.key = undefined;
    this.profile = undefined;
  }
  private ready() {
    if (!this.key || !this.profile || !this.identity || !this.privateKey)
      throw new Error("Vault is locked.");
    return {
      key: this.key,
      profile: this.profile,
      identity: this.identity,
      privateKey: this.privateKey,
    };
  }
  async create(vaultId: string, password: Uint8Array): Promise<Profile> {
    await sodium.ready;
    this.lock();
    const raw = random(32),
      pair = sodium.crypto_box_keypair(),
      salt = toB64(random(16));
    try {
      const wrap = await wrappingKey(password, salt, vaultId, this.kdf);
      const vault = await crypto.subtle.importKey("raw", raw, "AES-KW", true, [
        "wrapKey",
        "unwrapKey",
      ]);
      const wrapped = await crypto.subtle.wrapKey("raw", vault, wrap, "AES-KW");
      const identity: Identity = {
        version: 1,
        secretKey: toB64(pair.privateKey),
        contacts: [],
      };
      const profile: Profile = {
        version: 1,
        vaultId,
        kdf: {
          algorithm: "argon2id",
          version: 19,
          memoryKiB: 65536,
          iterations: 3,
          parallelism: 4,
          salt,
        },
        wrappedVaultKey: toB64(new Uint8Array(wrapped)),
        publicKey: toB64(pair.publicKey),
        identity: await sealValue(vault, vaultId, vaultId, 1, identity),
      };
      this.key = await crypto.subtle.importKey("raw", raw, "AES-KW", false, [
        "wrapKey",
        "unwrapKey",
      ]);
      this.profile = ProfileSchema.parse(profile);
      this.identity = identity;
      this.privateKey = new Uint8Array(pair.privateKey);
      return profile;
    } catch {
      this.lock();
      throw new Error("Vault creation failed.");
    } finally {
      wipe(password, raw, pair.privateKey);
    }
  }
  async unlock(input: Profile, password: Uint8Array): Promise<void> {
    await sodium.ready;
    this.lock();
    try {
      const profile = ProfileSchema.parse(input),
        key = await unwrapVault(profile, password, this.kdf);
      const identity = IdentitySchema.parse(
        await openValue(key, profile.identity),
      );
      const privateKey = fromB64(identity.secretKey, 32),
        expected = fromB64(profile.publicKey, 32),
        actual = sodium.crypto_scalarmult_base(privateKey);
      // Sodium's constant-time comparison verifies that the public directory key matches the encrypted identity.
      if (!sodium.memcmp(actual, expected)) {
        wipe(privateKey, actual, expected);
        throw new Error();
      }
      wipe(actual, expected);
      this.key = key;
      this.identity = identity;
      this.privateKey = privateKey;
      this.profile = profile;
    } catch {
      this.lock();
      throw new Error(
        "Unable to unlock. Check the password and vault integrity.",
      );
    } finally {
      wipe(password);
    }
  }
  async seal(
    id: string,
    revision: number,
    value: VaultItem,
  ): Promise<Envelope> {
    const { key, profile } = this.ready();
    if (id === profile.vaultId) throw new Error("Reserved item identifier.");
    return sealValue(
      key,
      profile.vaultId,
      id,
      revision,
      ItemSchema.parse(value),
    );
  }
  async open(input: Envelope): Promise<VaultItem> {
    const { key, profile } = this.ready();
    if (input.vaultId !== profile.vaultId || input.id === profile.vaultId)
      throw new Error("Invalid item context.");
    try {
      return ItemSchema.parse(await openValue(key, input));
    } catch {
      throw new Error("Item integrity verification failed.");
    }
  }
  async changePassword(
    oldPassword: Uint8Array,
    newPassword: Uint8Array,
  ): Promise<Profile> {
    const { profile } = this.ready();
    try {
      // Reauthenticate locally and rewrap only the random vault key; item ciphertext and sharing identities stay stable.
      const vault = await unwrapVault(profile, oldPassword, this.kdf, true),
        salt = toB64(random(16));
      const wrap = await wrappingKey(
        newPassword,
        salt,
        profile.vaultId,
        this.kdf,
      );
      const wrapped = await crypto.subtle.wrapKey("raw", vault, wrap, "AES-KW");
      return ProfileSchema.parse({
        ...profile,
        kdf: { ...profile.kdf, salt },
        wrappedVaultKey: toB64(new Uint8Array(wrapped)),
      });
    } finally {
      wipe(oldPassword, newPassword);
    }
  }
  contacts() {
    return this.ready().identity.contacts.map((c) => ({ ...c }));
  }
  async refreshProfile(input: Profile) {
    const { key, profile } = this.ready(),
      next = ProfileSchema.parse(input);
    if (
      next.vaultId !== profile.vaultId ||
      next.publicKey !== profile.publicKey
    )
      throw new Error("Identity changed. Lock and verify before continuing.");
    const identity = IdentitySchema.parse(await openValue(key, next.identity));
    const secret = fromB64(identity.secretKey, 32);
    try {
      if (!sodium.memcmp(secret, this.privateKey!))
        throw new Error("Identity changed.");
    } finally {
      wipe(secret);
    }
    this.identity = identity;
    this.profile = next;
  }
  async trustContact(
    userId: string,
    publicKey: string,
    label: string,
  ): Promise<Profile> {
    const { key, profile, identity } = this.ready();
    fromB64(publicKey, 32).fill(0);
    const existing = identity.contacts.find((c) => c.userId === userId);
    if (existing && existing.publicKey !== publicKey)
      throw new Error(
        "Recipient key changed. Verify independently before replacing trust.",
      );
    const next = IdentitySchema.parse({
      ...identity,
      contacts: [
        ...identity.contacts.filter((c) => c.userId !== userId),
        { userId, publicKey, label },
      ],
    });
    const result = ProfileSchema.parse({
      ...profile,
      identity: await sealValue(
        key,
        profile.vaultId,
        profile.vaultId,
        profile.identity.revision + 1,
        next,
      ),
    });
    this.identity = next;
    this.profile = result;
    return result;
  }
  async share(
    input: Envelope,
    recipientId: string,
    recipientPublicKey: string,
  ): Promise<Share> {
    const { key, profile, privateKey, identity } = this.ready();
    const contact = identity.contacts.find((c) => c.userId === recipientId);
    if (!contact || contact.publicKey !== recipientPublicKey)
      throw new Error("Verify the recipient fingerprint first.");
    const item = await this.open(input);
    item.history = [];
    // Sharing uses a separate snapshot key: disclosure does not expose the owner's original key or password history.
    const record = await sealValue(
      key,
      profile.vaultId,
      input.id,
      input.revision,
      item,
    );
    const wrapped = fromB64(record.wrappedKey, 40),
      recipient = fromB64(recipientPublicKey, 32),
      nonce = random(24);
    let raw: Uint8Array | undefined,
      binding: Uint8Array | undefined,
      message: Uint8Array | undefined;
    try {
      const itemKey = await crypto.subtle.unwrapKey(
        "raw",
        buffer(wrapped),
        key,
        "AES-KW",
        { name: "AES-GCM", length: 256 },
        true,
        ["decrypt"],
      );
      raw = new Uint8Array(await crypto.subtle.exportKey("raw", itemKey));
      binding = new Uint8Array(
        await crypto.subtle.digest(
          "SHA-256",
          context(record.vaultId, record.id, record.revision),
        ),
      );
      message = new Uint8Array(64);
      message.set(raw);
      message.set(binding, 32);
      const box = sodium.crypto_box_easy(message, nonce, recipient, privateKey);
      return ShareSchema.parse({
        version: 1,
        senderPublicKey: profile.publicKey,
        recipientPublicKey,
        nonce: toB64(nonce),
        box: toB64(box),
        record,
      });
    } finally {
      wipe(wrapped, recipient, nonce, raw, binding, message);
    }
  }
  async openShare(input: Share, senderId: string): Promise<VaultItem> {
    const { profile, privateKey, identity } = this.ready(),
      e = ShareSchema.parse(input);
    const contact = identity.contacts.find((c) => c.userId === senderId);
    if (
      !contact ||
      contact.publicKey !== e.senderPublicKey ||
      e.recipientPublicKey !== profile.publicKey
    )
      throw new Error("Verify the sender fingerprint first.");
    const sender = fromB64(e.senderPublicKey, 32),
      nonce = fromB64(e.nonce, 24),
      box = fromB64(e.box, 80);
    let message: Uint8Array | undefined,
      binding: Uint8Array | undefined,
      plaintext: Uint8Array | undefined;
    try {
      message = sodium.crypto_box_open_easy(box, nonce, sender, privateKey);
      binding = new Uint8Array(
        await crypto.subtle.digest(
          "SHA-256",
          context(e.record.vaultId, e.record.id, e.record.revision),
        ),
      );
      if (
        message.length !== 64 ||
        !sodium.memcmp(message.subarray(32), binding)
      )
        throw new Error();
      const itemKey = await crypto.subtle.importKey(
        "raw",
        buffer(message.subarray(0, 32)),
        "AES-GCM",
        false,
        ["decrypt"],
      );
      plaintext = new Uint8Array(
        await crypto.subtle.decrypt(
          {
            name: "AES-GCM",
            iv: buffer(fromB64(e.record.iv, 12)),
            additionalData: context(
              e.record.vaultId,
              e.record.id,
              e.record.revision,
            ),
            tagLength: 128,
          },
          itemKey,
          buffer(fromB64(e.record.ciphertext)),
        ),
      );
      return ItemSchema.parse(
        JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(plaintext)),
      );
    } catch {
      throw new Error("Shared item integrity verification failed.");
    } finally {
      wipe(sender, nonce, box, message, binding, plaintext);
    }
  }
}
export async function fingerprint(publicKey: string) {
  const raw = fromB64(publicKey, 32);
  try {
    const digest = new Uint8Array(
      await crypto.subtle.digest("SHA-256", buffer(raw)),
    );
    return Array.from(digest, (b) => b.toString(16).padStart(2, "0"))
      .join("")
      .match(/.{1,4}/g)!
      .join(" ");
  } finally {
    wipe(raw);
  }
}
````

## packages/shared/import-csv.ts

Full creation path: `/workspace/scratch/ef7b82d54654/sentinel-vault/packages/shared/import-csv.ts`

Defines shared format validation or local CSV interoperability.  
Keeps format bounds consistent between clients and the encrypted API.

````typescript
import Papa from "papaparse";
import { ItemSchema, type VaultItem } from "./schema";
export function importCsv(text: string): {
  items: VaultItem[];
  skipped: number;
} {
  if (new TextEncoder().encode(text).length > 2097152)
    throw new Error("CSV imports are limited to 2 MiB.");
  const parsed = Papa.parse<Record<string, string>>(text, {
    header: true,
    skipEmptyLines: "greedy",
    transformHeader: (h) =>
      h
        .replace(/^\uFEFF/, "")
        .trim()
        .toLowerCase(),
  });
  if (
    parsed.errors.length ||
    !parsed.meta.fields?.length ||
    Object.keys((parsed.meta as any).renamedHeaders || {}).length
  )
    throw new Error("Malformed or ambiguous CSV.");
  if (parsed.data.length > 1000) throw new Error("Import at most 1000 rows.");
  const recognized = parsed.meta.fields.some((h) =>
    ["password", "login_password"].includes(h),
  );
  if (!recognized)
    throw new Error("Use a login CSV from Bitwarden, LastPass or 1Password.");
  const items: VaultItem[] = [];
  let skipped = 0;
  const now = new Date().toISOString();
  const mapped = new Set([
    "name",
    "title",
    "username",
    "login_username",
    "password",
    "login_password",
    "url",
    "website",
    "login_uri",
    "notes",
    "extra",
    "folder",
    "grouping",
    "tags",
    "favorite",
    "favourite",
    "fav",
    "type",
  ]);
  for (const [index, row] of parsed.data.entries()) {
    const type = (row.type || "login").toLowerCase();
    if (!["login", "password", "1", ""].includes(type)) {
      skipped++;
      continue;
    }
    const pick = (...keys: string[]) =>
      keys.map((k) => row[k]).find((v) => v !== undefined && v !== "") || "";
    const extra = Object.fromEntries(
      Object.entries(row).filter(([k, v]) => !mapped.has(k) && v),
    );
    const notes =
      pick("notes", "extra") +
      (Object.keys(extra).length
        ? "\n\nAdditional imported fields:\n" + JSON.stringify(extra, null, 2)
        : "");
    const value = {
      site: pick("name", "title") || pick("url", "website", "login_uri"),
      username: pick("username", "login_username"),
      password: pick("password", "login_password"),
      url: pick("url", "website", "login_uri"),
      notes,
      folder: pick("folder", "grouping"),
      tags: (row.tags || "")
        .split(/[,;]/)
        .map((t) => t.trim())
        .filter(Boolean),
      favorite: ["1", "true", "yes"].includes(
        pick("favorite", "favourite", "fav").toLowerCase(),
      ),
      createdAt: now,
      updatedAt: now,
      passwordChangedAt: now,
      history: [],
    };
    const result = ItemSchema.safeParse(value);
    if (!result.success)
      throw new Error(
        `Row ${index + 2} is missing a title or exceeds a field limit. No rows were imported.`,
      );
    items.push(result.data);
  }
  if (!items.length) throw new Error("No supported login entries found.");
  return { items, skipped };
}
````

## packages/shared/schema.ts

Full creation path: `/workspace/scratch/ef7b82d54654/sentinel-vault/packages/shared/schema.ts`

Defines shared format validation or local CSV interoperability.  
Keeps format bounds consistent between clients and the encrypted API.

````typescript
import { z } from "zod";

export const uuid = z.uuid();
export const encoded = (min: number, max = min) =>
  z
    .string()
    .min(min)
    .max(max)
    .regex(/^[A-Za-z0-9_-]+$/);
export const KdfSchema = z.strictObject({
  algorithm: z.literal("argon2id"),
  version: z.literal(19),
  memoryKiB: z.literal(65536),
  iterations: z.literal(3),
  parallelism: z.literal(4),
  salt: encoded(22),
});
export const EnvelopeSchema = z.strictObject({
  version: z.literal(1),
  vaultId: uuid,
  id: uuid,
  revision: z.number().int().min(1).max(2147483647),
  iv: encoded(16),
  wrappedKey: encoded(54),
  ciphertext: encoded(22, 131072),
});
export const ProfileSchema = z
  .strictObject({
    version: z.literal(1),
    vaultId: uuid,
    kdf: KdfSchema,
    wrappedVaultKey: encoded(54),
    publicKey: encoded(43),
    identity: EnvelopeSchema,
  })
  .refine(
    (p) => p.identity.vaultId === p.vaultId && p.identity.id === p.vaultId,
    "Invalid identity context",
  );
export const ContactSchema = z.strictObject({
  userId: uuid,
  publicKey: encoded(43),
  label: z.string().max(200),
});
export const IdentitySchema = z.strictObject({
  version: z.literal(1),
  secretKey: encoded(43),
  contacts: z.array(ContactSchema).max(50),
});
const text = (max: number) => z.string().max(max);
export const ItemSchema = z.strictObject({
  site: text(300).min(1),
  username: text(512),
  password: text(4096),
  notes: text(16000),
  url: text(2048),
  folder: text(128),
  tags: z.array(text(32)).max(16),
  favorite: z.boolean(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
  passwordChangedAt: z.iso.datetime(),
  history: z
    .array(
      z.strictObject({ password: text(4096), changedAt: z.iso.datetime() }),
    )
    .max(5),
});
export const ShareSchema = z.strictObject({
  version: z.literal(1),
  senderPublicKey: encoded(43),
  recipientPublicKey: encoded(43),
  nonce: encoded(32),
  box: encoded(107),
  record: EnvelopeSchema,
});
export const ExportSchema = z.strictObject({
  format: z.literal("sentinel-vault"),
  version: z.literal(1),
  userId: uuid,
  profile: ProfileSchema,
  profileRevision: z.number().int().positive(),
  items: z.array(EnvelopeSchema).max(1000),
  exportedAt: z.iso.datetime(),
});
export type Envelope = z.infer<typeof EnvelopeSchema>;
export type Profile = z.infer<typeof ProfileSchema>;
export type VaultItem = z.infer<typeof ItemSchema>;
export type Share = z.infer<typeof ShareSchema>;
export type Identity = z.infer<typeof IdentitySchema>;
export type EncryptedExport = z.infer<typeof ExportSchema>;
export interface Account {
  id: string;
  email: string;
  vaultId: string;
  profile: Profile;
  profileRevision: number;
  twoFactor: boolean;
}
export interface ItemRow {
  id: string;
  revision: number;
  envelope: Envelope;
  deleted: boolean;
}
export interface SharedRow {
  id: string;
  sender_id: string;
  recipient_id: string;
  sender_email: string;
  recipient_email: string;
  envelope: Share;
  created_at: string;
}
````

## playwright.config.ts

Full creation path: `/workspace/scratch/ef7b82d54654/sentinel-vault/playwright.config.ts`

Defines project configuration, pinned dependencies, licensing or automated repository checks.  
Included in full so the repository can be built and reviewed independently.

````typescript
import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "tests/e2e",
  timeout: 60000,
  workers: 1,
  use: {
    baseURL: "http://localhost:8080",
    headless: true,
    launchOptions: {
      ...(process.env.CHROMIUM_PATH
        ? { executablePath: process.env.CHROMIUM_PATH }
        : {}),
      args: ["--no-sandbox", "--disable-dev-shm-usage"],
    },
    trace: "off",
    screenshot: "off",
    video: "off",
  },
  webServer: {
    command: "node --import tsx scripts/test-server.ts",
    url: "http://localhost:8080/api/health",
    timeout: 30000,
    reuseExistingServer: false,
  },
  reporter: "list",
});
````

## scripts/build.mjs

Full creation path: `/workspace/scratch/ef7b82d54654/sentinel-vault/scripts/build.mjs`

Provides a reproducible local build, operator command, test fixture server or release packaging step.  
Keeps runtime secrets and unrelated files out of the GitHub source artifact.

````javascript
import { build as viteBuild } from "vite";
import { build as esbuild } from "esbuild";
import {
  readFile,
  writeFile,
  mkdir,
  cp,
  readdir,
  stat,
} from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";
await viteBuild({ configFile: "apps/web/vite.config.ts" });
await viteBuild({ configFile: "extensions/browser/vite.config.ts" });
await esbuild({
  entryPoints: ["apps/api/src/main.ts"],
  bundle: true,
  platform: "node",
  target: "node24",
  format: "esm",
  packages: "external",
  outfile: "build/api/main.js",
});
const manifest = {
  manifest_version: 3,
  name: "Sentinel Vault",
  version: "0.1.0",
  description:
    "An independently bundled client for your self-hosted encrypted vault.",
  action: { default_popup: "index.html", default_title: "Sentinel Vault" },
  permissions: ["activeTab", "scripting", "storage"],
  optional_host_permissions: [
    "https://*/*",
    "http://localhost/*",
    "http://127.0.0.1/*",
  ],
  content_security_policy: {
    extension_pages:
      "default-src 'self'; script-src 'self' 'wasm-unsafe-eval'; object-src 'none'; style-src 'self'; worker-src 'self'; connect-src https: http://localhost:* http://127.0.0.1:*; base-uri 'none'; form-action 'none'",
  },
};
for (const browser of ["chrome", "firefox"]) {
  const dest = "build/extension-" + browser;
  await cp("build/extension", dest, { recursive: true });
  const value = structuredClone(manifest);
  if (browser === "firefox")
    value.browser_specific_settings = {
      gecko: {
        id: "sentinel-vault@local.invalid",
        strict_min_version: "128.0",
        data_collection_permissions: { required: ["none"] },
      },
    };
  await writeFile(
    dest + "/manifest.json",
    JSON.stringify(value, null, 2) + "\n",
  );
}
async function files(directory, prefix = "") {
  const result = [];
  for (const entry of await readdir(directory)) {
    const relative = path.join(prefix, entry);
    const info = await stat(path.join(directory, entry));
    if (info.isDirectory())
      result.push(...(await files(path.join(directory, entry), relative)));
    else result.push(relative);
  }
  return result;
}
const assets = (await files("build/web"))
  .filter((f) => !f.endsWith("sw.js"))
  .map((f) => "/" + f.replaceAll("\\", "/"));
const digest = createHash("sha256");
for (const asset of assets.sort())
  digest.update(await readFile("build/web" + asset));
const version = digest.digest("hex").slice(0, 16);
// Precache a fixed build allowlist. Neither /api nor arbitrary navigations nor credentials enter CacheStorage.
const sw = `const NAME='sentinel-shell-${version}';const ASSETS=${JSON.stringify(assets)};self.addEventListener('install',e=>e.waitUntil(caches.open(NAME).then(c=>c.addAll(ASSETS))));self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('sentinel-shell-')&&k!==NAME).map(k=>caches.delete(k))))));self.addEventListener('fetch',e=>{const u=new URL(e.request.url);if(e.request.method!=='GET'||u.origin!==self.location.origin||u.pathname.startsWith('/api/'))return;const key=u.pathname==='/'?'/index.html':u.pathname;if(!ASSETS.includes(key))return;e.respondWith(caches.open(NAME).then(async c=>(await c.match(key))||fetch(e.request)));});\n`;
await writeFile("build/web/sw.js", sw);
await mkdir("build", { recursive: true });
console.log("Built API, web shell, and independent Chrome/Firefox clients.");
````

## scripts/package.py

Full creation path: `/workspace/scratch/ef7b82d54654/sentinel-vault/scripts/package.py`

Provides a reproducible local build, operator command, test fixture server or release packaging step.  
Keeps runtime secrets and unrelated files out of the GitHub source artifact.

````python
"""Produce a GitHub source ZIP with independently built clients, never runtime secrets."""
from pathlib import Path
import hashlib
import zipfile
import importlib.util

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location("source_book", ROOT / "scripts/source-book.py")
book = importlib.util.module_from_spec(spec)
spec.loader.exec_module(book)
book.main()
destination = ROOT / "releases"
destination.mkdir(exist_ok=True)
artifact = destination / "sentinel-vault-github.zip"
files = book.source_files() + [ROOT / "docs/FILES.md", ROOT / "docs/SOURCEBOOK.md"]
with zipfile.ZipFile(artifact, "w", compression=zipfile.ZIP_DEFLATED, compresslevel=9) as archive:
    for file in sorted(set(files)):
        archive.write(file, "sentinel-vault/" + str(file.relative_to(ROOT)))
    for browser in ("chrome", "firefox"):
        client = ROOT / f"build/extension-{browser}"
        if not (client / "manifest.json").is_file():
            raise RuntimeError("Build the complete clients before packaging.")
        for file in sorted(client.rglob("*")):
            if file.is_file():
                archive.write(file, "sentinel-vault/clients/" + browser + "/" + str(file.relative_to(client)))
digest = hashlib.sha256(artifact.read_bytes()).hexdigest()
(destination / "sentinel-vault-github.sha256").write_text(digest + "  " + artifact.name + "\n")
print(f"Created {artifact} ({artifact.stat().st_size} bytes), SHA-256 {digest}")
````

## scripts/setup.mjs

Full creation path: `/workspace/scratch/ef7b82d54654/sentinel-vault/scripts/setup.mjs`

Provides a reproducible local build, operator command, test fixture server or release packaging step.  
Keeps runtime secrets and unrelated files out of the GitHub source artifact.

````javascript
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { randomBytes } from "node:crypto";
await mkdir(".local-data/secrets", { recursive: true, mode: 0o700 });
for (const [name, length] of [
  ["operational.key", 32],
  ["registration.key", 32],
]) {
  try {
    await writeFile(".local-data/secrets/" + name, randomBytes(length), {
      flag: "wx",
      mode: 0o600,
    });
  } catch (e) {
    if (e.code !== "EEXIST") throw e;
  }
}
try {
  await writeFile(".env", await readFile(".env.example"), {
    flag: "wx",
    mode: 0o600,
  });
} catch (e) {
  if (e.code !== "EEXIST") throw e;
}
console.log(
  "Local secrets and .env created without overwriting existing configuration. Configure DATABASE_URL for local development.",
);
````

## scripts/show-invitation.mjs

Full creation path: `/workspace/scratch/ef7b82d54654/sentinel-vault/scripts/show-invitation.mjs`

Provides a reproducible local build, operator command, test fixture server or release packaging step.  
Keeps runtime secrets and unrelated files out of the GitHub source artifact.

````javascript
import { readFile } from "node:fs/promises";
import path from "node:path";
// Explicit operator-only command. No automatic startup logging of invitation credentials.
const bytes = await readFile(
  path.join(
    process.env.SECRET_DIR || ".local-data/secrets",
    "registration.key",
  ),
);
if (bytes.length !== 32) throw new Error("Invalid registration secret.");
process.stdout.write(bytes.toString("base64url") + "\n");
bytes.fill(0);
````

## scripts/source-book.py

Full creation path: `/workspace/scratch/ef7b82d54654/sentinel-vault/scripts/source-book.py`

Provides a reproducible local build, operator command, test fixture server or release packaging step.  
Keeps runtime secrets and unrelated files out of the GitHub source artifact.

````python
"""Build a reviewable file inventory and complete source book, excluding runtime secrets."""
from pathlib import Path
import hashlib

ROOT = Path(__file__).resolve().parents[1]
EXCLUDED = {"node_modules", ".git", "build", "releases", ".local-data", "backups", "test-results", "playwright-report", "coverage", "__pycache__"}
SKIP = {".env", "SOURCEBOOK.md", "FILES.md"}

def source_files():
    return sorted(p for p in ROOT.rglob("*") if p.is_file() and not any(part in EXCLUDED for part in p.relative_to(ROOT).parts) and p.name not in SKIP and not p.name.endswith(".log"))

def explain(relative):
    if relative.startswith("apps/api/"):
        return "Implements the bounded, authenticated API or its configuration/database boundary.", "Vault values remain encrypted; authentication metadata is handled separately."
    if relative.startswith("packages/crypto/"):
        return "Implements a local cryptographic operation using native or library primitives.", "Documents key purpose, input limits and mutable-buffer cleanup at the call boundary."
    if relative.startswith("packages/shared/"):
        return "Defines shared format validation or local CSV interoperability.", "Keeps format bounds consistent between clients and the encrypted API."
    if relative.startswith("apps/web/public/vendor/"):
        return "Pinned upstream Argon2 binding/reference WASM asset, shipped locally.", "Provenance, license and byte hashes are listed in THIRD-PARTY.md."
    if relative.startswith("apps/web/"):
        return "Provides the local React vault interface, crypto worker or static application shell.", "Secrets are decrypted only for deliberate local operations; no telemetry is included."
    if relative.startswith("extensions/"):
        return "Builds the independently packaged browser extension and explicit autofill interface.", "Restricts filling to a selected exact-origin top-frame login form without submission."
    if relative.startswith("tests/"):
        return "Verifies real behavior using public synthetic fixtures and isolated test data.", "Does not describe unexecuted checks as an audit or security certification."
    if relative.startswith("deploy/") or relative in {"Dockerfile", "docker-compose.yml", ".dockerignore", ".env.example"}:
        return "Provides deployment configuration with generated operational secrets and explicit trust boundaries.", "Review the deployment guide and run environment-specific release checks before use."
    if relative.startswith("scripts/"):
        return "Provides a reproducible local build, operator command, test fixture server or release packaging step.", "Keeps runtime secrets and unrelated files out of the GitHub source artifact."
    if relative.startswith("docs/") or relative.endswith(".md"):
        return "Documents the actual design, usage, interfaces or verification evidence.", "Distinguishes implemented behavior, operational assumptions and manual release gates."
    return "Defines project configuration, pinned dependencies, licensing or automated repository checks.", "Included in full so the repository can be built and reviewed independently."

def main():
    files = source_files()
    inventory = ["# Complete folder and file inventory", "", "All paths are relative to the repository root. Build outputs and runtime secrets are deliberately excluded.", "", "```text"]
    inventory.extend(str(p.relative_to(ROOT)) for p in files)
    inventory.extend(["docs/FILES.md", "docs/SOURCEBOOK.md", "```", "", "`npm run build` additionally generates `build/api`, `build/web`, `build/extension-chrome` and `build/extension-firefox`. These compiled extension clients are packaged separately under `clients/` in the downloadable release.", ""])
    (ROOT / "docs/FILES.md").write_text("\n".join(inventory), encoding="utf-8")
    files = sorted(files + [ROOT / "docs/FILES.md"])
    lines = ["# Sentinel Vault complete source book", "", "Every authored text file and vendored text asset is reproduced below with its full creation path and two-line explanation. The source book itself is excluded from recursive reproduction. Binary WASM/PNG bytes are included as real files in the repository and identified below by length and SHA-256 rather than corrupting them into a text code fence. All fixtures are synthetic. Runtime dependencies are restored from the complete npm lockfile.", ""]
    languages = {".ts": "typescript", ".tsx": "tsx", ".js": "javascript", ".mjs": "javascript", ".json": "json", ".yml": "yaml", ".sql": "sql", ".html": "html", ".css": "css", ".py": "python", ".sh": "sh", ".md": "markdown"}
    for p in files:
        relative = str(p.relative_to(ROOT))
        one, two = explain(relative)
        lines.extend(["## " + relative, "", "Full creation path: `" + str(p) + "`", "", one + "  ", two, ""])
        data = p.read_bytes()
        try:
            text = data.decode("utf-8")
        except UnicodeDecodeError:
            lines.extend([f"Binary artifact: {len(data)} bytes; SHA-256 `{hashlib.sha256(data).hexdigest()}`.", ""])
            continue
        # Use a longer fence than any fence in the file so nested Markdown remains intact.
        fence = "`" * max(4, max((len(chunk) for chunk in text.split() if set(chunk) == {"`"}), default=3) + 1)
        lines.extend([fence + languages.get(p.suffix, "text"), text.rstrip("\n"), fence, ""])
    (ROOT / "docs/SOURCEBOOK.md").write_text("\n".join(lines), encoding="utf-8")
    print(f"Documented {len(files)} files with complete text and binary hashes.")

if __name__ == "__main__":
    main()
````

## scripts/test-server.ts

Full creation path: `/workspace/scratch/ef7b82d54654/sentinel-vault/scripts/test-server.ts`

Provides a reproducible local build, operator command, test fixture server or release packaging step.  
Keeps runtime secrets and unrelated files out of the GitHub source artifact.

````typescript
import { randomBytes } from "node:crypto";
import path from "node:path";
import { testDatabase } from "../tests/database";
import { makeApp } from "../apps/api/src/app";
import { writeFile, mkdir } from "node:fs/promises";
// Isolated browser-test server: no production bypass, real WebAuthn verification, ephemeral PostgreSQL engine.
const db = await testDatabase();
const app = await makeApp(db, {
  origin: "http://localhost:8080",
  rpId: "localhost",
  secure: false,
  operationalKey: randomBytes(32),
  registrationToken: "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
  trustProxy: false,
  staticDir: path.resolve("build/web"),
});
await mkdir("docs", { recursive: true });
await writeFile(
  "docs/openapi.json",
  JSON.stringify(app.swagger(), null, 2) + "\n",
);
await app.listen({ host: "127.0.0.1", port: 8080 });
const stop = async () => {
  await app.close();
  await db.end();
  process.exit(0);
};
process.on("SIGINT", stop);
process.on("SIGTERM", stop);
````

## tests/analysis.test.ts

Full creation path: `/workspace/scratch/ef7b82d54654/sentinel-vault/tests/analysis.test.ts`

Verifies real behavior using public synthetic fixtures and isolated test data.  
Does not describe unexecuted checks as an audit or security certification.

````typescript
import { it, expect } from "vitest";
import { analyze } from "../packages/crypto/analyze";
it("computes empirical Shannon entropy and reports dictionary, keyboard, repeat and leetspeak patterns without returning the secret", () => {
  expect(analyze("aaaa").shannonBitsPerCharacter).toBe(0);
  expect(analyze("aabb").empiricalBits).toBe(4);
  expect(analyze("qwerty12345").score).toBeLessThan(3);
  expect(analyze("p@ssw0rd").patterns).toContain(
    "Dictionary word with leetspeak",
  );
  const report = analyze("qwerty12345");
  expect(JSON.stringify(report)).not.toContain("qwerty12345");
  expect(report.suggestions.length).toBeGreaterThan(0);
  expect(() => analyze("a".repeat(4097))).toThrow();
});
````

## tests/api.test.ts

Full creation path: `/workspace/scratch/ef7b82d54654/sentinel-vault/tests/api.test.ts`

Verifies real behavior using public synthetic fixtures and isolated test data.  
Does not describe unexecuted checks as an audit or security certification.

````typescript
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
````

## tests/crypto.test.ts

Full creation path: `/workspace/scratch/ef7b82d54654/sentinel-vault/tests/crypto.test.ts`

Verifies real behavior using public synthetic fixtures and isolated test data.  
Does not describe unexecuted checks as an audit or security certification.

````typescript
import { describe, it, expect } from "vitest";
import { randomUUID } from "node:crypto";
import { VaultCrypto, fingerprint } from "../packages/crypto/vault";
import {
  fromB64,
  toB64,
  passwordBytes,
  context,
} from "../packages/crypto/bytes";
import { argon, fixture, item } from "./fixtures";
describe("authenticated vault cryptography", () => {
  it("roundtrips with exact parameters, 40-byte wraps, 12-byte IV, and wipes input", async () => {
    const f = await fixture();
    const envelope = await f.vault.seal(randomUUID(), 1, item());
    expect(fromB64(f.profile.wrappedVaultKey)).toHaveLength(40);
    expect(fromB64(envelope.wrappedKey)).toHaveLength(40);
    expect(fromB64(envelope.iv)).toHaveLength(12);
    expect(context(f.vaultId, envelope.id, 1)).toHaveLength(44);
    expect(await f.vault.open(envelope)).toEqual(item());
    const password = passwordBytes("public synthetic master fixture 7294");
    const copy = new VaultCrypto(argon);
    await copy.unlock(f.profile, password);
    expect(password.every((b) => b === 0)).toBe(true);
    expect(await copy.open(envelope)).toEqual(item());
    f.vault.lock();
    copy.lock();
  });
  it("rejects wrong password, ciphertext/tag tampering, AAD changes, mixed vaults, locked access", async () => {
    const a = await fixture(),
      b = await fixture(),
      id = randomUUID();
    const envelope = await a.vault.seal(id, 1, item());
    await expect(
      new VaultCrypto(argon).unlock(
        a.profile,
        passwordBytes("wrong public test password"),
      ),
    ).rejects.toThrow("Unable to unlock");
    const bytes = fromB64(envelope.ciphertext);
    bytes[0] ^= 1;
    await expect(
      a.vault.open({ ...envelope, ciphertext: toB64(bytes) }),
    ).rejects.toThrow("integrity");
    await expect(a.vault.open({ ...envelope, revision: 2 })).rejects.toThrow(
      "integrity",
    );
    await expect(
      a.vault.open({ ...envelope, id: randomUUID() }),
    ).rejects.toThrow("integrity");
    await expect(b.vault.open(envelope)).rejects.toThrow("context");
    a.vault.lock();
    await expect(a.vault.open(envelope)).rejects.toThrow("locked");
    b.vault.lock();
  });
  it("uses fresh item keys and IVs on revisions and changes only the master wrapper on rotation", async () => {
    const a = await fixture(),
      id = randomUUID(),
      e1 = await a.vault.seal(id, 1, item()),
      e2 = await a.vault.seal(id, 2, item());
    expect(e1.iv).not.toBe(e2.iv);
    expect(e1.wrappedKey).not.toBe(e2.wrappedKey);
    const next = await a.vault.changePassword(
      passwordBytes("public synthetic master fixture 7294"),
      passwordBytes("new public synthetic master fixture 5128"),
    );
    expect(next.identity).toEqual(a.profile.identity);
    const b = new VaultCrypto(argon);
    await b.unlock(
      next,
      passwordBytes("new public synthetic master fixture 5128"),
    );
    expect(await b.open(e1)).toEqual(item());
    await expect(
      new VaultCrypto(argon).unlock(
        next,
        passwordBytes("public synthetic master fixture 7294"),
      ),
    ).rejects.toThrow();
    a.vault.lock();
    b.lock();
  });
  it("requires pinned keys, shares a separate snapshot, omits history and rejects modified boxes", async () => {
    const a = await fixture(),
      b = await fixture(),
      sender = randomUUID(),
      recipient = randomUUID(),
      e = await a.vault.seal(
        randomUUID(),
        1,
        item({
          history: [
            {
              password: "previous-public-fixture",
              changedAt: "2025-01-01T00:00:00Z",
            },
          ],
        }),
      );
    await expect(
      a.vault.share(e, recipient, b.profile.publicKey),
    ).rejects.toThrow("fingerprint");
    await a.vault.trustContact(recipient, b.profile.publicKey, "Recipient");
    const share = await a.vault.share(e, recipient, b.profile.publicKey);
    expect(share.record.wrappedKey).not.toBe(e.wrappedKey);
    await expect(b.vault.openShare(share, sender)).rejects.toThrow(
      "fingerprint",
    );
    await b.vault.trustContact(sender, a.profile.publicKey, "Sender");
    expect((await b.vault.openShare(share, sender)).history).toEqual([]);
    const box = fromB64(share.box);
    box[0] ^= 1;
    await expect(
      b.vault.openShare({ ...share, box: toB64(box) }, sender),
    ).rejects.toThrow("integrity");
    await expect(
      a.vault.trustContact(recipient, a.profile.publicKey, "Changed"),
    ).rejects.toThrow("changed");
    expect(
      (await fingerprint(a.profile.publicKey)).replaceAll(" ", ""),
    ).toHaveLength(64);
    a.vault.lock();
    b.vault.lock();
  });
  it("rejects malformed encodings, control characters and unmatched UTF-16 without normalization", () => {
    expect(() => fromB64("!")).toThrow();
    expect(() => passwordBytes("a\u0000b")).toThrow();
    expect(() => passwordBytes("\ud800")).toThrow();
    expect(passwordBytes("é")).not.toEqual(passwordBytes("e\u0301"));
  });
});
````

## tests/database.ts

Full creation path: `/workspace/scratch/ef7b82d54654/sentinel-vault/tests/database.ts`

Verifies real behavior using public synthetic fixtures and isolated test data.  
Does not describe unexecuted checks as an audit or security certification.

````typescript
import { PGlite } from "@electric-sql/pglite";
import { readFile } from "node:fs/promises";
import { database, type Database, type Connection } from "../apps/api/src/db";
export async function testDatabase(directory?: string): Promise<Database> {
  // CI can run this SAME suite against PostgreSQL. Guard against accidental use of a real vault database.
  if (process.env.TEST_DATABASE_URL) {
    const url = new URL(process.env.TEST_DATABASE_URL);
    if (!url.pathname.endsWith("_test"))
      throw new Error(
        "TEST_DATABASE_URL must name a dedicated database ending _test.",
      );
    const db = database(url.href);
    await db.query("DROP SCHEMA public CASCADE; CREATE SCHEMA public;");
    await db.query(await readFile("db/schema.sql", "utf8"));
    return db;
  }
  const pg = new PGlite(directory);
  await pg.waitReady;
  // PGlite is single-connection PostgreSQL. A mutex provides connection ownership across explicit transactions.
  let queue = Promise.resolve();
  async function acquire() {
    let release!: () => void;
    const next = new Promise<void>((r) => (release = r));
    const previous = queue;
    queue = previous.then(() => next);
    await previous;
    return release;
  }
  const run = async (text: string, values?: unknown[]) => {
    if (/^SELECT pg_advisory_xact_lock/.test(text))
      return { rows: [], rowCount: 0 }; // Single backend + connection mutex has equivalent serialization in this test adapter.
    if (!values && text.includes(";")) {
      await pg.exec(text);
      return { rows: [], rowCount: 0 };
    }
    const result = await pg.query(text, values);
    return { rows: result.rows, rowCount: result.affectedRows };
  };
  const db: Database = {
    query: async (text, values) => {
      const release = await acquire();
      try {
        return await run(text, values);
      } finally {
        release();
      }
    },
    connect: async () => {
      const release = await acquire();
      return { query: run, release } as Connection;
    },
    end: async () => {
      await queue;
      await pg.close();
    },
  };
  await db.query(await readFile("db/schema.sql", "utf8"));
  return db;
}
````

## tests/e2e/security.spec.ts

Full creation path: `/workspace/scratch/ef7b82d54654/sentinel-vault/tests/e2e/security.spec.ts`

Verifies real behavior using public synthetic fixtures and isolated test data.  
Does not describe unexecuted checks as an audit or security certification.

````typescript
import { test, expect } from "@playwright/test";
import * as OTPAuth from "otpauth";
import { fillLogin } from "../../extensions/browser/src/autofill";
test("TOTP enrollment and one-use recovery login, then master rotation and pinned contact update", async ({
  page,
  context,
}) => {
  const master = "public browser security master tulip solar 90721",
    next = "public rotated master marigold nebula 42715";
  const cdp = await context.newCDPSession(page);
  await cdp.send("WebAuthn.enable");
  await cdp.send("WebAuthn.addVirtualAuthenticator", {
    options: {
      protocol: "ctap2",
      transport: "internal",
      hasResidentKey: true,
      hasUserVerification: true,
      isUserVerified: true,
      automaticPresenceSimulation: true,
    },
  });
  await page.goto("/");
  await page
    .getByRole("button", { name: "Create an account", exact: true })
    .click();
  await page
    .getByLabel("Email", { exact: true })
    .fill("security@tests.invalid");
  await page
    .getByLabel("Invitation token")
    .fill("AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA");
  await page.getByLabel("Master password", { exact: true }).fill(master);
  await page.getByLabel("Confirm master password").fill(master);
  await page.getByRole("button", { name: "Create vault & passkey" }).click();
  await expect(
    page.getByRole("heading", { name: "All credentials", exact: true }),
  ).toBeVisible({ timeout: 20000 });
  await page.getByRole("button", { name: "Security settings" }).click();
  await page.getByRole("button", { name: "Set up authenticator" }).click();
  const seed = await page.locator("code.fingerprint").first().textContent();
  const totp = new OTPAuth.TOTP({
    algorithm: "SHA1",
    digits: 6,
    period: 30,
    secret: OTPAuth.Secret.fromBase32(seed!),
  });
  await page.getByLabel("Current authenticator code").fill(totp.generate());
  await page.getByRole("button", { name: "Enable TOTP", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Save these recovery codes now" }),
  ).toBeVisible();
  const recovery = await page.locator(".recovery code").first().textContent();
  await page.getByRole("button", { name: "I saved them safely" }).click();
  await page
    .getByRole("button", { name: "Sign out & clear offline copy" })
    .click();
  await expect(
    page.getByRole("heading", { name: "Welcome back" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Sign in with passkey" }).click();
  await expect(
    page.getByRole("heading", { name: "Verify your sign-in" }),
  ).toBeVisible();
  await page.getByLabel("Authenticator or recovery code").fill(recovery!);
  await page.getByLabel("Use a recovery code").check();
  await page.getByRole("button", { name: "Verify", exact: true }).click();
  await page.getByLabel("Master password", { exact: true }).fill(master);
  await page.getByRole("button", { name: "Unlock vault", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "All credentials", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Security settings" }).click();
  await page.getByLabel("Current master password").fill(master);
  await page.getByLabel("New master password", { exact: true }).fill(next);
  await page.getByLabel("Confirm new master password").fill(next);
  await page
    .getByRole("button", { name: "Change master password", exact: true })
    .click();
  await expect(page.getByText(/Master password changed/)).toBeVisible();
  // A contacts update must preserve the new wrapper, not accidentally restore the old worker profile.
  await page.getByRole("button", { name: "Secure sharing" }).click();
  await page.getByLabel("Recipient email").fill("security@tests.invalid");
  await page.getByRole("button", { name: "Find contact" }).click();
  const fp = await page.locator("code.fingerprint").last().textContent();
  await page
    .getByLabel("Enter the fingerprint verified independently")
    .fill(fp!);
  await page.getByRole("button", { name: "Pin verified contact" }).click();
  await expect(page.getByText(/Contact fingerprint pinned/)).toBeVisible();
  await page.getByRole("button", { name: "Lock vault", exact: true }).click();
  await page.getByLabel("Master password", { exact: true }).fill(next);
  await page.getByRole("button", { name: "Unlock vault", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "All credentials", exact: true }),
  ).toBeVisible();
});
test("autofill changes one same-origin login form without submission; rejects ambiguity and cross-origin form actions", async ({
  page,
}) => {
  await page.goto("/");
  await page.setContent(
    '<form action="/login"><input name="username" autocomplete="username"><input name="password" type="password"><button>Sign in</button></form>',
  );
  const result = await page.evaluate(fillLogin, {
    expectedOrigin: "http://localhost:8080",
    username: "public-test-user",
    password: "public-test-password",
  });
  expect(result).toBe(true);
  await expect(page.locator("input[name=username]")).toHaveValue(
    "public-test-user",
  );
  await expect(page.locator("input[type=password]")).toHaveValue(
    "public-test-password",
  );
  expect(page.url()).toBe("http://localhost:8080/");
  await page.setContent(
    '<form action="https://attacker.invalid/"><input type="password"></form>',
  );
  expect(
    await page.evaluate(fillLogin, {
      expectedOrigin: "http://localhost:8080",
      username: "public-test-user",
      password: "public-test-password",
    }),
  ).toBe(false);
  await page.setContent('<input type="password"><input type="password">');
  expect(
    await page.evaluate(fillLogin, {
      expectedOrigin: "http://localhost:8080",
      username: "public-test-user",
      password: "public-test-password",
    }),
  ).toBe(false);
});
````

## tests/e2e/vault.spec.ts

Full creation path: `/workspace/scratch/ef7b82d54654/sentinel-vault/tests/e2e/vault.spec.ts`

Verifies real behavior using public synthetic fixtures and isolated test data.  
Does not describe unexecuted checks as an audit or security certification.

````typescript
import { test, expect } from "@playwright/test";
import { mkdir } from "node:fs/promises";
test("real passkey, worker crypto, encrypted CRUD, offline edits, sync, export and lock", async ({
  page,
  context,
}) => {
  const client = await context.newCDPSession(page);
  await client.send("WebAuthn.enable");
  await client.send("WebAuthn.addVirtualAuthenticator", {
    options: {
      protocol: "ctap2",
      transport: "internal",
      hasResidentKey: true,
      hasUserVerification: true,
      isUserVerified: true,
      automaticPresenceSimulation: true,
    },
  });
  const leaks: string[] = [],
    csp: string[] = [];
  page.on("request", (req) => {
    const body = req.postData();
    if (
      body &&
      [
        "synthetic browser master passage 88402 cosmic orchid",
        "PublicBrowserTestPassword!98",
      ].some((secret) => body.includes(secret))
    )
      leaks.push(req.url());
  });
  page.on("console", (m) => {
    if (m.type() === "error") csp.push(m.text());
  });
  await page.goto("/");
  await mkdir("docs/screenshots", { recursive: true });
  await page.screenshot({
    path: "docs/screenshots/sign-in.png",
    fullPage: true,
  });
  await page
    .getByRole("button", { name: "Create an account", exact: true })
    .click();
  await page.getByLabel("Email", { exact: true }).fill("browser@tests.invalid");
  await page
    .getByLabel("Invitation token")
    .fill("AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA");
  await page
    .getByLabel("Master password", { exact: true })
    .fill("synthetic browser master passage 88402 cosmic orchid");
  await page
    .getByLabel("Confirm master password")
    .fill("synthetic browser master passage 88402 cosmic orchid");
  await page.getByRole("button", { name: "Create vault & passkey" }).click();
  await expect(
    page.getByRole("heading", { name: "All credentials", exact: true }),
  ).toBeVisible({ timeout: 20000 });
  await page.getByRole("button", { name: "Add credential" }).click();
  await page.getByLabel("Name", { exact: true }).fill("GitHub · example");
  await page.getByLabel("Username", { exact: true }).fill("portfolio-example");
  await page
    .getByLabel("Password", { exact: true })
    .fill("PublicBrowserTestPassword!98");
  await page.getByLabel("Website URL").fill("https://github.com");
  await page.getByLabel("Folder", { exact: true }).fill("Work");
  await page.getByRole("button", { name: "Save encrypted credential" }).click();
  await expect(
    page.getByRole("button", { name: /GitHub · example/ }),
  ).toBeVisible();
  await page.screenshot({ path: "docs/screenshots/vault.png", fullPage: true });
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.clock.install();
  await page.getByRole("button", { name: /GitHub · example/ }).click();
  await page
    .getByRole("button", { name: "Copy password", exact: true })
    .click();
  await expect(
    page.getByText(
      "Copied. Automatic clearing will be attempted in 30 seconds.",
    ),
  ).toBeVisible();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
    "PublicBrowserTestPassword!98",
  );
  await page.clock.runFor(30050);
  await expect(page.getByText("Clipboard cleared.")).toBeVisible();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe("");
  await page
    .getByRole("button", { name: "Copy password", exact: true })
    .click();
  await expect(
    page.getByText(
      "Copied. Automatic clearing will be attempted in 30 seconds.",
    ),
  ).toBeVisible();
  await page.evaluate(() =>
    navigator.clipboard.writeText("new unrelated public clipboard content"),
  );
  await page.clock.runFor(30050);
  await expect(
    page.getByText("Clipboard changed; your newer content was left intact."),
  ).toBeVisible();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
    "new unrelated public clipboard content",
  );
  await page.getByRole("button", { name: "Security settings" }).click();
  await page.getByLabel("Keep an encrypted offline copy").check();
  await expect(page.getByLabel("Keep an encrypted offline copy")).toBeChecked();
  await page.getByRole("button", { name: "All credentials" }).click();
  await context.setOffline(true);
  await page.reload();
  await page
    .getByRole("button", { name: "Open encrypted offline vault" })
    .click();
  await page
    .getByLabel("Master password", { exact: true })
    .fill("synthetic browser master passage 88402 cosmic orchid");
  await page.getByRole("button", { name: "Unlock vault", exact: true }).click();
  await expect(
    page.getByRole("button", { name: /GitHub · example/ }),
  ).toBeVisible({ timeout: 20000 });
  await page.getByRole("button", { name: "Add credential" }).click();
  await page.getByLabel("Name", { exact: true }).fill("Offline example");
  await page
    .getByLabel("Password", { exact: true })
    .fill("AnotherPublicTestPassword!45");
  await page.getByRole("button", { name: "Save encrypted credential" }).click();
  await expect(
    page.getByText("1 encrypted offline change(s) awaiting sync."),
  ).toBeVisible();
  await context.setOffline(false);
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Unlock your vault" }),
  ).toBeVisible();
  await page
    .getByLabel("Master password", { exact: true })
    .fill("synthetic browser master passage 88402 cosmic orchid");
  await page.getByRole("button", { name: "Unlock vault", exact: true }).click();
  await expect(
    page.getByText("1 encrypted offline change(s) awaiting sync."),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: /Offline example/ }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Synchronize", exact: true }).click();
  await expect(page.getByText("Encrypted changes synchronized.")).toBeVisible();
  await page.getByRole("button", { name: "Password health" }).click();
  await expect(
    page.getByRole("heading", { name: "Password health", exact: true }),
  ).toBeVisible();
  await page.screenshot({
    path: "docs/screenshots/health.png",
    fullPage: true,
  });
  await page.getByRole("button", { name: "Security settings" }).click();
  const downloadPromise = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Export encrypted JSON backup" })
    .click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe("sentinel-encrypted-vault.json");
  expect(leaks).toEqual([]);
  expect(
    csp.filter((v) =>
      /Content Security Policy|Refused to|unsafe-eval/i.test(v),
    ),
  ).toEqual([]);
  await page.getByRole("button", { name: "Lock vault", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Unlock your vault" }),
  ).toBeVisible();
  await page
    .getByLabel("Master password", { exact: true })
    .fill("wrong public fixture");
  await page.getByRole("button", { name: "Unlock vault", exact: true }).click();
  await expect(page.getByText(/Unable to unlock/)).toBeVisible();
});
````

## tests/fixtures.ts

Full creation path: `/workspace/scratch/ef7b82d54654/sentinel-vault/tests/fixtures.ts`

Verifies real behavior using public synthetic fixtures and isolated test data.  
Does not describe unexecuted checks as an audit or security certification.

````typescript
import { argon2, randomUUID } from "node:crypto";
import { promisify } from "node:util";
import { VaultCrypto } from "../packages/crypto/vault";
import type { VaultItem } from "../packages/shared/schema";
export const argon = async (password: Uint8Array, salt: Uint8Array) =>
  new Uint8Array(
    await promisify(argon2)("argon2id", {
      message: password,
      nonce: salt,
      parallelism: 4,
      passes: 3,
      memory: 65536,
      tagLength: 32,
    }),
  );
export const item = (changes: Partial<VaultItem> = {}): VaultItem => ({
  site: "Example service",
  username: "synthetic-user",
  password: "Public-test-password-only!27",
  notes: "Synthetic test fixture",
  url: "https://example.com",
  folder: "Personal",
  tags: ["sample"],
  favorite: true,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
  passwordChangedAt: "2026-01-01T00:00:00.000Z",
  history: [],
  ...changes,
});
export async function fixture() {
  const vault = new VaultCrypto(argon),
    vaultId = randomUUID(),
    password = new TextEncoder().encode("public synthetic master fixture 7294");
  const profile = await vault.create(vaultId, password);
  return { vault, vaultId, profile };
}
````

## tests/history.test.ts

Full creation path: `/workspace/scratch/ef7b82d54654/sentinel-vault/tests/history.test.ts`

Verifies real behavior using public synthetic fixtures and isolated test data.  
Does not describe unexecuted checks as an audit or security certification.

````typescript
import { it, expect } from "vitest";
import { prepareRevision } from "../packages/crypto/history";
import { item } from "./fixtures";
it("retains exactly five prior passwords, ignores injected history, and preserves age on username-only edits", async () => {
  let previous = await prepareRevision(
    item({
      history: [
        {
          password: "untrusted injected history",
          changedAt: "2020-01-01T00:00:00Z",
        },
      ],
    }),
    undefined,
    "2026-01-01T00:00:00Z",
  );
  expect(previous.history).toEqual([]);
  for (let version = 1; version <= 7; version++)
    previous = await prepareRevision(
      { ...previous, password: "public version " + version, history: [] },
      previous,
      `2026-01-0${version + 1}T00:00:00Z`,
    );
  expect(previous.history.map((h) => h.password)).toEqual([
    "public version 6",
    "public version 5",
    "public version 4",
    "public version 3",
    "public version 2",
  ]);
  const unchanged = await prepareRevision(
    { ...previous, username: "changed username", history: [] },
    previous,
    "2026-02-01T00:00:00Z",
  );
  expect(unchanged.passwordChangedAt).toBe(previous.passwordChangedAt);
  expect(unchanged.history).toEqual(previous.history);
  expect(unchanged.createdAt).toBe(previous.createdAt);
  expect(unchanged.updatedAt).not.toBe(previous.updatedAt);
});
````

## tests/kdf.test.ts

Full creation path: `/workspace/scratch/ef7b82d54654/sentinel-vault/tests/kdf.test.ts`

Verifies real behavior using public synthetic fixtures and isolated test data.  
Does not describe unexecuted checks as an audit or security certification.

````typescript
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
````

## tests/utilities.test.ts

Full creation path: `/workspace/scratch/ef7b82d54654/sentinel-vault/tests/utilities.test.ts`

Verifies real behavior using public synthetic fixtures and isolated test data.  
Does not describe unexecuted checks as an audit or security certification.

````typescript
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
````

## tsconfig.json

Full creation path: `/workspace/scratch/ef7b82d54654/sentinel-vault/tsconfig.json`

Defines project configuration, pinned dependencies, licensing or automated repository checks.  
Included in full so the repository can be built and reviewed independently.

````json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "lib": ["ES2024", "DOM", "DOM.Iterable"],
    "jsx": "react-jsx",
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "types": ["node", "vite/client"],
    "allowImportingTsExtensions": true
  },
  "include": [
    "apps/**/*.ts",
    "apps/**/*.tsx",
    "packages/**/*.ts",
    "extensions/**/*.ts",
    "tests/**/*.ts",
    "*.ts",
    "scripts/**/*.ts"
  ]
}
````

## vitest.config.ts

Full creation path: `/workspace/scratch/ef7b82d54654/sentinel-vault/vitest.config.ts`

Defines project configuration, pinned dependencies, licensing or automated repository checks.  
Included in full so the repository can be built and reviewed independently.

````typescript
import { defineConfig } from "vitest/config";
export default defineConfig({
  test: {
    include: ["tests/**/*.test.ts"],
    testTimeout: 30000,
    hookTimeout: 30000,
    maxWorkers: 1,
  },
});
````
