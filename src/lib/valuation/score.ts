/**
 * RadarPro Portugal - Motor de scoring com pesos por tipo de ativo
 *
 * Pesos (soma 1.00 por tipo):
 * | Dimensão       | apartment | urban_land | rural_land | auction |
 * | Desconto vs AVM| 0.30      | 0.25       | 0.20       | 0.30    |
 * | Preço/m² vs mediana| 0.25  | 0.30       | 0.35       | 0.20    |
 * | Yield/rendimento | 0.20    | 0.10       | 0.25       | 0.20    |
 * | Liquidez        | 0.15     | 0.20       | 0.10       | 0.15    |
 * | Confiança/risco | 0.10     | 0.15       | 0.10       | 0.15    |
 *
 * Cortes (regras de corte aplicadas depois da soma ponderada):
 * - valuation_confidence = 'very_low'  → score máximo 40
 * - pdm_status = 'non_buildable' ou 'unknown' (urban_land) → score máximo 40
 * - Sem rendimento demonstrável (rural_land) → score máximo 30
 * - current_bid >= max_bid (leilão) → score máximo 30, badge vermelho
 */

import type { AssetClass, ScoreResult } from "./types";

export const SCORE_WEIGHTS: Record<string, Record<string, number>> = {
  apartment: {
    discount: 0.30,
    pricePerSqm: 0.25,
    yield: 0.20,
    liquidity: 0.15,
    confidence: 0.10,
  },
  urban_land: {
    discount: 0.25,
    pricePerSqm: 0.30,
    yield: 0.10,
    liquidity: 0.20,
    confidence: 0.15,
  },
  rural_land: {
    discount: 0.20,
    pricePerSqm: 0.35,
    yield: 0.25,
    liquidity: 0.10,
    confidence: 0.10,
  },
  auction: {
    discount: 0.30,
    pricePerSqm: 0.20,
    yield: 0.20,
    liquidity: 0.15,
    confidence: 0.15,
  },
};

function clamp01(v: number): number {
  return Math.min(100, Math.max(0, Math.round(v)));
}

/** 0-100: desconto do preço de venda/ask face ao valor de referência (AVM) */
function discountScore(
  property: any,
  valuation: any
): number {
  const discountPct = property.discountPct ?? 0;
  if (discountPct >= 40) return 100;
  if (discountPct >= 30) return 80;
  if (discountPct >= 20) return 60;
  if (discountPct >= 10) return 40;
  if (discountPct > 0) return 20;
  return 0;
}

/** 0-100: preço/m² do imóvel face à mediana da zona */
function pricePerSqmScore(property: any, valuation: any): number {
  const pricePerSqm = property.pricePerSqm ?? 0;
  const marketAvgPerSqm = valuation.marketAvgPerSqm ?? property.marketAvgPerSqm ?? 0;
  if (!pricePerSqm || !marketAvgPerSqm) return 50;
  const ratio = pricePerSqm / marketAvgPerSqm;
  if (ratio < 0.60) return 100;
  if (ratio < 0.75) return 80;
  if (ratio < 0.85) return 60;
  if (ratio < 0.95) return 40;
  if (ratio > 1.20) return 0;
  return 20;
}

/** 0-100: yield/rendimento estimado */
function yieldScore(property: any, valuation: any): number {
  const yieldPct = property.yieldPct ?? valuation.yieldPct ?? 0;
  if (!yieldPct || yieldPct <= 0) return 0;
  if (yieldPct >= 8) return 100;
  if (yieldPct >= 6) return 75;
  if (yieldPct >= 4) return 50;
  if (yieldPct >= 2) return 25;
  return 10;
}

/** 0-100: liquidez da zona/tipo */
function liquidityScore(property: any): number {
  const districtLiquidity: Record<string, number> = {
    Lisboa: 100, Porto: 80, Braga: 55, Faro: 70, Setubal: 65,
    Aveiro: 60, Coimbra: 55, Leiria: 55, Santarem: 50,
    Viseu: 50, "Viana do Castelo": 55, Braganca: 40, Guarda: 40,
    "Castelo Branco": 40, Portalegre: 40, Evora: 50, Beja: 40,
    "Vila Real": 50, Acores: 35, Madeira: 50,
  };
  return districtLiquidity[property.district] ?? 55;
}

/** 0-100: confiança do modelo / risco */
function confidenceScore(property: any, valuation: any): number {
  const conf = property.valuation_confidence ?? valuation.confidence ?? "low";
  switch (conf) {
    case "high": return 100;
    case "medium": return 70;
    case "low": return 40;
    case "very_low": return 10;
    default: return 40;
  }
}

export function calculateScore(
  property: any,
  valuation: any
): ScoreResult {
  const assetClass: AssetClass = property.asset_class ?? "apartment";
  const isAuction =
    property.isAuction === true ||
    property.listing_type === "auction_judicial" ||
    property.listing_type === "auction_fiscal" ||
    property.listing_type === "auction_private";

  const weightKey = isAuction ? "auction" : assetClass;
  const weights = SCORE_WEIGHTS[weightKey] ?? SCORE_WEIGHTS.apartment;

  const sDiscount = discountScore(property, valuation);
  const sPriceM2 = pricePerSqmScore(property, valuation);
  const sYield = yieldScore(property, valuation);
  const sLiquidity = liquidityScore(property);
  const sConfidence = confidenceScore(property, valuation);

  // Soma ponderada (0-100)
  let score = Math.round(
    sDiscount * weights.discount +
    sPriceM2 * weights.pricePerSqm +
    sYield * weights.yield +
    sLiquidity * weights.liquidity +
    sConfidence * weights.confidence
  );

  // Aplicar cortes
  let maxScore = 100;
  const badges: string[] = [];
  let capped = false;

  if (property.valuation_confidence === "very_low") {
    maxScore = Math.min(maxScore, 40);
    badges.push("Confiança muito baixa");
    capped = true;
  }

  if (
    assetClass === "urban_land" &&
    (property.pdm_status === "non_buildable" || property.pdm_status === "unknown")
  ) {
    maxScore = Math.min(maxScore, 40);
    badges.push("PDM não edificável ou desconhecido");
    capped = true;
  }

  if (assetClass === "rural_land" && !property.annualIncome) {
    maxScore = Math.min(maxScore, 30);
    badges.push("Sem rendimento demonstrável");
    capped = true;
  }

  if (isAuction && property.currentBid != null && property.maxBid != null && property.currentBid >= property.maxBid) {
    maxScore = Math.min(maxScore, 30);
    badges.push("Lance atual >= lance máximo");
    capped = true;
  }

  if (capped) {
    score = Math.min(score, maxScore);
  }

  return {
    score: clamp01(score),
    breakdown: {
      discount: sDiscount,
      pricePerSqm: sPriceM2,
      yield: sYield,
      liquidity: sLiquidity,
      confidence: sConfidence,
    },
    maxScore,
    badges,
    capped,
  };
}
