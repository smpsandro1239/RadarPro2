/**
 * RadarPro Portugal - Terreno urbano (lote urbanizável) (v2)
 *
 * Base: €/m² de lote urbanizável (findMarketData "urban_land").
 * PDM diferente de "buildable"/"restricted" (inclui null) -> valuation = null.
 * Área do lote = sqm (o minAreaFactor usa a área REAL, não um campo à parte).
 */
import { confidenceFromMarket, lookupMarket, marketAsOf, marketLevel, marketSource } from "./market";
import type { EngineResult, PropertyInput } from "./types";
import { fold, minConfidence, noValuation } from "./utils";

function pdmFactor(pdm: string): number {
  if (pdm === "buildable") return 1.0;
  if (pdm === "restricted") return 0.6;
  return 0; // non_buildable / unknown: nunca chega aqui (corte prévio)
}

function infrastructureFactor(v: string): number {
  switch (v) {
    case "full": return 1.0;
    case "partial": return 0.85;
    case "none": return 0.6;
    default: return 0.7; // unknown
  }
}

const TOPOGRAPHY: Record<string, number> = {
  flat: 1.0, plano: 1.0, gentle: 0.95, suave: 0.95, steep: 0.8, ingreme: 0.8,
};

function frontageFactor(m: number | null): number {
  if (m === null) return 0.9;
  if (m >= 20) return 1.05;
  if (m >= 10) return 1.0;
  if (m >= 5) return 0.95;
  return 0.85;
}

function areaFactor(area: number): number {
  if (area >= 1000) return 1.0;
  if (area >= 500) return 0.95;
  if (area >= 250) return 0.9;
  return 0.8;
}

export function evaluateUrbanLand(p: PropertyInput, now: Date = new Date()): EngineResult {
  const pdm = fold(p.pdmStatus);
  if (pdm !== "buildable" && pdm !== "restricted") {
    return noValuation("land_urban", "PDM não edificável ou desconhecido", "very_low", {
      pdmStatus: p.pdmStatus,
    });
  }
  if (!p.district) return noValuation("land_urban", "Distrito em falta");
  if (p.sqm === null || p.sqm <= 0) return noValuation("land_urban", "Área do lote em falta");

  const market = lookupMarket(p, "urban_land");
  if (!market) return noValuation("land_urban", "Sem dados de mercado para terreno urbano nesta zona");

  const assumptions: string[] = [];
  const infra = fold(p.infrastructure);
  const topo = fold(p.topography);
  if (!["full", "partial", "none"].includes(infra)) assumptions.push("Infraestruturas desconhecidas: fator 0.70");
  if (TOPOGRAPHY[topo] === undefined) assumptions.push("Topografia desconhecida: fator 0.90");
  if (p.roadFrontageMeters === null) assumptions.push("Frente de estrada desconhecida: fator 0.90");

  const factors = {
    pdm: pdmFactor(pdm),
    infrastructure: infrastructureFactor(infra),
    topography: TOPOGRAPHY[topo] ?? 0.9,
    roadFrontage: frontageFactor(p.roadFrontageMeters),
    area: areaFactor(p.sqm),
  };
  const totalFactor = Object.values(factors).reduce((a, b) => a * b, 1);
  const adjustedPerSqm = market.pricePerSqm * totalFactor;
  const valuation = Math.round(adjustedPerSqm * p.sqm);

  const base = confidenceFromMarket(market, now);
  let confidence = base.confidence;
  if (pdm === "restricted" || assumptions.length > 0) confidence = minConfidence(confidence, "medium");

  return {
    valuation,
    engine: "land_urban",
    confidence,
    breakdown: {
      basePerSqm: market.pricePerSqm,
      areaSqm: p.sqm,
      totalFactor,
      adjustedPerSqm,
      source: marketSource(market),
      level: marketLevel(market),
      asOf: marketAsOf(market),
      factors,
      pdmStatus: pdm,
    },
    warnings: base.warnings,
    assumptions,
  };
}
