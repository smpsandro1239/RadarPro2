import { createClient } from "@libsql/client";
const c = createClient({
  url: "libsql://radarpro2-smpsandro1239.aws-eu-west-1.turso.io",
  authToken:
    "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3OTMyMjQxNjUsImlkIjoiMDFhMTg0N2MtYWYwMS03NjVjLWEzOWYtZTdiNzhmMjdiNGMwIiwia2lkIjoiM3loRDhHZlpvc2VVTE44M1BoYVR4ZzllVDRRckNEaHBtbzdfcTNrSU9fNCIsInJpZCI6ImRhZmRiZjQ2LWI2MmEtNDI1NC05ZWQwLThhMTAxYzZjNjlmMCJ9.gxbkXNeVgAiI4MtTw8WDwvTBe5fRkuFV9eC99jOTMZFtic4-GXwF3Zlryovw_uoaxxhZ0NFXkdKbtejzONaMAw",
});
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
