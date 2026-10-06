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
