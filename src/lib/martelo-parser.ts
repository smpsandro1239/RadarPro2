/**
 * Conversao dos dados do canal oficial do Martelo.pt (API publica) e do feed
 * RSS do Estamo para o formato interno. Sem efeitos secundarios: e testavel.
 *
 * Medido na API em 2026-11-03 (100 eventos por pagina, 5086 anunciados):
 * - `tipo` = "Imovel" | "Direito" | "Equipamento" | "Maquina" | "Mobiliario" | "Veiculo";
 *   so `Imovel` e um imovel (apartamento, moradia, terreno, predio, garagem).
 * - `subtipo` = "Apartamento" | "Moradia" | "Terreno Construcao" | "Prédio" | ...
 * - `tipologia` = "T2".."T6" | "nao aplicavel" | null.
 * - `valor_base`, `lance_atual` e `valor_abertura` presentes em 100/100.
 * - `area_util` 15, `area_privativa` 34, `area_efetiva` 41 (41 com alguma area).
 * - `freguesia` 97/100; `latitude`/`longitude` 100/100.
 * - `tags` classificam a origem: `origem-judicial` | `origem-fiscal` |
 *   `origem-insolvencia` | `origem-outra`.
 */

import { parsePortugalDateTime } from "./portugal-time";

export type AuctionType = "judicial" | "fiscal" | "private";
export type GeoQuality = "exact" | "street" | "NA";

export type ScrapedRow = {
  id: string;
  source: string;
  sourceName: string;
  url: string;
  title: string;
  district: string | null;
  municipality: string | null;
  parish: string | null;
  type: string | null;
  price: number | null;
  areaSqm: number | null;
  floor: number | null;
  isAuction: boolean;
  auctionType: AuctionType | null;
  auctionEndDate: number | null;
  openingBid: number | null;
  currentBid: number | null;
  reservePrice: number | null;
  auctionHouse: string;
  lat: number | null;
  lng: number | null;
  geoQuality: GeoQuality;
  images: string[];
};

export type MarteloTag = { slug?: string; label?: string };

export type MarteloEvent = {
  reference?: string;
  titulo?: string;
  tipo?: string;
  subtipo?: string;
  tipologia?: string | null;
  valor_base?: number | null;
  lance_atual?: number | null;
  valor_abertura?: number | null;
  data_fim?: string | null;
  distrito?: string | null;
  concelho?: string | null;
  freguesia?: string | null;
  area_util?: number | null;
  area_privativa?: number | null;
  area_efetiva?: number | null;
  piso?: string | null;
  capa?: string | null;
  fotos?: string[] | null;
  source?: string | null;
  source_url?: string | null;
  tipo_processo?: string | null;
  estado_at?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  gps_approximate?: boolean | null;
  terminado?: boolean;
  cancelado?: boolean;
  ativo?: boolean;
  tags?: MarteloTag[] | null;
};

/** Casas de leilao com comissao conhecida em `src/lib/auction-calculator.ts`. */
const AUCTION_HOUSES: Record<string, string> = {
  leilosoc: "Leilosoc",
  eleiloes: "e-Leilões",
  martelo: "Martelo",
  martelopt: "Martelo",
  bidizi: "Bidizi",
  estamo: "Estamo",
};

function fold(text: string): string {
  return text.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
}

/** Nome canonico da casa de leilao (para a comissao) ou o valor original. */
export function mapAuctionHouse(source: string | null | undefined): string {
  const raw = (source ?? "").trim();
  if (!raw) return "Outra";
  return AUCTION_HOUSES[fold(raw).replace(/[^a-z]/g, "")] ?? raw;
}

/** True quando o evento e um imovel (e nao uma viatura, maquina ou mobilia). */
export function isPropertyEvent(event: MarteloEvent): boolean {
  const tipo = fold(event.tipo ?? "");
  return tipo === "imovel" || tipo === "imoveis";
}

/**
 * Tipo de leilao segundo a origem do processo.
 * `insolvencia` e um processo judicial (execucao ou insolvencia): o schema so
 * distingue judicial/fiscal/private, e null significa "desconhecido".
 */
