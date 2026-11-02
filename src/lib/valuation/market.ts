import { findMarketData } from "@/lib/market-data";
import type { ConfidenceLevel, PropertyInput } from "./types";
import { downgrade, monthsSince } from "./utils";

export type MarketData = NonNullable<ReturnType<typeof findMarketData>>;

/** Dados de mercado com mais de 24 meses baixam a confiança um nível. */
export const STALE_MONTHS = 24;

/**
 * Wrapper único sobre findMarketData: valida entrada e saída.
 * NOTA: confirmar que findMarketData aceita os propertyType usados
 * ("apartment" | "urban_land" | "commercial" | "garage").
 */
export function lookupMarket(p: PropertyInput, propertyType: string): MarketData | null {
  if (!p.district) return null;
  const res = findMarketData({
    district: p.district,
    municipality: p.municipality ?? p.district,
    parish: p.parish ?? undefined,
    propertyType,
  } as Parameters<typeof findMarketData>[0]);
  if (!res) return null;
  if (!Number.isFinite(res.pricePerSqm) || res.pricePerSqm <= 0) return null;
  return res;
}

export function marketLevel(m: MarketData): string {
  const l = (m as { level?: unknown }).level;
  return typeof l === "string" ? l : "district";
}

export function marketAsOf(m: MarketData): string | null {
  const a = (m as { asOf?: unknown }).asOf;
  return typeof a === "string" ? a : null;
}

export function marketSource(m: MarketData): string {
  const s = (m as { source?: unknown }).source;
  return typeof s === "string" ? s : "";
}

export function confidenceFromMarket(
  m: MarketData,
  now: Date = new Date(),
): { confidence: ConfidenceLevel; warnings: string[] } {
  const level = marketLevel(m);
  let confidence: ConfidenceLevel =
    level === "parish" ? "high" : level === "municipality" ? "medium" : "low";
  const warnings: string[] = [];
  const age = monthsSince(marketAsOf(m), now);
  if (age !== null && age > STALE_MONTHS) {
    confidence = downgrade(confidence);
    warnings.push(`Dados de mercado desatualizados (${Math.round(age)} meses)`);
  }
  return { confidence, warnings };
}
