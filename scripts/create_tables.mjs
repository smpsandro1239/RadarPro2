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
  await c.execute(`CREATE TABLE IF NOT EXISTS properties (
    id TEXT PRIMARY KEY,
    source TEXT NOT NULL,
    source_name TEXT NOT NULL,
    url TEXT NOT NULL,
    title TEXT NOT NULL,
    district TEXT NOT NULL,
    municipality TEXT NOT NULL,
    type TEXT NOT NULL,
    price REAL NOT NULL,
    market_value REAL,
    discount_pct REAL,
    score INTEGER,
    rentability REAL,
    images TEXT,
    created_at INTEGER
  )`);
  await c.execute(`CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    plan TEXT DEFAULT 'free',
    stripe_customer_id TEXT,
    subscription_status TEXT
  )`);
  console.log("Tables created");
  const r = await c.execute("SELECT name FROM sqlite_master WHERE type='table'");
  console.log(JSON.stringify(r.rows));
})();
