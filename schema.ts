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
