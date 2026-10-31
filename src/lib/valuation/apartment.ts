/**
 * RadarPro Portugal - AVM hedónico para apartamentos e moradias
 *
 * Base: mediana €/m² da freguesia (via findMarketData).
 * Ajustamentos: tipologia, andar, orientação, estado, certificação energética,
 * garagem, elevador, vista.
 * Comparáveis últimos 18 meses raio 500m (placeholder - sem base de transações reais).
 * Faixa confiança: ±10% (alta), ±18% (média), ±25% (baixa).
 */

import { findMarketData } from "@/lib/market-data";
import type { ValuationResult } from "./types";

interface HedonicAdjustments {
  typology: number;   // T0-T4, V2-V5
  floor: number;      // andar
  orientation: number;// orientação solar
  condition: number;  // estado de conservação
  energyCert: number; // certificação energética
  garage: number;     // lugar de garagem
  elevator: number;   // elevador
  view: number;       // vista
}

function defaultAdjustments(): HedonicAdjustments {
  return {
    typology: 1.00,
    floor: 1.00,
    orientation: 1.00,
    condition: 1.00,
    energyCert: 1.00,
    garage: 1.00,
    elevator: 1.00,
    view: 1.00,
  };
}

function typologyMultiplier(type: string): number {
  const t = (type || "").toUpperCase();
  const multipliers: Record<string, number> = {
    T0: 0.85, T1: 0.95, T2: 1.00, T3: 1.10, T4: 1.20,
    V2: 1.15, V3: 1.25, V4: 1.35, V5: 1.45,
  };
  return multipliers[t] ?? 1.00;
}

function floorMultiplier(floor: number | null, totalFloors: number | null): number {
  if (floor == null) return 1.00;
  if (floor === 0) return 0.90; // rés-do-chão
  if (floor === -1) return 0.75; // cave
  if (totalFloors && floor === totalFloors - 1) return 1.05; // último andar
  if (floor >= 1 && floor <= 3) return 1.02;
  return 1.00;
}

function orientationMultiplier(orientation: string | null): number {
  const o = (orientation || "").toUpperCase();
  const m: Record<string, number> = {
    S: 1.03, SUL: 1.03, SURESTE: 1.02, SUROESTE: 1.02,
    E: 1.01, ESTE: 1.01, O: 1.00, OESTE: 1.00,
    N: 0.97, NORTE: 0.97, NORESTE: 0.98, NOROESTE: 0.98,
  };
  return m[o] ?? 1.00;
}

function conditionMultiplier(condition: string | null): number {
  const c = (condition || "").toUpperCase();
  const m: Record<string, number> = {
    NOVO: 1.10, NOVO_USADO: 1.05, BOM: 1.00, REGULAR: 0.92,
    MAU: 0.80, RUIN: 0.70, A_RECUPERAR: 0.75,
  };
  return m[c] ?? 1.00;
}

function energyCertMultiplier(cert: string | null): number {
  const c = (cert || "").toUpperCase();
  const m: Record<string, number> = {
    A: 1.05, A_PLUS: 1.08, B: 1.02, C: 1.00, D: 0.96,
    E: 0.92, F: 0.88, G: 0.84,
  };
  return m[c] ?? 1.00;
}

export function evaluateApartment(property: any): ValuationResult {
  const {
    district = "Lisboa",
    municipality = district,
    parish,
    price = 0,
    sqm = 0,
    type = "T2",
    floor = null,
    totalFloors = null,
    orientation = null,
    condition = null,
    energyCert = null,
    hasGarage = false,
    hasElevator = false,
    hasView = false,
  } = property;

  // 1. Mediana €/m² da freguesia/concelho/distrito
  const marketData = findMarketData({
    district,
    municipality,
    parish,
    propertyType: "apartment",
  });

  if (!marketData) {
    return {
      valuation: null,
      score: 0,
      engine: "hedonic",
      confidence: "very_low",
      breakdown: { reason: "Sem dados de mercado para a zona" },
    };
  }

  const basePerSqm = marketData.pricePerSqm;
  const estSqm = sqm > 0 ? sqm : 70;

  // 2. Ajustamentos hedónicos
  const adj: HedonicAdjustments = defaultAdjustments();
  adj.typology = typologyMultiplier(type);
  adj.floor = floorMultiplier(floor, totalFloors);
  adj.orientation = orientationMultiplier(orientation);
  adj.condition = conditionMultiplier(condition);
  adj.energyCert = energyCertMultiplier(energyCert);
  adj.garage = hasGarage ? 1.03 : 1.00;
  adj.elevator = hasElevator ? 1.02 : 1.00;
  adj.view = hasView ? 1.04 : 1.00;

  const adjustmentFactor =
    adj.typology * adj.floor * adj.orientation * adj.condition *
    adj.energyCert * adj.garage * adj.elevator * adj.view;

  const adjustedPerSqm = basePerSqm * adjustmentFactor;
  const valuation = Math.round(adjustedPerSqm * estSqm);

  // 3. Nível de confiança com base na granularidade dos dados de mercado
  let confidence: "high" | "medium" | "low" | "very_low" = "medium";
  if (marketData.level === "parish") confidence = "high";
  else if (marketData.level === "municipality") confidence = "medium";
  else confidence = "low";

  const rangePct = confidence === "high" ? 0.10 : confidence === "medium" ? 0.18 : 0.25;

  return {
    valuation,
    score: 0, // preenchido pelo score.ts
    engine: "hedonic",
    confidence,
    breakdown: {
      basePerSqm,
      adjustmentFactor,
      adjustedPerSqm,
      areaSqm: estSqm,
      source: marketData.source,
      level: marketData.level,
      asOf: marketData.asOf,
      rangeLow: Math.round(valuation * (1 - rangePct)),
      rangeHigh: Math.round(valuation * (1 + rangePct)),
      adjustments: adj,
    },
  };
}
