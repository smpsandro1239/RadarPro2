/**
 * RadarPro Portugal - Leilão Engine
 *
 * Este módulo calcula o LANCE MÁXIMO SUSTENTÁVEL para imóveis em leilão.
 * A fórmula é:
 *   Max Bid = (Valor de Mercado × (1 - Margem Alvo)) - (Custos Totais sem Lance)
 *
 * Custos incluem:
 * - Comissão leiloeira (% do lance + IVA)
 * - IMT (Imposto Municipal sobre Transmissões)
 * - Imposto do Selo (0,8%)
 * - Registo Predial (fixo)
 * - Custas judiciais residuais
 * - Condomínio em atraso
 * - Obras estimadas
 */

import { PropertyValuationInput, PropertyValuationOutput, municipalityPremiums, districtBenchmarks, typeSizeEstimates, sourceReliability, districtLiquidity, marketTrends as marketTrendsFromValuation, typeMultipliers, conditionFactors } from "./valuation";

interface AuctionCalculationInput {
  district: string;
  municipality: string;
  type: string;
  price: number;
  marketValue: number | null;
  source: string;
  sourceName?: string;
  sourceType?: "judicial" | "fiscal" | "private";
  sqm?: number;
  createdAt?: Date | null;
  isActive?: boolean;
  vpt?: number;
  condominiumDebt?: number;
  renovationEstimate?: number;
}

interface CostBreakdown {
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
}

export function calculateAuctionValuation(input: PropertyValuationInput): PropertyValuationOutput & { costBreakdown: CostBreakdown } {
  const {
    district,
    municipality = district,
    type,
    price,
    marketValue,
    source = "portal",
    sourceName = source,
    sourceType = "judicial",
    sqm = 0,
    condominiumDebt = 0,
    renovationEstimate = 0,
    targetMargin = 15,
    createdAt,
    isActive = true,
    vpt,
  } = input;

  const marketValueNum = marketValue ?? 0;

  const bench = districtBenchmarks[district] || districtBenchmarks["Braga"];
  const estSqm = sqm > 0 ? sqm : typeSizeEstimates[type] || 70;

  // Cálculo do custo total
  const commission = calculateCommission(price, sourceName);
  const imt = calculateIMT(imtBase(price, marketValueNum), type, false);
  const stampDuty = calculateStampDuty(imtBase(price, marketValueNum));
  const registrationFee = 250;
  const courtCosts = Math.round(imtBase(price, marketValueNum) * 0.0075);
  const condoDebt = condominiumDebt || 0;
  const renovationEst = renovationEstimate || 0;

  const totalNonBidCosts = commission + imt + stampDuty + registrationFee + courtCosts + condoDebt + renovationEst;

  // Max Bid = (Valor de Mercado × (1 - Margem Alvo)) - Custos Fixos
  // Max Bid = (targetValue - fixedCosts) / (1 + variablePct)
  const targetMarginDecimal = targetMargin / 100;
  const targetValue = marketValueNum * (1 - targetMarginDecimal);
  const variablePct = (commission + imt + stampDuty) / marketValueNum;

  const maxBid = Math.round((targetValue - totalNonBidCosts) / (1 + variablePct));
  const maxBidRounded = Math.round(maxBid);

  const pricePerSqm = Math.round(price / estSqm);
  const marketAvgPerSqm = Math.round(marketValueNum / estSqm);

  // Desconto do lance atual vs mercado
  const discountPct = Math.round(((marketValueNum - price) / marketValueNum) * 100);

  // Desconto do lance máximo vs mercado
  const maxBidDiscountPct = Math.round(((marketValueNum - maxBidRounded) / marketValueNum) * 100);

  // Rentabilidade estimada (baseada no lance máximo)
  let monthlyRentEstimate: number | null = null;
  let yieldPct: number | null = null;
  const rentByType = rentEstimates[district];
  if (rentByType && rentByType[type]) {
    monthlyRentEstimate = rentByType[type];
    yieldPct = Math.round((monthlyRentEstimate * 12) / maxBidRounded * 100);
  }

  // Score de oportunidade de leilão (0-100)
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

  // Desconto (30 pontos)
  const discountScore = Math.min(30, Math.max(0, maxBidDiscountPct));
  factors.discount = discountScore;
  score += discountScore;

  // Rentabilidade (20 pontos)
  let rentScore = 0;
  if (yieldPct && yieldPct >= 8) rentScore = 20;
  else if (yieldPct && yieldPct >= 6) rentScore = 15;
  else if (yieldPct && yieldPct >= 4) rentScore = 10;
  else if (yieldPct && yieldPct > 0) rentScore = 5;
  factors.rentability = rentScore;
  score += rentScore;

  // Preço/m² vs mediana da zona (25 pontos)
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

  // Liquidez (15 pontos)
  factors.liquidity = districtLiquidity[district] || 8;
  score += factors.liquidity;

  // Fonte / atualidade (10 pontos)
  factors.source = sourceReliability[source] || 5;
  score += factors.source;

  score = Math.min(100, Math.max(0, Math.round(score)));

  let risk: "baixo" | "medio" | "alto" = "medio";
  if (score >= 85) risk = "baixo";
  else if (score < 55) risk = "alto";

  let recommendation: string;
  if (score >= 85) recommendation = "Excelente oportunidade de leilão";
  else if (score >= 70) recommendation = "Boa oportunidade de leilão";
  else if (score >= 55) recommendation = "Oportunidade razoável";
  else recommendation = "Cuidado: lance acima do recomendado";

  const methodology = `Cálculo do Lance Máximo para ${district}:
  • Valor de mercado (AVM): ${marketValueNum.toLocaleString()}€
  • Margem alvo: ${targetMargin}%
  • Preço/m² do distrito: ${bench.avgPricePerSqm}€/m²
  • Tipo de imóvel: ${type} (multiplicador ${typeMultipliers[type] || 1}x)
  • Município: ${municipality} (prémio ${municipalityPremiums[district]?.[municipality] || 1}x)
  • Tendência de mercado: ${marketTrendsFromValuation[district] || 1}x
  • Condição da fonte: ${conditionFactors[source] || 1}x

  Custos incluídos no cálculo:
  • Comissão leiloeira: ${commission.toLocaleString()}€
  • IMT: ${Math.round(imt).toLocaleString()}€
  • Imposto do Selo (0,8%): ${Math.round(stampDuty).toLocaleString()}€
  • Registo Predial: ${registrationFee}€
  • Custas judiciais: ${Math.round(courtCosts).toLocaleString()}€
  • Condomínio em atraso: ${condoDebt.toLocaleString()}€
  • Obras estimadas: ${renovationEst.toLocaleString()}€
  • Custos totais (sem lance): ${Math.round(commission + imt + stampDuty + registrationFee + courtCosts + condoDebt + renovationEst).toLocaleString()}€

  Fórmula: Max Bid = ((Valor Mercado × (1 - Margem)) - Custos Fixos) / (1 + % Variável)`;

  return {
    askingPrice: price,
    marketValue: marketValueNum,
    avm: marketValueNum,
    avmLow: Math.round(marketValueNum * 0.85),
    avmHigh: Math.round(marketValueNum * 1.15),
    avmConfidence: "alta",
    pricePerSqm,
    marketAvgPerSqm: Math.round(marketValueNum / estSqm),
    areaSqm: estSqm,
    discountPct,
    maxBidDiscountPct,
    rentability: yieldPct,
    monthlyRentEstimate,
    score,
    risk,
    factors,
    methodology,
    valuationFactors: {
      basePricePerSqm: bench.avgPricePerSqm,
      typeMultiplier: typeMultipliers[type] || 1,
      municipalityPremium: municipalityPremiums[district]?.[municipality] || 1,
      marketTrend: marketTrendsFromValuation[district] || 1,
      conditionFactor: conditionFactors[source] || 1,
    },
    costBreakdown: {
      basePrice: price,
      marketValue: marketValueNum,
      discountPct,
      maxBid: maxBidRounded,
      rentability: yieldPct,
      monthlyRentEstimate,
      score,
      risk,
      recommendation,
      factors: {
        discount: discountScore,
        rentability: rentScore,
        pricePerSqm: priceM2Score,
        liquidity: factors.liquidity,
        source: factors.source,
      },
      methodology,
      valuationFactors: {
        basePricePerSqm: bench.avgPricePerSqm,
        typeMultiplier: typeMultipliers[type] || 1,
        municipalityPremium: municipalityPremiums[district]?.[municipality] || 1,
        marketTrend: marketTrendsFromValuation[district] || 1,
        conditionFactor: conditionFactors[source] || 1,
      },
    },
  };
}

