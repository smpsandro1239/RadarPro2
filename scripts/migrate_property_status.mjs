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
    "ALTER TABLE properties ADD COLUMN is_active INTEGER DEFAULT 1",
    "ALTER TABLE properties ADD COLUMN last_checked INTEGER",
    "ALTER TABLE properties ADD COLUMN check_status TEXT DEFAULT 'pending'",
    "ALTER TABLE properties ADD COLUMN updated_at INTEGER",
  ];

  for (const sql of columns) {
    try {
      await c.execute(sql);
      console.log("OK:", sql);
    } catch (e) {
      console.log("Skip (may exist):", e.message);
    }
  }

  // Set all existing properties as active
  await c.execute("UPDATE properties SET is_active = 1, check_status = 'pending' WHERE is_active IS NULL");
  console.log("Properties updated");

  const r = await c.execute("SELECT COUNT(*) as total, SUM(is_active) as active FROM properties");
  console.log("Total:", r.rows[0][0], "Active:", r.rows[0][1]);
})();
