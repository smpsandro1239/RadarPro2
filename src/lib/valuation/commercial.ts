/**
 * RadarPro Portugal - Avaliação de imóveis comerciais
 *
 * Base: €/m² comercial da zona (via findMarketData com propertyType "commercial").
 * Yield é indicador central: valor = rendimento anual ÷ taxa de capitalização.
 */

import { findMarketData } from "@/lib/market-data";
import type { ValuationResult } from "./types";

const DEFAULT_YIELD = 0.06; // 6% yield típico comércio/serviços

export function evaluateCommercial(property: any): ValuationResult {
  const {
    district = "Lisboa",
    municipality = district,
    parish,
    price = 0,
    sqm = 0,
    annualRent = null,
    yieldPct = null,
  } = property;

  // Abordagem 1: rendimento (yield) - indicador central para comercial
  let valuationFromIncome: number | null = null;
  if (annualRent && annualRent > 0) {
    const yieldRate = (yieldPct && yieldPct > 0 ? yieldPct / 100 : DEFAULT_YIELD);
    valuationFromIncome = Math.round(annualRent / yieldRate);
  }

  // Abordagem 2: €/m² comercial da zona
  const marketData = findMarketData({
    district,
    municipality,
    parish,
    propertyType: "commercial",
  });

  let valuationFromSqm: number | null = null;
  if (marketData) {
    const estSqm = sqm > 0 ? sqm : 60;
    valuationFromSqm = Math.round(marketData.pricePerSqm * estSqm);
  }

  // Combinar: se há rendimento, confia-se nele; senão usa €/m²
  let valuation: number | null = null;
  let confidence: "high" | "medium" | "low" | "very_low" = "low";
  let source = "";

  if (valuationFromIncome) {
    valuation = valuationFromIncome;
    confidence = "medium";
    source = "rendimento_anual";
  } else if (valuationFromSqm) {
    valuation = valuationFromSqm;
    confidence = marketData?.level === "parish" ? "medium" : "low";
    source = marketData?.source ?? "";
  }

  if (!valuation) {
    return {
      valuation: null,
      score: 0,
      engine: "commercial",
      confidence: "very_low",
      breakdown: {
        reason: "Sem rendimento nem dados de mercado comerciais para a zona",
      },
    };
  }

  return {
    valuation,
    score: 0,
    engine: "commercial",
    confidence,
    breakdown: {
      basePerSqm: marketData?.pricePerSqm ?? null,
      areaSqm: sqm || 0,
      annualRent: annualRent ?? null,
      yieldPct: yieldPct ?? null,
      valuationFromIncome,
      valuationFromSqm,
      source,
      level: marketData?.level ?? null,
      asOf: marketData?.asOf ?? null,
    },
  };
}
