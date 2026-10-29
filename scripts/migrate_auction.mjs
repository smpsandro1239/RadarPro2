import { createClient } from "@libsql/client";
const c = createClient({
  url: "libsql://radarpro2-smpsandro1239.aws-eu-west-1.turso.io",
  authToken:
    "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3OTMyMjQxNjUsImlkIjoiMDFhMTg0N2MtYWYwMS03NjVjLWEzOWYtZTdiNzhmMjdiNGMwIiwia2lkIjoiM3loRDhHZlpvc2VVTE44M1BoYVR4ZzllVDRRckNEaHBtbzdfcTNrSU9fNCIsInJpZCI6ImRhZmRiZjQ2LWI2MmEtNDI1NC05ZWQwLThhMTAxYzZjNjlmMCJ9.gxbkXNeVgAiI4MtTw8WDwvTBe5fRkuFV9eC99jOTMZFtic4-GXwF3Zlryovw_uoaxxhZ0NFXkdKbtejzONaMAw",
});
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
