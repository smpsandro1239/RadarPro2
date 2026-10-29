import { createClient } from "@libsql/client";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

const c = createClient({
  url: "libsql://radarpro2-smpsandro1239.aws-eu-west-1.turso.io",
  authToken:
    "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3OTMyMjQxNjUsImlkIjoiMDFhMTg0N2MtYWYwMS03NjVjLWEzOWYtZTdiNzhmMjdiNGMwIiwia2lkIjoiM3loRDhHZlpvc2VVTE44M1BoYVR4ZzllVDRRckNEaHBtbzdfcTNrSU9fNCIsInJpZCI6ImRhZmRiZjQ2LWI2MmEtNDI1NC05ZWQwLThhMTAxYzZjNjlmMCJ9.gxbkXNeVgAiI4MtTw8WDwvTBe5fRkuFV9eC99jOTMZFtic4-GXwF3Zlryovw_uoaxxhZ0NFXkdKbtejzONaMAw",
});

async function fetchWithRetry(url: string, retries = 3): Promise<Response> {
  for (let i = 0; i < retries; i++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      const res = await fetch(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
          "Accept-Language": "pt-PT,pt;q=0.9,en;q=0.8",
          Connection: "keep-alive",
        },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      if (res.ok) return res;
    } catch (err) {
      if (i === retries - 1) throw err;
      await new Promise((r) => setTimeout(r, 1000 * (i + 1)));
    }
  }
  throw new Error("Failed to fetch " + url + " after " + retries + " retries");
}

function parsePrice(text: string): number | null {
  const match = text.match(/[\d.,]+/);
  if (!match) return null;
  const clean = match[0].replace(/\./g, "").replace(/,/g, ".");
  const val = parseFloat(clean);
  return isNaN(val) ? null : val;
}

export interface ScrapedProperty {
  id: string;
  title: string;
  price: number;
  location: string;
  url: string;
  source: string;
  images: string[];
  isAuction?: boolean;
  auctionEndDate?: number;
}

export async function scrapeCasaSapo(district: string): Promise<ScrapedProperty[]> {
  const results: ScrapedProperty[] = [];

  try {
    const url = "https://casa.sapo.pt/comprar-apartamentos/" + district.toLowerCase() + "/";
    const res = await fetchWithRetry(url);
    const html = await res.text();
    const $ = cheerio.load(html);

    $(".property-card, article.property, .listing-item, .result-item").each((_, el) => {
      const $el = $(el);
      const title = $el.find("h2, h3, .title, [class*='title']").first().text().trim();
      const priceText = $el.find(".price, [class*='price']").first().text().trim();
      const location = $el.find(".location, [class*='location'], .address").first().text().trim();
      const link = $el.find("a").first().attr("href");
      const images: string[] = [];
      $el.find("img").each((_, img) => {
        const src = $(img).attr("src") || $(img).attr("data-src");
        if (src && src.startsWith("http")) images.push(src);
      });
      const price = parsePrice(priceText);
      if (title && price > 0) {
        results.push({
          id: "cs-" + district + "-" + price + "-" + title.replace(/\s+/g, "-").toLowerCase().slice(0, 30),
          title: title,
          price: price,
          location: location,
          url: link ? (link.startsWith("http") ? link : "https://casa.sapo.pt" + link) : url,
          source: "Casa Sapo",
          images: images,
        });
      }
    });
  } catch (error) {
    console.error("Error scraping Casa Sapo:", error);
  }

  return results;
}

