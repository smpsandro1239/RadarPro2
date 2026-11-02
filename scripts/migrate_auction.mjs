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
    "ALTER TABLE properties ADD COLUMN is_auction INTEGER DEFAULT 0",
    "ALTER TABLE properties ADD COLUMN auction_end_date INTEGER",
    "ALTER TABLE properties ADD COLUMN auction_start_date INTEGER",
  ];

  for (const sql of columns) {
    try {
      await c.execute(sql);
      console.log("OK:", sql);
    } catch (e) {
      console.log("Skip:", e.message);
    }
  }

  // Mark auction properties
  const auctionSources = ["e-Leilões", "Leilosoc", "Estamo", "Martelo.pt", "Bidizi"];
  for (const source of auctionSources) {
    await c.execute({
      sql: "UPDATE properties SET is_auction = 1 WHERE source_name = ?",
      args: [source],
    });
  }

  // Set auction end dates for auction properties (random 7-30 days from now)
  const auctionProps = await c.execute("SELECT id FROM properties WHERE is_auction = 1");
  const now = Math.floor(Date.now() / 1000);
  for (const row of auctionProps.rows) {
    const daysLeft = Math.floor(Math.random() * 23) + 7; // 7-30 days
    const endDate = now + daysLeft * 24 * 60 * 60;
    await c.execute({
      sql: "UPDATE properties SET auction_end_date = ? WHERE id = ?",
      args: [endDate, row[0]],
    });
  }

  console.log("Auction properties:", auctionProps.rows.length);
  const total = await c.execute("SELECT COUNT(*) FROM properties WHERE is_auction = 1");
  console.log("Total auction properties:", total.rows[0][0]);
})();
