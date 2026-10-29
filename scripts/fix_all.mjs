import { createClient } from "@libsql/client";

const c = createClient({
  url: "libsql://radarpro2-smpsandro1239.aws-eu-west-1.turso.io",
  authToken:
    "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3OTMyMjQxNjUsImlkIjoiMDFhMTg0N2MtYWYwMS03NjVjLWEzOWYtZTdiNzhmMjdiNGMwIiwia2lkIjoiM3loRDhHZlpvc2VVTE44M1BoYVR4ZzllVDRRckNEaHBtbzdfcTNrSU9fNCIsInJpZCI6ImRhZmRiZjQ2LWI2MmEtNDI1NC05ZWQwLThhMTAxYzZjNjlmMCJ9.gxbkXNeVgAiI4MtTw8WDwvTBe5fRkuFV9eC99jOTMZFtic4-GXwF3Zlryovw_uoaxxhZ0NFXkdKbtejzONaMAw",
});

// Fix existing timestamps from milliseconds to seconds
async function fixTimestamps() {
  const tables = [
    { table: "properties", column: "created_at" },
    { table: "properties", column: "updated_at" },
    { table: "properties", column: "last_checked" },
    { table: "price_history", column: "recorded_at" },
    { table: "search_alerts", column: "created_at" },
    { table: "saved_properties", column: "created_at" },
  ];

  for (const { table, column } of tables) {
    try {
      const rows = await c.execute(`SELECT id, ${column} FROM ${table}`);
      for (const row of rows.rows) {
        const ts = row[1];
        if (ts && ts > 10000000000) {
          await c.execute({
            sql: `UPDATE ${table} SET ${column} = ? WHERE id = ?`,
            args: [Math.floor(ts / 1000), row[0]],
          });
        }
      }
    } catch (e) {
      // Table might not exist
    }
  }
  console.log("Timestamps fixed");
}

// Update auction site URLs to specific property pages
const urlUpdates = [
  { id: "el-lis-1", url: "https://www.e-leiloes.pt/leilao/NP1181932026/" },
  { id: "el-por-1", url: "https://www.e-leiloes.pt/leilao/NP1184922026/" },
  { id: "el-bra-1", url: "https://www.e-leiloes.pt/leilao/NP1193772026/" },
  { id: "ls-lis-1", url: "https://leilosoc.com/pt-PT/lot/45738/167183-edificio-oliveira-do-hospital-coimbra/" },
  { id: "ls-por-1", url: "https://leilosoc.com/pt-PT/lot/45750/172474-terreno-para-construcao-de-5-moradias-pip-favoravel-canelas-vila-nova-de-gaia/" },
  { id: "ls-bra-1", url: "https://leilosoc.com/pt-PT/lot/45615/173457-proporcao-de-1-2-de-armazem-sao-torcato-guimaraes/" },
];

async function fixUrls() {
  for (const update of urlUpdates) {
    await c.execute({
      sql: "UPDATE properties SET url = ? WHERE id = ?",
      args: [update.url, update.id],
    });
  }
  console.log("URLs updated:", urlUpdates.length);
}

async function main() {
  await fixTimestamps();
  await fixUrls();

  // Verify
  const sample = await c.execute("SELECT id, title, url, created_at FROM properties WHERE source = 'leilao' LIMIT 5");
  for (const row of sample.rows) {
    const date = new Date(row[3] * 1000);
    console.log(row[0], "|", row[1], "|", row[2], "|", date.toLocaleDateString("pt-PT"));
  }
}

main().catch(console.error);
