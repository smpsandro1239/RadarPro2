import { parseCasaSapoListings, parseImovirtualListingsFromHtml } from "@/lib/portal-parsers";

export interface ScrapedProperty {
  title: string;
  price: number;
  location: string;
  url: string;
  source: string;
  imageUrl?: string;
  areaSqm?: number | null;
}

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

async function fetchHtml(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, { headers: { "User-Agent": USER_AGENT } });
    if (!res.ok) {
      console.error(`${url} returned ${res.status}`);
      return null;
    }
    return await res.text();
  } catch (error) {
    console.error("Error fetching", url, error);
    return null;
  }
}

export async function scrapeCasaSapo(district: string): Promise<ScrapedProperty[]> {
  const url = `https://casa.sapo.pt/comprar-apartamentos/${district.toLowerCase()}/`;
  const html = await fetchHtml(url);
  if (!html) return [];

  return parseCasaSapoListings(html).map((l) => ({
    title: l.title,
    price: l.price,
    location: l.location || district,
    url: l.url,
    source: "Casa Sapo",
    imageUrl: l.images[0],
    areaSqm: l.areaSqm,
  }));
}

export async function scrapeImovirtual(district: string): Promise<ScrapedProperty[]> {
  const url = `https://www.imovirtual.com/pt/resultados/comprar/apartamento/${district.toLowerCase()}/`;
  const html = await fetchHtml(url);
  if (!html) return [];

  return parseImovirtualListingsFromHtml(html).map((l) => ({
    title: l.title,
    price: l.price,
    location: l.location || district,
    url: l.url,
    source: "Imovirtual",
    imageUrl: l.images[0],
    areaSqm: l.areaSqm,
  }));
}
