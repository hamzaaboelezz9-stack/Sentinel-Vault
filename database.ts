import { PGlite } from "@electric-sql/pglite";
import { readFile } from "node:fs/promises";
import { database, type Database, type Connection } from "../apps/api/src/db";
export async function testDatabase(directory?: string): Promise<Database> {
  // CI can run this SAME suite against PostgreSQL. Guard against accidental use of a real vault database.
  if (process.env.TEST_DATABASE_URL) {
    const url = new URL(process.env.TEST_DATABASE_URL);
    if (!url.pathname.endsWith("_test"))
      throw new Error(
        "TEST_DATABASE_URL must name a dedicated database ending _test.",
      );
    const db = database(url.href);
    await db.query("DROP SCHEMA public CASCADE; CREATE SCHEMA public;");
    await db.query(await readFile("db/schema.sql", "utf8"));
    return db;
  }
  const pg = new PGlite(directory);
  await pg.waitReady;
  // PGlite is single-connection PostgreSQL. A mutex provides connection ownership across explicit transactions.
  let queue = Promise.resolve();
  async function acquire() {
    let release!: () => void;
    const next = new Promise<void>((r) => (release = r));
    const previous = queue;
    queue = previous.then(() => next);
    await previous;
    return release;
  }
  const run = async (text: string, values?: unknown[]) => {
    if (/^SELECT pg_advisory_xact_lock/.test(text))
      return { rows: [], rowCount: 0 }; // Single backend + connection mutex has equivalent serialization in this test adapter.
    if (!values && text.includes(";")) {
      await pg.exec(text);
      return { rows: [], rowCount: 0 };
    }
    const result = await pg.query(text, values);
    return { rows: result.rows, rowCount: result.affectedRows };
  };
  const db: Database = {
    query: async (text, values) => {
      const release = await acquire();
      try {
        return await run(text, values);
      } finally {
        release();
      }
    },
    connect: async () => {
      const release = await acquire();
      return { query: run, release } as Connection;
    },
    end: async () => {
      await queue;
      await pg.close();
    },
  };
  await db.query(await readFile("db/schema.sql", "utf8"));
  return db;
}
