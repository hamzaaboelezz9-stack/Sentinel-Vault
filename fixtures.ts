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
