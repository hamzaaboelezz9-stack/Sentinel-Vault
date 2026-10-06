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
