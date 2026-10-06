import { readFile, mkdir, writeFile } from "node:fs/promises";
import { randomBytes } from "node:crypto";
import path from "node:path";
export interface Config {
  origin: string;
  rpId: string;
  secure: boolean;
  operationalKey: Buffer;
  registrationToken: string;
  staticDir?: string;
  trustProxy: boolean;
}
async function secret(filename: string, bytes: number) {
  try {
    return await readFile(filename);
  } catch (error: any) {
    if (error.code !== "ENOENT") throw error;
  }
  const value = randomBytes(bytes);
  try {
    await writeFile(filename, value, { flag: "wx", mode: 0o600 });
    return value;
  } catch (error: any) {
    value.fill(0);
    if (error.code !== "EEXIST") throw error;
    return readFile(filename);
  }
}
export async function config(): Promise<Config> {
  const origin = process.env.PUBLIC_ORIGIN || "http://localhost:8080",
    url = new URL(origin);
  if (url.origin !== origin || url.username || url.password)
    throw new Error("PUBLIC_ORIGIN must be a canonical origin.");
  const local = ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname);
  if (url.protocol !== "https:" && !(url.protocol === "http:" && local))
    throw new Error("Non-local deployments require HTTPS.");
  const directory = path.resolve(
    process.env.SECRET_DIR || ".local-data/secrets",
  );
  await mkdir(directory, { recursive: true, mode: 0o700 });
  const operationalKey = await secret(
    path.join(directory, "operational.key"),
    32,
  );
  const registration = await secret(
    path.join(directory, "registration.key"),
    32,
  );
  if (operationalKey.length !== 32 || registration.length !== 32)
    throw new Error("Invalid operational secrets.");
  const registrationToken = registration.toString("base64url");
  registration.fill(0);
  const rpId = process.env.RP_ID || url.hostname;
  if (rpId !== url.hostname)
    throw new Error("RP_ID must match the canonical origin hostname.");
  return {
    origin,
    rpId,
    secure: url.protocol === "https:",
    operationalKey,
    registrationToken,
    staticDir: process.env.STATIC_DIR,
    trustProxy: process.env.TRUST_PROXY === "true",
  };
}
