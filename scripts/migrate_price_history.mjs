import { createClient } from "@libsql/client";
const c = createClient({
  url: "libsql://radarpro2-smpsandro1239.aws-eu-west-1.turso.io",
  authToken:
    "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3OTMyMjQxNjUsImlkIjoiMDFhMTg0N2MtYWYwMS03NjVjLWEzOWYtZTdiNzhmMjdiNGMwIiwia2lkIjoiM3loRDhHZlpvc2VVTE44M1BoYVR4ZzllVDRRckNEaHBtbzdfcTNrSU9fNCIsInJpZCI6ImRhZmRiZjQ2LWI2MmEtNDI1NC05ZWQwLThhMTAxYzZjNjlmMCJ9.gxbkXNeVgAiI4MtTw8WDwvTBe5fRkuFV9eC99jOTMZFtic4-GXwF3Zlryovw_uoaxxhZ0NFXkdKbtejzONaMAw",
});
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
