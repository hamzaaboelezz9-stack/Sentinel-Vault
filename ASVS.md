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
