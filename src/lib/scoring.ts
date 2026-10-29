// Enhanced valuation and scoring model
// Combines multiple data points for a comprehensive opportunity assessment

export interface OpportunityScore {
  total: number; // 0-100
  breakdown: {
    discount: number; // 0-30: discount vs market
    rentability: number; // 0-20: estimated yield
    liquidity: number; // 0-15: how fast properties sell in the area
    source: number; // 0-15: source reliability (bank/leilao = higher)
    pricePerSqm: number; // 0-10: price per m² vs zone average
    freshness: number; // 0-10: how recently listed
  };
  riskLevel: "baixo" | "médio" | "alto";
  recommendation: string;
  factors: string[];
}

// Source reliability scores
export const sourceReliability: Record<string, number> = {
  "e-Leilões": 15,
  "Estamo": 15,
  "Leilosoc": 14,
  "Martelo.pt": 14,
  "Caixa Imobiliário": 13,
  "Millennium BCP": 13,
  "Santander": 12,
  "Novo Banco": 12,
  "Montepio": 11,
  "Crédito Agrícola": 11,
  "BPI Expresso": 12,
  "Casa Sapo": 8,
  "Idealista": 8,
  "Imovirtual": 8,
  "SuperCasa": 7,
  "OLX": 6,
  "CustoJusto": 6,
  "RE/MAX": 9,
  "ERA": 9,
  "Century 21": 9,
  "KW Portugal": 9,
  "Coldwell Banker": 9,
};

// District liquidity scores (how fast properties sell)
export const districtLiquidity: Record<string, number> = {
  Lisboa: 15,
  Porto: 12,
  Braga: 8,
};

// Price per m² benchmarks by district (2026 market data)
export const pricePerSqmBenchmarks: Record<string, { avg: number; min: number; max: number }> = {
  Lisboa: { avg: 5200, min: 3800, max: 8500 },
  Porto: { avg: 3800, min: 2500, max: 6500 },
  Braga: { avg: 2600, min: 1800, max: 4200 },
};

// Type size estimates (m²) for properties without area data
export const typeSizeEstimates: Record<string, number> = {
  T0: 35, T1: 55, T2: 75, T3: 100, T4: 130,
  V2: 120, V3: 150, V4: 180, V5: 220,
  Terreno: 500, Garagem: 15, Loja: 60,
  Armazém: 200, "Prédio": 500, Arrecadação: 10,
};