export async function scrapeImovirtual(district: string): Promise<ScrapedProperty[]> {
  const results: ScrapedProperty[] = [];
  try {
    const url = "https://www.imovirtual.com/pt/resultados/comprar/apartamento/" + district.toLowerCase() + "/";
    const res = await fetchWithRetry(url);
    const html = await res.text();
    const $ = cheerio.load(html);

    $("[data-cy='listing-item'], .listing-item, article").each((_, el) => {
      const $el = $(el);
      const title = $el.find("h3, h2, [class*='title']").first().text().trim();
      const priceText = $el.find("[class*='price']").first().text().trim();
      const location = $el.find("[class*='location'], [class*='address']").first().text().trim();
      const link = $el.find("a").first().attr("href");
      const images: string[] = [];
      $el.find("img").each((_, img) => {
        const src = $(img).attr("src") || $(img).attr("data-src");
        if (src && src.startsWith("http")) images.push(src);
      });
      const price = parsePrice(priceText);
      if (title && price > 0) {
        results.push({
          id: "im-por-" + district + "-" + price + "-" + title.replace(/\s+/g, "-").toLowerCase().slice(0, 30),
          title: title,
          price: price,
          location: location,
          url: link ? (link.startsWith("http") ? link : "https://www.imovirtual.com" + link) : url,
          source: "Imovirtual",
          images: images,
        });
      }
    });
  } catch (error) {
    console.error("Error scraping Imovirtual:", error);
  }
  return results;
}

export async function scrapeIdealista(district: string): Promise<ScrapedProperty[]> {
  const results: ScrapedProperty[] = [];
  try {
    const url = "https://www.idealista.pt/comprar-casas/" + district.toLowerCase() + "/";
    const res = await fetchWithRetry(url);
    const html = await res.text();
    const $ = cheerio.load(html);

    $("article.item, .listing-item, .listing-item-card").each((_, el) => {
      const $el = $(el);
      const title = $el.find("h3, h2, [class*='title']").first().text().trim();
      const priceText = $el.find("[class*='price']").first().text().trim();
      const location = $el.find("[class*='location'], [class*='address']").first().text().trim();
      const link = $el.find("a.item-link, a").first().attr("href");
      const images: string[] = [];
      $el.find("img").each((_, img) => {
        const src = $(img).attr("src") || $(img).attr("data-src");
        if (src && src.startsWith("http")) images.push(src);
      });
      const price = parsePrice(priceText);
      if (title && price > 0) {
        results.push({
          id: "id-" + district + "-" + price + "-" + title.replace(/\s+/g, "-").toLowerCase().slice(0, 30),
          title: title,
          price: price,
          location: location,
          url: link ? (link.startsWith("http") ? link : "https://www.idealista.pt" + link) : url,
          source: "Idealista",
          images: images,
        });
      }
    });
  } catch (error) {
    console.error("Error scraping Idealista:", error);
  }
  return results;
}

export async function scrapeOLX(district: string): Promise<ScrapedProperty[]> {
  const results: ScrapedProperty[] = [];
  try {
    const url = "https://www.olx.pt/imoveis/apartamento-casa-a-venda/" + district.toLowerCase() + "/q-barato/";
    const res = await fetchWithRetry(url);
    const html = await res.text();
    const $ = cheerio.load(html);

    $("[data-cy='l-card'], .listing-item, .offer-item, article").each((_, el) => {
      const $el = $(el);
      const title = $el.find("h3, h2, [class*='title']").first().text().trim();
      const priceText = $el.find("[class*='price']").first().text().trim();
      const location = $el.find("[class*='location'], [class*='address']").first().text().trim();
      const link = $el.find("a").first().attr("href");
      const images: string[] = [];
      $el.find("img").each((_, img) => {
        const src = $(img).attr("src") || $(img).attr("data-src");
        if (src && src.startsWith("http")) images.push(src);
      });
      const price = parsePrice(priceText);
      if (title && price > 0) {
        results.push({
          id: "olx-" + district + "-" + price + "-" + title.replace(/\s+/g, "-").toLowerCase().slice(0, 30),
          title: title,
          price: price,
          location: location,
          url: link ? (link.startsWith("http") ? link : "https://www.olx.pt" + link) : url,
          source: "OLX",
          images: images,
        });
      }
    });
  } catch (error) {
    console.error("Error scraping OLX:", error);
  }
  return results;
}

