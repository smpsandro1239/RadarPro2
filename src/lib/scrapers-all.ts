import { createClient } from "@libsql/client";

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
  throw new Error(`Failed to fetch ${url} after ${retries} retries`);
}

function parsePrice(text: string): number | null {
  const match = text.match(/[\d.,]+/);
  if (!match) return null;
  const clean = match[0].replace(/\./g, "").replace(/,/g, ".");
  const val = parseFloat(clean);
  return isNaN(val) ? null : val;
}

export async function scrapeImobancos(district: string): Promise<any[]> {
  const results = [];
  try {
    const url = `https://imobancos.pt/imoveis/${district.toLowerCase()}/page/1/`;
    const res = await fetchWithRetry(url);
    const html = await res.text();
    const $ = cheerio.load(html);
    
    $(".property-card, article.property, .result-item, .listing-item, .property-card").each((_, el) => {
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
          id: `ib-${district}-${price}-${title.replace(/\s+/g, "-").toLowerCase().slice(0, 30)}`,
          title,
          price,
          location,
          url: link ? (link.startsWith("http") ? link : `https://imobancos.pt${link}`) : url,
          source: "imobancos",
          images,
        });
      }
    });
  } catch (error) {
    console.error("Error scraping Imobancos:", error);
  }
  return results;
}

export async function scrapeMillenniumBCP(district: string): Promise<ScrapedProperty[]> {
  const results: ScrapedProperty[] = [];
  try {
    const url = `https://ind.millenniumbcp.pt/pt/Particulares/viver/Imoveis/Pages/imoveis.aspx`;
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
          id: `bcp-${district}-${price}-${title.replace(/\s+/g, "-").toLowerCase().slice(0, 30)}`,
          title,
          price,
          location,
          url: link ? (link.startsWith("http") ? link : `https://ind.millenniumbcp.pt${link}`) : url,
          source: "Millennium BCP",
          images,
        });
      }
    });
  } catch (error) {
    console.error("Error scraping Millennium BCP:", error);
  }
  return results;
}

export async function scrapeSantander(district: string): Promise<ScrapedProperty[]> {
  const results: ScrapedProperty[] = [];
  try {
    const url = `https://www.santander.pt/pt-pt/pessoais/casa-imoveis/comprar/${district.toLowerCase()}/`;
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
          id: `santander-${district}-${price}-${title.replace(/\s+/g, "-").toLowerCase().slice(0, 30)}`,
          title,
          price,
          location,
          url: link ? (link.startsWith("http") ? link : `https://www.santander.pt${link}`) : url,
          source: "Santander",
          images,
        });
      }
    });
  } catch (error) {
    console.error("Error scraping Santander:", error);
  }
  return results;
}

export async function scrapeMontepio(district: string): Promise<ScrapedProperty[]> {
  const results: ScrapedProperty[] = [];
  try {
    const url = `https://www.montepio.pt/particulares/imoveis/${district.toLowerCase()}/`;
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
          id: `montepio-${district}-${price}-${title.replace(/\s+/g, "-").toLowerCase().slice(0, 30)}`,
          title,
          price,
          location,
          url: link ? (link.startsWith("http") ? link : `https://www.montepio.pt${link}`) : url,
          source: "Montepio",
          images,
        });
      }
    });
  } catch (error) {
    console.error("Error scraping Montepio:", error);
  }
  return results;
}

export async function scrapeCaixaImobiliario(district: string): Promise<ScrapedProperty[]> {
  const results: ScrapedProperty[] = [];
  try {
    const url = `https://www.caixaimobiliario.pt/comprar/${district.toLowerCase()}/`;
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
          id: `cgd-${district}-${price}-${title.replace(/\s+/g, "-").toLowerCase().slice(0, 30)}`,
          title,
          price,
          location,
          url: link ? (link.startsWith("http") ? link : `https://www.caixaimobiliario.pt${link}`) : url,
          source: "Caixa Imobiliário",
          images,
        });
      }
    });
  } catch (error) {
    console.error("Error scraping Caixa Imobiliário:", error);
  }
  return results;
}

export async function scrapeCreditoAgricola(district: string): Promise<ScrapedProperty[]> {
  const results: ScrapedProperty[] = [];
  try {
    const url = `https://www.cai.pt/imoveis/${district.toLowerCase()}/`;
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
          id: `cg-${district}-${price}-${title.replace(/\s+/g, "-").toLowerCase().slice(0, 30)}`,
          title,
          price,
          location,
          url: link ? (link.startsWith("http") ? link : `https://www.cai.pt${link}`) : url,
          source: "Crédito Agrícola",
          images,
        });
      }
    });
  } catch (error) {
    console.error("Error scraping Crédito Agrícola:", error);
  }
  return results;
}

export async function scrapeNovoBanco(district: string): Promise<ScrapedProperty[]> {
  const results: ScrapedProperty[] = [];
  try {
    const url = `https://www.novobanco.pt/particulares/imoveis/${district.toLowerCase()}/`;
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
          id: `novobanco-${district}-${price}-${title.replace(/\s+/g, "-").toLowerCase().slice(0, 30)}`,
          title,
          price,
          location,
          url: link ? (link.startsWith("http") ? link : `https://www.novobanco.pt${link}`) : url,
          source: "Novo Banco",
          images,
        });
      }
    });
  } catch (error) {
    console.error("Error scraping Novo Banco:", error);
  }
  return results;
}

export async function scrapeBPI(district: string): Promise<ScrapedProperty[]> {
  const results: ScrapedProperty[] = [];
  try {
    const url = `https://www.bpiexpressoimobiliario.pt/imoveis/${district.toLowerCase()}/`;
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
          id: `bpi-${district}-${price}-${title.replace(/\s+/g, "-").toLowerCase().slice(0, 30)}`,
          title,
          price,
          location,
          url: link ? (link.startsWith("http") ? link : `https://www.bpiexpressoimobiliario.pt${link}`) : url,
          source: "BPI Expresso",
          images,
        });
      }
    });
  } catch (error) {
    console.error("Error scraping BPI Expresso:", error);
  }
  return results;
}

export async function scrapeAllBanks(districts: string[] = ["lisboa", "porto", "braga"]): Promise<ScrapedProperty[]> {
  const results: ScrapedProperty[] = [];
  
  const scrapers = [
    scrapeCasaSapo,
    scrapeImovirtual,
    scrapeIdealista,
    scrapeOLX,
    scrapeCustoJusto,
    scrapeELeiloes,
    scrapeImobancos,
    scrapeMillenniumBCP,
    scrapeSantander,
    scrapeMontepio,
    scrapeCaixaImobiliario,
    scrapeCreditoAgricola,
    scrapeNovoBanco,
    scrapeBPI,
  ];

  for (const scraper of [scrapeCasaSapo, scrapeImovirtual, scrapeIdealista, scrapeOLX, scrapeCustoJusto, scrapeELeiloes, scrapeImobancos, scrapeMillenniumBCP, scrapeSantander, scrapeMontepio, scrapeCaixaImobiliario, scrapeCreditoAgricola, scrapeNovoBanco, scrapeBPI]) {
    try {
      const results = await scraper(district);
      allScraped.push(...results);
    } catch (err) {
      console.error(`Error scraping ${source}:`, err);
    }
  }

  return allScrapedProperties;
}