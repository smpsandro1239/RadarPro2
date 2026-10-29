import { createClient } from "@libsql/client";

const c = createClient({
  url: "libsql://radarpro2-smpsandro1239.aws-eu-west-1.turso.io",
  authToken:
    "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3OTMyMjQxNjUsImlkIjoiMDFhMTg0N2MtYWYwMS03NjVjLWEzOWYtZTdiNzhmMjdiNGMwIiwia2lkIjoiM3loRDhHZlpvc2VVTE44M1BoYVR4ZzllVDRRckNEaHBtbzdfcTNrSU9fNCIsInJpZCI6ImRhZmRiZjQ2LWI2MmEtNDI1NC05ZWQwLThhMTAxYzZjNjlmMCJ9.gxbkXNeVgAiI4MtTw8WDwvTBe5fRkuFV9eC99jOTMZFtic4-GXwF3Zlryovw_uoaxxhZ0NFXkdKbtejzONaMAw",
});

(async () => {
  const columns = [
    "ALTER TABLE properties ADD COLUMN image_url TEXT",
    "ALTER TABLE properties ADD COLUMN image_source TEXT",
    "ALTER TABLE properties ADD COLUMN image_status TEXT DEFAULT 'missing'",
  ];

  for (const sql of columns) {
    try {
      await c.execute(sql);
      console.log("OK:", sql);
    } catch (e) {
      console.log("Skip (may already exist):", e.message);
    }
  }

  const r = await c.execute("SELECT id, image_url, image_status FROM properties LIMIT 3");
  console.log("Sample:", JSON.stringify(r.rows));
})();
