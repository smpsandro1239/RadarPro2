/**
 * RadarPro Intelligence — comparador de imóveis.
 *
 * Nunca estima áreas em falta. Imóveis sem área usam comparação por preço,
 * localização e tipologia, sem produzir métricas €/m².
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
  comparables: Array<{ id: string; pricePerSqm: number; price: number; areaSqm: number }>;
  reasons: string[];
  comparisonMode?: "price_per_sqm" | "price_only";
  subjectPrice?: number | null;
  medianPrice?: number | null;
  priceDifferencePct?: number | null;
}

type AreaBasis = "usable" | "gross" | "land" | "legacy" | null;

function normalize(value: unknown): string {
  return String(value ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toLocaleLowerCase("pt-PT");
}

function validArea(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value > 0 && value <= 1_000_000;
}

function getAssetClass(property: ComparableProperty): string {
  return normalize(property.assetClass ?? property.asset_class ?? "apartment");
}

function getAreaDetails(property: ComparableProperty): { area: number | null; basis: AreaBasis } {
  const assetClass = getAssetClass(property);
  if (assetClass === "urban_land" || assetClass === "rural_land") {
    return validArea(property.landAreaSqm)
      ? { area: property.landAreaSqm, basis: "land" }
      : { area: null, basis: null };
  }
  if (validArea(property.usableAreaSqm)) return { area: property.usableAreaSqm, basis: "usable" };
  if (validArea(property.grossAreaSqm)) return { area: property.grossAreaSqm, basis: "gross" };
  const legacy = property.sqm ?? property.area;
  return validArea(legacy) ? { area: legacy, basis: "legacy" } : { area: null, basis: null };
}

function getComparableType(property: ComparableProperty): string {
  const text = normalize((property.type ?? "") + " " + (property.title ?? ""));
  const typology = text.match(/\b(?:t|v)\s*\d+\b/i)?.[0]?.replace(/\s+/g, "") ?? "";
  return typology || normalize(property.type);
}

function isActive(property: ComparableProperty): boolean {
  return (property.isActive ?? property.is_active ?? true) !== false;
}

function hasAcceptableCheckStatus(property: ComparableProperty): boolean {
  const status = property.checkStatus ?? property.check_status;
  return status == null || status === "ok";
}

function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[middle - 1] + sorted[middle]) / 2 : sorted[middle];
}

function sameLocation(subject: ComparableProperty, candidate: ComparableProperty): boolean {
  const municipality = normalize(subject.municipality);
  if (municipality) return normalize(candidate.municipality) === municipality;
  const district = normalize(subject.district);
  return Boolean(district) && normalize(candidate.district) === district;
}

function sameBasicProfile(subject: ComparableProperty, candidate: ComparableProperty): boolean {
  return candidate.id !== subject.id &&
    isActive(candidate) &&
    hasAcceptableCheckStatus(candidate) &&
    candidate.isAuction !== true &&
    subject.isAuction !== true &&
    Number.isFinite(candidate.price) &&
    candidate.price > 0 &&
    getComparableType(candidate) === getComparableType(subject) &&
    getAssetClass(candidate) === getAssetClass(subject) &&
    sameLocation(subject, candidate);
}

/** Compara imóveis semelhantes sem misturar leilões ou bases de área distintas. */
export function compareProperties(
  subject: ComparableProperty,
  candidates: ComparableProperty[],
  options: { areaTolerance?: number; minimumSample?: number } = {},
): ComparableAnalysis {
  const areaTolerance = options.areaTolerance ?? 0.25;
  const minimumSample = options.minimumSample ?? 3;
  const { area: subjectArea, basis: subjectAreaBasis } = getAreaDetails(subject);
  const subjectPrice = subject.price;
  const subjectType = getComparableType(subject);
  const validSubjectPrice = Number.isFinite(subjectPrice) && subjectPrice > 0;
  const reasons: string[] = [];

  if (!subjectArea) reasons.push("Área do imóvel em análise desconhecida.");
  if (!validSubjectPrice) reasons.push("Preço do imóvel em análise inválido.");
  if (!subjectType) reasons.push("Tipologia não identificada.");
  if (!hasAcceptableCheckStatus(subject)) reasons.push("O anúncio em análise ainda não foi validado.");
  if (!normalize(subject.municipality) && !normalize(subject.district)) reasons.push("Localização não identificada.");

  if (!validSubjectPrice || !subjectType || !hasAcceptableCheckStatus(subject) ||
      (!normalize(subject.municipality) && !normalize(subject.district))) {
    return {
      status: "insufficient_data", confidence: "very_low",
      subjectPricePerSqm: null, medianPricePerSqm: null, differencePct: null,
      sampleSize: 0, comparables: [], reasons,
    };
  }

  const matchingRows = candidates.filter((candidate) => sameBasicProfile(subject, candidate));

  if (!subjectArea || !subjectAreaBasis) {
    const sampleSize = matchingRows.length;
    const medianPrice = sampleSize ? median(matchingRows.map((row) => row.price)) : null;
    const priceDifferencePct = medianPrice !== null && medianPrice > 0
      ? Math.round(((subjectPrice - medianPrice) / medianPrice) * 10000) / 100
      : null;
    reasons.push("Área não indicada: comparação apenas por preço, localização e tipologia; €/m² não calculado.");
    if (sampleSize < minimumSample) reasons.push(`Amostra insuficiente: encontrados ${sampleSize} comparáveis; mínimo recomendado: ${minimumSample}.`);
    return {
      status: sampleSize >= minimumSample ? "ok" : "insufficient_data",
      confidence: sampleSize >= 8 ? "medium" : sampleSize >= minimumSample ? "low" : "very_low",
      subjectPricePerSqm: null, medianPricePerSqm: null, differencePct: null,
      sampleSize, comparables: [], reasons, comparisonMode: "price_only",
      subjectPrice, medianPrice, priceDifferencePct,
    };
  }

  const comparableRows = matchingRows.flatMap((candidate) => {
    const { area, basis } = getAreaDetails(candidate);
    if (!area || basis !== subjectAreaBasis) return [];
    if (Math.abs(area - subjectArea) / subjectArea > areaTolerance) return [];
    return [{ id: candidate.id, price: candidate.price, areaSqm: area, pricePerSqm: candidate.price / area }];
  }).filter((row) => Number.isFinite(row.pricePerSqm));

  const sampleSize = comparableRows.length;
  if (sampleSize < minimumSample) reasons.push(`Amostra insuficiente: encontrados ${sampleSize} comparáveis; mínimo recomendado: ${minimumSample}.`);
  if (sampleSize === 0) {
    return {
      status: "insufficient_data", confidence: "very_low",
      subjectPricePerSqm: Math.round((subjectPrice / subjectArea) * 100) / 100,
      medianPricePerSqm: null, differencePct: null,
      sampleSize, comparables: [], reasons,
    };
  }

  const medianPricePerSqm = median(comparableRows.map((row) => row.pricePerSqm));
  const subjectPricePerSqm = subjectPrice / subjectArea;
  const differencePct = ((subjectPricePerSqm - medianPricePerSqm) / medianPricePerSqm) * 100;

  return {
    status: sampleSize >= minimumSample ? "ok" : "insufficient_data",
    confidence: sampleSize >= 8 ? "high" : sampleSize >= minimumSample ? "medium" : "low",
    subjectPricePerSqm: Math.round(subjectPricePerSqm * 100) / 100,
    medianPricePerSqm: Math.round(medianPricePerSqm * 100) / 100,
    differencePct: Math.round(differencePct * 100) / 100,
    sampleSize,
    comparables: comparableRows.sort((a, b) => a.pricePerSqm - b.pricePerSqm).map((row) => ({
      id: row.id, pricePerSqm: Math.round(row.pricePerSqm * 100) / 100,
      price: row.price, areaSqm: row.areaSqm,
    })),
    reasons,
    comparisonMode: "price_per_sqm",
  };
}
