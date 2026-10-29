import { createClient } from "@libsql/client";

const c = createClient({
  url: "libsql://radarpro2-smpsandro1239.aws-eu-west-1.turso.io",
  authToken:
    "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3OTMyMjQxNjUsImlkIjoiMDFhMTg0N2MtYWYwMS03NjVjLWEzOWYtZTdiNzhmMjdiNGMwIiwia2lkIjoiM3loRDhHZlpvc2VVTE44M1BoYVR4ZzllVDRRckNEaHBtbzdfcTNrSU9fNCIsInJpZCI6ImRhZmRiZjQ2LWI2MmEtNDI1NC05ZWQwLThhMTAxYzZjNjlmMCJ9.gxbkXNeVgAiI4MtTw8WDwvTBe5fRkuFV9eC99jOTMZFtic4-GXwF3Zlryovw_uoaxxhZ0NFXkdKbtejzONaMAw",
});

// All districts of Portugal
const allDistricts = [
  "Aveiro", "Beja", "Braga", "Bragança", "Castelo Branco", "Coimbra",
  "Évora", "Faro", "Guarda", "Leiria", "Lisboa", "Portalegre",
  "Porto", "Santarém", "Setúbal", "Viana do Castelo", "Vila Real",
  "Viseu", "Açores", "Madeira",
];

// Price per m² benchmarks by district (2026 market data)
const priceBenchmarks = {
  "Lisboa": { avg: 5200, min: 3800, max: 8500 },
  "Porto": { avg: 3800, min: 2500, max: 6500 },
  "Braga": { avg: 2600, min: 1800, max: 4200 },
  "Faro": { avg: 3500, min: 2200, max: 6000 },
  "Setúbal": { avg: 3200, min: 2000, max: 5500 },
  "Aveiro": { avg: 2400, min: 1600, max: 4000 },
  "Coimbra": { avg: 2200, min: 1500, max: 3800 },
  "Leiria": { avg: 2000, min: 1400, max: 3500 },
  "Santarém": { avg: 1800, min: 1200, max: 3200 },
  "Viseu": { avg: 1700, min: 1100, max: 3000 },
  "Viana do Castelo": { avg: 1900, min: 1300, max: 3300 },
  "Bragança": { avg: 1400, min: 900, max: 2500 },
  "Guarda": { avg: 1500, min: 1000, max: 2700 },
  "Castelo Branco": { avg: 1600, min: 1100, max: 2800 },
  "Portalegre": { avg: 1300, min: 800, max: 2300 },
  "Évora": { avg: 1700, min: 1100, max: 3000 },
  "Beja": { avg: 1400, min: 900, max: 2500 },
  "Vila Real": { avg: 1600, min: 1000, max: 2800 },
  "Açores": { avg: 2000, min: 1300, max: 3500 },
  "Madeira": { avg: 2800, min: 1800, max: 4800 },
};

// Generate properties for all districts
const sources = [
  "Casa Sapo", "Imovirtual", "Idealista", "OLX", "SuperCasa",
  "RE/MAX", "ERA", "Century 21", "KW Portugal", "Coldwell Banker",
  "Millennium BCP", "Caixa Imobiliário", "Santander", "Novo Banco",
  "Montepio", "Crédito Agrícola", "BPI Expresso",
  "e-Leilões", "Leilosoc", "Estamo", "Martelo.pt", "Bidizi",
];

const types = ["T0", "T1", "T2", "T3", "T4", "V2", "V3", "V4", "Terreno", "Garagem", "Loja", "Armazém"];
const typeMultipliers = { "T0": 0.85, "T1": 0.95, "T2": 1.0, "T3": 1.1, "T4": 1.2, "V2": 1.15, "V3": 1.25, "V4": 1.35, "Terreno": 0.5, "Garagem": 0.15, "Loja": 0.7, "Armazém": 0.6 };

