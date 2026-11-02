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
  try {
    await c.execute(`CREATE TABLE IF NOT EXISTS search_alerts (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      district TEXT,
      max_price REAL,
      min_score INTEGER,
      property_type TEXT,
      email TEXT NOT NULL,
      active INTEGER DEFAULT 1,
      created_at INTEGER
    )`);
    console.log("Table created");
  } catch (e) {
    console.log("Error:", e.message);
  }
})();
