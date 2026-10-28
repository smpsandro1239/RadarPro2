import { createClient } from "@libsql/client";
const c = createClient({
  url: "libsql://radarpro2-smpsandro1239.aws-eu-west-1.turso.io",
  authToken:
    "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3OTMyMjQxNjUsImlkIjoiMDFhMTg0N2MtYWYwMS03NjVjLWEzOWYtZTdiNzhmMjdiNGMwIiwia2lkIjoiM3loRDhHZlpvc2VVTE44M1BoYVR4ZzllVDRRckNEaHBtbzdfcTNrSU9fNCIsInJpZCI6ImRhZmRiZjQ2LWI2MmEtNDI1NC05ZWQwLThhMTAxYzZjNjlmMCJ9.gxbkXNeVgAiI4MtTw8WDwvTBe5fRkuFV9eC99jOTMZFtic4-GXwF3Zlryovw_uoaxxhZ0NFXkdKbtejzONaMAw",
});
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
