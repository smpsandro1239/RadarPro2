/**
 * RadarPro Portugal - Extracao de area (m2) e de dados estruturados dos anuncios.
 *
 * Fontes de dados (medidas em producao, 2026-11):
 * - Imovirtual: a pagina de resultados embute `__NEXT_DATA__` com
 *   `areaInSquareMeters` por anuncio (37/37 anuncios com area na pagina de Lisboa).
 * - Casa Sapo: cada anuncio tem um bloco JSON-LD (application/ld+json) com `name`,
 *   `description`, `price` e endereco. A area esta no texto da descricao
 *   ("com 72 m2 de area bruta"), nao num campo estruturado.
 *
 * Regra: se nao ha area no anuncio, devolve null. Nunca estimar area por tipologia.
 */

/** Area em m2 de um texto livre (descricao de anuncio). */
export function parseAreaSqm(text: string | null | undefined): number | null {
  if (!text) return null;

  const flat = text.replace(/\u00a0/g, " ").replace(/(\d)\s*-\s*(\d)/g, "$1-$2");

  // "85-120 m2" e um intervalo: nao ha area unica -> null.
  if (/\d\s*-\s*\d+\s*m\s*[²2]/i.test(flat)) return null;

  const matches = [...flat.matchAll(/(\d+(?:[.,]\d+)?)\s*m\s*[²2]/gi)];
  if (matches.length === 0) return null;

  const labelled = matches.filter((m) => {
    const before = flat.slice(Math.max(0, m.index - 45), m.index);
    const after = flat.slice(m.index + m[0].length, m.index + m[0].length + 25);
    return /á\s*rea|areas?\b|superfície/i.test(`${before} ${after}`);
  });

  // Sem rotulo: so accepta se houver uma unica area no texto (senao e ambiguo:
  // "sala com 21 m2", "varanda com 5 m2" nao sao a area total).
  const pool = labelled.length > 0 ? labelled : matches.length === 1 ? matches : [];
  if (pool.length === 0) return null;

  const value = parseNumber(pool[0][1]);
  if (value === null || value > 100000) return null;
  return value;
}

/** "216,09" -> 216.09 | "1.234" -> 1234 | "72" -> 72 */
export function parseNumber(raw: string): number | null {
  let s = raw.trim();
  if (s.includes(",")) {
    s = s.replace(/\./g, "").replace(",", ".");
  } else if (/^\d{1,3}(\.\d{3})+$/.test(s)) {
    s = s.replace(/\./g, "");
  }
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

export interface JsonLdListing {
  title: string | null;
  description: string | null;
  price: number | null;
  url: string | null;
  areaSqm: number | null;
}

/** Extrai os anuncios embebidos em blocos JSON-LD (Casa Sapo). */
export function extractJsonLdListings(html: string): JsonLdListing[] {
  const out: JsonLdListing[] = [];
  const re = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;

  for (const m of html.matchAll(re)) {
    let parsed: unknown;
    try {
      parsed = JSON.parse(m[1].trim());
    } catch {
      continue;
    }
    for (const node of flattenLd(parsed)) {
      const o = node as Record<string, unknown>;
      const description = typeof o.description === "string" ? o.description : null;
      const title = typeof o.name === "string" ? o.name : null;
      if (!title && !description) continue;

      const floorSize = o.floorSize as { value?: unknown } | undefined;
      const floorSizeValue =
        typeof floorSize?.value === "number" && floorSize.value > 0 ? floorSize.value : null;

      out.push({
        title,
        description,
        price: parseLdPrice(o.price),
        url: typeof o.url === "string" ? o.url : null,
        areaSqm: floorSizeValue ?? parseAreaSqm(description),
      });
    }
  }
  return out;
}

export interface ImovirtualListing {
  href: string | null;
  title: string | null;
  price: number | null;
  areaSqm: number | null;
  floor: string | null;
  rooms: string | null;
  district: string | null;
  municipality: string | null;
  parish: string | null;
  images: string[];
  transaction: string | null;
}

/** Extrai os anuncios do `__NEXT_DATA__` da pagina de resultados do Imovirtual. */
export function extractImovirtualListings(html: string): ImovirtualListing[] {
  const raw = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/i);
  if (!raw) return [];

  let data: unknown;
  try {
    data = JSON.parse(raw[1]);
  } catch {
    return [];
  }

  const items = findSearchItems(data);
  return items.map((item) => {
    const locations = readLocations(item);
    return {
      href: typeof item.href === "string" ? item.href : null,
      title: typeof item.title === "string" ? item.title : null,
      price: readPrice(item),
      areaSqm:
        typeof item.areaInSquareMeters === "number" && item.areaInSquareMeters > 0
          ? item.areaInSquareMeters
          : null,
      floor: typeof item.floorNumber === "string" ? item.floorNumber : null,
      rooms: typeof item.roomsNumber === "string" ? item.roomsNumber : null,
      district: locations.district,
      municipality: locations.municipality,
      parish: locations.parish,
      images: readImages(item.images),
      transaction: typeof item.transaction === "string" ? item.transaction : null,
    };
  });
}

