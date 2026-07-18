import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import pg from "pg";

const { Client } = pg;
const migrationsRoot = path.join(process.cwd(), "prisma", "migrations");

async function getMigrationFiles() {
  const entries = await fs.readdir(migrationsRoot, { withFileTypes: true });
  const migrations = [];

  for (const entry of entries
    .filter((item) => item.isDirectory())
    .sort((a, b) => a.name.localeCompare(b.name))) {
    const file = path.join(migrationsRoot, entry.name, "migration.sql");
    try {
      const sql = await fs.readFile(file, "utf8");
      migrations.push({ name: entry.name, sql });
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
    }
  }

  return migrations;
}

async function main() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required");

  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  try {
    await client.query("SELECT pg_advisory_lock($1)", [874246193]);
    await client.query(`
      CREATE TABLE IF NOT EXISTS "_ws_wishlist_migrations" (
        "name" TEXT PRIMARY KEY,
        "appliedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    const migrations = await getMigrationFiles();
    for (const migration of migrations) {
      const existing = await client.query(
        'SELECT 1 FROM "_ws_wishlist_migrations" WHERE "name" = $1',
        [migration.name]
      );
      if (existing.rowCount) continue;

      console.log(`Applying database migration ${migration.name}`);
      await client.query("BEGIN");
      try {
        await client.query(migration.sql);
        await client.query(
          'INSERT INTO "_ws_wishlist_migrations" ("name") VALUES ($1)',
          [migration.name]
        );
        await client.query("COMMIT");
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      }
    }
  } finally {
    await client
      .query("SELECT pg_advisory_unlock($1)", [874246193])
      .catch(() => {});
    await client.end();
  }
}

main().catch((error) => {
  console.error("Database migration failed", error);
  process.exit(1);
});
