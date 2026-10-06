import { Pool } from "pg";
import { readFile } from "node:fs/promises";
export interface Connection {
  query(
    text: string,
    values?: unknown[],
  ): Promise<{ rows: any[]; rowCount?: number | null }>;
  release(): void;
}
export interface Database {
  query(
    text: string,
    values?: unknown[],
  ): Promise<{ rows: any[]; rowCount?: number | null }>;
  connect(): Promise<Connection>;
  end(): Promise<void>;
}
export function database(url: string): Database {
  const pool = new Pool({
    connectionString: url,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  });
  // Idle database failures are handled by reconnecting/query errors, never dumped with connection metadata.
  pool.on("error", () => {});
  return pool as Database;
}
export async function migrate(db: Database, filename: string) {
  const sql = await readFile(filename, "utf8");
  await db.query(sql);
}
export async function transaction<T>(
  db: Database,
  fn: (client: Connection) => Promise<T>,
): Promise<T> {
  const c = await db.connect();
  try {
    await c.query("BEGIN");
    const value = await fn(c);
    await c.query("COMMIT");
    return value;
  } catch (error) {
    await c.query("ROLLBACK");
    throw error;
  } finally {
    c.release();
  }
}