export function detectAuctionType(event: MarteloEvent): AuctionType | null {
  const slugs = (event.tags ?? []).map((tag) => fold(tag.slug ?? ""));
  const origin = slugs.find((slug) => slug.startsWith("origem-"));
  if (origin === "origem-fiscal") return "fiscal";
  if (origin === "origem-judicial" || origin === "origem-insolvencia") return "judicial";
  if (origin === "origem-outra") return null;

  const process = fold(event.tipo_processo ?? "");
  if (process.startsWith("execucao") || process.includes("insolvencia")) return "judicial";
  return null;
}

/** Primeiro valor estritamente positivo (a API traz area 0 em alguns eventos). */
function firstPositive(...values: (number | null | undefined)[]): number | null {
  for (const value of values) {
    if (typeof value === "number" && value > 0) return value;
  }
  return null;
}

/**
 * O API traz `piso` como texto ("1º andar", "r/c", "cave").
 * Convencao do motor: 0 = res-do-chao, negativo = cave.
 */
export function parseFloor(value: string | null | undefined): number | null {
  if (!value) return null;
  const text = fold(value);
  if (text.startsWith("cave")) return -1;
  if (text.startsWith("r/c") || text.startsWith("rc") || text.startsWith("res")) return 0;
  const match = /-?\d+/.exec(text);
  return match ? Number(match[0]) : null;
}

function geoQualityOf(event: MarteloEvent): GeoQuality {
  if (event.latitude === null || event.latitude === undefined) return "NA";
  if (event.longitude === null || event.longitude === undefined) return "NA";
  return event.gps_approximate === false ? "exact" : "street";
}

/** Tipo do imovel com a tipologia quando existe ("Apartamento T3"). */
function buildType(event: MarteloEvent): string | null {
  const base = (event.subtipo ?? event.tipo ?? "").trim();
  if (!base) return null;
  const tipologia = (event.tipologia ?? "").trim();
  const match = /^(T[0-6]|V[2-9])\b/i.exec(tipologia);
  return match ? `${base} ${match[1].toUpperCase()}` : base;
}

export function mapMarteloEvent(event: MarteloEvent): ScrapedRow {
  const reference = (event.reference ?? "desconhecido").trim().toLowerCase();
  // Leiloes sem lance nenhum trazem `lance_atual = 0`: o preco registado e o
  // valor de abertura (o que um comprador teria de licitar agora) e o
  // `current_bid` fica null (nunca 0, que a UI mostraria como "0 EUR").
  const currentBid = firstPositive(event.lance_atual);
  const opening = firstPositive(event.valor_abertura);
  const reserve = firstPositive(event.valor_base);

  return {
    id: `martelo-${reference}`,
    source: "martelo",
    sourceName: "Martelo.pt",
    url: event.source_url ?? `https://martelo.pt/evento/${event.reference ?? ""}`,
    title: event.titulo ?? "Imóvel em leilão",
    district: event.distrito ?? null,
    municipality: event.concelho ?? null,
    parish: event.freguesia ?? null,
    type: buildType(event),
    price: currentBid ?? opening ?? reserve,
    areaSqm: firstPositive(event.area_util, event.area_privativa, event.area_efetiva),
    floor: parseFloor(event.piso),
    isAuction: true,
    auctionType: detectAuctionType(event),
    auctionEndDate: parsePortugalDateTime(event.data_fim),
    openingBid: firstPositive(event.valor_abertura),
    currentBid,
    reservePrice: reserve,
    auctionHouse: mapAuctionHouse(event.source),
    lat: typeof event.latitude === "number" ? event.latitude : null,
    lng: typeof event.longitude === "number" ? event.longitude : null,
    geoQuality: geoQualityOf(event),
    images: [event.capa, ...(event.fotos ?? [])].filter((u): u is string => typeof u === "string" && u.startsWith("http")),
  };
}

/** True quando o texto do feed e conteudo de exemplo (nao um imovel real). */
export function detectPlaceholder(text: string): boolean {
  return /lorem ipsum|nome do empreendimento|consectetuer/i.test(text);
}

export function extractRssItems(xml: string): { title: string; link: string; description: string }[] {
  const items: { title: string; link: string; description: string }[] = [];
  for (const match of xml.matchAll(/<item>([\s\S]*?)<\/item>/g)) {
    const block = match[1];
    const pick = (tag: string) => {
      const found = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`).exec(block);
      return found ? found[1].replace(/<!\[CDATA\[|\]\]>/g, "").trim() : "";
    };
    items.push({ title: pick("title"), link: pick("link"), description: pick("description") });
  }
  return items;
}
