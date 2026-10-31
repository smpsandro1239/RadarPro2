/**
 * RadarPro Portugal - Avaliação de terreno urbano (lote urbanizável)
 *
 * Base: €/m² de lote urbanizável (via findMarketData com propertyType "urban_land").
 * Fatores obrigatórios: PDM, infraestrutura, topografia, frente de estrada, área mínima.
 * Se PDM = non_buildable ou unknown → valuation=null, confidence='very_low', score cortado a 40.
 */

import { findMarketData } from "@/lib/market-data";
import type { ValuationResult } from "./types";

function pdmFactor(pdmStatus: string | null): number {
  const p = (pdmStatus || "").toLowerCase();
  switch (p) {
    case "buildable": return 1.00;
    case "restricted": return 0.60;
    case "non_buildable": return 0.00;
    case "unknown": return 0.00;
    default: return 0.00;
  }
}

function infrastructureFactor(infrastructure: string | null): number {
  const i = (infrastructure || "").toLowerCase();
  switch (i) {
    case "full": return 1.00;
    case "partial": return 0.85;
    case "none": return 0.60;
    case "unknown": return 0.70;
    default: return 0.70;
  }
}

function topographyFactor(topography: string | null): number {
  const t = (topography || "").toLowerCase();
  const m: Record<string, number> = {
    flat: 1.00, plano: 1.00,
    gentle: 0.95, suave: 0.95,
    steep: 0.80, íngreme: 0.80,
    unknown: 0.90,
  };
  return m[t] ?? 0.90;
}

function roadFrontageFactor(frontageMeters: number | null): number {
  if (frontageMeters == null) return 0.90;
  if (frontageMeters >= 20) return 1.05;
  if (frontageMeters >= 10) return 1.00;
  if (frontageMeters >= 5) return 0.95;
  return 0.85;
}

function minAreaFactor(areaSqm: number | null): number {
  if (areaSqm == null) return 0.90;
  if (areaSqm >= 1000) return 1.00;
  if (areaSqm >= 500) return 0.95;
  if (areaSqm >= 250) return 0.90;
  return 0.80;
}

export function evaluateUrbanLand(property: any): ValuationResult {
  const {
    district = "Lisboa",
    municipality = district,
    parish,
    price = 0,
    sqm = 0,
    pdmStatus = "unknown",
    infrastructure = "unknown",
    topography = null,
    roadFrontageMeters = null,
    minArea = null,
  } = property;

  // Regra de corte: PDM não edificável ou unknown → sem avaliação
  if (pdmStatus === "non_buildable" || pdmStatus === "unknown") {
    return {
      valuation: null,
      score: 0,
      engine: "land_urban",
      confidence: "very_low",
      breakdown: {
        reason: "PDM não edificável ou desconhecido - terreno não urbanizável",
        pdmStatus,
      },
    };
  }

  const marketData = findMarketData({
    district,
    municipality,
    parish,
    propertyType: "urban_land",
  });

  if (!marketData) {
    return {
      valuation: null,
      score: 0,
      engine: "land_urban",
      confidence: "very_low",
      breakdown: {
        reason: "Sem dados de mercado para terreno urbano nesta zona",
        pdmStatus,
      },
    };
  }

  const basePerSqm = marketData.pricePerSqm;
  const area = sqm > 0 ? sqm : 500;

  const factors = {
    pdm: pdmFactor(pdmStatus),
    infrastructure: infrastructureFactor(infrastructure),
    topography: topographyFactor(topography),
    roadFrontage: roadFrontageFactor(roadFrontageMeters),
    minArea: minAreaFactor(minArea),
  };

  const totalFactor =
    factors.pdm * factors.infrastructure * factors.topography *
    factors.roadFrontage * factors.minArea;

  const adjustedPerSqm = basePerSqm * totalFactor;
  const valuation = Math.round(adjustedPerSqm * area);

  let confidence: "high" | "medium" | "low" | "very_low" = "medium";
  if (marketData.level === "parish") confidence = "high";
  else if (marketData.level === "municipality") confidence = "medium";
  else confidence = "low";

  return {
    valuation,
    score: 0,
    engine: "land_urban",
    confidence,
    breakdown: {
      basePerSqm,
      areaSqm: area,
      totalFactor,
      adjustedPerSqm,
      source: marketData.source,
      level: marketData.level,
      asOf: marketData.asOf,
      factors,
      pdmStatus,
    },
  };
}
