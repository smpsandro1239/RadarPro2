import { createClient } from "@libsql/client";
import { load as cheerioLoad } from "cheerio";
import * as Sentry from "@sentry/nextjs";

const c = createClient({
  url: "libsql://radarpro2-smpsandro1239.aws-eu-west-1.turso.io",
  authToken: process.env.TURSO_AUTH_TOKEN!,
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

function parsePrice(text: string): number {
  const match = text.match(/[\d.,]+/);
  if (!match) return 0;
  const clean = match[0].replace(/\./g, "").replace(/,/g, ".");
  const val = parseFloat(clean);
  return isNaN(val) ? 0 : val;
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
  Sentry.addBreadcrumb({
    category: 'scraper',
    message: `source:Casa Sapo, district:${district}`,
    level: 'info',
  });
  try {
    const url = "https://casa.sapo.pt/comprar-apartamentos/" + district.toLowerCase() + "/";
    const res = await fetchWithRetry(url);
    const html = await res.text();
    const $ = cheerioLoad(html);
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
          title,
          price,
          location,
          url: link ? (link.startsWith("http") ? link : "https://casa.sapo.pt" + link) : url,
          source: "Casa Sapo",
          images,
        });
      }
    });
  } catch (error) {
    Sentry.captureException(error, {
      tags: { source: 'Casa Sapo', district: district },
      extra: { error: String(error) },
    });
    console.error("Error scraping Casa Sapo:", error);
  }
  return results;
}

export async function scrapeImovirtual(district: string): Promise<ScrapedProperty[]> {
  const results: ScrapedProperty[] = [];
  Sentry.addBreadcrumb({
    category: 'scraper',
    message: `source:Imovirtual, district:${district}`,
    level: 'info',
  });
  try {
    const url = "https://www.imovirtual.com/pt/resultados/comprar/apartamento/" + district.toLowerCase() + "/";
    const res = await fetchWithRetry(url);
    const html = await res.text();
    const $ = cheerioLoad(html);
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
          title,
          price,
          location,
          url: link ? (link.startsWith("http") ? link : "https://www.imovirtual.com" + link) : url,
          source: "Imovirtual",
          images,
        });
      }
    });
  } catch (error) {
    Sentry.captureException(error, {
      tags: { source: 'Imovirtual', district: district },
      extra: { error: String(error) },
    });
    console.error("Error scraping Imovirtual:", error);
  }
  return results;
}

export async function scrapeIdealista(district: string): Promise<ScrapedProperty[]> {
  const results: ScrapedProperty[] = [];
  Sentry.addBreadcrumb({
    category: 'scraper',
    message: `source:Idealista, district:${district}`,
    level: 'info',
  });
  try {
    const url = "https://www.idealista.pt/comprar-casas/" + district.toLowerCase() + "/";
    const res = await fetchWithRetry(url);
    const html = await res.text();
    const $ = cheerioLoad(html);
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
          title,
          price,
          location,
          url: link ? (link.startsWith("http") ? link : "https://www.idealista.pt" + link) : url,
          source: "Idealista",
          images,
        });
      }
    });
  } catch (error) {
    Sentry.captureException(error, {
      tags: { source: 'Idealista', district: district },
      extra: { error: String(error) },
    });
    console.error("Error scraping Idealista:", error);
  }
  return results;
}

export async function scrapeOLX(district: string): Promise<ScrapedProperty[]> {
  const results: ScrapedProperty[] = [];
  Sentry.addBreadcrumb({
    category: 'scraper',
    message: `source:OLX, district:${district}`,
    level: 'info',
  });
  try {
    const url = "https://www.olx.pt/imoveis/apartamento-casa-a-venda/" + district.toLowerCase() + "/q-barato/";
    const res = await fetchWithRetry(url);
    const html = await res.text();
    const $ = cheerioLoad(html);
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
          title,
          price,
          location,
          url: link ? (link.startsWith("http") ? link : "https://www.olx.pt" + link) : url,
          source: "OLX",
          images,
        });
      }
    });
  } catch (error) {
    Sentry.captureException(error, {
      tags: { source: 'OLX', district: district },
      extra: { error: String(error) },
    });
    console.error("Error scraping OLX:", error);
  }
  return results;
}

