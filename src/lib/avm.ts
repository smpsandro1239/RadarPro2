// Enhanced AVM (Automated Valuation Model) with multi-factor analysis
// Provides more accurate property valuation estimates

export interface AVMResult {
  estimatedValue: number;
  confidence: "alta" | "média" | "baixa";
  pricePerSqm: number;
  marketAvgPerSqm: number;
  valuationRange: { min: number; max: number };
  factors: {
    district: number; // district price influence
    type: number; // property type multiplier
    condition: number; // estimated condition factor
    location: number; // municipality premium/discount
    trend: number; // market trend factor
  };
  methodology: string;
}

// Municipality price premiums (relative to district average)
const municipalityPremiums: Record<string, Record<string, number>> = {
  Lisboa: {
    "Lisboa": 1.15, "Cascais": 1.35, "Oeiras": 1.2, "Sintra": 0.95,
    "Amadora": 0.85, "Odivelas": 0.9, "Loures": 0.85, "Mafra": 0.9,
    "Torres Vedras": 0.8, "Vila Franca de Xira": 0.85,
  },
  Porto: {
    "Porto": 1.1, "Vila Nova de Gaia": 0.95, "Matosinhos": 1.15,
    "Gondomar": 0.85, "Maia": 0.95, "Valongo": 0.85,
    "Póvoa de Varzim": 0.9, "Vila do Conde": 0.9, "Felgueiras": 0.75,
    "Santo Tirso": 0.8,
  },
  Braga: {
    "Braga": 1.1, "Guimarães": 0.95, "Barcelos": 0.85,
    "Vila Nova de Famalicão": 0.9, "Fafe": 0.75, "Póvoa de Lanhoso": 0.8,
    "Esposende": 0.9, "Amares": 0.8, "Vila Verde": 0.8,
  },
  Faro: {
    "Faro": 1.0, "Loulé": 1.4, "Albufeira": 1.2, "Portimão": 1.05,
    "Lagos": 1.25, "Tavira": 1.1, "Olhão": 0.95, "Silves": 0.9,
  },
  Setúbal: {
    "Setúbal": 1.0, "Almada": 1.1, "Seixal": 0.95, "Barreiro": 0.85,
    "Sesimbra": 1.15, "Palmela": 0.9, "Montijo": 0.9, "Moita": 0.85,
  },
};

// Market trend factors (2026 Q1-Q2 trends)
const marketTrends: Record<string, number> = {
  Lisboa: 1.03, // +3% YoY
  Porto: 1.05, // +5% YoY
  Braga: 1.04, // +4% YoY
  Faro: 1.06, // +6% YoY (Algarve premium)
  Setúbal: 1.04,
  Aveiro: 1.02,
  Coimbra: 1.01,
  Leiria: 1.02,
  Santarém: 1.01,
  Viseu: 1.01,
  "Viana do Castelo": 1.02,
  Bragança: 1.0,
  Guarda: 1.0,
  "Castelo Branco": 1.01,
  Portalegre: 1.0,
  Évora: 1.01,
  Beja: 1.0,
  "Vila Real": 1.01,
  Açores: 1.02,
  Madeira: 1.03,
};

// Condition factors based on source type
const conditionFactors: Record<string, number> = {
  "banco": 0.85, // Bank properties often need renovation
  "leilao": 0.80, // Auction properties often in poor condition
  "portal": 1.0, // Regular listings
  "agencia": 1.05, // Agency listings often better presented
};

export function calculateAdvancedAVM(params: {
  district: string;
  municipality: string;
  type: string;
  price: number;
  marketValue: number | null;
  source: string;
  sqm?: number;
}): AVMResult {
  const benchmark = pricePerSqmBenchmarks[params.district] || pricePerSqmBenchmarks["Braga"];
  const estSqm = params.sqm || typeSizeEstimates[params.type] || 70;

  // 1. District factor
  const districtFactor = benchmark.avg;

  // 2. Type multiplier
  const typeMultiplier = typeMultipliers[params.type] || 1.0;

  // 3. Municipality premium
  const munPremium = municipalityPremiums[params.district]?.[params.municipality] || 1.0;

  // 4. Market trend
  const trend = marketTrends[params.district] || 1.0;

  // 5. Condition factor
  const condition = conditionFactors[params.source] || 1.0;

  // Calculate estimated value
  let estimatedValue: number;
  let confidence: "alta" | "média" | "baixa" = "média";

  if (params.marketValue && params.marketValue > 0) {
    // Use actual market value as anchor, adjust with factors
    const marketPricePerSqm = params.marketValue / estSqm;
    const adjustedPerSqm = marketPricePerSqm * munPremium * trend;
    estimatedValue = Math.round(adjustedPerSqm * estSqm);
    confidence = "alta";
  } else {
    // Use benchmark with all factors
    const adjustedPerSqm = benchmark.avg * typeMultiplier * munPremium * trend * condition;
    estimatedValue = Math.round(adjustedPerSqm * estSqm);
    confidence = estSqm === 70 ? "baixa" : "média";
  }

  const pricePerSqm = Math.round(params.price / estSqm);
  const marketAvgPerSqm = Math.round(estimatedValue / estSqm);

  // Valuation range (±12% for high confidence, ±20% for low)
  const rangePct = confidence === "alta" ? 0.12 : confidence === "média" ? 0.15 : 0.20;
  const valuationRange = {
    min: Math.round(estimatedValue * (1 - rangePct)),
    max: Math.round(estimatedValue * (1 + rangePct)),
  };

  const factors = {
    district: Math.round(districtFactor),
    type: Math.round(typeMultiplier * 100) / 100,
    condition: Math.round(condition * 100) / 100,
    location: Math.round(munPremium * 100) / 100,
    trend: Math.round(trend * 100) / 100,
  };

  const methodology = `AVM baseado em: preço/m² médio do distrito (${districtFactor}€/m²), multiplicador de tipo (${typeMultiplier}), prémio de localização (${munPremium}), tendência de mercado (${trend}), e fator de condição (${condition}). ${params.marketValue ? "Valor de mercado fornecido pelo portal usado como referência." : "Sem valor de mercado fornecido - estimativa baseada em benchmarks."}`;

  return {
    estimatedValue,
    confidence,
    pricePerSqm,
    marketAvgPerSqm,
    valuationRange,
    factors,
    methodology,
  };
}

// Import existing types
import { typeSizeEstimates, pricePerSqmBenchmarks } from "./scoring";
import { typeMultipliers } from "./valuation";

// Re-export for convenience
export { typeSizeEstimates, pricePerSqmBenchmarks };
