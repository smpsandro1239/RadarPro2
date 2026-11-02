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
  const columns = [
    "ALTER TABLE properties ADD COLUMN lat REAL",
    "ALTER TABLE properties ADD COLUMN lng REAL",
    "ALTER TABLE properties ADD COLUMN geo_quality TEXT",
    "ALTER TABLE properties ADD COLUMN dedup_hash TEXT",
  ];

  for (const sql of columns) {
    try {
      await c.execute(sql);
      console.log("OK:", sql);
    } catch (e) {
      console.log("Skip (may exist):", e.message);
    }
  }

  // Generate dedup hashes for all properties
  const props = await c.execute("SELECT id, title, district, municipality, type, price FROM properties");
  for (const row of props.rows) {
    const hash = [row[1], row[2], row[3], row[4], row[5]].join("|").toLowerCase().replace(/\s+/g, "");
    await c.execute({
      sql: "UPDATE properties SET dedup_hash = ? WHERE id = ?",
      args: [hash, row[0]],
    });
  }
  console.log("Dedup hashes generated for", props.rows.length, "properties");
})();