export async function scrapeCustoJusto(district: string): Promise<ScrapedProperty[]> {
  const results: ScrapedProperty[] = [];
  Sentry.addBreadcrumb({
    category: 'scraper',
    message: `source:CustoJusto, district:${district}`,
    level: 'info',
  });
  try {
    const url = "https://www.custojusto.pt/" + district.toLowerCase() + "/imoveis";
    const res = await fetchWithRetry(url);
    const html = await res.text();
    const $ = cheerioLoad(html);
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
          title,
          price,
          location,
          url: link ? (link.startsWith("http") ? link : "https://www.custojusto.pt" + link) : url,
          source: "CustoJusto",
          images,
        });
      }
    });
  } catch (error) {
    Sentry.captureException(error, {
      tags: { source: 'CustoJusto', district: district },
      extra: { error: String(error) },
    });
    console.error("Error scraping CustoJusto:", error);
  }
  return results;
}

export async function scrapeELeiloes(district: string): Promise<ScrapedProperty[]> {
  const results: ScrapedProperty[] = [];
  Sentry.addBreadcrumb({
    category: 'scraper',
    message: `source:e-Leiloes, district:${district}`,
    level: 'info',
  });
  try {
    const url = "https://www.e-leiloes.pt/leiloes/imoveis/" + district.toLowerCase() + "/";
    const res = await fetchWithRetry(url);
    const html = await res.text();
    const $ = cheerioLoad(html);
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
          title,
          price,
          location,
          url: link ? (link.startsWith("http") ? link : "https://www.e-leiloes.pt" + link) : url,
          source: "e-Leiloes",
          images,
          isAuction: true,
        });
      }
    });
  } catch (error) {
    Sentry.captureException(error, {
      tags: { source: 'e-Leiloes', district: district },
      extra: { error: String(error) },
    });
    console.error("Error scraping e-Leiloes:", error);
  }
  return results;
}

export async function scrapeAllDistricts(): Promise<ScrapedProperty[]> {
  const sources = ["casasa", "imovirtual", "idealista", "olx", "custojusto", "leiloes"];
  const results: ScrapedProperty[] = [];

  for (const source of sources) {
    try {
      let scraped: ScrapedProperty[] = [];
      if (source === "casasa") scraped = await scrapeCasaSapo("Lisboa");
      else if (source === "imovirtual") scraped = await scrapeImovirtual("Lisboa");
      else if (source === "idealista") scraped = await scrapeIdealista("Lisboa");
      else if (source === "olx") scraped = await scrapeOLX("Lisboa");
      else if (source === "custojusto") scraped = await scrapeCustoJusto("Lisboa");
      else if (source === "leiloes") scraped = await scrapeELeiloes("Lisboa");
      results.push(...scraped);
    } catch (err) {
      console.error("Error scraping " + source + ":", err);
    }
  }
  return results;
}

export async function scrapeImobancos(district: string): Promise<ScrapedProperty[]> {
  const results: ScrapedProperty[] = [];
  Sentry.addBreadcrumb({
    category: 'scraper',
    message: `source:Imobancos, district:${district}`,
    level: 'info',
  });
  try {
    const url = "https://imobancos.pt/imoveis/" + district.toLowerCase() + "/page/1/";
    const res = await fetchWithRetry(url);
    const html = await res.text();
    const $ = cheerioLoad(html);
    $(".property-card, article.property, .result-item, .listing-item").each((_, el) => {
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
          id: "ib-" + district + "-" + price + "-" + title.replace(/\s+/g, "-").toLowerCase().slice(0, 30),
          title,
          price,
          location,
          url: link ? (link.startsWith("http") ? link : "https://imobancos.pt" + link) : url,
          source: "Imobancos",
          images,
        });
      }
    });
  } catch (error) {
    Sentry.captureException(error, {
      tags: { source: 'Imobancos', district: district },
      extra: { error: String(error) },
    });
    console.error("Error scraping Imobancos:", error);
  }
  return results;
}

