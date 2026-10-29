import { createClient } from "@libsql/client";
const c = createClient({
  url: "libsql://radarpro2-smpsandro1239.aws-eu-west-1.turso.io",
  authToken:
    "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3OTMyMjQxNjUsImlkIjoiMDFhMTg0N2MtYWYwMS03NjVjLWEzOWYtZTdiNzhmMjdiNGMwIiwia2lkIjoiM3loRDhHZlpvc2VVTE44M1BoYVR4ZzllVDRRckNEaHBtbzdfcTNrSU9fNCIsInJpZCI6ImRhZmRiZjQ2LWI2MmEtNDI1NC05ZWQwLThhMTAxYzZjNjlmMCJ9.gxbkXNeVgAiI4MtTw8WDwvTBe5fRkuFV9eC99jOTMZFtic4-GXwF3Zlryovw_uoaxxhZ0NFXkdKbtejzONaMAw",
});
(async () => {
  // Fix timestamps: convert milliseconds to seconds
  const props = await c.execute("SELECT id, created_at FROM properties");
  for (const row of props.rows) {
    const ts = row[1];
    if (ts && ts > 10000000000) {
      // It's in milliseconds, convert to seconds
      await c.execute({
        sql: "UPDATE properties SET created_at = ? WHERE id = ?",
        args: [Math.floor(ts / 1000), row[0]],
      });
    }
  }

  // Fix updated_at and last_checked too
  const props2 = await c.execute("SELECT id, updated_at, last_checked FROM properties");
  for (const row of props2.rows) {
    if (row[1] && row[1] > 10000000000) {
      await c.execute({
        sql: "UPDATE properties SET updated_at = ? WHERE id = ?",
        args: [Math.floor(row[1] / 1000), row[0]],
      });
    }
    if (row[2] && row[2] > 10000000000) {
      await c.execute({
        sql: "UPDATE properties SET last_checked = ? WHERE id = ?",
        args: [Math.floor(row[2] / 1000), row[0]],
      });
    }
  }

  // Fix price_history timestamps
  const ph = await c.execute("SELECT id, recorded_at FROM price_history");
  for (const row of ph.rows) {
    if (row[1] && row[1] > 10000000000) {
      await c.execute({
        sql: "UPDATE price_history SET recorded_at = ? WHERE id = ?",
        args: [Math.floor(row[1] / 1000), row[0]],
      });
    }
  }

  // Fix search_alerts timestamps
  const sa = await c.execute("SELECT id, created_at FROM search_alerts");
  for (const row of sa.rows) {
    if (row[1] && row[1] > 10000000000) {
      await c.execute({
        sql: "UPDATE search_alerts SET created_at = ? WHERE id = ?",
        args: [Math.floor(row[1] / 1000), row[0]],
      });
    }
  }

  // Fix saved_properties timestamps
  const sp = await c.execute("SELECT id, created_at FROM saved_properties");
  for (const row of sp.rows) {
    if (row[1] && row[1] > 10000000000) {
      await c.execute({
        sql: "UPDATE saved_properties SET created_at = ? WHERE id = ?",
        args: [Math.floor(row[1] / 1000), row[0]],
      });
    }
  }

  // Verify
  const sample = await c.execute("SELECT id, created_at FROM properties LIMIT 3");
  console.log("Sample timestamps:", JSON.stringify(sample.rows));
  const date = new Date(sample.rows[0][1] * 1000);
  console.log("Converted date:", date.toLocaleDateString("pt-PT"));
})();