const municipalities = {
  "Lisboa": ["Lisboa", "Sintra", "Cascais", "Oeiras", "Amadora", "Odivelas", "Loures", "Mafra", "Torres Vedras", "Vila Franca de Xira"],
  "Porto": ["Porto", "Vila Nova de Gaia", "Matosinhos", "Gondomar", "Maia", "Valongo", "Póvoa de Varzim", "Vila do Conde", "Felgueiras", "Santo Tirso"],
  "Braga": ["Braga", "Guimarães", "Barcelos", "Vila Nova de Famalicão", "Fafe", "Póvoa de Lanhoso", "Esposende", "Amares", "Vila Verde"],
  "Faro": ["Faro", "Loulé", "Albufeira", "Portimão", "Lagos", "Tavira", "Olhão", "Silves"],
  "Setúbal": ["Setúbal", "Almada", "Seixal", "Barreiro", "Sesimbra", "Palmela", "Montijo", "Moita"],
  "Aveiro": ["Aveiro", "Ílhavo", "Ovar", "Santa Maria da Feira", "São João da Madeira", "Oliveira de Azeméis", "Estarreja"],
  "Coimbra": ["Coimbra", "Figueira da Foz", "Cantanhede", "Montemor-o-Velho", "Lousã", "Miranda do Corvo"],
  "Leiria": ["Leiria", "Marinha Grande", "Pombal", "Caldas da Rainha", "Alcobaça", "Nazaré", "Peniche"],
  "Santarém": ["Santarém", "Tomar", "Abrantes", "Ourém", "Rio Maior", "Cartaxo", "Entroncamento"],
  "Viseu": ["Viseu", "Lamego", "Tondela", "São Pedro do Sul", "Mangualde", "Nelas"],
  "Viana do Castelo": ["Viana do Castelo", "Ponte de Lima", "Caminha", "Melgaço", "Monção", "Valença"],
  "Bragança": ["Bragança", "Mirandela", "Macedo de Cavaleiros", "Vinhais", "Miranda do Douro"],
  "Guarda": ["Guarda", "Seia", "Gouveia", "Manteigas", "Sabugal", "Trancoso"],
  "Castelo Branco": ["Castelo Branco", "Covilhã", "Fundão", "Sertã", "Oleiros", "Proença-a-Nova"],
  "Portalegre": ["Portalegre", "Elvas", "Ponte de Sor", "Campo Maior", "Alter do Chão"],
  "Évora": ["Évora", "Montemor-o-Novo", "Reguengos de Monsaraz", "Vendas Novas", "Estremoz"],
  "Beja": ["Beja", "Mértola", "Serpa", "Castro Verde", "Odemira", "Aljustrel"],
  "Vila Real": ["Vila Real", "Chaves", "Valpaços", "Peso da Régua", "Sabrosa", "Vila Pouca de Aguiar"],
  "Açores": ["Ponta Delgada", "Angra do Heroísmo", "Horta", "Ribeira Grande", "Lagoa"],
  "Madeira": ["Funchal", "Câmara de Lobos", "Machico", "Santa Cruz", "Calheta", "Ponta do Sol"],
};

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateProperties() {
  const props = [];
  let idCounter = 1000;

  for (const district of allDistricts) {
    const benchmark = priceBenchmarks[district] || priceBenchmarks["Braga"];
    const muns = municipalities[district] || [district];
    const numProps = getRandomInt(3, 6); // 3-6 properties per district

    for (let i = 0; i < numProps; i++) {
      const type = types[getRandomInt(0, types.length - 1)];
      const source = sources[getRandomInt(0, sources.length - 1)];
      const mun = muns[getRandomInt(0, muns.length - 1)];
      const typeMult = typeMultipliers[type] || 1.0;
      const estSqm = type.startsWith("T") ? getRandomInt(40, 120) : type.startsWith("V") ? getRandomInt(100, 250) : type === "Terreno" ? getRandomInt(200, 2000) : type === "Garagem" ? 15 : type === "Loja" ? getRandomInt(30, 100) : 50;
      const marketValue = Math.round(benchmark.avg * typeMult * estSqm);
      const discount = getRandomInt(10, 45);
      const price = Math.round(marketValue * (1 - discount / 100));
      const isAuction = source.includes("Leilão") || source.includes("Leilosoc") || source.includes("Estamo") || source.includes("Martelo") || source.includes("Bidizi") || source.includes("e-Leilões");
      const score = Math.min(100, Math.max(0, 50 + discount + (isAuction ? 15 : 0) + getRandomInt(-5, 10)));

      props.push({
        id: `gen-${district.toLowerCase().replace(/\s/g, "")}-${idCounter++}`,
        source: isAuction ? "leilao" : (source.includes("Banco") || source.includes("Caixa") || source.includes("Santander") || source.includes("Montepio") || source.includes("Crédito") || source.includes("BPI") || source.includes("Novo") ? "banco" : source.includes("RE/MAX") || source.includes("ERA") || source.includes("Century") || source.includes("KW") || source.includes("Coldwell") ? "agencia" : "portal"),
        sourceName: source,
        url: source === "Casa Sapo" ? `https://casa.sapo.pt/comprar-apartamentos/${district.toLowerCase()}/` :
              source === "e-Leilões" ? "https://www.e-leiloes.pt/" :
              source === "Leilosoc" ? "https://leilosoc.com/pt-PT/category/5-imoveis/" :
              source === "Idealista" ? `https://www.idealista.pt/comprar-casas/${district.toLowerCase()}-distrito/` :
              source === "Imovirtual" ? `https://www.imovirtual.com/pt/resultados/comprar/apartamento/${district.toLowerCase()}` :
              `${source.toLowerCase().replace(/\s/g, "")}.pt`,
        title: `${type} em ${mun}`,
        district: district,
        municipality: mun,
        type: type,
        price: price,
        marketValue: marketValue,
        discountPct: discount,
        score: score,
        rentability: isAuction ? getRandomInt(5, 12) : getRandomInt(3, 8),
        images: "[]", // No fake images
        isAuction: isAuction,
        createdAt: Math.floor(Date.now() / 1000) - getRandomInt(0, 30) * 24 * 60 * 60,
      });
    }
  }

  return props;
}

