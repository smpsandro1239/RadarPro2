/**
 * RadarPro Portugal - AVM hedónico para apartamentos e moradias (v2)
 *
 * Base: mediana €/m² da freguesia/concelho/distrito (findMarketData).
 * Ajustamentos: tipologia, andar, orientação, estado, certificação energética,
 * garagem, elevador, vista. O produto dos ajustamentos é limitado a [0.70, 1.30].
 *
 * Regras:
 * - Sem distrito, sem área ou sem dados de mercado -> valuation = null (nunca se inventa área/zona).
 * - Comparáveis reais ainda não existem: as faixas de confiança são INDICATIVAS.
 */

import { confidenceFromMarket, lookupMarket, marketAsOf, marketLevel, marketSource } from "./market";
import type { EngineResult, PropertyInput } from "./types";
import { clamp, fold, noValuation, normalizeKey } from "./utils";

/** A validar com dados reais (T0 < T1 < ... pode inverter em €/m²). */
export const TYPOLOGY_MULTIPLIERS: Record<string, number> = {
  T0: 0.85, T1: 0.95, T2: 1.0, T3: 1.1, T4: 1.2,
  V2: 1.15, V3: 1.25, V4: 1.35, V5: 1.45,
};
const ORIENTATION: Record<string, number> = {
  S: 1.03, SUL: 1.03, SURESTE: 1.02, SUDESTE: 1.02, SUROESTE: 1.02, SUDOESTE: 1.02,
  E: 1.01, ESTE: 1.01, O: 1.0, OESTE: 1.0,
  N: 0.97, NORTE: 0.97, NORESTE: 0.98, NORDESTE: 0.98, NOROESTE: 0.98,
};
const CONDITION: Record<string, number> = {
  NOVO: 1.1, NOVO_USADO: 1.05, BOM: 1.0, REGULAR: 0.92,
  MAU: 0.8, RUINA: 0.7, RUIN: 0.7, A_RECUPERAR: 0.75,
};
const ENERGY: Record<string, number> = {
  A: 1.05, A_PLUS: 1.08, "A+": 1.08, B: 1.02, "B-": 1.0, C: 1.0, D: 0.96, E: 0.92, F: 0.88, G: 0.84,
};

export const FACTOR_MIN = 0.7;
export const FACTOR_MAX = 1.3;

function typologyKey(p: PropertyInput): string | null {
  for (const s of [p.type, p.title]) {
    const m = /\b([tv][0-9])\b/.exec(fold(s));
    if (m) return m[1].toUpperCase();
  }
  return null;
}

function floorMultiplier(floor: number | null, totalFloors: number | null): number {
  if (floor === null) return 1.0;
  if (floor === 0) return 0.9; // rés-do-chão
  if (floor < 0) return 0.75; // cave
  if (totalFloors !== null && floor === totalFloors - 1) return 1.05; // último andar
  if (floor >= 1 && floor <= 3) return 1.02;
  return 1.0;
}

function fromTable(
  table: Record<string, number>,
  raw: string | null,
  label: string,
  assumptions: string[],
): number {
  if (raw === null) return 1.0;
  const v = table[normalizeKey(raw)];
  if (v === undefined) {
    assumptions.push(`${label} "${raw}" não reconhecido: ajustamento neutro`);
    return 1.0;
  }
  return v;
}

export function evaluateApartment(p: PropertyInput, now: Date = new Date()): EngineResult {
  if (!p.district) return noValuation("hedonic", "Distrito em falta");
  if (p.sqm === null || p.sqm <= 0) return noValuation("hedonic", "Área em falta");

  const market = lookupMarket(p, "apartment");
  if (!market) return noValuation("hedonic", "Sem dados de mercado para a zona");

  const assumptions: string[] = [];
  const warnings: string[] = [];

  const tKey = typologyKey(p);
  let typology = 1.0;
  if (tKey && TYPOLOGY_MULTIPLIERS[tKey] !== undefined) typology = TYPOLOGY_MULTIPLIERS[tKey];
  else assumptions.push("Tipologia desconhecida: ajustamento neutro");

  const adjustments = {
    typology,
    floor: floorMultiplier(p.floor, p.totalFloors),
    orientation: fromTable(ORIENTATION, p.orientation, "Orientação", assumptions),
    condition: fromTable(CONDITION, p.condition, "Estado", assumptions),
    energyCert: fromTable(ENERGY, p.energyCert, "Certificado energético", assumptions),
    garage: p.hasGarage ? 1.03 : 1.0,
    elevator: p.hasElevator ? 1.02 : 1.0,
    view: p.hasView ? 1.04 : 1.0,
  };

  const rawFactor = Object.values(adjustments).reduce((a, b) => a * b, 1);
  const adjustmentFactor = clamp(rawFactor, FACTOR_MIN, FACTOR_MAX);
  if (adjustmentFactor !== rawFactor) {
    warnings.push(`Ajustamentos limitados a ${FACTOR_MIN}-${FACTOR_MAX} (valor bruto ${rawFactor.toFixed(2)})`);
  }

  const basePerSqm = market.pricePerSqm;
  const adjustedPerSqm = basePerSqm * adjustmentFactor;
  const valuation = Math.round(adjustedPerSqm * p.sqm);

  const { confidence, warnings: mw } = confidenceFromMarket(market, now);
  const rangePct = confidence === "high" ? 0.1 : confidence === "medium" ? 0.18 : 0.25;

  return {
    valuation,
    engine: "hedonic",
    confidence,
    breakdown: {
      basePerSqm,
      adjustmentFactor,
      adjustedPerSqm,
      areaSqm: p.sqm,
      source: marketSource(market),
      level: marketLevel(market),
      asOf: marketAsOf(market),
      rangeLow: Math.round(valuation * (1 - rangePct)),
      rangeHigh: Math.round(valuation * (1 + rangePct)),
      rangeIsIndicative: true,
      adjustments,
    },
    warnings: [...warnings, ...mw],
    assumptions,
  };
}
