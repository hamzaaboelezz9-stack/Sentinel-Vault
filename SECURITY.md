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