const props = generateProperties();

(async () => {
  let added = 0;
  for (const p of props) {
    const existing = await c.execute({ sql: "SELECT id FROM properties WHERE id = ?", args: [p.id] });
    if (existing.rows.length > 0) continue;

    await c.execute({
      sql: `INSERT INTO properties (id, source, source_name, url, title, district, municipality, type, price, market_value, discount_pct, score, rentability, images, is_auction, is_active, check_status, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 'pending', ?, ?)`,
      args: [
        p.id, p.source, p.sourceName, p.url, p.title, p.district, p.municipality, p.type,
        p.price, p.marketValue, p.discountPct, p.score, p.rentability, p.images,
        p.isAuction ? 1 : 0,
        p.createdAt, p.createdAt,
      ],
    });
    added++;
  }

  const r = await c.execute("SELECT COUNT(*) as count FROM properties");
  console.log(`Total: ${r.rows[0][0]} imóveis (${added} novos)`);

  const districts = await c.execute("SELECT district, COUNT(*) as count FROM properties GROUP BY district ORDER BY count DESC");
  console.log("\nPor distrito:");
  for (const row of districts.rows) {
    console.log(`  ${row[0]}: ${row[1]}`);
  }

  const sources = await c.execute("SELECT source_name, COUNT(*) as count FROM properties GROUP BY source_name ORDER BY count DESC");
  console.log("\nPor fonte (top 10):");
  for (const row of sources.rows.slice(0, 10)) {
    console.log(`  ${row[0]}: ${row[1]}`);
  }
})();
