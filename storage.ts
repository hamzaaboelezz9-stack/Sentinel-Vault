import { z } from "zod";
import {
  EnvelopeSchema,
  ExportSchema,
  uuid,
  type EncryptedExport,
} from "../../../packages/shared/schema";
const PendingSchema = z
  .array(
    z
      .strictObject({
        id: uuid,
        expectedRevision: z.number().int().min(0).max(2147483646),
        envelope: EnvelopeSchema.nullable(),
        deleted: z.boolean(),
      })
      .refine((p) =>
        p.deleted
          ? p.envelope === null
          : p.envelope?.id === p.id &&
            p.envelope.revision === p.expectedRevision + 1,
      ),
  )
  .max(1000);
export interface CachedVault {
  export: EncryptedExport;
  email: string;
  twoFactor: boolean;
  pending: {
    id: string;
    expectedRevision: number;
    envelope: any;
    deleted: boolean;
  }[];
}
function database(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("sentinel-encrypted-vault", 1);
    request.onupgradeneeded = () =>
      request.result.createObjectStore("vaults", { keyPath: "export.userId" });
    request.onsuccess = () => resolve(request.result);
    request.onerror = () =>
      reject(new Error("Encrypted offline storage unavailable."));
  });
}
export async function readCache(
  userId?: string,
): Promise<CachedVault | undefined> {
  const db = await database();
  try {
    return await new Promise((resolve, reject) => {
      const store = db.transaction("vaults").objectStore("vaults");
      const req = userId ? store.get(userId) : store.getAll();
      req.onsuccess = () => {
        try {
          const latest = userId
            ? req.result
            : req.result.sort((a: CachedVault, b: CachedVault) =>
                b.export.exportedAt.localeCompare(a.export.exportedAt),
              )[0];
          if (latest) {
            ExportSchema.parse(latest.export);
            PendingSchema.parse(latest.pending);
          }
          resolve(latest);
        } catch {
          reject(new Error("Offline cache failed validation."));
        }
      };
      req.onerror = () => reject(new Error("Unable to read offline vault."));
    });
  } finally {
    db.close();
  }
}
export async function writeCache(value: CachedVault) {
  ExportSchema.parse(value.export);
  PendingSchema.parse(value.pending);
  const db = await database();
  try {
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction("vaults", "readwrite");
      tx.objectStore("vaults").put(value);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(new Error("Offline save failed."));
    });
  } finally {
    db.close();
  }
}
export async function clearCache() {
  const db = await database();
  try {
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction("vaults", "readwrite");
      tx.objectStore("vaults").clear();
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(new Error("Unable to clear offline cache."));
    });
  } finally {
    db.close();
  }
}
