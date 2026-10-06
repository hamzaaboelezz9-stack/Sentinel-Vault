import { config } from "./config";
import { database, migrate } from "./db";
import { makeApp } from "./app";
import { readFile } from "node:fs/promises";
import path from "node:path";
async function main() {
  const settings = await config();
  let url = process.env.DATABASE_URL;
  if (!url) {
    const password = (
      await readFile(
        process.env.DB_PASSWORD_FILE ||
          path.join(
            process.env.SECRET_DIR || ".local-data/secrets",
            "database-password",
          ),
        "utf8",
      )
    ).trim();
    url = `postgresql://sentinel:${encodeURIComponent(password)}@db:5432/sentinel`;
  }
  const db = database(url);
  await migrate(db, process.env.SCHEMA_FILE || "db/schema.sql");
  const app = await makeApp(db, settings);
  const cleanup = setInterval(() => {
    void db
      .query(
        "DELETE FROM challenges WHERE expires_at<now(); DELETE FROM sessions WHERE expires_at<now(); DELETE FROM device_pairings WHERE expires_at<now(); DELETE FROM auth_throttle WHERE updated_at<now()-interval '7 days'; DELETE FROM audit_events WHERE created_at<now()-interval '90 days'",
      )
      .catch(() => {});
  }, 300000);
  cleanup.unref();
  const stop = async () => {
    clearInterval(cleanup);
    await app.close();
    await db.end();
    settings.operationalKey.fill(0);
    process.exit(0);
  };
  process.on("SIGTERM", stop);
  process.on("SIGINT", stop);
  await app.listen({
    host: process.env.BIND_HOST || "127.0.0.1",
    port: Number(process.env.PORT || 8080),
  });
  process.stdout.write("Sentinel Vault is ready.\n");
}
main().catch(() => {
  process.stderr.write(
    "Sentinel Vault could not start. Verify configuration, secrets and database availability.\n",
  );
  process.exit(1);
});
