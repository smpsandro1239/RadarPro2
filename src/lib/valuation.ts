/**
 * RadarPro Portugal - Unified Valuation & Scoring Engine
 *
 * Única fonte de verdade para todos os cálculos de valorização, score e rentabilidade.
 * Nenhum componente pode recalcular valores de forma diferente.
 */

// 1. Base de dados de preços por distrito (EUR/m²) - fonte: portais + INE (2026)
export interface DistrictBenchmark {
  district: string;
  avgPricePerSqm: number;
  minPricePerSqm: number;
  maxPricePerSqm: number;
}

export const districtBenchmarks: Record<string, DistrictBenchmark> = {
  Lisboa: { district: "Lisboa", avgPricePerSqm: 5200, minPricePerSqm: 3800, maxPricePerSqm: 8500 },
  Porto: { district: "Porto", avgPricePerSqm: 3800, minPricePerSqm: 2500, maxPricePerSqm: 6500 },
  Braga: { district: "Braga", avgPricePerSqm: 2600, minPricePerSqm: 1800, maxPricePerSqm: 4200 },
  Faro: { district: "Faro", avgPricePerSqm: 3500, minPricePerSqm: 2200, maxPricePerSqm: 6000 },
  Setubal: { district: "Setubal", avgPricePerSqm: 3200, minPricePerSqm: 2000, maxPricePerSqm: 5500 },
  Aveiro: { district: "Aveiro", avgPricePerSqm: 2400, minPricePerSqm: 1600, maxPricePerSqm: 4000 },
  Coimbra: { district: "Coimbra", avgPricePerSqm: 2200, minPricePerSqm: 1500, maxPricePerSqm: 3800 },
  Leiria: { district: "Leiria", avgPricePerSqm: 2000, minPricePerSqm: 1400, maxPricePerSqm: 3500 },
  Santarem: { district: "Santarem", avgPricePerSqm: 1800, minPricePerSqm: 1200, maxPricePerSqm: 3200 },
  Viseu: { district: "Viseu", avgPricePerSqm: 1700, minPricePerSqm: 1100, maxPricePerSqm: 3000 },
  "Viana do Castelo": { district: "Viana do Castelo", avgPricePerSqm: 1900, minPricePerSqm: 1300, maxPricePerSqm: 3300 },
  Braganca: { district: "Braganca", avgPricePerSqm: 1400, minPricePerSqm: 900, maxPricePerSqm: 2500 },
  Guarda: { district: "Guarda", avgPricePerSqm: 1500, minPricePerSqm: 1000, maxPricePerSqm: 2700 },
  "Castelo Branco": { district: "Castelo Branco", avgPricePerSqm: 1600, minPricePerSqm: 1100, maxPricePerSqm: 2800 },
  Portalegre: { district: "Portalegre", avgPricePerSqm: 1300, minPricePerSqm: 800, maxPricePerSqm: 2300 },
  Evora: { district: "Evora", avgPricePerSqm: 1700, minPricePerSqm: 1100, maxPricePerSqm: 3000 },
  Beja: { district: "Beja", avgPricePerSqm: 1400, minPricePerSqm: 900, maxPricePerSqm: 2500 },
  "Vila Real": { district: "Vila Real", avgPricePerSqm: 1600, minPricePerSqm: 1000, maxPricePerSqm: 2800 },
  Acores: { district: "Acores", avgPricePerSqm: 2000, minPricePerSqm: 1300, maxPricePerSqm: 3500 },
  Madeira: { district: "Madeira", avgPricePerSqm: 2800, minPricePerSqm: 1800, maxPricePerSqm: 4800 },
};

// Tendência de mercado (multiplicador anual)
export const marketTrends: Record<string, number> = {
  Lisboa: 1.03, Porto: 1.05, Braga: 1.04, Faro: 1.06,
  Setubal: 1.04, Aveiro: 1.02, Coimbra: 1.01, Leiria: 1.02,
  Santarem: 1.01, Viseu: 1.01, "Viana do Castelo": 1.02,
  Braganca: 1.00, Guarda: 1.00, "Castelo Branco": 1.01,
  Portalegre: 1.00, Evora: 1.01, Beja: 1.00, "Vila Real": 1.01,
  Acores: 1.02, Madeira: 1.03,
};

