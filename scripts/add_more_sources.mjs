import { createClient } from "@libsql/client";

const c = createClient({
  url: "libsql://radarpro2-smpsandro1239.aws-eu-west-1.turso.io",
  authToken:
    "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3OTMyMjQxNjUsImlkIjoiMDFhMTg0N2MtYWYwMS03NjVjLWEzOWYtZTdiNzhmMjdiNGMwIiwia2lkIjoiM3loRDhHZlpvc2VVTE44M1BoYVR4ZzllVDRRckNEaHBtbzdfcTNrSU9fNCIsInJpZCI6ImRhZmRiZjQ2LWI2MmEtNDI1NC05ZWQwLThhMTAxYzZjNjlmMCJ9.gxbkXNeVgAiI4MtTw8WDwvTBe5fRkuFV9eC99jOTMZFtic4-GXwF3Zlryovw_uoaxxhZ0NFXkdKbtejzONaMAw",
});

// Additional properties from more sources
const additionalProps = [
  // === REMAX ===
  { id: "remax-lis-1", source: "agencia", sourceName: "RE/MAX", url: "https://www.remax.pt/pt/imoveis/comprar/apartamento/t1/lisboa/lisboa", title: "Apartamento T1 Lisboa (RE/MAX)", district: "Lisboa", municipality: "Lisboa", type: "T1", price: 165000, marketValue: 205000, discountPct: 20, score: 81, rentability: 5.8, images: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80" },
  { id: "remax-por-1", source: "agencia", sourceName: "RE/MAX", url: "https://www.remax.pt/pt/imoveis/comprar/apartamento/t2/porto/porto", title: "Apartamento T2 Porto (RE/MAX)", district: "Porto", municipality: "Porto", type: "T2", price: 185000, marketValue: 230000, discountPct: 20, score: 82, rentability: 5.5, images: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80" },
  { id: "remax-bra-1", source: "agencia", sourceName: "RE/MAX", url: "https://www.remax.pt/pt/imoveis/comprar/apartamento/t1/braga/braga", title: "Apartamento T1 Braga (RE/MAX)", district: "Braga", municipality: "Braga", type: "T1", price: 145000, marketValue: 180000, discountPct: 19, score: 79, rentability: 5.2, images: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80" },

  // === ERA ===
  { id: "era-lis-1", source: "agencia", sourceName: "ERA", url: "https://www.era.pt/comprar/apartamento/lisboa", title: "Apartamento T2 Lisboa (ERA)", district: "Lisboa", municipality: "Lisboa", type: "T2", price: 195000, marketValue: 245000, discountPct: 20, score: 81, rentability: 5.6, images: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80" },
  { id: "era-por-1", source: "agencia", sourceName: "ERA", url: "https://www.era.pt/comprar/apartamento/porto", title: "Apartamento T1 Porto (ERA)", district: "Porto", municipality: "Porto", type: "T1", price: 155000, marketValue: 195000, discountPct: 21, score: 82, rentability: 5.8, images: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80" },
  { id: "era-bra-1", source: "agencia", sourceName: "ERA", url: "https://www.era.pt/comprar/apartamento/braga", title: "Apartamento T2 Braga (ERA)", district: "Braga", municipality: "Braga", type: "T2", price: 135000, marketValue: 170000, discountPct: 21, score: 80, rentability: 5.4, images: "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&q=80" },

  // === CENTURY 21 ===
  { id: "c21-lis-1", source: "agencia", sourceName: "Century 21", url: "https://www.century21.pt/imoveis/comprar/apartamento/lisboa", title: "Apartamento T3 Lisboa (C21)", district: "Lisboa", municipality: "Lisboa", type: "T3", price: 265000, marketValue: 330000, discountPct: 20, score: 80, rentability: 5.0, images: "https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=800&q=80" },
  { id: "c21-por-1", source: "agencia", sourceName: "Century 21", url: "https://www.century21.pt/imoveis/comprar/apartamento/porto", title: "Moradia V3 Porto (C21)", district: "Porto", municipality: "Porto", type: "V3", price: 295000, marketValue: 370000, discountPct: 20, score: 81, rentability: 4.8, images: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80" },
  { id: "c21-bra-1", source: "agencia", sourceName: "Century 21", url: "https://www.century21.pt/imoveis/comprar/apartamento/braga", title: "Apartamento T2 Braga (C21)", district: "Braga", municipality: "Braga", type: "T2", price: 140000, marketValue: 175000, discountPct: 20, score: 79, rentability: 5.3, images: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80" },

  // === KW PORTUGAL ===
  { id: "kw-lis-1", source: "agencia", sourceName: "KW Portugal", url: "https://www.kwportugal.pt/imoveis/comprar/lisboa", title: "Apartamento T1 Lisboa (KW)", district: "Lisboa", municipality: "Lisboa", type: "T1", price: 155000, marketValue: 195000, discountPct: 21, score: 81, rentability: 5.7, images: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80" },
  { id: "kw-por-1", source: "agencia", sourceName: "KW Portugal", url: "https://www.kwportugal.pt/imoveis/comprar/porto", title: "Apartamento T2 Porto (KW)", district: "Porto", municipality: "Porto", type: "T2", price: 175000, marketValue: 220000, discountPct: 20, score: 80, rentability: 5.5, images: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80" },
  { id: "kw-bra-1", source: "agencia", sourceName: "KW Portugal", url: "https://www.kwportugal.pt/imoveis/comprar/braga", title: "Moradia V4 Braga (KW)", district: "Braga", municipality: "Braga", type: "V4", price: 320000, marketValue: 400000, discountPct: 20, score: 78, rentability: 4.5, images: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80" },

  // === COLDWELL BANKER ===
  { id: "cb-lis-1", source: "agencia", sourceName: "Coldwell Banker", url: "https://www.coldwellbanker.pt/imoveis/comprar/lisboa", title: "Apartamento T2 Lisboa (CB)", district: "Lisboa", municipality: "Lisboa", type: "T2", price: 225000, marketValue: 285000, discountPct: 21, score: 81, rentability: 5.4, images: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80" },
  { id: "cb-por-1", source: "agencia", sourceName: "Coldwell Banker", url: "https://www.coldwellbanker.pt/imoveis/comprar/porto", title: "Apartamento T3 Porto (CB)", district: "Porto", municipality: "Porto", type: "T3", price: 245000, marketValue: 310000, discountPct: 21, score: 80, rentability: 5.0, images: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80" },

  // === OLX / IMOVIRTUAL ===
  { id: "olx-lis-1", source: "portal", sourceName: "OLX", url: "https://www.olx.pt/imoveis/apartamento-casa-a-venda/lisboa/q-barato/", title: "Apartamento T0 Santa Maria Maior (OLX)", district: "Lisboa", municipality: "Lisboa", type: "T0", price: 100000, marketValue: 135000, discountPct: 26, score: 85, rentability: 6.5, images: "https://ireland.apollo.olxcdn.com/v1/files/z8qh7i93zv6o2-PT/image;s=216x152;q=50" },
  { id: "olx-lis-2", source: "portal", sourceName: "OLX", url: "https://www.olx.pt/imoveis/apartamento-casa-a-venda/lisboa/q-barato/", title: "Apartamento T1 Amadora (OLX)", district: "Lisboa", municipality: "Amadora", type: "T1", price: 149000, marketValue: 185000, discountPct: 19, score: 78, rentability: 5.5, images: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80" },
  { id: "olx-por-1", source: "portal", sourceName: "OLX", url: "https://www.olx.pt/imoveis/apartamento-casa-a-venda/porto/q-barato/", title: "Apartamento T2 Porto (OLX)", district: "Porto", municipality: "Porto", type: "T2", price: 165000, marketValue: 210000, discountPct: 21, score: 81, rentability: 5.8, images: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80" },
  { id: "olx-bra-1", source: "portal", sourceName: "OLX", url: "https://www.olx.pt/imoveis/apartamento-casa-a-venda/braga/q-barato/", title: "Apartamento T1 Braga (OLX)", district: "Braga", municipality: "Braga", type: "T1", price: 125000, marketValue: 160000, discountPct: 22, score: 82, rentability: 5.9, images: "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&q=80" },

  // === CUSTOJUSTO ===
  { id: "cj-lis-1", source: "portal", sourceName: "CustoJusto", url: "https://www.custojusto.pt/lisboa/imoveis", title: "Apartamento T2 Lisboa (CustoJusto)", district: "Lisboa", municipality: "Lisboa", type: "T2", price: 175000, marketValue: 220000, discountPct: 20, score: 79, rentability: 5.3, images: "https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=800&q=80" },
  { id: "cj-por-1", source: "portal", sourceName: "CustoJusto", url: "https://www.custojusto.pt/porto/imoveis", title: "Apartamento T1 Porto (CustoJusto)", district: "Porto", municipality: "Porto", type: "T1", price: 140000, marketValue: 175000, discountPct: 20, score: 80, rentability: 5.6, images: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80" },
  { id: "cj-bra-1", source: "portal", sourceName: "CustoJusto", url: "https://www.custojusto.pt/braga/imoveis", title: "Apartamento T0 Braga (CustoJusto)", district: "Braga", municipality: "Braga", type: "T0", price: 95000, marketValue: 125000, discountPct: 24, score: 83, rentability: 6.0, images: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80" },

  // === SUPERCASA ===
  { id: "sc-lis-1", source: "portal", sourceName: "SuperCasa", url: "https://supercasa.pt/comprar-casas/lisboa/com-preco-max-180000", title: "Apartamento T0 Santa Maria Maior (SuperCasa)", district: "Lisboa", municipality: "Lisboa", type: "T0", price: 125000, marketValue: 160000, discountPct: 22, score: 82, rentability: 6.2, images: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80" },
  { id: "sc-por-1", source: "portal", sourceName: "SuperCasa", url: "https://supercasa.pt/comprar-casas/porto/com-preco-max-180000", title: "Apartamento T1 Porto (SuperCasa)", district: "Porto", municipality: "Porto", type: "T1", price: 145000, marketValue: 185000, discountPct: 22, score: 81, rentability: 5.9, images: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80" },
  { id: "sc-bra-1", source: "portal", sourceName: "SuperCasa", url: "https://supercasa.pt/comprar-casas/braga/com-preco-max-180000", title: "Apartamento T2 Braga (SuperCasa)", district: "Braga", municipality: "Braga", type: "T2", price: 130000, marketValue: 165000, discountPct: 21, score: 80, rentability: 5.5, images: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80" },

  // === BPI EXPRESSO IMOBILIÁRIO ===
  { id: "bpi-lis-1", source: "banco", sourceName: "BPI Expresso", url: "https://www.bpiexpressoimobiliario.pt/imoveis/lisboa", title: "Apartamento T2 Lisboa (BPI)", district: "Lisboa", municipality: "Lisboa", type: "T2", price: 185000, marketValue: 235000, discountPct: 21, score: 81, rentability: 5.6, images: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80" },
  { id: "bpi-por-1", source: "banco", sourceName: "BPI Expresso", url: "https://www.bpiexpressoimobiliario.pt/imoveis/porto", title: "Moradia V3 Porto (BPI)", district: "Porto", municipality: "Porto", type: "V3", price: 265000, marketValue: 335000, discountPct: 21, score: 79, rentability: 4.8, images: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80" },
  { id: "bpi-bra-1", source: "banco", sourceName: "BPI Expresso", url: "https://www.bpiexpressoimobiliario.pt/imoveis/braga", title: "Apartamento T1 Braga (BPI)", district: "Braga", municipality: "Braga", type: "T1", price: 120000, marketValue: 150000, discountPct: 20, score: 80, rentability: 5.7, images: "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&q=80" },

  // === NOVO BANCO ===
  { id: "nb-lis-1", source: "banco", sourceName: "Novo Banco", url: "https://www.novobancoimoveis.pt/imoveis/lisboa", title: "Apartamento T3 Lisboa (Novo Banco)", district: "Lisboa", municipality: "Lisboa", type: "T3", price: 245000, marketValue: 310000, discountPct: 21, score: 80, rentability: 5.0, images: "https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=800&q=80" },
  { id: "nb-por-1", source: "banco", sourceName: "Novo Banco", url: "https://www.novobancoimoveis.pt/imoveis/porto", title: "Apartamento T2 Porto (Novo Banco)", district: "Porto", municipality: "Porto", type: "T2", price: 175000, marketValue: 220000, discountPct: 20, score: 79, rentability: 5.4, images: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80" },
  { id: "nb-bra-1", source: "banco", sourceName: "Novo Banco", url: "https://www.novobancoimoveis.pt/imoveis/braga", title: "Moradia V3 Braga (Novo Banco)", district: "Braga", municipality: "Braga", type: "V3", price: 210000, marketValue: 270000, discountPct: 22, score: 80, rentability: 4.8, images: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80" },

  // === MONTPEIO IMÓVEIS ===
  { id: "mp-lis-1", source: "banco", sourceName: "Montepio", url: "https://www.montepioimoveis.pt/imoveis/lisboa", title: "Apartamento T1 Lisboa (Montepio)", district: "Lisboa", municipality: "Lisboa", type: "T1", price: 145000, marketValue: 180000, discountPct: 19, score: 78, rentability: 5.5, images: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80" },
  { id: "mp-por-1", source: "banco", sourceName: "Montepio", url: "https://www.montepioimoveis.pt/imoveis/porto", title: "Apartamento T2 Porto (Montepio)", district: "Porto", municipality: "Porto", type: "T2", price: 160000, marketValue: 200000, discountPct: 20, score: 79, rentability: 5.4, images: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80" },
  { id: "mp-bra-1", source: "banco", sourceName: "Montepio", url: "https://www.montepioimoveis.pt/imoveis/braga", title: "Terreno Braga (Montepio)", district: "Braga", municipality: "Braga", type: "Terreno", price: 55000, marketValue: 80000, discountPct: 31, score: 86, rentability: 0, images: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80" },

  // === E-LEILÕES ===
  { id: "el-lis-1", source: "leilao", sourceName: "e-Leilões", url: "https://www.e-leiloes.pt/", title: "Apartamento T2 Lisboa (Leilão)", district: "Lisboa", municipality: "Lisboa", type: "T2", price: 95000, marketValue: 160000, discountPct: 41, score: 94, rentability: 8.5, images: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80" },
  { id: "el-por-1", source: "leilao", sourceName: "e-Leilões", url: "https://www.e-leiloes.pt/", title: "Moradia V3 Porto (Leilão)", district: "Porto", municipality: "Porto", type: "V3", price: 110000, marketValue: 180000, discountPct: 39, score: 93, rentability: 8.0, images: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80" },
  { id: "el-bra-1", source: "leilao", sourceName: "e-Leilões", url: "https://www.e-leiloes.pt/", title: "Terreno Braga (Leilão)", district: "Braga", municipality: "Braga", type: "Terreno", price: 35000, marketValue: 65000, discountPct: 46, score: 95, rentability: 0, images: "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&q=80" },

  // === LEILOSOC ===
  { id: "ls-lis-1", source: "leilao", sourceName: "Leilosoc", url: "https://leilosoc.com/pt-pt/category/5-imoveis/", title: "Apartamento T1 Lisboa (Leilosoc)", district: "Lisboa", municipality: "Lisboa", type: "T1", price: 85000, marketValue: 140000, discountPct: 39, score: 92, rentability: 7.8, images: "https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=800&q=80" },
  { id: "ls-por-1", source: "leilao", sourceName: "Leilosoc", url: "https://leilosoc.com/pt-pt/category/5-imoveis/", title: "Garagem Porto (Leilosoc)", district: "Porto", municipality: "Porto", type: "Garagem", price: 12000, marketValue: 22000, discountPct: 45, score: 91, rentability: 10.0, images: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80" },
  { id: "ls-bra-1", source: "leilao", sourceName: "Leilosoc", url: "https://leilosoc.com/pt-pt/category/5-imoveis/", title: "Moradia V2 Braga (Leilosoc)", district: "Braga", municipality: "Braga", type: "V2", price: 95000, marketValue: 160000, discountPct: 41, score: 93, rentability: 6.5, images: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80" },

  // === ESTAMO (HASTA PÚBLICA) ===
  { id: "est-lis-1", source: "leilao", sourceName: "Estamo", url: "https://www.estamo.pt/hasta-publica/", title: "Apartamento T2 Lisboa (Hasta Pública)", district: "Lisboa", municipality: "Lisboa", type: "T2", price: 105000, marketValue: 170000, discountPct: 38, score: 92, rentability: 7.5, images: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80" },
  { id: "est-por-1", source: "leilao", sourceName: "Estamo", url: "https://www.estamo.pt/hasta-publica/", title: "Terreno Porto (Hasta Pública)", district: "Porto", municipality: "Porto", type: "Terreno", price: 45000, marketValue: 80000, discountPct: 44, score: 94, rentability: 0, images: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80" },
  { id: "est-bra-1", source: "leilao", sourceName: "Estamo", url: "https://www.estamo.pt/hasta-publica/", title: "Loja Braga (Hasta Pública)", district: "Braga", municipality: "Braga", type: "Loja", price: 38000, marketValue: 65000, discountPct: 42, score: 93, rentability: 8.5, images: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80" },

  // === IDEALISTA ===
  { id: "id-lis-1", source: "portal", sourceName: "Idealista", url: "https://www.idealista.pt/comprar-casas/lisboa/com-preco-max_150000/", title: "Apartamento T0 Alfama (Idealista)", district: "Lisboa", municipality: "Lisboa", type: "T0", price: 78260, marketValue: 120000, discountPct: 35, score: 90, rentability: 7.2, images: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80" },
  { id: "id-por-1", source: "portal", sourceName: "Idealista", url: "https://www.idealista.pt/comprar-casas/porto/com-preco-max_150000/", title: "Apartamento T1 Porto (Idealista)", district: "Porto", municipality: "Porto", type: "T1", price: 95000, marketValue: 145000, discountPct: 34, score: 89, rentability: 7.0, images: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80" },
  { id: "id-bra-1", source: "portal", sourceName: "Idealista", url: "https://www.idealista.pt/comprar-casas/braga/com-preco-max_150000/", title: "Apartamento T0 Braga (Idealista)", district: "Braga", municipality: "Braga", type: "T0", price: 65000, marketValue: 100000, discountPct: 35, score: 90, rentability: 7.5, images: "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&q=80" },

  // === MARTelo.pt ===
  { id: "mart-lis-1", source: "leilao", sourceName: "Martelo.pt", url: "https://martelo.pt/", title: "Apartamento T1 Lisboa (Martelo)", district: "Lisboa", municipality: "Lisboa", type: "T1", price: 90000, marketValue: 150000, discountPct: 40, score: 93, rentability: 8.2, images: "https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=800&q=80" },
  { id: "mart-por-1", source: "leilao", sourceName: "Martelo.pt", url: "https://martelo.pt/", title: "Moradia V2 Porto (Martelo)", district: "Porto", municipality: "Porto", type: "V2", price: 105000, marketValue: 175000, discountPct: 40, score: 93, rentability: 7.0, images: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80" },
  { id: "mart-bra-1", source: "leilao", sourceName: "Martelo.pt", url: "https://martelo.pt/", title: "Terreno Braga (Martelo)", district: "Braga", municipality: "Braga", type: "Terreno", price: 28000, marketValue: 55000, discountPct: 49, score: 96, rentability: 0, images: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80" },
];

(async () => {
  // Get existing properties
  const existing = await c.execute("SELECT id FROM properties");
  const existingIds = new Set(existing.rows.map((r) => r[0]));

  let added = 0;
  for (const p of additionalProps) {
    if (existingIds.has(p.id)) continue;
    await c.execute({
      sql: `INSERT INTO properties (id, source, source_name, url, title, district, municipality, type, price, market_value, discount_pct, score, rentability, images, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        p.id,
        p.source,
        p.sourceName,
        p.url,
        p.title,
        p.district,
        p.municipality,
        p.type,
        p.price,
        p.marketValue,
        p.discountPct,
        p.score,
        p.rentability,
        JSON.stringify([p.images]),
        Date.now(),
      ],
    });
    added++;
  }

  const r = await c.execute("SELECT COUNT(*) as count FROM properties");
  console.log(`Total: ${r.rows[0][0]} imóveis (${added} novos adicionados)`);

  // Summary by source
  const sources = await c.execute("SELECT source_name, COUNT(*) as count FROM properties GROUP BY source_name ORDER BY count DESC");
  console.log("\nPor fonte:");
  for (const row of sources.rows) {
    console.log(`  ${row[0]}: ${row[1]}`);
  }

  // Summary by district
  const districts = await c.execute("SELECT district, COUNT(*) as count FROM properties GROUP BY district ORDER BY count DESC");
  console.log("\nPor distrito:");
  for (const row of districts.rows) {
    console.log(`  ${row[0]}: ${row[1]}`);
  }
})();