export function calculateOpportunityScore(params: {
  price: number;
  marketValue: number | null;
  discountPct: number | null;
  rentability: number | null;
  sourceName: string;
  district: string;
  type: string;
  createdAt: Date | null;
  isActive: boolean;
}): OpportunityScore {
  const factors: string[] = [];
  const breakdown = {
    discount: 0,
    rentability: 0,
    liquidity: 0,
    source: 0,
    pricePerSqm: 0,
    freshness: 0,
  };

  // 1. Discount (0-30 points)
  const discount = params.discountPct || 0;
  if (discount >= 40) { breakdown.discount = 30; factors.push("Desconto excecional (40%+)"); }
  else if (discount >= 30) { breakdown.discount = 25; factors.push("Desconto muito bom (30%+)"); }
  else if (discount >= 20) { breakdown.discount = 20; factors.push("Bom desconto (20%+)"); }
  else if (discount >= 10) { breakdown.discount = 12; factors.push("Desconto moderado"); }
  else { breakdown.discount = 5; }

  // 2. Rentability (0-20 points)
  const rent = params.rentability || 0;
  if (rent >= 8) { breakdown.rentability = 20; factors.push("Rentabilidade elevada (8%+)"); }
  else if (rent >= 6) { breakdown.rentability = 15; factors.push("Boa rentabilidade (6%+)"); }
  else if (rent >= 4) { breakdown.rentability = 10; factors.push("Rentabilidade moderada"); }
  else if (rent > 0) { breakdown.rentability = 5; }
  else { breakdown.rentability = 0; }

  // 3. Liquidity (0-15 points)
  breakdown.liquidity = districtLiquidity[params.district] || 8;

  // 4. Source reliability (0-15 points)
  breakdown.source = sourceReliability[params.sourceName] || 5;
  if (breakdown.source >= 13) factors.push("Fonte de alta confiança (banco/leilão)");

  // 5. Price per m² (0-10 points) - use marketValue when available for realistic comparison
  const benchmark = pricePerSqmBenchmarks[params.district] || pricePerSqmBenchmarks["Braga"];
  const estSqm = typeSizeEstimates[params.type] || 70;
  const pricePerSqm = params.price / estSqm;
  
  // Use marketValue for more realistic AVM comparison
  let marketAvgPerSqm = benchmark.avg;
  if (params.marketValue && params.marketValue > 0) {
    const marketPricePerSqm = params.marketValue / estSqm;
    // Blend market data with property-specific data
    marketAvgPerSqm = Math.round((benchmark.avg + marketPricePerSqm) / 2);
  }
  
  const ratio = pricePerSqm / marketAvgPerSqm;
  if (ratio < 0.6) { breakdown.pricePerSqm = 10; factors.push("Preço/m² muito abaixo da média"); }
  else if (ratio < 0.75) { breakdown.pricePerSqm = 8; factors.push("Preço/m² abaixo da média"); }
  else if (ratio < 0.9) { breakdown.pricePerSqm = 5; }
  else if (ratio > 1.2) { breakdown.pricePerSqm = 0; factors.push("Preço/m² acima da média"); }
  else { breakdown.pricePerSqm = 3; }

  // 6. Freshness (0-10 points)
  if (params.createdAt) {
    const daysSinceListed = (Date.now() - new Date(params.createdAt).getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceListed < 7) { breakdown.freshness = 10; factors.push("Listado recentemente"); }
    else if (daysSinceListed < 30) { breakdown.freshness = 7; }
    else if (daysSinceListed < 90) { breakdown.freshness = 4; }
    else { breakdown.freshness = 1; factors.push("No mercado há mais de 90 dias"); }
  }

  // Leilão bonus
  if (params.sourceName.toLowerCase().includes("leilão") || params.sourceName.toLowerCase().includes("leilosoc") || params.sourceName.toLowerCase().includes("martelo") || params.sourceName.toLowerCase().includes("estamo")) {
    factors.push("Leilão: potencial de desconto adicional");
  }

  // Inactive penalty
  if (!params.isActive) {
    factors.push("⚠️ Imóvel pode não estar disponível");
  }

  const total = Object.values(breakdown).reduce((a, b) => a + b, 0);

  let riskLevel: "baixo" | "médio" | "alto" = "médio";
  if (total >= 80) riskLevel = "baixo";
  else if (total < 50) riskLevel = "alto";

  let recommendation = "Imóvel com potencial moderado. Verificar detalhes.";
  if (total >= 90) recommendation = "Excelente oportunidade! Forte desconto, boa fonte e rentabilidade.";
  else if (total >= 80) recommendation = "Boa oportunidade de investimento. Recomendado.";
  else if (total >= 70) recommendation = "Oportunidade razoável. Verificar detalhes e visitar.";
  else if (total >= 50) recommendation = "Oportunidade moderada. Analisar com cuidado.";
  else recommendation = "Cuidado: pode não ser uma boa oportunidade. Verificar disponibilidade.";

  return {
    total: Math.min(100, Math.max(0, total)),
    breakdown,
    riskLevel,
    recommendation,
    factors,
  };
}

export function calculateAVM(params: {
  district: string;
  type: string;
  price: number;
  marketValue: number | null;
}): {
  estimatedValue: number;
  confidence: "alta" | "média" | "baixa";
  pricePerSqm: number;
  marketAvgPerSqm: number;
  valuationRange: { min: number; max: number };
} {
  const benchmark = pricePerSqmBenchmarks[params.district] || pricePerSqmBenchmarks["Braga"];
  const estSqm = typeSizeEstimates[params.type] || 70;

  // Use marketValue when available for more realistic estimate
  let estimatedValue: number;
  let confidence: "alta" | "média" | "baixa" = "média";

  if (params.marketValue && params.marketValue > 0) {
    // Use actual market value as primary estimate, blend with benchmark
    const marketPricePerSqm = params.marketValue / estSqm;
    const blendedPerSqm = Math.round((benchmark.avg + marketPricePerSqm) / 2);
    estimatedValue = Math.round(blendedPerSqm * estSqm);
    confidence = "alta";
  } else {
    estimatedValue = Math.round(benchmark.avg * estSqm);
    confidence = estSqm === 70 ? "baixa" : "média";
  }

  const pricePerSqm = Math.round(params.price / estSqm);
  const marketAvgPerSqm = Math.round(estimatedValue / estSqm);

  // Valuation range (±15%)
  const valuationRange = {
    min: Math.round(estimatedValue * 0.85),
    max: Math.round(estimatedValue * 1.15),
  };

  return {
    estimatedValue,
    confidence,
    pricePerSqm,
    marketAvgPerSqm,
    valuationRange,
  };
}
