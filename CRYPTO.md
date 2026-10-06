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
