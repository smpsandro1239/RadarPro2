/**
 * Garagens/arrecadações: NÃO usam o €/m² de apartamentos (sobrevaloriza).
 * Exige dados de mercado próprios ("garage") e área real.
 */
import { confidenceFromMarket, lookupMarket, marketAsOf, marketLevel, marketSource } from "./market";
import type { EngineResult, PropertyInput } from "./types";
import { noValuation } from "./utils";

export function evaluateGarage(p: PropertyInput, now: Date = new Date()): EngineResult {
  if (!p.district) return noValuation("hedonic", "Distrito em falta");
  if (p.sqm === null || p.sqm <= 0) return noValuation("hedonic", "Área em falta");

  const market = lookupMarket(p, "garage");
  if (!market) return noValuation("hedonic", "Sem dados de mercado para garagens nesta zona");

  const { confidence, warnings } = confidenceFromMarket(market, now);
  const valuation = Math.round(market.pricePerSqm * p.sqm);
  return {
    valuation,
    engine: "hedonic",
    confidence,
    breakdown: {
      basePerSqm: market.pricePerSqm,
      areaSqm: p.sqm,
      source: marketSource(market),
      level: marketLevel(market),
      asOf: marketAsOf(market),
    },
    warnings,
    assumptions: [],
  };
}