// Coeficientes de tipologia (multiplicador sobre preço base)
export const typeMultipliers: Record<string, number> = {
  T0: 0.85, T1: 0.95, T2: 1.00, T3: 1.10, T4: 1.20,
  V2: 1.15, V3: 1.25, V4: 1.35, V5: 1.45,
  Terreno: 0.50, Garagem: 0.15, Loja: 0.70, Armazem: 0.60,
  Predio: 1.50, Arrecadacao: 0.10,
};

// Tamanhos estimados por tipologia (m²) quando não conhecidos
export const typeSizeEstimates: Record<string, number> = {
  T0: 35, T1: 55, T2: 75, T3: 100, T4: 130,
  V2: 120, V3: 150, V4: 180, V5: 220,
  Terreno: 500, Garagem: 15, Loja: 60, Armazem: 200,
  Predio: 500, Arrecadacao: 10,
};

// Fonte de confiança por tipo de origem (0-15)
export const sourceReliability: Record<string, number> = {
  "e-Leiloes": 15,
  Estamo: 15,
  Leilosoc: 14,
  "Martelo.pt": 14,
  "Caixa Imobiliario": 13,
  "Millennium BCP": 13,
  Santander: 12,
  "Novo Banco": 12,
  Montepio: 11,
  "Credito Agricola": 11,
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

// Liquidez por distrito (0-15 pontos)
export const districtLiquidity: Record<string, number> = {
  Lisboa: 15, Porto: 12, Braga: 8, Faro: 10, Setubal: 9,
  Aveiro: 9, Coimbra: 8, Leiria: 8, Santarem: 7,
  Viseu: 7, "Viana do Castelo": 8, Braganca: 6, Guarda: 6,
  "Castelo Branco": 6, Portalegre: 6, Evora: 7, Beja: 6,
  "Vila Real": 7, Acores: 5, Madeira: 7,
};

// Rendimentos mensais estimados por tipologia e distrito (EUR/mês)
export const rentEstimates: Record<string, Record<string, number>> = {
  Lisboa: { T0: 750, T1: 950, T2: 1400, T3: 1900, T4: 2600 },
  Porto: { T0: 550, T1: 700, T2: 1000, T3: 1400, T4: 1900 },
  Braga: { T0: 450, T1: 600, T2: 850, T3: 1200, T4: 1600 },
  Faro: { T0: 500, T1: 700, T2: 1100, T3: 1500, T4: 2000 },
  Setubal: { T0: 480, T1: 650, T2: 950, T3: 1300, T4: 1800 },
  Aveiro: { T0: 450, T1: 620, T2: 900, T3: 1250, T4: 1700 },
  Coimbra: { T0: 420, T1: 580, T2: 800, T3: 1100, T4: 1500 },
};

// Fator de condição por fonte
export const conditionFactors: Record<string, number> = {
  banco: 0.85, leilao: 0.80, portal: 1.00, agencia: 1.05,
};

// Premio municipal (multiplicador sobre preço base do distrito)
export const municipalityPremiums: Record<string, Record<string, number>> = {
  Lisboa: {
    Lisboa: 1.15, Cascais: 1.35, Oeiras: 1.20, Sintra: 0.95,
    Amadora: 0.85, Odivelas: 0.90, Loures: 0.85, Mafra: 0.90,
    "Torres Vedras": 0.80, "Vila Franca de Xira": 0.85,
  },
  Porto: {
    Porto: 1.10, "Vila Nova de Gaia": 0.95, Matosinhos: 1.15,
    Gondomar: 0.85, Maia: 0.95, Valongo: 0.85,
    "Póvoa de Varzim": 0.90, "Vila do Conde": 0.90, Felgueiras: 0.75,
    "Santo Tirso": 0.80,
  },
  Braga: {
    Braga: 1.10, Guimaraes: 0.95, Barcelos: 0.85,
    "Vila Nova de Famalicao": 0.90, Fafe: 0.75, "Póvoa de Lanhoso": 0.80,
    Esposende: 0.90, Amares: 0.80, "Vila Verde": 0.80,
  },
};

export interface PropertyValuationInput {
  district: string;
  municipality: string;
  type: string;
  price: number;              // asking price
  marketValue?: number;       // valor de referência (opcional)
  source: string;             // nome da fonte (ex: "Casa Sapo")
  sourceName?: string;        // nome exibível da fonte
  sqm?: number;               // área útil/m² (opcional)
  createdAt?: Date | null;
  isActive?: boolean | null;
  isAuction?: boolean;        // é um leilão?
  currentBid?: number;        // lance atual (apenas leilão)
  auctionType?: string;       // tipo de leilão: judicial, extrajudicial, etc.
  vpt?: number;               // Valor Patrimonial Tributário
  condominiumDebt?: number;   // condomínio em atraso
  renovationEstimate?: number; // estimativa de obras
  targetMargin?: number;      // margem alvo para leilão (ex: 15%)
}

export interface PropertyValuationOutput {
  askingPrice: number;
  marketValue: number;        // valor de referência usado no desconto
  avm: number;                // estimativa do modelo
  avmLow: number;
  avmHigh: number;
  avmConfidence: "alta" | "media" | "baixa";
  pricePerSqm: number;
  marketAvgPerSqm: number;
  areaSqm: number;
  discountPct: number;        // (marketValue - askingPrice) / marketValue
  yieldPct: number | null;    // (rendaMensal × 12) / askingPrice × 100
  monthlyRentEstimate: number | null;
  score: number;              // 0-100
  risk: "baixo" | "medio" | "alto";
  recommendation: string;
  factors: {
    discount: number;
    rentability: number;
    pricePerSqm: number;
    liquidity: number;
    source: number;
  };
  methodology: string;
  valuationFactors: {
    basePricePerSqm: number;
    typeMultiplier: number;
    municipalityPremium: number;
    marketTrend: number;
    conditionFactor: number;
  };
  costBreakdown?: {
    basePrice: number;
    marketValue: number;
    discountPct: number;
    maxBid: number;
    rentability: number | null;
    monthlyRentEstimate: number | null;
    score: number;
    risk: "baixo" | "medio" | "alto";
    recommendation: string;
    factors: {
      discount: number;
      rentability: number;
      pricePerSqm: number;
      liquidity: number;
      source: number;
    };
    methodology: string;
    valuationFactors: {
      basePricePerSqm: number;
      typeMultiplier: number;
      municipalityPremium: number;
      marketTrend: number;
      conditionFactor: number;
    };
  };
}

export function calculateValuation(input: PropertyValuationInput): PropertyValuationOutput {
  const {
    district,
    municipality = district,
    type,
    price,
    marketValue,
    source = "portal",
    sourceName = source,
    sqm = 0,
    createdAt,
    isActive = true,
    isAuction = false,
    currentBid,
    auctionType,
    vpt,
    condominiumDebt = 0,
    renovationEstimate = 0,
    targetMargin = 15,
  } = input;

  const bench = districtBenchmarks[district] || districtBenchmarks["Braga"];
  const estSqm = sqm > 0 ? sqm : typeSizeEstimates[type] || 70;

  const basePricePerSqm = bench.avgPricePerSqm;
  const typeMult = typeMultipliers[type] || 1.0;
  const munPremium = municipalityPremiums[district]?.[municipality] || 1.0;
  const trend = marketTrends[district] || 1.0;
  const condition = conditionFactors[source] || 1.0;
  const sourceScore = sourceReliability[source] || 5;

  let marketValueFinal: number;
  let confidence: "alta" | "media" | "baixa";
  let methodology: string;

  if (marketValue && marketValue > 0) {
    marketValueFinal = marketValue;
    confidence = "alta";
    methodology = `Valor de referência: anúncio (${marketValue.toLocaleString()}€). AVM não aplicado.`;
  } else {
    const adjustedPerSqm = basePricePerSqm * typeMult * munPremium * trend * condition;
    marketValueFinal = Math.round(adjustedPerSqm * estSqm);
    confidence = estSqm === 70 ? "baixa" : "media";
    methodology = `AVM: ${estSqm}m² × ${basePricePerSqm}€/m² (base distrito) × ${typeMult} (tipo) × ${munPremium} (município) × ${trend} (tendência) × ${condition} (condição fonte).`;
  }

  const pricePerSqm = Math.round(price / estSqm);
  const marketAvgPerSqm = Math.round(marketValueFinal / estSqm);
  const discountPct = Math.round(((marketValueFinal - price) / marketValueFinal) * 100);

  let monthlyRentEstimate: number | null = null;
  let yieldPct: number | null = null;
  const rentByType = rentEstimates[district];
  if (rentByType && rentByType[type]) {
    monthlyRentEstimate = rentByType[type];
    yieldPct = Math.round((monthlyRentEstimate * 12) / price * 100);
  }

  let score = 50;
  const factors: {
    discount: number;
    rentability: number;
    pricePerSqm: number;
    liquidity: number;
    source: number;
  } = {
    discount: 0,
    rentability: 0,
    pricePerSqm: 0,
    liquidity: 0,
    source: 0,
  };

  const discountScore = Math.min(30, Math.max(0, discountPct));
  factors.discount = discountScore;
  score += discountScore;

  let rentScore = 0;
  if (yieldPct && yieldPct >= 8) rentScore = 20;
  else if (yieldPct && yieldPct >= 6) rentScore = 15;
  else if (yieldPct && yieldPct >= 4) rentScore = 10;
  else if (yieldPct && yieldPct > 0) rentScore = 5;
  factors.rentability = rentScore;
  score += rentScore;

  let priceM2Score = 0;
  const ratio = pricePerSqm / marketAvgPerSqm;
  if (ratio < 0.6) priceM2Score = 25;
  else if (ratio < 0.75) priceM2Score = 20;
  else if (ratio < 0.85) priceM2Score = 15;
  else if (ratio < 0.95) priceM2Score = 10;
  else if (ratio > 1.2) priceM2Score = 0;
  else priceM2Score = 5;
  factors.pricePerSqm = priceM2Score;
  score += priceM2Score;

  factors.liquidity = districtLiquidity[district] || 8;
  score += factors.liquidity;

  factors.source = sourceReliability[source] || 5;
  score += factors.source;

  let freshnessScore = 0;
  if (createdAt) {
    const days = (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24);
    if (days < 7) freshnessScore = 10;
    else if (days < 30) freshnessScore = 7;
    else if (days < 90) freshnessScore = 4;
    else freshnessScore = 1;
  }
  score += freshnessScore;

  if (!isActive) score -= 10;

  score = Math.min(100, Math.max(0, Math.round(score)));

  let risk: "baixo" | "medio" | "alto" = "medio";
  if (score >= 85) risk = "baixo";
  else if (score < 55) risk = "alto";

  let recommendation: string;
  if (score >= 85) recommendation = "Excelente oportunidade";
  else if (score >= 70) recommendation = "Boa oportunidade";
  else if (score >= 55) recommendation = "Oportunidade razoável";
  else recommendation = "Oportunidade fraca";

  const rangePct = confidence === "alta" ? 0.10 : confidence === "media" ? 0.18 : 0.25;
  const avmLow = Math.round(marketValueFinal * (1 - rangePct));
  const avmHigh = Math.round(marketValueFinal * (1 + rangePct));

  return {
    askingPrice: price,
    marketValue: marketValueFinal,
    avm: marketValueFinal,
    avmLow,
    avmHigh,
    avmConfidence: confidence,
    pricePerSqm,
    marketAvgPerSqm,
    areaSqm: estSqm,
    discountPct,
    yieldPct,
    monthlyRentEstimate,
    score,
    risk,
    recommendation,
    factors,
    methodology,
    valuationFactors: {
      basePricePerSqm: bench.avgPricePerSqm,
      typeMultiplier: typeMult,
      municipalityPremium: munPremium,
      marketTrend: trend,
      conditionFactor: condition,
    },
  };
}

export function formatCurrency(value: number): string {
  return value.toLocaleString("pt-PT", { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + "€";
}

export function formatScoreText(score: number): string {
  if (score >= 85) return "Excelente oportunidade";
  if (score >= 70) return "Boa oportunidade";
  if (score >= 55) return "Oportunidade razoável";
  return "Oportunidade fraca";
}