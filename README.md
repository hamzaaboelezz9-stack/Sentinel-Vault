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
