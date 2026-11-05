/**
 * RadarPro Portugal - Parsers por portal (pagina de resultados -> anuncios).
 *
 * Os seletores de HTML dos portais mudam com frequencia. Onde o portal embute
 * dados estruturados (JSON-LD na Casa Sapo, __NEXT_DATA__ no Imovirtual) usa-se
 * essa fonte; o HTML serve para o que o JSON nao traz (url real, imagens).
 *
 * Estado medido em producao (2026-11-02, Lisboa):
 * - Casa Sapo: 28/28 cartoes com area em `.property-features` ("Usado - 91 m2").
 * - Imovirtual: 37/37 anuncios com `areaInSquareMeters` no __NEXT_DATA__.
 */
import { loadHtml } from "@/lib/html";
import { extractImovirtualListings, parseAreaSqm, parseNumber } from "@/lib/area-parser";

export interface PortalListing {
  title: string;
  price: number;
  location: string;
  url: string;
  images: string[];
  areaSqm: number | null;
  floor: string | null;
  rooms: string | null;
  district: string | null;
  municipality: string | null;
  parish: string | null;
}

const IMOVIRTUAL_BASE = "https://www.imovirtual.com";

/** Casa Sapo: cartoes `.property` com area em `.property-features` e url real no parametro `l=`. */
export function parseCasaSapoListings(html: string): PortalListing[] {
  const $ = loadHtml(html);
  const out: PortalListing[] = [];

  $(".property, .property-card, article.property, .listing-item, .result-item").each((_, el) => {
    const $el = $(el);

    const title =
      $el.find("[data-title]").first().attr("data-title")?.trim() ||
      $el.find("img").first().attr("alt")?.trim() ||
      $el.find("h2, h3").first().text().trim();
    const priceText = $el.find(".property-price-value, .price").first().text().trim();
    const location = $el.find(".property-location, .location").first().text().replace(/\s+/g, " ").trim();
    const href = $el.find("a").first().attr("href") ?? "";
    const url = unwrapCasaSapoUrl(href);
    const price = parsePrice(priceText);
    const features = $el.find(".property-features").first().text().replace(/\s+/g, " ").trim();

    const images: string[] = [];
    $el.find("img").each((_, img) => {
      const src = $(img).attr("src") || $(img).attr("data-src");
      if (src && src.startsWith("http")) images.push(src);
    });

    // Anuncios de arrendamento nao servem para avaliacao de venda.
    if (isRental(url, priceText)) return;
    if (!title || !(price > 0)) return;

    out.push({
      title,
      price,
      location,
      url,
      images,
      areaSqm: parseAreaSqm(features) ?? parseAreaSqm($el.text()),
      floor: null,
      rooms: null,
      district: null,
      municipality: null,
      parish: null,
    });
  });

  return out;
}

/** Imovirtual: dados estruturados do `__NEXT_DATA__` (titulo, preco, area, geografia, imagens). */
export function parseImovirtualListingsFromHtml(html: string): PortalListing[] {
  const items = extractImovirtualListings(html);
  const out: PortalListing[] = [];

  for (const item of items) {
    if (!item.title || !item.price || item.price <= 0) continue;
    if (item.transaction && item.transaction.toUpperCase() === "RENT") continue;

    const href = item.href ?? "";
    const url = href.startsWith("[lang]") ? `${IMOVIRTUAL_BASE}/pt${href.slice("[lang]".length)}` : href;

    out.push({
      title: item.title.replace(/\s+/g, " ").trim(),
      price: item.price,
      location: [item.parish, item.municipality, item.district].filter(Boolean).join(", "),
      url,
      images: item.images,
      areaSqm: item.areaSqm,
      floor: item.floor,
      rooms: item.rooms,
      district: item.district,
      municipality: item.municipality,
      parish: item.parish,
    });
  }

  return out;
}

/** A Casa Sapo usa links de tracking: o url real vem no parametro `l=`. */
export function unwrapCasaSapoUrl(href: string): string {
  if (!href) return "";
  const match = href.match(/[?&]l=([^&]+)/);
  if (match) return decodeURIComponent(match[1]);
  return href.startsWith("http") ? href : `https://casa.sapo.pt${href}`;
}

/** "770.000 €" | "459.000 € 480.000 € -4,38%" -> 770000 */
export function parsePrice(text: string): number {
  const match = text.match(/[\d.,]+/);
  if (!match) return 0;
  const value = parseNumber(match[0].replace(/[^\d.,]/g, ""));
  return value !== null && value > 0 ? value : 0;
}

function isRental(url: string, priceText: string): boolean {
  if (/\/comprar-alugar-|alugar-/i.test(url)) return true;
  return priceText.includes("/");
}
