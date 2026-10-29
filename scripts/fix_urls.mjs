import { createClient } from "@libsql/client";

const c = createClient({
  url: "libsql://radarpro2-smpsandro1239.aws-eu-west-1.turso.io",
  authToken:
    "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3OTMyMjQxNjUsImlkIjoiMDFhMTg0N2MtYWYwMS03NjVjLWEzOWYtZTdiNzhmMjdiNGMwIiwia2lkIjoiM3loRDhHZlpvc2VVTE44M1BoYVR4ZzllVDRRckNEaHBtbzdfcTNrSU9fNCIsInJpZCI6ImRhZmRiZjQ2LWI2MmEtNDI1NC05ZWQwLThhMTAxYzZjNjlmMCJ9.gxbkXNeVgAiI4MtTw8WDwvTBe5fRkuFV9eC99jOTMZFtic4-GXwF3Zlryovw_uoaxxhZ0NFXkdKbtejzONaMAw",
});

const urlUpdates = [
  { id: "ls-lis-1", url: "https://leilosoc.com/pt-PT/lot/45738/167183-edificio-oliveira-do-hospital-coimbra/" },
  { id: "ls-por-1", url: "https://leilosoc.com/pt-PT/lot/45750/172474-terreno-para-construcao-de-5-moradias-pip-favoravel-canelas-vila-nova-de-gaia/" },
  { id: "ls-bra-1", url: "https://leilosoc.com/pt-PT/lot/45615/173457-proporcao-de-1-2-de-armazem-sao-torcato-guimaraes/" },
  { id: "el-lis-1", url: "https://www.e-leiloes.pt/leilao/NP1198802026/" },
  { id: "el-por-1", url: "https://www.e-leiloes.pt/leilao/NP1198802026/" },
  { id: "el-bra-1", url: "https://www.e-leiloes.pt/leilao/NP1198802026/" },
  { id: "est-lis-1", url: "https://www.estamo.pt/hasta-publica/" },
  { id: "est-por-1", url: "https://www.estamo.pt/hasta-publica/" },
  { id: "est-bra-1", url: "https://www.estamo.pt/hasta-publica/" },
  { id: "mart-lis-1", url: "https://martelo.pt/leiloes/imoveis" },
  { id: "mart-por-1", url: "https://martelo.pt/leiloes/imoveis" },
  { id: "mart-bra-1", url: "https://martelo.pt/leiloes/imoveis" },
  { id: "id-lis-1", url: "https://www.idealista.pt/comprar-casas/lisboa/com-preco-max_100000/" },
  { id: "id-por-1", url: "https://www.idealista.pt/comprar-casas/porto/com-preco-max_100000/" },
  { id: "id-bra-1", url: "https://www.idealista.pt/comprar-casas/braga/com-preco-max_100000/" },
];

async function main() {
  for (const update of urlUpdates) {
    await c.execute({
      sql: "UPDATE properties SET url = ? WHERE id = ?",
      args: [update.url, update.id],
    });
  }
  console.log("Updated", urlUpdates.length, "property URLs");

  const sample = await c.execute("SELECT id, title, url FROM properties WHERE source = 'leilao' LIMIT 5");
  for (const row of sample.rows) {
    console.log(row[0], "|", row[1], "|", row[2]);
  }
}

main().catch(console.error);
