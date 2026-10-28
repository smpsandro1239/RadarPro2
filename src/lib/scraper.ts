import * as cheerio from "cheerio";

export interface ScrapedProperty {
  title: string;
  price: number;
  location: string;
  url: string;
  source: string;
  imageUrl?: string;
}

export async function scrapeCasaSapo(district: string): Promise<ScrapedProperty[]> {
  const results: ScrapedProperty[] = [];

  try {
    const url = `https://casa.sapo.pt/venda-apartamentos/${district.toLowerCase()}/`;
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });

    if (!res.ok) {
      console.error(`Casa Sapo returned ${res.status} for ${district}`);
      return results;
    }

    const html = await res.text();
    const $ = cheerio.load(html);

    // Casa Sapo listing cards
    $(".property, .listing-item, [class*='property-card']").each((_, el) => {
      const $el = $(el);
      const title = $el.find("h2, h3, .title, [class*='title']").first().text().trim();
      const priceText = $el.find(".price, [class*='price']").first().text().trim();
      const location = $el.find(".location, [class*='location'], [class*='address']").first().text().trim();
      const link = $el.find("a").first().attr("href");
      const img = $el.find("img").first().attr("src");

      const price = parseInt(priceText.replace(/[^\d]/g, ""), 10);

      if (title && price > 0) {
        results.push({
          title,
          price,
          location: location || district,
          url: link ? (link.startsWith("http") ? link : `https://casa.sapo.pt${link}`) : url,
          source: "Casa Sapo",
          imageUrl: img,
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
    const url = `https://www.imovirtual.com/comprar/apartamento/${district.toLowerCase()}/`;
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });

    if (!res.ok) {
      console.error(`Imovirtual returned ${res.status} for ${district}`);
      return results;
    }

    const html = await res.text();
    const $ = cheerio.load(html);

    $("[data-cy='listing-item'], .listing-item, article").each((_, el) => {
      const $el = $(el);
      const title = $el.find("h3, h2, [class*='title']").first().text().trim();
      const priceText = $el.find("[class*='price']").first().text().trim();
      const location = $el.find("[class*='location'], [class*='address']").first().text().trim();
      const link = $el.find("a").first().attr("href");
      const img = $el.find("img").first().attr("src");

      const price = parseInt(priceText.replace(/[^\d]/g, ""), 10);

      if (title && price > 0) {
        results.push({
          title,
          price,
          location: location || district,
          url: link ? (link.startsWith("http") ? link : `https://www.imovirtual.com${link}`) : url,
          source: "Imovirtual",
          imageUrl: img,
        });
      }
    });
  } catch (error) {
    console.error("Error scraping Imovirtual:", error);
  }

  return results;
}
