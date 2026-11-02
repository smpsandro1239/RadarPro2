/**
 * RadarPro Portugal - Comercial (v2)
 *
 * Abordagem 1 (central): renda anual ÷ taxa de capitalização DE MERCADO.
 *   A rentabilidade do próprio anúncio (yieldPct) NÃO é usada: renda ÷ yield do anúncio
 *   devolve o preço pedido e nunca há desconto (circularidade).
 * Abordagem 2: €/m² comercial da zona × área real (sem áreas inventadas).
 */
import { confidenceFromMarket, lookupMarket, marketAsOf, marketLevel, marketSource } from "./market";
import type { ConfidenceLevel, EngineResult, PropertyInput } from "./types";
import { noValuation } from "./utils";

export const DEFAULT_MARKET_CAP_RATE = 0.06;
export const DIVERGENCE_WARN = 0.35;

export function evaluateCommercial(p: PropertyInput, now: Date = new Date()): EngineResult {
  const warnings: string[] = [];

  let capRate = DEFAULT_MARKET_CAP_RATE;
  let capRateSource: "market" | "default" = "default";
  if (p.marketCapRate !== null) {
    const r = p.marketCapRate > 1 ? p.marketCapRate / 100 : p.marketCapRate;
    if (r > 0 && r <= 0.2) {
      capRate = r;
      capRateSource = "market";
    }
  }

  const fromIncome =
    p.annualRent !== null && p.annualRent > 0 ? Math.round(p.annualRent / capRate) : null;

  const market = p.district ? lookupMarket(p, "commercial") : null;
  const marketConf = market ? confidenceFromMarket(market, now) : null;
  const fromSqm =
    market && p.sqm !== null && p.sqm > 0 ? Math.round(market.pricePerSqm * p.sqm) : null;

  let valuation: number | null = null;
  let confidence: ConfidenceLevel = "low";
  let method = "";

  if (fromIncome !== null) {
    valuation = fromIncome;
    method = "rendimento_anual";
    confidence = capRateSource === "market" ? "medium" : "low";
    if (fromSqm !== null) {
      const div = Math.abs(fromIncome - fromSqm) / Math.max(fromIncome, fromSqm);
      if (div > DIVERGENCE_WARN) {
        warnings.push(`Avaliações divergentes: rendimento ${fromIncome} € vs €/m² ${fromSqm} €`);
        confidence = "low";
      }
    }
  } else if (fromSqm !== null && marketConf) {
    valuation = fromSqm;
    method = "preco_m2_comercial";
    confidence = marketConf.confidence === "high" ? "medium" : "low";
    warnings.push(...marketConf.warnings);
  }

  if (valuation === null) {
    return noValuation("income", "Sem renda nem dados de mercado comerciais (e área) para a zona", "very_low");
  }

  return {
    valuation,
    engine: "income",
    confidence,
    breakdown: {
      method,
      basePerSqm: market?.pricePerSqm ?? null,
      areaSqm: p.sqm,
      annualRent: p.annualRent,
      capRate,
      capRateSource,
      valuationFromIncome: fromIncome,
      valuationFromSqm: fromSqm,
      source: market ? marketSource(market) : null,
      level: market ? marketLevel(market) : null,
      asOf: market ? marketAsOf(market) : null,
    },
    warnings,
    assumptions:
      fromIncome !== null && capRateSource === "default"
        ? [`Taxa de capitalização por defeito ${DEFAULT_MARKET_CAP_RATE * 100}% (sem taxa de mercado da zona)`]
        : [],
  };
}