export async function scrapeMillenniumBCP(district: string): Promise<ScrapedProperty[]> {
  const results: ScrapedProperty[] = [];
  Sentry.addBreadcrumb({
    category: 'scraper',
    message: `source:Millennium BCP, district:${district}`,
    level: 'info',
  });
  try {
    const url = "https://ind.millenniumbcp.pt/pt/Particulares/viver/Imoveis/Pages/imoveis.aspx";
    const res = await fetchWithRetry(url);
    const html = await res.text();
    const $ = cheerioLoad(html);
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
          id: "bcp-" + district + "-" + price + "-" + title.replace(/\s+/g, "-").toLowerCase().slice(0, 30),
          title,
          price,
          location,
          url: link ? (link.startsWith("http") ? link : "https://ind.millenniumbcp.pt" + link) : url,
          source: "Millennium BCP",
          images,
        });
      }
    });
  } catch (error) {
    Sentry.captureException(error, {
      tags: { source: 'Millennium BCP', district: district },
      extra: { error: String(error) },
    });
    console.error("Error scraping Millennium BCP:", error);
  }
  return results;
}

export async function scrapeSantander(district: string): Promise<ScrapedProperty[]> {
  const results: ScrapedProperty[] = [];
  Sentry.addBreadcrumb({
    category: 'scraper',
    message: `source:Santander, district:${district}`,
    level: 'info',
  });
  try {
    const url = "https://www.santander.pt/pt-pt/pessoais/casa-imoveis/comprar/" + district.toLowerCase() + "/";
    const res = await fetchWithRetry(url);
    const html = await res.text();
    const $ = cheerioLoad(html);
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
          id: "santander-" + district + "-" + price + "-" + title.replace(/\s+/g, "-").toLowerCase().slice(0, 30),
          title,
          price,
          location,
          url: link ? (link.startsWith("http") ? link : "https://www.santander.pt" + link) : url,
          source: "Santander",
          images,
        });
      }
    });
  } catch (error) {
    Sentry.captureException(error, {
      tags: { source: 'Santander', district: district },
      extra: { error: String(error) },
    });
    console.error("Error scraping Santander:", error);
  }
  return results;
}

export async function scrapeMontepio(district: string): Promise<ScrapedProperty[]> {
  const results: ScrapedProperty[] = [];
  Sentry.addBreadcrumb({
    category: 'scraper',
    message: `source:Montepio, district:${district}`,
    level: 'info',
  });
  try {
    const url = "https://www.montepio.pt/particulares/imoveis/" + district.toLowerCase() + "/";
    const res = await fetchWithRetry(url);
    const html = await res.text();
    const $ = cheerioLoad(html);
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
          id: "montepio-" + district + "-" + price + "-" + title.replace(/\s+/g, "-").toLowerCase().slice(0, 30),
          title,
          price,
          location,
          url: link ? (link.startsWith("http") ? link : "https://www.montepio.pt" + link) : url,
          source: "Montepio",
          images,
        });
      }
    });
  } catch (error) {
    Sentry.captureException(error, {
      tags: { source: 'Montepio', district: district },
      extra: { error: String(error) },
    });
    console.error("Error scraping Montepio:", error);
  }
  return results;
}

export async function scrapeCaixaImobiliario(district: string): Promise<ScrapedProperty[]> {
  const results: ScrapedProperty[] = [];
  Sentry.addBreadcrumb({
    category: 'scraper',
    message: `source:Caixa Imobiliário, district:${district}`,
    level: 'info',
  });
  try {
    const url = "https://www.caixaimobiliario.pt/comprar/" + district.toLowerCase() + "/";
    const res = await fetchWithRetry(url);
    const html = await res.text();
    const $ = cheerioLoad(html);
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
          id: "cgd-" + district + "-" + price + "-" + title.replace(/\s+/g, "-").toLowerCase().slice(0, 30),
          title,
          price,
          location,
          url: link ? (link.startsWith("http") ? link : "https://www.caixaimobiliario.pt" + link) : url,
          source: "Caixa Imobiliário",
          images,
        });
      }
    });
  } catch (error) {
    Sentry.captureException(error, {
      tags: { source: 'Caixa Imobiliário', district: district },
      extra: { error: String(error) },
    });
    console.error("Error scraping Caixa Imobiliário:", error);
  }
  return results;
}

