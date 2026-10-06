import { readFile } from "node:fs/promises";
import path from "node:path";
// Explicit operator-only command. No automatic startup logging of invitation credentials.
const bytes = await readFile(
  path.join(
    process.env.SECRET_DIR || ".local-data/secrets",
    "registration.key",
  ),
);
if (bytes.length !== 32) throw new Error("Invalid registration secret.");
process.stdout.write(bytes.toString("base64url") + "\n");
bytes.fill(0);