export async function scrapeCustoJusto(district: string): Promise<ScrapedProperty[]> {
  const results: ScrapedProperty[] = [];
  try {
    const url = "https://www.custojusto.pt/" + district.toLowerCase() + "/imoveis";
    const res = await fetchWithRetry(url);
    const html = await res.text();
    const $ = cheerio.load(html);

    $("[data-cy='listing-item'], .listing-item, article").each((_, el) => {
      const $el = $(el);
      const title = $el.find("h3, h2, [class*='title']").first().text().trim();
      const priceText = $el.find("[class*='price']").first().text().trim();
      const location = $el.find("[class*='location'], [class*='address']").first().text().trim();
      const link = $el.find("a").first().attr("href");
      const images: string[] = [];
      $el.find("img").each((_, img) => {
        const src = $(img).attr("src") || $(img).attr("data-src");
        if (src && src.startsWith("http")) images.push(src);
      });
      const price = parsePrice(priceText);
      if (title && price > 0) {
        results.push({
          id: "cj-" + district + "-" + price + "-" + title.replace(/\s+/g, "-").toLowerCase().slice(0, 30),
          title: title,
          price: price,
          location: location,
          url: link ? (link.startsWith("http") ? link : "https://www.custojusto.pt" + link) : url,
          source: "CustoJusto",
          images: images,
        });
      }
    });
  } catch (error) {
    console.error("Error scraping CustoJusto:", error);
  }
  return results;
}

export async function scrapeLeiloes(district: string): Promise<ScrapedProperty[]> {
  const results: ScrapedProperty[] = [];
  try {
    const url = "https://www.e-leiloes.pt/leiloes/imoveis/" + district.toLowerCase() + "/";
    const res = await fetchWithRetry(url);
    const html = await res.text();
    const $ = cheerio.load(html);

    $("article, .listing-item, .property-card").each((_, el) => {
      const $el = $(el);
      const title = $el.find("h2, h3, [class*='title']").first().text().trim();
      const priceText = $el.find("[class*='price'], .price").first().text().trim();
      const location = $el.find("[class*='location'], [class*='address']").first().text().trim();
      const link = $el.find("a").first().attr("href");
      const images: string[] = [];
      $el.find("img").each((_, img) => {
        const src = $(img).attr("src") || $(img).attr("data-src");
        if (src && src.startsWith("http")) images.push(src);
      });
      const price = parsePrice(priceText);
      if (title && price > 0) {
        results.push({
          id: "el-" + district + "-" + price + "-" + title.replace(/\s+/g, "-").toLowerCase().slice(0, 30),
          title: title,
          price: price,
          location: location,
          url: link ? (link.startsWith("http") ? link : "https://www.e-leiloes.pt" + link) : url,
          source: "e-Leiloes",
          images: images,
          isAuction: true,
          sourceType: "leilao",
        });
      }
    });
  } catch (error) {
    console.error("Error scraping e-Leiloes:", error);
  }
  return results;
}

export async function scrapeAllDistricts(): Promise<ScrapedProperty[]> {
  const sources = ["casasa", "imovirtual", "idealista", "olx", "custojusto", "leiloes"];
  const results: ScrapedProperty[] = [];

  for (const source of sources) {
    try {
      let results: ScrapedProperty[] = [];
      if (source === "casasa") results = await scrapeCasaSapo("Lisboa");
      else if (source === "imovirtual") results = await scrapeImovirtual("Lisboa");
      else if (source === "idealista") results = await scrapeIdealista("Lisboa");
      else if (source === "olx") results = await scrapeOLX("Lisboa");
      else if (source === "custojusto") results = await scrapeCustoJusto("Lisboa");
      else if (source === "leiloes") results = await scrapeELeiloes("Lisboa");

      results.forEach((p) => results.push(p));
    } catch (err) {
      console.error("Error scraping " + source + ":", err);
    }
  }
  return results;
}