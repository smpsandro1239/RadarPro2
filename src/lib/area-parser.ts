/** Extrai apenas áreas explicitamente identificadas no anúncio. */
export interface ScrapedAreaDetails {
  usableAreaSqm?: number;
  grossAreaSqm?: number;
  landAreaSqm?: number;
}
function parseAreaValue(value: string): number | undefined {
  const normalized = value.includes(",")
    ? value.replace(/\./g, "").replace(",", ".")
    : /^\d{1,3}(?:\.\d{3})+$/.test(value) ? value.replace(/\./g, "") : value;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) && parsed > 0 && parsed <= 1000000 ? parsed : undefined;
}
export function parseAreaDetails(text: string): ScrapedAreaDetails {
  const source = text.replace(/\s+/g, " ");
  const read = (pattern: RegExp): number | undefined => {
    const match = source.match(pattern);
    return match && match[1] ? parseAreaValue(match[1]) : undefined;
  };
  const usableAreaSqm = read(/(?:área\s+útil|area\s+util|superfície\s+útil|superficie\s+util)\s*[:\-]?\s*([\d.]+(?:,[\d]+)?)\s*m(?:²|2)(?=\s|$|[,;.)])/i);
  const grossAreaSqm = read(/(?:área\s+bruta\s+privativa|area\s+bruta\s+privativa|área\s+bruta|area\s+bruta|área\s+de\s+construção|area\s+de\s+construcao)\s*[:\-]?\s*([\d.]+(?:,[\d]+)?)\s*m(?:²|2)(?=\s|$|[,;.)])/i);
  const landAreaSqm = read(/(?:área\s+(?:do\s+)?terreno|area\s+(?:do\s+)?terreno|terreno)\s*[:\-]?\s*([\d.]+(?:,[\d]+)?)\s*m(?:²|2)(?=\s|$|[,;.)])/i);
  return {
    ...(usableAreaSqm !== undefined ? { usableAreaSqm } : {}),
    ...(grossAreaSqm !== undefined ? { grossAreaSqm } : {}),
    ...(landAreaSqm !== undefined ? { landAreaSqm } : {}),
  };
}

