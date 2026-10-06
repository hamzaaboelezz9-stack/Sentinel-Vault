import { randomBytes } from "node:crypto";
import path from "node:path";
import { testDatabase } from "../tests/database";
import { makeApp } from "../apps/api/src/app";
import { writeFile, mkdir } from "node:fs/promises";
// Isolated browser-test server: no production bypass, real WebAuthn verification, ephemeral PostgreSQL engine.
const db = await testDatabase();
const app = await makeApp(db, {
  origin: "http://localhost:8080",
  rpId: "localhost",
  secure: false,
  operationalKey: randomBytes(32),
  registrationToken: "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
  trustProxy: false,
  staticDir: path.resolve("build/web"),
});
await mkdir("docs", { recursive: true });
await writeFile(
  "docs/openapi.json",
  JSON.stringify(app.swagger(), null, 2) + "\n",
);
await app.listen({ host: "127.0.0.1", port: 8080 });
const stop = async () => {
  await app.close();
  await db.end();
  process.exit(0);
};
process.on("SIGINT", stop);
process.on("SIGTERM", stop);