export function calculateCommission(price: number, sourceName: string): number {
  if (sourceName === "e-Leiloes") return 0;
  const commissionRate = sourceName === "Leilosoc" ? 0.05 :
    sourceName === "Martelo.pt" ? 0.06 :
    sourceName === "Bidizi" ? 0.05 : 0.05;
  return price * commissionRate * 1.23;
}

function calculateIMT(price: number, propertyType: string, isHPP: boolean = false): number {
  if (propertyType === "Terreno" || propertyType === "Armazem" || propertyType === "Predio") {
    return price * 0.065;
  }
  if (isHPP) {
    if (price <= 106346) return 0;
    if (price <= 138450) return (price * 0.02) - 1063.46;
    if (price <= 190456) return (price * 0.05) - 5178.67;
    if (price <= 324058) return (price * 0.07) - 9000.39;
    if (price <= 648022) return (price * 0.08) - 12240.97;
    return price * 0.06;
  }
  if (price <= 106346) return price * 0.01;
  if (price <= 138450) return (price * 0.02) - 1063.46;
  if (price <= 190456) return (price * 0.05) - 5178.67;
  if (price <= 324058) return (price * 0.07) - 9000.39;
  if (price <= 648022) return (price * 0.08) - 12240.97;
  return price * 0.06;
}

function calculateStampDuty(price: number): number {
  return price * 0.008;
}

function imtBase(price: number, marketValue: number): number {
  return marketValue && marketValue > price ? marketValue : price;
}