/** Normaliza um titulo para casar anuncios entre JSON-LD e cartoes HTML. */
export function normalizeTitle(title: string | null | undefined): string {
  return (title ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

/**
 * Casa um anuncio do cartao HTML com o anuncio estruturado.
 * Os titulos nao sao identicos ("Apartamento T2" vs "Apartamento T2, Lisboa"), por isso
 * aceita prefixo comum com pelo menos 20 caracteres.
 */
export function matchByTitle<T extends { title: string | null }>(
  listings: T[],
  title: string | null | undefined,
): T | null {
  const target = normalizeTitle(title);
  if (!target) return null;

  for (const l of listings) {
    if (normalizeTitle(l.title) === target) return l;
  }
  for (const l of listings) {
    const candidate = normalizeTitle(l.title);
    if (!candidate) continue;
    if (candidate.length >= 20 && (candidate.startsWith(target) || target.startsWith(candidate))) return l;
  }
  for (const l of listings) {
    const candidate = normalizeTitle(l.title);
    if (!candidate) continue;
    const a = candidate.slice(0, 30);
    const b = target.slice(0, 30);
    if (a.length >= 15 && a === b) return l;
  }
  return null;
}

function flattenLd(value: unknown): unknown[] {
  if (Array.isArray(value)) return value.flatMap(flattenLd);
  if (value && typeof value === "object") {
    const graph = (value as { "@graph"?: unknown })["@graph"];
    if (Array.isArray(graph)) return graph.flatMap(flattenLd);
    return [value];
  }
  return [];
}

function parseLdPrice(value: unknown): number | null {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value === "string") {
    const n = parseNumber(value.replace(/[^\d.,]/g, ""));
    return n !== null && n > 0 ? n : null;
  }
  if (Array.isArray(value)) {
    for (const v of value) {
      const n = parseLdPrice(v);
      if (n !== null) return n;
    }
    return null;
  }
  if (value && typeof value === "object") {
    const inner = (value as { value?: unknown }).value;
    return typeof inner === "number" ? inner : null;
  }
  return null;
}

function findSearchItems(data: unknown): Record<string, unknown>[] {
  const direct = (data as { props?: { pageProps?: { data?: { searchAds?: { items?: unknown } } } } })
    ?.props?.pageProps?.data?.searchAds?.items;
  if (Array.isArray(direct)) return direct as Record<string, unknown>[];

  // Fallback: procura o primeiro array de objetos que pareca uma lista de anuncios.
  const seen = new Set<unknown>();
  const walk = (node: unknown, depth: number): Record<string, unknown>[] | null => {
    if (depth > 8 || !node || typeof node !== "object" || seen.has(node)) return null;
    seen.add(node);
    if (Array.isArray(node)) {
      const arr = node as unknown[];
      if (
        arr.length > 0 &&
        arr.every((x) => x && typeof x === "object" && ("areaInSquareMeters" in x || "totalPrice" in x))
      ) {
        return arr as Record<string, unknown>[];
      }
      for (const x of arr) {
        const found = walk(x, depth + 1);
        if (found) return found;
      }
      return null;
    }
    for (const v of Object.values(node as Record<string, unknown>)) {
      const found = walk(v, depth + 1);
      if (found) return found;
    }
    return null;
  };

  return walk(data, 0) ?? [];
}

function readPrice(item: Record<string, unknown>): number | null {
  const total = item.totalPrice as { value?: unknown } | undefined;
  if (typeof total?.value === "number") return total.value;
  const price = item.price as { value?: unknown } | undefined;
  if (typeof price?.value === "number") return price.value;
  if (typeof item.price === "number") return item.price;
  return null;
}

/** Imagens do anuncio: o Imovirtual entrega {small,medium,large}. */
function readImages(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  const out: string[] = [];
  for (const img of value) {
    if (typeof img === "string") {
      out.push(img);
      continue;
    }
    if (!img || typeof img !== "object") continue;
    const o = img as Record<string, unknown>;
    const url = [o.medium, o.large, o.small, o.url].find(
      (u): u is string => typeof u === "string" && u.startsWith("http"),
    );
    if (url) out.push(url);
  }
  return out;
}

function readLocations(item: Record<string, unknown>): {
  district: string | null;
  municipality: string | null;
  parish: string | null;
} {  const location = item.location as
    | { reverseGeocoding?: { locations?: Array<{ locationLevel?: string; name?: string }> } }
    | undefined;
  const locations = location?.reverseGeocoding?.locations ?? [];
  const byLevel = (level: string): string | null => {
    const hit = locations.find((l) => l.locationLevel === level && typeof l.name === "string");
    return hit?.name ?? null;
  };
  return {
    district: byLevel("district"),
    municipality: byLevel("council"),
    parish: byLevel("parish"),
  };
}
