import { createClient } from "@libsql/client";
import { existsSync } from "node:fs";

if (!process.env.TURSO_DATABASE_URL || !process.env.TURSO_AUTH_TOKEN) {
  const envFile = existsSync(".env.local") ? ".env.local" : ".env";
  if (existsSync(envFile)) process.loadEnvFile(envFile);
}
const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;
if (!url || !authToken) {
  console.error(
    "Faltam TURSO_DATABASE_URL e/ou TURSO_AUTH_TOKEN. Define-os no ambiente (ou em .env.local na raiz do repo) e volta a correr.",
  );
  process.exit(1);
}

const c = createClient({ url, authToken });
(async () => {
  // Fix timestamps: convert milliseconds to seconds
  const props = await c.execute("SELECT id, created_at FROM properties");
  for (const row of props.rows) {
    const ts = row[1];
    if (ts && ts > 10000000000) {
      // It's in milliseconds, convert to seconds
      await c.execute({
        sql: "UPDATE properties SET created_at = ? WHERE id = ?",
        args: [Math.floor(ts / 1000), row[0]],
      });
    }
  }

  // Fix updated_at and last_checked too
  const props2 = await c.execute("SELECT id, updated_at, last_checked FROM properties");
  for (const row of props2.rows) {
    if (row[1] && row[1] > 10000000000) {
      await c.execute({
        sql: "UPDATE properties SET updated_at = ? WHERE id = ?",
        args: [Math.floor(row[1] / 1000), row[0]],
      });
    }
    if (row[2] && row[2] > 10000000000) {
      await c.execute({
        sql: "UPDATE properties SET last_checked = ? WHERE id = ?",
        args: [Math.floor(row[2] / 1000), row[0]],
      });
    }
  }

  // Fix price_history timestamps
  const ph = await c.execute("SELECT id, recorded_at FROM price_history");
  for (const row of ph.rows) {
    if (row[1] && row[1] > 10000000000) {
      await c.execute({
        sql: "UPDATE price_history SET recorded_at = ? WHERE id = ?",
        args: [Math.floor(row[1] / 1000), row[0]],
      });
    }
  }

  // Fix search_alerts timestamps
  const sa = await c.execute("SELECT id, created_at FROM search_alerts");
  for (const row of sa.rows) {
    if (row[1] && row[1] > 10000000000) {
      await c.execute({
        sql: "UPDATE search_alerts SET created_at = ? WHERE id = ?",
        args: [Math.floor(row[1] / 1000), row[0]],
      });
    }
  }

  // Fix saved_properties timestamps
  const sp = await c.execute("SELECT id, created_at FROM saved_properties");
  for (const row of sp.rows) {
    if (row[1] && row[1] > 10000000000) {
      await c.execute({
        sql: "UPDATE saved_properties SET created_at = ? WHERE id = ?",
        args: [Math.floor(row[1] / 1000), row[0]],
      });
    }
  }

  // Verify
  const sample = await c.execute("SELECT id, created_at FROM properties LIMIT 3");
  console.log("Sample timestamps:", JSON.stringify(sample.rows));
  const date = new Date(sample.rows[0][1] * 1000);
  console.log("Converted date:", date.toLocaleDateString("pt-PT"));
})();
