import { createClient } from "@libsql/client";
const c = createClient({
  url: "libsql://radarpro2-smpsandro1239.aws-eu-west-1.turso.io",
  authToken:
    "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3OTMyMjQxNjUsImlkIjoiMDFhMTg0N2MtYWYwMS03NjVjLWEzOWYtZTdiNzhmMjdiNGMwIiwia2lkIjoiM3loRDhHZlpvc2VVTE44M1BoYVR4ZzllVDRRckNEaHBtbzdfcTNrSU9fNCIsInJpZCI6ImRhZmRiZjQ2LWI2MmEtNDI1NC05ZWQwLThhMTAxYzZjNjlmMCJ9.gxbkXNeVgAiI4MtTw8WDwvTBe5fRkuFV9eC99jOTMZFtic4-GXwF3Zlryovw_uoaxxhZ0NFXkdKbtejzONaMAw",
});
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