export async function scrapeCreditoAgricola(district: string): Promise<ScrapedProperty[]> {
  const results: ScrapedProperty[] = [];
  Sentry.addBreadcrumb({
    category: 'scraper',
    message: `source:Crédito Agrícola, district:${district}`,
    level: 'info',
  });
  try {
    const url = "https://www.cai.pt/imoveis/" + district.toLowerCase() + "/";
    const res = await fetchWithRetry(url);
    const html = await res.text();
    const $ = cheerioLoad(html);
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
          id: "cg-" + district + "-" + price + "-" + title.replace(/\s+/g, "-").toLowerCase().slice(0, 30),
          title,
          price,
          location,
          url: link ? (link.startsWith("http") ? link : "https://www.cai.pt" + link) : url,
          source: "Crédito Agrícola",
          images,
        });
      }
    });
  } catch (error) {
    Sentry.captureException(error, {
      tags: { source: 'Crédito Agrícola', district: district },
      extra: { error: String(error) },
    });
    console.error("Error scraping Crédito Agrícola:", error);
  }
  return results;
}

export async function scrapeNovoBanco(district: string): Promise<ScrapedProperty[]> {
  const results: ScrapedProperty[] = [];
  Sentry.addBreadcrumb({
    category: 'scraper',
    message: `source:Novo Banco, district:${district}`,
    level: 'info',
  });
  try {
    const url = "https://www.novobanco.pt/particulares/imoveis/" + district.toLowerCase() + "/";
    const res = await fetchWithRetry(url);
    const html = await res.text();
    const $ = cheerioLoad(html);
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
          id: "novobanco-" + district + "-" + price + "-" + title.replace(/\s+/g, "-").toLowerCase().slice(0, 30),
          title,
          price,
          location,
          url: link ? (link.startsWith("http") ? link : "https://www.novobanco.pt" + link) : url,
          source: "Novo Banco",
          images,
        });
      }
    });
  } catch (error) {
    Sentry.captureException(error, {
      tags: { source: 'Novo Banco', district: district },
      extra: { error: String(error) },
    });
    console.error("Error scraping Novo Banco:", error);
  }
  return results;
}

export async function scrapeBPI(district: string): Promise<ScrapedProperty[]> {
  const results: ScrapedProperty[] = [];
  Sentry.addBreadcrumb({
    category: 'scraper',
    message: `source:BPI Expresso, district:${district}`,
    level: 'info',
  });
  try {
    const url = "https://www.bpiexpressoimobiliario.pt/imoveis/" + district.toLowerCase() + "/";
    const res = await fetchWithRetry(url);
    const html = await res.text();
    const $ = cheerioLoad(html);
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
          id: "bpi-" + district + "-" + price + "-" + title.replace(/\s+/g, "-").toLowerCase().slice(0, 30),
          title,
          price,
          location,
          url: link ? (link.startsWith("http") ? link : "https://www.bpiexpressoimobiliario.pt" + link) : url,
          source: "BPI Expresso",
          images,
        });
      }
    });
  } catch (error) {
    Sentry.captureException(error, {
      tags: { source: 'BPI Expresso', district: district },
      extra: { error: String(error) },
    });
    console.error("Error scraping BPI Expresso:", error);
  }
  return results;
}

export async function scrapeAllBanks(districts: string[] = ["lisboa", "porto", "braga"]): Promise<ScrapedProperty[]> {
  const results: ScrapedProperty[] = [];
  const scrapers = [
    scrapeImobancos,
    scrapeMillenniumBCP,
    scrapeSantander,
    scrapeMontepio,
    scrapeCaixaImobiliario,
    scrapeCreditoAgricola,
    scrapeNovoBanco,
    scrapeBPI,
  ];

  for (const district of districts) {
    for (const scraper of scrapers) {
      try {
        const scraped = await scraper(district);
        results.push(...scraped);
      } catch (err) {
        console.error("Error scraping bank:", err);
      }
    }
  }

  return results;
}
