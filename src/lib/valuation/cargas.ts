/**
 * RadarPro Portugal - Análise de cargas (Fase 3.2)
 *
 * Carga total = dívida de condomínio + renovação estimada + embargos + hipotecas.
 * Alerta quando a carga ultrapassa 20% do valor de referência (MV / max bid).
 */

import type { PropertyInput } from "./types";

export const CARGAS_ALERT_THRESHOLD_PCT = 20;

export interface CargasInput {
  /** Carga total conhecida (condomínio + obras + embargos + hipotecas). Se null, soma os componentes. */
  cargasTotal: number | null;
  /** Dívida de condomínio em atraso. */
  condominiumDebt: number | null;
  /** Estimativa de custos de renovação/obras. */
  renovationEstimate: number | null;
  /** Dívida por embargos judiciais / penhoras. */
  embargos: number | null;
  /** Dívida por hipotecas em curso. */
  hipotecas: number | null;
  /** Valor de referência para a comparação (MV ou lance máximo recomendado). */
  marketValue: number | null;
}

export interface CargasResult {
  /** Carga total conhecida em EUR; null se alguma componente estiver desconhecida. */
  total: number | null;
  /** Componentes conhecidos. */
  condominiumDebt: number | null;
  renovationEstimate: number | null;
  embargos: number | null;
  hipotecas: number | null;
  /** Valor de referência usado na comparação. */
  referenceValue: number | null;
  /** Carga / valor de referência em % (ex.: 25 = 25%). Null se não calculável. */
  loadPct: number | null;
  /** True quando a carga > 20% do valor de referência. */
  exceedsAlertThreshold: boolean;
}

export function calculateCargas(input: CargasInput): CargasResult {
  const componentsKnown = [input.condominiumDebt, input.renovationEstimate, input.embargos, input.hipotecas].every(
    (v) => v !== null,
  );

  const total =
    input.cargasTotal !== null
      ? input.cargasTotal
      : componentsKnown
        ? (input.condominiumDebt ?? 0) + (input.renovationEstimate ?? 0) + (input.embargos ?? 0) + (input.hipotecas ?? 0)
        : null;

  const referenceValue = input.marketValue;
  const loadPct = total !== null && referenceValue !== null && referenceValue > 0 ? (total / referenceValue) * 100 : null;

  return {
    total,
    condominiumDebt: input.condominiumDebt,
    renovationEstimate: input.renovationEstimate,
    embargos: input.embargos,
    hipotecas: input.hipotecas,
    referenceValue,
    loadPct,
    exceedsAlertThreshold: loadPct !== null && loadPct > CARGAS_ALERT_THRESHOLD_PCT,
  };
}

export function calculateCargasFromProperty(
  p: Pick<PropertyInput, "cargasTotal" | "condominiumDebt" | "renovationEstimate" | "embargos" | "hipotecas" | "marketValue">,
): CargasResult {
  return calculateCargas({
    cargasTotal: p.cargasTotal,
    condominiumDebt: p.condominiumDebt,
    renovationEstimate: p.renovationEstimate,
    embargos: p.embargos,
    hipotecas: p.hipotecas,
    marketValue: p.marketValue,
  });
}
