/**
 * RadarPro Portugal - Avaliação de terreno rústico
 *
 * Método do rendimento: renda agro-florestal anual ÷ taxa de capitalização (ex: 4%).
 * Se não há rendimento → valuation=null, confidence='low', score cortado a 30.
 * Proibido usar €/m² de construção (terreno rústico não tem valor de construção).
 */

import type { ValuationResult } from "./types";

const DEFAULT_CAP_RATE = 0.04; // 4% taxa de capitalização

function estimateAnnualIncome(
  areaSqm: number,
  landUse: string | null,
  district: string | null
): number | null {
  // Rendimento anual estimado €/ha por tipo de uso (referência INE/ADP)
  const incomePerHa: Record<string, number | null> = {
    floresta: 120,       // pinhal/eucalipto
    agricultura: 300,    // culturas temporárias
    olival: 450,         // olival
    vinha: 900,          // vinha
    pastagem: 180,       // pastagem
    misto: 250,
    unknown: null,
  };

  const use = (landUse || "unknown").toLowerCase();
  const perHa = incomePerHa[use];
  if (perHa == null) return null;

  const areaHa = areaSqm / 10000;
  return Math.round(perHa * areaHa);
}

export function evaluateRuralLand(property: any): ValuationResult {
  const {
    district = null,
    municipality = null,
    price = 0,
    sqm = 0,
    landUse = null,
    annualIncome = null,
    capRate = DEFAULT_CAP_RATE,
  } = property;

  // Regra: proibido usar €/m² de construção para rural
  // Se não há rendimento anual (informado ou estimado) → sem avaliação
  let income: number | null = annualIncome ?? null;
  if (!income && sqm > 0) {
    income = estimateAnnualIncome(sqm, landUse, district);
  }

  if (!income || income <= 0) {
    return {
      valuation: null,
      score: 0,
      engine: "land_rural",
      confidence: "low",
      breakdown: {
        reason: "Sem rendimento agro-florestal demonstrável - método do rendimento não aplicável",
        landUse,
        sqm,
      },
    };
  }

  const valuation = Math.round(income / capRate);

  return {
    valuation,
    score: 0,
    engine: "land_rural",
    confidence: "medium",
    breakdown: {
      annualIncome: income,
      capRate,
      areaSqm: sqm,
      areaHa: Math.round((sqm / 10000) * 100) / 100,
      landUse,
      method: "rendimento_agro_florestal",
      note: "Valor = rendimento anual ÷ taxa de capitalização. Proibido €/m² de construção.",
    },
  };
}
