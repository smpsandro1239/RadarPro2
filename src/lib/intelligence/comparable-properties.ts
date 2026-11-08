/**
 * RadarPro Intelligence — comparador de imóveis.
 *
 * Compara apenas anúncios de venda fixa, ativos, com preço e área válidos,
 * na mesma localização e tipologia. Não mistura leilões com preço anunciado.
 * Não estima áreas em falta: sem amostra suficiente devolve confiança baixa.
 */

export type ComparableConfidence = "high" | "medium" | "low" | "very_low";

export interface ComparableProperty {
  id: string;
  title?: string | null;
  price: number;
  sqm?: number | null;
  area?: number | null;
  usableAreaSqm?: number | null;
  grossAreaSqm?: number | null;
  landAreaSqm?: number | null;
  district?: string | null;
  municipality?: string | null;
  type?: string | null;
  assetClass?: string | null;
  asset_class?: string | null;
  isAuction?: boolean | null;
  is_active?: boolean | null;
  isActive?: boolean | null;
  checkStatus?: string | null;
  check_status?: string | null;
}

export interface ComparableAnalysis {
  status: "ok" | "insufficient_data";
  confidence: ComparableConfidence;
  subjectPricePerSqm: number | null;
  medianPricePerSqm: number | null;
  differencePct: number | null;
  sampleSize: number;
  comparables: Array<{
    id: string;
    pricePerSqm: number;
    price: number;
    areaSqm: number;
  }>;
  reasons: string[];
  comparisonMode?: "price_per_sqm" | "price_only";
  subjectPrice?: number | null;
  medianPrice?: number | null;
  priceDifferencePct?: number | null;
}

function normalize(value: unknown): string {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLocaleLowerCase("pt-PT");
}

function getArea(property: ComparableProperty): number | null {
  const area = property.usableAreaSqm ?? property.grossAreaSqm ?? property.sqm ?? property.area;
  return typeof area === "number" && Number.isFinite(area) && area > 0
    ? area
    : null;
}

function getAreaBasis(property: ComparableProperty): "usable" | "gross" | "legacy" | null {
  if (property.usableAreaSqm != null) return "usable";
  if (property.grossAreaSqm != null) return "gross";
  if (property.sqm != null || property.area != null) return "legacy";
  return null;
}

function getComparableType(property: ComparableProperty): string {
  const text = normalize((property.type ?? "") + " " + (property.title ?? ""));
  const typology = text.match(/\b(?:t|v)\s*\d+\b/i)?.[0]?.replace(/\s+/g, "") ?? "";
  return typology || normalize(property.type);
}


