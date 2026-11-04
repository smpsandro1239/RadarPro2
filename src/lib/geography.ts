/**
 * Geografia de um imovel: distrito, concelho e freguesia.
 *
 * Dois caminhos:
 * - Canais oficiais (Martelo.pt) dao os tres campos separados: sao usados tal e qual.
 * - Os portais dao so texto ("Santa Maria Maior, Lisboa, Lisboa"): a geografia e
 *   lida a partir do texto, ancorada no ultimo segmento quando esse e um
 *   distrito conhecido de Portugal.
 *
 * Regra: nunca se inventa geografia. Sem distrito reconhecivel nao ha distrito.
 */

/** Os 18 distritos de Portugal continental + as duas regioes autonomeas. */
export const PORTUGAL_DISTRICTS: readonly string[] = [
  "Aveiro",
  "Beja",
  "Braga",
  "Bragança",
  "Castelo Branco",
  "Coimbra",
  "Évora",
  "Faro",
  "Guarda",
  "Leiria",
  "Lisboa",
  "Madeira",
  "Portalegre",
  "Porto",
  "Santarém",
  "Setúbal",
  "Viana do Castelo",
  "Vila Real",
  "Viseu",
  "Açores",
];

export function fold(value: string): string {
  return value.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
}
export const normalizeName = fold;

export type Geography = {
  district: string | null;
  municipality: string | null;
  parish: string | null;
};

/** Nome canonico do distrito ("lisboa" -> "Lisboa"); null se nao for um distrito. */
export function canonicalDistrict(value: string | null | undefined): string | null {
  if (!value) return null;
  const folded = fold(value);
  return PORTUGAL_DISTRICTS.find((district) => fold(district) === folded) ?? null;
}

export function isDistrict(value: string | null | undefined): boolean {
  return canonicalDistrict(value) !== null;
}

/** Dois nomes de distrito iguais ignorando acentos e caixa. */
export function isSameDistrict(a: string | null | undefined, b: string | null | undefined): boolean {
  if (!a || !b) return false;
  return fold(a) === fold(b);
}

/** Distrito canonico quando conhecido, tal e qual caso contrario. */
export function normalizeDistrict(value: string | null | undefined): string | null {
  const text = (value ?? "").trim();
  if (text === "") return null;
  return canonicalDistrict(text) ?? text;
}

function clean(value: string | null | undefined): string | null {
  const text = (value ?? "").trim();
  return text === "" ? null : text;
}

/**
 * Le a geografia de um texto separado por virgulas.
 * "Freguesia, Concelho, Distrito" -> as tres; "Concelho, Distrito" -> as duas.
 * Sem distrito reconhecivel no fim, nao ha distrito.
 */
export function parseLocation(location: string | null | undefined): Geography {
  const parts = (location ?? "")
    .split(",")
    .map((part) => part.trim())
    .filter((part) => part !== "");

  if (parts.length === 0) return { district: null, municipality: null, parish: null };
  if (parts.length === 1) {
    return { district: isDistrict(parts[0]) ? parts[0] : null, municipality: null, parish: null };
  }

  const district = isDistrict(parts[parts.length - 1]) ? parts[parts.length - 1] : null;
  if (district === null) return { district: null, municipality: null, parish: null };
  if (parts.length === 2) {
    return { district, municipality: parts[0], parish: null };
  }
  return { district, municipality: parts[parts.length - 2], parish: parts[parts.length - 3] };
}

/**
 * Geografia final de um imovel: os campos estruturados quando existem,
 * o texto apenas para preencher o que falta.
 */
export function resolveGeography(input: {
  district?: string | null;
  municipality?: string | null;
  parish?: string | null;
  location?: string | null;
}): Geography {
  const structured: Geography = {
    district: clean(input.district),
    municipality: clean(input.municipality),
    parish: clean(input.parish),
  };
  const parsed = parseLocation(input.location);

  if (structured.district !== null) {
    // O texto so completa o que falta quando aponta para o mesmo distrito:
    // caso contrario pode ser uma rua ou outro lugar.
    const sameDistrict = isSameDistrict(parsed.district, structured.district);
    return {
      district: structured.district,
      municipality: structured.municipality ?? (sameDistrict ? parsed.municipality : null),
      parish: structured.parish ?? (sameDistrict ? parsed.parish : null),
    };
  }

  return {
    district: parsed.district,
    municipality: structured.municipality ?? parsed.municipality,
    parish: structured.parish ?? parsed.parish,
  };
}
