import { createClient } from "@libsql/client";

const c = createClient({
  url: "libsql://radarpro2-smpsandro1239.aws-eu-west-1.turso.io",
  authToken: "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3OTMyMjQxNjUsImlkIjoiMDFhMTg0N2MtYWYwMS03NjVjLWEzOWYtZTdiNzhmMjdiNGMwIiwia2lkIjoiM3loRDhHZlpvc2VVTE44M1BoYVR4ZzllVDRRckNEaHBtbzdfcTNrSU9fNCIsInJpZCI6ImRhZmRiZjQ2LWI2MmEtNDI1NC05ZWQwLThhMTAxYzZjNjlmMCJ9.gxbkXNeVgAiI4MtTw8WDwvTBe5fRkuFV9eC99jOTMZFtic4-GXwF3Zlryovw_uoaxxhZ0NFXkdKbtejzONaMAw",
});

async function fetchWithRetry(url: string, retries = 3): Promise<Response> {
  for (let i = 0; i < retries; i++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      const res = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
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
    .each((_, el) => {
      const $\)el = $(el);
      const title = $\)el.find("h2, h3, .title, [class*='title']").first().text().trim();
      const priceText = $\)el.find(".price, [class*='price']").first().text().trim();
      const location = $\)el.find(".location, [class*='location'], .address").first().text().trim();
      const link = $\)el.find("a").first().attr("href");
      const images: string[] = [];
      $\)el.find("img").each((_, img) => {
        const src = $\)img).attr("src") || $\)img).attr("data-src");
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
