import { createClient } from "@libsql/client";

const c = createClient({
  url: "libsql://radarpro2-smpsandro1239.aws-eu-west-1.turso.io",
  authToken:
    "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3OTMyMjQxNjUsImlkIjoiMDFhMTg0N2MtYWYwMS03NjVjLWEzOWYtZTdiNzhmMjdiNGMwIiwia2lkIjoiM3loRDhHZlpvc2VVTE44M1BoYVR4ZzllVDRRckNEaHBtbzdfcTNrSU9fNCIsInJpZCI6ImRhZmRiZjQ2LWI2MmEtNDI1NC05ZWQwLThhMTAxYzZjNjlmMCJ9.gxbkXNeVgAiI4MtTw8WDwvTBe5fRkuFV9eC99jOTMZFtic4-GXwF3Zlryovw_uoaxxhZ0NFXkdKbtejzONaMAw",
});

const sourceReliability: Record<string, number> = {
  "e-Leiloes": 15,
  Estamo: 15,
  Leilosoc: 14,
  "Martelo.pt": 14,
  "Caixa Imobiliário": 13,
  "Millennium BCP": 13,
  Santander: 12,
  "Novo Banco": 12,
  Montepio: 11,
  "Crédito Agrícola": 11,
  "BPI Expresso": 12,
  "Casa Sapo": 8,
  Idealista: 8,
  Imovirtual: 8,
  SuperCasa: 7,
  OLX: 6,
  CustoJusto: 6,
  "RE/MAX": 9,
  ERA: 9,
  "Century 21": 9,
  "KW Portugal": 9,
  "Coldwell Banker": 9,
  Bidizi: 9,
};

const districtLiquidity: Record<string, number> = {
  Lisboa: 15,
  Porto: 12,
  Braga: 8,
  Faro: 10,
  Setubal: 9,
  Aveiro: 9,
  Coimbra: 8,
  Leiria: 8,
  Santarem: 7,
  Viseu: 7,
  "Viana do Castelo": 8,
  Braganca: 6,
  Guarda: 6,
  "Castelo Branco": 6,
  Portalegre: 6,
  Evora: 7,
  Beja: 6,
  "Vila Real": 7,
  Acores: 5,
  Madeira: 7,
};

function calculateCommission(price: number, sourceName: string): number {
  if (sourceName === "e-Leiloes") return 0;
  const rate =
    sourceName === "Leilosoc"
      ? 0.05
      : sourceName === "Martelo.pt"
      ? 0.06
      : sourceName === "Bidizi"
      ? 0.05
      : 0.05;
  return price * commissionRate * 1.23;
}

function calculateIMT(price: number, propertyType: string): number {
  if (propertyType === "Terreno" || propertyType === "Armazem" || propertyType === "Predio") {
    return price * 0.065;
  }
  if (price <= 106346) return price * 0.01;
  if (price <= 138450) return price * 0.02 - 1063.46;
  if (price <= 190456) return price * 0.05 - 5178.67;
  if (price <= 324058) return price * 0.07 - 9000.39;
  if (price <= 648022) return price * 0.08 - 12240.97;
  return price * 0.06;
}

function calculateStampDuty(price: number): number {
  return price * 0.008;
}

function imtBase(price: number, marketValue: number): number {
  return marketValue && marketValue > price ? marketValue : price;
}

export async function calculateAuctionValuation(input: PropertyValuationInput): Promise<PropertyValuationOutput & { costBreakdown: CostBreakdown }> {
  const {
    district,
    municipality = district,
    type,
    price,
    marketValue,
    source = "portal",
    sourceName = source,
    sqm = 0,
    condominiumDebt = 0,
    renovationEstimate = 0,
    targetMargin = 15,
  } = input;

  const marketValueNum = marketValue ?? 0;

  const sourceScore = sourceReliability[source] || 5;
  const scoreBase = 50;

  const discountPct = marketValueNum > 0 ? Math.round(((marketValueNum - price) / marketValueNum) * 100) : 0;

  const pricePerSqm = sqm > 0 ? Math.round(price / sqm) : 0;
  const marketAvgPerSqm = Math.round(marketValueNum / estSqm);

  let rentScore = 0;
  if (yieldPct && yieldPct >= 8) rentScore = 20;
  else if (yieldPct && yieldPct >= 6) rentScore = 15;
  else if (yieldPct && yieldPct >= 4) rentScore = 10;
  else if (yieldPct && yieldPct > 0) rentScore = 5;

  let priceM2Score = 0;
  if (ratio < 0.6) priceM2Score = 25;
  else if (ratio < 0.75) priceM2Score = 20;
  else if (ratio < 0.85) priceM2Score = 15;
  else if (ratio < 0.95) priceM2Score = 10;
  else if (ratio > 1.2) priceM2Score = 0;
  else priceM2Score = 5;

  score += discountScore + rentScore + priceM2Score + factors.liquidity + factors.source;
  score = Math.min(100, Math.max(0, Math.round(score)));

  let riskLevel: "baixo" | "medio" | "alto" = "medio";
  if (score >= 85) risk = "baixo";
  else if (score < 55) risk = "alto";

  let recommendation: string;
  if (score >= 85) recommendation = "Excelente oportunidade";
  else if (score >= 80) recommendation = "Boa oportunidade";
  else if (score >= 70) recommendation = "Oportunidade razoável";
  else recommendation = "Oportunidade fraca";

  return {
    id: prop.id,
    source: prop.sourceName || prop.source,
    source_name: prop.sourceName,
    url: prop.url,
    title: prop.title,
    district: prop.district,
    municipality: prop.municipality,
    type: prop.type,
    price: prop.price,
    marketValue: prop.marketValue,
    discount_pct: prop.discountPct,
    score: prop.score,
    rentability: prop.rentability,
    images: prop.images || "[]",
    is_active: prop.isActive ?? true,
    check_status: prop.checkStatus || "pending",
    created_at: prop.createdAt ?? Date.now(),
    updated_at: Date.now(),
  };
}