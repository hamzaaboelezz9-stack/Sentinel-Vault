import { mkdir, readFile, writeFile } from "node:fs/promises";
import { randomBytes } from "node:crypto";
await mkdir(".local-data/secrets", { recursive: true, mode: 0o700 });
for (const [name, length] of [
  ["operational.key", 32],
  ["registration.key", 32],
]) {
  try {
    await writeFile(".local-data/secrets/" + name, randomBytes(length), {
      flag: "wx",
      mode: 0o600,
    });
  } catch (e) {
    if (e.code !== "EEXIST") throw e;
  }
}
try {
  await writeFile(".env", await readFile(".env.example"), {
    flag: "wx",
    mode: 0o600,
  });
} catch (e) {
  if (e.code !== "EEXIST") throw e;
}
console.log(
  "Local secrets and .env created without overwriting existing configuration. Configure DATABASE_URL for local development.",
);
