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
