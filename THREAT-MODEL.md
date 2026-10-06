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
