import { createClient } from "@libsql/client";

const c = createClient({
  url: "libsql://radarpro2-smpsandro1239.aws-eu-west-1.turso.io",
  authToken:
    "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3OTMyMjQxNjUsImlkIjoiMDFhMTg0N2MtYWYwMS03NjVjLWEzOWYtZTdiNzhmMjdiNGMwIiwia2lkIjoiM3loRDhHZlpvc2VVTE44M1BoYVR4ZzllVDRRckNEaHBtbzdfcTNrSU9fNCIsInJpZCI6ImRhZmRiZjQ2LWI2MmEtNDI1NC05ZWQwLThhMTAxYzZjNjlmMCJ9.gxbkXNeVgAiI4MtTw8WDwvTBe5fRkuFV9eC99jOTMZFtic4-GXwF3Zlryovw_uoaxxhZ0NFXkdKbtejzONaMAw",
});

const BASE = "https://casa.sapo.pt";

const moreProps = [
  // === CASA SAPO - PORTO (novos) ===
  { id: "cs-por-9", source: "portal", sourceName: "Casa Sapo", url: `${BASE}/comprar-apartamento-t0-porto-bonfim-7aea4239-18a5-11f1-8add-060000000054.html`, title: "Apartamento T0 Bonfim (novo)", district: "Porto", municipality: "Porto", type: "T0", price: 165000, marketValue: 205000, discountPct: 20, score: 80, rentability: 5.5, images: "https://media.casasapo.pt/Z360x270/OAYES/S5/C4494/P29553555/Tphoto/ID93f3c201-0000-0500-0000-0000189e5a4a.jpg.webp" },
  { id: "cs-por-10", source: "portal", sourceName: "Casa Sapo", url: `${BASE}/comprar-apartamento-t0-porto-bonfim-d4e9e4f0-5761-11f0-8add-060000000054.html`, title: "Apartamento T0 Bonfim (construção)", district: "Porto", municipality: "Porto", type: "T0", price: 168000, marketValue: 210000, discountPct: 20, score: 79, rentability: 5.2, images: "https://media.casasapo.pt/Z360x270/OAYES/S5/C4494/P27374157/Tphoto/ID4db2a101-0000-0500-0000-0000160b14d3.jpg.webp" },
  { id: "cs-por-11", source: "portal", sourceName: "Casa Sapo", url: `${BASE}/comprar-apartamento-t2-porto-campanha-ce87169d-6322-11f1-9a8d-060000000057.html`, title: "Apartamento T2 Campanhã (investimento)", district: "Porto", municipality: "Porto", type: "T2", price: 169000, marketValue: 215000, discountPct: 21, score: 82, rentability: 5.8, images: "https://media.casasapo.pt/Z360x270/OAYES/S5/C16767/P30318374/Tphoto/ID269fce01-0000-0500-0000-00001999825c.jpg.webp" },
  { id: "cs-por-12", source: "portal", sourceName: "Casa Sapo", url: `${BASE}/comprar-apartamento-t0-porto-cedofeita-santo-ildefonso-se-miragaia-sao-nicolau-e-vitoria-febf1142-baf6-11f0-bd5e-060000000058.html`, title: "Apartamento T0 Cedofeita (escritório)", district: "Porto", municipality: "Porto", type: "T0", price: 172500, marketValue: 210000, discountPct: 18, score: 77, rentability: 5.0, images: "https://media.casasapo.pt/Z360x270/OAYES/S5/C3871/P28647188/Tphoto/ID141fb501-0000-0500-0000-0000179255b9.jpg.webp" },
  { id: "cs-por-13", source: "portal", sourceName: "Casa Sapo", url: `${BASE}/comprar-apartamento-t1-porto-ramalde-6ea68e0a-7c31-11eb-aee4-060000000054.html`, title: "Apartamento T1 Ramalde (novo)", district: "Porto", municipality: "Porto", type: "T1", price: 173250, marketValue: 210000, discountPct: 18, score: 77, rentability: 5.0, images: "https://media.casasapo.pt/Z360x270/OAYES/S5/C5554/P20629495/Tphoto/IDf7c73a01-0000-0500-0000-00000dcfe66b.jpg.webp" },

  // === CASA SAPO - LISBOA (novos) ===
  { id: "cs-lis-6", source: "portal", sourceName: "Casa Sapo", url: `${BASE}/comprar-apartamento-t1-lisboa-santa-maria-maior-fbed17e2-281d-11f1-90a1-060000000056.html`, title: "Apartamento T1 Santa Maria Maior (obras)", district: "Lisboa", municipality: "Lisboa", type: "T1", price: 159000, marketValue: 195000, discountPct: 18, score: 78, rentability: 5.5, images: "https://media.casasapo.pt/Z360x270/OAYES/S5/C5701/P29726811/Tphoto/ID5b98c501-0000-0500-0000-000018dcadad.jpg.webp" },
  { id: "cs-lis-7", source: "portal", sourceName: "Casa Sapo", url: `${BASE}/comprar-apartamento-t1-lisboa-olivais-b3d55d45-ae89-11f1-9c13-060000000051.html`, title: "Apartamento T1 Olivais (investimento)", district: "Lisboa", municipality: "Lisboa", type: "T1", price: 154900, marketValue: 190000, discountPct: 18, score: 77, rentability: 5.4, images: "https://media.casasapo.pt/Z360x270/OAYES/S5/C5304/P31019230/Tphoto/IDde50d901-0000-0500-0000-00001a5e659e.jpg.webp" },
  { id: "cs-lis-8", source: "portal", sourceName: "Casa Sapo", url: `${BASE}/comprar-apartamento-t0-lisboa-penha-de-franca-fc0f69f4-63f3-11f1-9aaf-060000000054.html`, title: "Apartamento T0 Penha de França (vitalícia)", district: "Lisboa", municipality: "Lisboa", type: "T0", price: 150000, marketValue: 185000, discountPct: 19, score: 78, rentability: 5.5, images: "https://media.casasapo.pt/Z360x270/OAYES/S5/C15505/P30323089/Tphoto/ID91b1ce01-0000-0500-0000-0000199b1e1a.jpg.webp" },

  // === CASA SAPO - BRAGA (novos) ===
  { id: "cs-bra-10", source: "portal", sourceName: "Casa Sapo", url: `${BASE}/comprar-apartamento-t0-braga-sao-jose-de-sao-lazaro-e-sao-joao-do-souto-76ad5d48-cf0c-11f1-9aaf-060000000054.html`, title: "Apartamento T0 Centro Braga (histórico)", district: "Braga", municipality: "Braga", type: "T0", price: 159000, marketValue: 195000, discountPct: 18, score: 80, rentability: 5.5, images: "https://media.casasapo.pt/Z360x270/OAYES/S5/C3981/P31287967/Tphoto/ID9f6add01-0000-0500-0000-00001ab2a792.jpg.webp" },
  { id: "cs-bra-11", source: "portal", sourceName: "Casa Sapo", url: `${BASE}/comprar-apartamento-t1-braga-sao-victor-9054ce89-3950-4fd9-9cdf-a07fafdc98ed.html`, title: "Apartamento T1 São Víctor (funcional)", district: "Braga", municipality: "Braga", type: "T1", price: 160000, marketValue: 198000, discountPct: 19, score: 79, rentability: 5.7, images: "https://media.casasapo.pt/Z360x270/OAYES/S6/C1122978/P200390738/Tphoto/ID28ff4ed9-7bc1-46f5-af6a-b78d17dbb219.jpg.webp" },
  { id: "cs-bra-12", source: "portal", sourceName: "Casa Sapo", url: `${BASE}/comprar-apartamento-t0-braga-ferreiros-e-gondizalves-f6e864a3-38b6-11f1-bc59-060000000052.html`, title: "Apartamento T0 Ferreiros (condomínio)", district: "Braga", municipality: "Braga", type: "T0", price: 175000, marketValue: 215000, discountPct: 19, score: 78, rentability: 5.2, images: "https://media.casasapo.pt/Z360x270/OAYES/S5/C10286/P29894402/Tphoto/ID0227c801-0000-0500-0000-0000191da828.jpg.webp" },
];

async function main() {
  let added = 0;
  for (const p of moreProps) {
    const existing = await c.execute({ sql: "SELECT id FROM properties WHERE id = ?", args: [p.id] });
    if (existing.rows.length > 0) continue;

    await c.execute({
      sql: `INSERT INTO properties (id, source, source_name, url, title, district, municipality, type, price, market_value, discount_pct, score, rentability, images, is_active, check_status, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 'pending', ?, ?)`,
      args: [
        p.id, p.source, p.sourceName, p.url, p.title, p.district, p.municipality, p.type,
        p.price, p.marketValue, p.discountPct, p.score, p.rentability, JSON.stringify([p.images]),
        Math.floor(Date.now() / 1000), Math.floor(Date.now() / 1000),
      ],
    });
    added++;
  }

  const r = await c.execute("SELECT COUNT(*) as count FROM properties");
  const withImages = await c.execute("SELECT COUNT(*) FROM properties WHERE images != '[]' AND images IS NOT NULL");
  console.log(`Total: ${r.rows[0][0]} imóveis (${added} novos)`);
  console.log(`Com imagens reais: ${withImages.rows[0][0]}`);
}

main().catch(console.error);
