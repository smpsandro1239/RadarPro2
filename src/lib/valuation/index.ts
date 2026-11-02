/**
 * RadarPro Portugal - Dispatcher do motor de avaliação (v2)
 *
 * evaluateProperty(raw): normaliza -> classifica -> avalia -> pontua.
 * Aceita linhas da BD (snake_case) ou objetos camelCase.
 *
 * Mudanças face à v1:
 * - Normalização única (acaba o desencontro pdm_status/pdmStatus, null vs undefined).
 * - asset_class em falta é deduzido de type/title (com pressuposto registado).
 * - "mixed" já não é avaliado como T2: devolve valuation null (avaliação manual).
 * - Leilões: o valor de mercado vem do motor da classe, não de price*1.2.
 * - Garagens têm motor próprio (não usam €/m² de apartamentos).
 */
import { evaluateApartment } from "./apartment";
import { evaluateAuction } from "./auction";
import { deriveAssetClass, deriveListingType } from "./classify";
import { evaluateCommercial } from "./commercial";
import { evaluateGarage } from "./garage";
import { evaluateRuralLand } from "./land-rural";
import { evaluateUrbanLand } from "./land-urban";
import { normalizeProperty } from "./normalize";
import { calculateScore } from "./score";
import type { AssetClass, EngineResult, PropertyInput, ValuationResult } from "./types";
import { dedupe, noValuation } from "./utils";

function evaluateByClass(p: PropertyInput, assetClass: AssetClass, now: Date): EngineResult {
  switch (assetClass) {
    case "urban_land": return evaluateUrbanLand(p, now);
    case "rural_land": return evaluateRuralLand(p);
    case "commercial": return evaluateCommercial(p, now);
    case "garage": return evaluateGarage(p, now);
    case "mixed": return noValuation("none", "Ativo misto: requer avaliação manual", "very_low");
    case "apartment":
    case "house":
    default: return evaluateApartment(p, now);
  }
}

export function evaluateProperty(raw: unknown, now: Date = new Date()): ValuationResult {
  const p = normalizeProperty(raw);
  const cls = deriveAssetClass(p);
  const { listingType, assumed } = deriveListingType(p);
  const isAuction = listingType !== "fixed_price";

  const base = evaluateByClass(p, cls.assetClass, now);
  const engine = isAuction ? evaluateAuction(p, base) : base;
  const s = calculateScore(p, engine, { assetClass: cls.assetClass, listingType });

  const assumptions = [...engine.assumptions];
  if (cls.inferred && cls.reason) assumptions.push(cls.reason);
  if (assumed) assumptions.push("Tipo de leilão desconhecido: assumido leilão privado");

  return {
    ...engine,
    warnings: dedupe(engine.warnings),
    assumptions: dedupe(assumptions),
    score: s.score,
    assetClass: cls.assetClass,
    listingType,
    breakdown: {
      ...engine.breakdown,
      scoreBreakdown: s.breakdown,
      scoreBadges: s.badges,
      scoreCapped: s.capped,
      scoreMax: s.maxScore,
      scoreCoverage: s.coverage,
    },
  };
}

export { calculateScore, SCORE_WEIGHTS } from "./score";
export { normalizeProperty } from "./normalize";
export type * from "./types";
