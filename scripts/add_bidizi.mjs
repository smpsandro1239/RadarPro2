import { createClient } from "@libsql/client";

const c = createClient({
  url: "libsql://radarpro2-smpsandro1239.aws-eu-west-1.turso.io",
  authToken:
    "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3OTMyMjQxNjUsImlkIjoiMDFhMTg0N2MtYWYwMS03NjVjLWEzOWYtZTdiNzhmMjdiNGMwIiwia2lkIjoiM3loRDhHZlpvc2VVTE44M1BoYVR4ZzllVDRRckNEaHBtbzdfcTNrSU9fNCIsInJpZCI6ImRhZmRiZjQ2LWI2MmEtNDI1NC05ZWQwLThhMTAxYzZjNjlmMCJ9.gxbkXNeVgAiI4MtTw8WDwvTBe5fRkuFV9eC99jOTMZFtic4-GXwF3Zlryovw_uoaxxhZ0NFXkdKbtejzONaMAw",
});

const newProps = [
  { id: "bidizi-lis-1", source: "leilao", sourceName: "Bidizi", url: "https://bidizi.pt/leiloes/apartamento-sito-no-lumiar-lisboa-lisboa-5643ec", title: "Apartamento Lumiar, Lisboa", district: "Lisboa", municipality: "Lisboa", type: "T2", price: 320000, marketValue: 420000, discountPct: 24, score: 82, rentability: 5.0, images: "[]" },
  { id: "bidizi-lis-2", source: "leilao", sourceName: "Bidizi", url: "https://bidizi.pt/leiloes/imovel-3336-2026-2-execucao-fiscal-at-lisboa-1b0204", title: "Apartamento Parque das Nações (Execução Fiscal)", district: "Lisboa", municipality: "Lisboa", type: "T3", price: 272882, marketValue: 350000, discountPct: 22, score: 79, rentability: 4.8, images: "[]" },
  { id: "bidizi-por-1", source: "leilao", sourceName: "Bidizi", url: "https://bidizi.pt/leiloes/imovel-1821-2026-14-execucao-fiscal-at-porto-5aa6ff", title: "Apartamento Ramalde (Execução Fiscal AT)", district: "Porto", municipality: "Porto", type: "T2", price: 2901, marketValue: 120000, discountPct: 98, score: 99, rentability: 15.0, images: "[]" },
  { id: "bidizi-por-2", source: "leilao", sourceName: "Bidizi", url: "https://bidizi.pt/leiloes/imovel-1805-2026-11-execucao-fiscal-at-porto-bccf46", title: "Imóvel Porto (Execução Fiscal AT)", district: "Porto", municipality: "Porto", type: "T1", price: 13534, marketValue: 85000, discountPct: 84, score: 97, rentability: 12.0, images: "[]" },
  { id: "bidizi-bra-1", source: "leilao", sourceName: "Bidizi", url: "https://bidizi.pt/leiloes/imovel-0361-2026-37-execucao-fiscal-at-braga-0e33f1", title: "Apartamento Maximinos (Execução Fiscal AT)", district: "Braga", municipality: "Braga", type: "T2", price: 90592, marketValue: 150000, discountPct: 40, score: 94, rentability: 8.0, images: "[]" },
  { id: "bidizi-bra-2", source: "leilao", sourceName: "Bidizi", url: "https://bidizi.pt/leiloes/imovel-destinado-a-comercio-loja-situado-na-freguesia-de-se-concelho-de-braga-braga-dc2506", title: "Loja Braga (Execução Fiscal)", district: "Braga", municipality: "Braga", type: "Loja", price: 68235, marketValue: 110000, discountPct: 38, score: 92, rentability: 9.0, images: "[]" },
];

async function main() {
  let added = 0;
  for (const p of newProps) {
    const existing = await c.execute({ sql: "SELECT id FROM properties WHERE id = ?", args: [p.id] });
    if (existing.rows.length > 0) continue;

    await c.execute({
      sql: `INSERT INTO properties (id, source, source_name, url, title, district, municipality, type, price, market_value, discount_pct, score, rentability, images, is_active, check_status, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 'pending', ?, ?)`,
      args: [
        p.id, p.source, p.sourceName, p.url, p.title, p.district, p.municipality, p.type,
        p.price, p.marketValue, p.discountPct, p.score, p.rentability, p.images,
        Math.floor(Date.now() / 1000), Math.floor(Date.now() / 1000),
      ],
    });
    added++;
  }

  const r = await c.execute("SELECT COUNT(*) as count FROM properties");
  console.log(`Total: ${r.rows[0][0]} imóveis (${added} novos do Bidizi)`);

  const sources = await c.execute("SELECT source_name, COUNT(*) as count FROM properties GROUP BY source_name ORDER BY count DESC");
  console.log("\nPor fonte:");
  for (const row of sources.rows) {
    console.log(`  ${row[0]}: ${row[1]}`);
  }
}

main().catch(console.error);
