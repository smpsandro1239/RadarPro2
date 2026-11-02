/**
 * RadarPro Portugal - Terreno rústico (v2)
 *
 * Método do rendimento: renda agro-florestal anual ÷ taxa de capitalização.
 * - Rendimento INFORMADO -> confiança média.
 * - Rendimento ESTIMADO por €/ha (sem fonte verificável) -> confiança baixa.
 * - Sem rendimento -> valuation = null.
 * Proibido usar €/m² de construção.
 */
import type { EngineResult, PropertyInput } from "./types";
import { fold, noValuation } from "./utils";

export const DEFAULT_CAP_RATE = 0.04;

/** €/ha/ano. Referência a validar (INE/ADP). */
const INCOME_PER_HA: Record<string, number> = {
  floresta: 120, agricultura: 300, olival: 450, vinha: 900, pastagem: 180, misto: 250,
};

function resolveCapRate(raw: number | null, warnings: string[]): number {
  if (raw === null) return DEFAULT_CAP_RATE;
  const r = raw > 1 ? raw / 100 : raw; // aceita 4 ou 0.04
  if (r > 0 && r <= 0.2) return r;
  warnings.push(`Taxa de capitalização inválida (${raw}): usada ${DEFAULT_CAP_RATE * 100}%`);
  return DEFAULT_CAP_RATE;
}

export function evaluateRuralLand(p: PropertyInput): EngineResult {
  const warnings: string[] = [];
  const assumptions: string[] = [];

  let income: number | null = p.annualIncome !== null && p.annualIncome > 0 ? p.annualIncome : null;
  let incomeSource: "informed" | "estimated" = "informed";

  if (income === null && p.sqm !== null && p.sqm > 0) {
    const perHa = INCOME_PER_HA[fold(p.landUse)];
    if (perHa !== undefined) {
      income = Math.round(perHa * (p.sqm / 10000));
      incomeSource = "estimated";
      assumptions.push(`Rendimento estimado por €/ha para uso "${p.landUse}" (não demonstrado)`);
    }
  }

  if (income === null || income <= 0) {
    return noValuation(
      "land_rural",
      "Sem rendimento agro-florestal demonstrável - método do rendimento não aplicável",
      "low",
      { landUse: p.landUse, sqm: p.sqm },
    );
  }

  const capRate = resolveCapRate(p.capRate, warnings);
  const valuation = Math.round(income / capRate);

  return {
    valuation,
    engine: "land_rural",
    confidence: incomeSource === "informed" ? "medium" : "low",
    breakdown: {
      annualIncome: income,
      incomeSource,
      capRate,
      areaSqm: p.sqm,
      areaHa: p.sqm !== null ? Math.round((p.sqm / 10000) * 100) / 100 : null,
      landUse: p.landUse,
      method: "rendimento_agro_florestal",
    },
    warnings,
    assumptions,
  };
}
