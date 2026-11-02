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
  await c.execute(`CREATE TABLE IF NOT EXISTS price_history (
    id TEXT PRIMARY KEY,
    property_id TEXT NOT NULL,
    price REAL NOT NULL,
    market_value REAL,
    recorded_at INTEGER
  )`);

  // Add sample price history for a few properties
  const now = Math.floor(Date.now() / 1000);
  const day = 24 * 60 * 60 * 1000;
  const samples = [
    { propId: "cs-lis-1", prices: [115000, 120000, 125000, 115000] },
    { propId: "cs-por-1", prices: [160000, 155000, 150000] },
    { propId: "cs-bra-1", prices: [165000, 160000, 159000] },
  ];

  for (const s of samples) {
    for (let i = 0; i < s.prices.length; i++) {
      await c.execute({
        sql: `INSERT INTO price_history (id, property_id, price, recorded_at) VALUES (?, ?, ?, ?)`,
        args: [crypto.randomUUID(), s.propId, s.prices[i], now - (s.prices.length - i) * 7 * day],
      });
    }
  }

  const r = await c.execute("SELECT COUNT(*) as count FROM price_history");
  console.log("Price history records:", r.rows[0][0]);
})();
