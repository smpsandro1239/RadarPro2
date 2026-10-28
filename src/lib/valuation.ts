// Valuation model: price per m² by district (based on market data 2026)
export const pricePerSqmByDistrict: Record<string, { min: number; avg: number; max: number }> = {
  Lisboa: { min: 3800, avg: 5200, max: 8500 },
  Porto: { min: 2500, avg: 3800, max: 6500 },
  Braga: { min: 1800, avg: 2600, max: 4200 },
};

// Type multipliers for valuation
export const typeMultipliers: Record<string, number> = {
  T0: 0.85,
  T1: 0.95,
  T2: 1.0,
  T3: 1.1,
  T4: 1.2,
  V2: 1.15,
  V3: 1.25,
  V4: 1.35,
  Terreno: 0.5,
  Garagem: 0.15,
  Loja: 0.7,
  Armazém: 0.6,
  "Prédio": 1.5,
  Arrecadação: 0.1,
};

export interface ValuationResult {
  estimatedValue: number;
  pricePerSqm: number;
  marketAvgPerSqm: number;
  discountPct: number;
  opportunityScore: number;
  riskLevel: "baixo" | "médio" | "alto";
  yieldEstimate: number;
  recommendation: string;
}

export function calculateValuation(
  district: string,
  type: string,
  price: number,
  sqm: number = 0,
  rentability: number = 0
): ValuationResult {
  const districtData = pricePerSqmByDistrict[district] || pricePerSqmByDistrict["Braga"];
  const typeMult = typeMultipliers[type] || 1.0;

  // Estimate sqm if not provided (based on average for type)
  const estimatedSqm = sqm > 0 ? sqm : type.startsWith("T") ? 70 : type.startsWith("V") ? 120 : 50;

  const marketAvgPerSqm = districtData.avg * typeMult;
  const estimatedValue = Math.round(marketAvgPerSqm * estimatedSqm);
  const pricePerSqm = Math.round(price / estimatedSqm);
  const discountPct = Math.round(((estimatedValue - price) / estimatedValue) * 100);

  // Opportunity score (0-100)
  let score = 50;
  // Discount contribution (up to 30 points)
  score += Math.min(30, discountPct);
  // Rentability contribution (up to 20 points)
  score += Math.min(20, rentability * 2);
  // Price per sqm vs market (up to 20 points)
  const priceRatio = pricePerSqm / marketAvgPerSqm;
  if (priceRatio < 0.7) score += 20;
  else if (priceRatio < 0.85) score += 15;
  else if (priceRatio < 1.0) score += 10;
  else if (priceRatio > 1.2) score -= 10;
  // Cap at 100
  score = Math.min(100, Math.max(0, score));

  // Risk level
  let riskLevel: "baixo" | "médio" | "alto" = "médio";
  if (score >= 85) riskLevel = "baixo";
  else if (score < 60) riskLevel = "alto";

  // Yield estimate
  const yieldEstimate = rentability > 0 ? rentability : discountPct > 20 ? 6.5 : 4.5;

  // Recommendation
  let recommendation = "Imóvel com potencial moderado.";
  if (score >= 90) recommendation = "Excelente oportunidade! Forte desconto e boa rentabilidade.";
  else if (score >= 80) recommendation = "Boa oportunidade de investimento.";
  else if (score >= 70) recommendation = "Oportunidade razoável. Verificar detalhes.";
  else if (score < 60) recommendation = "Cuidado: pode não ser uma boa oportunidade.";

  return {
    estimatedValue,
    pricePerSqm,
    marketAvgPerSqm: Math.round(marketAvgPerSqm),
    discountPct,
    opportunityScore: score,
    riskLevel,
    yieldEstimate,
    recommendation,
  };
}

export function formatCurrency(value: number): string {
  return value.toLocaleString("pt-PT") + "€";
}
