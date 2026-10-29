import { createClient } from "@libsql/client";

const c = createClient({
  url: "libsql://radarpro2-smpsandro1239.aws-eu-west-1.turso.io",
  authToken:
    "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3OTMyMjQxNjUsImlkIjoiMDFhMTg0N2MtYWYwMS03NjVjLWEzOWYtZTdiNzhmMjdiNGMwIiwia2lkIjoiM3loRDhHZlpvc2VVTE44M1BoYVR4ZzllVDRRckNEaHBtbzdfcTNrSU9fNCIsInJpZCI6ImRhZmRiZjQ2LWI2MmEtNDI1NC05ZWQwLThhMTAxYzZjNjlmMCJ9.gxbkXNeVgAiI4MtTw8WDwvTBe5fRkuFV9eC99jOTMZFtic4-GXwF3Zlryovw_uoaxxhZ0NFXkdKbtejzONaMAw",
});

const urlUpdates = [
  { id: "mart-lis-1", url: "https://martelo.pt/leilao/NP1212732026.html" },
  { id: "mart-por-1", url: "https://martelo.pt/leilao/LO1449022026.html" },
  { id: "mart-bra-1", url: "https://martelo.pt/leilao/NP1225562026.html" },
];

async function main() {
  for (const update of urlUpdates) {
    await c.execute({
      sql: "UPDATE properties SET url = ? WHERE id = ?",
      args: [update.url, update.id],
    });
  }
  console.log("Updated", urlUpdates.length, "Martelo.pt URLs");

  // Verify
  const sample = await c.execute("SELECT id, title, url FROM properties WHERE source_name = 'Martelo.pt'");
  for (const row of sample.rows) {
    console.log(row[0], "|", row[1], "|", row[2]);
  }
}

main().catch(console.error);
