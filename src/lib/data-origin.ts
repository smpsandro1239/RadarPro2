export type DataOrigin = "demo" | "scraped" | "unknown";

/**
 * Ids de dados de demonstracao: `prefixo-codigo-distrito[-real]-N` (ex.: `cs-lis-1`,
 * `cs-bra-real-1`). Terminam em 1-3 digitos e nao temem nenhum numero de 4 ou mais
 * digitos (o preco, que aparece em todos os ids dos scrapers, tem 5-7 digitos).
 */
const DEMO_LAST_SEGMENT = /\d{1,3}$/;
const DEMO_PRICE_MARKER = /\d{4,}/;
const DEMO_MIN_SEGMENTS = 3;
const DEMO_MAX_SEGMENTS = 4;
/** Id gerado pelo `scripts/add_all_districts.mjs` (dados sinteticos). */
const SYNTHETIC_ID_PREFIX = "gen-";
/** Formato dos ids gerados pelos scrapers (prefixo-distrito-preco-hash). */
const SCRAPED_ID_PATTERN = /^[a-z0-9]+-[a-z0-9]+-\d{5,7}-[a-z0-9]+$/;
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isDemoId(id: string): boolean {
  if (!id) return false;
  if (id.startsWith(SYNTHETIC_ID_PREFIX)) return true;
  if (!DEMO_LAST_SEGMENT.test(id)) return false;
  if (DEMO_PRICE_MARKER.test(id)) return false;
  const segments = id.split("-").length;
  return segments >= DEMO_MIN_SEGMENTS && segments <= DEMO_MAX_SEGMENTS;
}

export function inferDataOrigin(id: string): DataOrigin {
  if (!id) return "unknown";
  if (isDemoId(id)) return "demo";
  if (SCRAPED_ID_PATTERN.test(id) || UUID_PATTERN.test(id)) return "scraped";
  return "unknown";
}

/** `SHOW_SEED_DATA=true` mostra (e nao filtra) os dados de demonstracao. */
export function showSeedData(): boolean {
  const value = (process.env.SHOW_SEED_DATA ?? "").trim().toLowerCase();
  return value === "true" || value === "1" || value === "yes";
}
