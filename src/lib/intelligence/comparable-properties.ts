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
  const typology = text.match(/\\b(?:t|v)\\s*\\d+\\b/i)?.[0]?.replace(/\\s+/g, "") ?? "";
  return typology || normalize(property.type);
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

function getAssetClass(property: ComparableProperty): string {
  return normalize(property.assetClass ?? property.asset_class ?? "apartment");
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
  return sorted.length % 2 === 0
    ? (sorted[middle - 1] + sorted[middle]) / 2
    : sorted[middle];
}

/**
 * Produz uma comparação de €/m² com imóveis semelhantes.
 * O chamador deve fornecer os anúncios candidatos obtidos da base de dados.
 */
export function compareProperties(
  subject: ComparableProperty,
  candidates: ComparableProperty[],
  options: { areaTolerance?: number; minimumSample?: number } = {},
): ComparableAnalysis {
  const areaTolerance = options.areaTolerance ?? 0.25;
  const minimumSample = options.minimumSample ?? 3;
  const subjectArea = getArea(subject);
  const subjectPrice = subject.price;
  const subjectType = getComparableType(subject);
  const subjectMunicipality = normalize(subject.municipality);
  const subjectDistrict = normalize(subject.district);
  const subjectAsset = getAssetClass(subject);
  const reasons: string[] = [];

  if (!subjectArea) reasons.push("Área do imóvel em análise desconhecida.");
  if (!Number.isFinite(subjectPrice) || subjectPrice <= 0) {
    reasons.push("Preço do imóvel em análise inválido.");
  }
  if (!subjectType) reasons.push("Tipologia não identificada.");
  if (!hasAcceptableCheckStatus(subject)) {
    reasons.push("O anúncio em análise ainda não foi validado.");
  }
  if (!subjectMunicipality && !subjectDistrict) {
    reasons.push("Localização não identificada.");
  }

  if (!subjectArea && Number.isFinite(subjectPrice) && subjectPrice > 0 &&
      subjectType && hasAcceptableCheckStatus(subject) &&
      (subjectMunicipality || subjectDistrict)) {
    const priceRows = candidates.filter((candidate) => {
      if (candidate.id === subject.id || !isActive(candidate)) return false;
      if (!hasAcceptableCheckStatus(candidate) || candidate.isAuction === true || subject.isAuction === true) return false;
      if (!Number.isFinite(candidate.price) || candidate.price <= 0) return false;
      if (getComparableType(candidate) !== subjectType || getAssetClass(candidate) !== subjectAsset) return false;
      const candidateMunicipality = normalize(candidate.municipality);
      const candidateDistrict = normalize(candidate.district);
      return subjectMunicipality ? candidateMunicipality === subjectMunicipality : candidateDistrict === subjectDistrict;
    });
    const sampleSize = priceRows.length;
    const medianPrice = sampleSize ? median(priceRows.map((row) => row.price)) : null;
    const priceDifferencePct = medianPrice && medianPrice > 0
      ? Math.round(((subjectPrice - medianPrice) / medianPrice) * 10000) / 100
      : null;
    const confidence: ComparableConfidence =
      sampleSize >= 8 ? "medium" : sampleSize >= minimumSample ? "low" : "very_low";
    const priceReasons = ["Área não indicada: comparação apenas por preço, localização e tipologia; €/m² não calculado."];
    if (sampleSize < minimumSample) {
      priceReasons.push(`Amostra insuficiente: encontrados ${sampleSize} comparáveis; mínimo recomendado: ${minimumSample}.`);
    }
    return {
      status: sampleSize >= minimumSample ? "ok" as const : "insufficient_data" as const,
      confidence,
      subjectPricePerSqm: null,
      medianPricePerSqm: null,
      differencePct: null,
      sampleSize,
      comparables: [],
      reasons: priceReasons,
      comparisonMode: "price_only" as const,
      subjectPrice,
      medianPrice,
      priceDifferencePct,
    };
  }

  if (
    !subjectArea ||
    !Number.isFinite(subjectPrice) ||
    subjectPrice <= 0 ||
    !subjectType ||
    !hasAcceptableCheckStatus(subject) ||
    (!subjectMunicipality && !subjectDistrict)
  ) {
    return {
      status: "insufficient_data",
      confidence: "very_low",
      subjectPricePerSqm: null,
      medianPricePerSqm: null,
      differencePct: null,
      sampleSize: 0,
      comparables: [],
      reasons,
    };
  }

  const subjectIsAuction = subject.isAuction === true;
  const comparableRows = candidates
    .filter((candidate) => {
      if (candidate.id === subject.id || !isActive(candidate)) return false;
      if (!hasAcceptableCheckStatus(candidate)) return false;
      if (candidate.isAuction === true || subjectIsAuction) return false;
      if (!Number.isFinite(candidate.price) || candidate.price <= 0) return false;

      const candidateArea = getArea(candidate);
      if (!candidateArea || getAreaBasis(candidate) !== getAreaBasis(subject)) return false;
      if (Math.abs(candidateArea - subjectArea) / subjectArea > areaTolerance) return false;
      if (getComparableType(candidate) !== subjectType) return false;
      if (getAssetClass(candidate) !== subjectAsset) return false;

      const candidateMunicipality = normalize(candidate.municipality);
      const candidateDistrict = normalize(candidate.district);

      if (subjectMunicipality) {
        return candidateMunicipality === subjectMunicipality;
      }
      return candidateDistrict === subjectDistrict;
    })
    .map((candidate) => {
      const areaSqm = getArea(candidate)!;
      return {
        id: candidate.id,
        price: candidate.price,
        areaSqm,
        pricePerSqm: candidate.price / areaSqm,
      };
    })
    .filter((candidate) => Number.isFinite(candidate.pricePerSqm));

  const sampleSize = comparableRows.length;
  if (sampleSize < minimumSample) {
    reasons.push(
      `Amostra insuficiente: encontrados ${sampleSize} comparáveis; mínimo recomendado: ${minimumSample}.`,
    );
  }

  if (sampleSize === 0) {
    return {
      status: "insufficient_data",
      confidence: "very_low",
      subjectPricePerSqm: subjectPrice / subjectArea,
      medianPricePerSqm: null,
      differencePct: null,
      sampleSize,
      comparables: [],
      reasons,
    };
  }

  const medianPricePerSqm = median(comparableRows.map((row) => row.pricePerSqm));
  const subjectPricePerSqm = subjectPrice / subjectArea;
  const differencePct =
    ((subjectPricePerSqm - medianPricePerSqm) / medianPricePerSqm) * 100;

  const confidence: ComparableConfidence =
    sampleSize >= 8 ? "high" :
    sampleSize >= minimumSample ? "medium" :
    "low";

  return {
    status: sampleSize >= minimumSample ? "ok" : "insufficient_data",
    confidence,
    subjectPricePerSqm: Math.round(subjectPricePerSqm * 100) / 100,
    medianPricePerSqm: Math.round(medianPricePerSqm * 100) / 100,
    differencePct: Math.round(differencePct * 100) / 100,
    sampleSize,
    comparables: comparableRows
      .sort((a, b) => a.pricePerSqm - b.pricePerSqm)
      .map((row) => ({
        id: row.id,
        pricePerSqm: Math.round(row.pricePerSqm * 100) / 100,
        price: row.price,
        areaSqm: row.areaSqm,
      })),
    reasons,
  };
}
