/**
 * Ingest de imoveis de bancos via HTML publico - standalone (sem imports Next.js/Sentry).
 *   node scripts/ingest-banks-standalone.ts --limit 5 [--dry-run] [--write] [--confirm-remote-write]
 */
import { createClient } from "@libsql/client";
import { existsSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";
import { loadHtml } from "../src/lib/html.ts";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

interface BankListing {
  source: string;
  district: string;
  municipality: string;
  title: string;
  price: number;
  url: string;
  images: string[];
  areaSqm: number | null;
}

const DISTRICTS = ["lisboa", "porto", "braga"];

const BANK_SOURCES: { source: string; urlFor: (district: string) => string; selector: string }[] = [
  { source: "Casa Sapo", urlFor: (d: string) => `https://casa.sapo.pt/comprar-apartamentos/${d}/`, selector: ".property" },
  { source: "Millennium BCP", urlFor: (_d: string) => "https://ind.millenniumbcp.pt/pt/Particulares/viver/Imoveis/Pages/imoveis.aspx", selector: ".property-card, article.property, .listing-item, .result-item" },
  { source: "Santander", urlFor: (d: string) => `https://www.santander.pt/pt-pt/pessoais/casa-imoveis/comprar/${d}/`, selector: ".property-card, article.property, .listing-item, .result-item" },
  { source: "Montepio", urlFor: (_d: string) => "https://www.montepio.pt/particulares/imoveis/", selector: ".property-card, article.property, .listing-item, .result-item" },
  { source: "Caixa Imobiliario", urlFor: (_d: string) => "https://www.caixaimobiliario.pt/comprar/", selector: ".property-card, article.property, .listing-item, .result-item" },
  { source: "Credito Agricola", urlFor: (_d: string) => "https://www.cai.pt/imoveis/", selector: ".property-card, article.property, .listing-item, .result-item" },
  { source: "Novo Banco", urlFor: (_d: string) => "https://www.novobanco.pt/particulares/imoveis/", selector: ".property-card, article.property, .listing-item, .result-item" },
];

async function fetchHtml(url: string): Promise<string> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "pt-PT,pt;q=0.9,en;q=0.8",
      },
      signal: controller.signal,
    });
    if (!res.ok) return "";
    return await res.text();
  } finally {
    clearTimeout(timeoutId);
  }
}

function parsePrice(text: string): number {
  const cleaned = text.replace(/[^0-9]/g, "");
  const value = Number(cleaned);
  return Number.isFinite(value) ? value : 0;
}

async function scrapeBank(source: string, district: string, limit: number): Promise<BankListing[]> {
  const config = BANK_SOURCES.find((s) => s.source === source);
  if (!config) return [];
  const url = config.urlFor(district);
  const html = await fetchHtml(url);
  if (!html) return [];
  const $ = loadHtml(html);
  const results: BankListing[] = [];
  $("" + config.selector).each((_, el) => {
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
    if (!title || price <= 0) return;
    results.push({
      source,
      district,
      municipality: district.charAt(0).toUpperCase() + district.slice(1),
      title,
      price,
      url: link ? (link.startsWith("http") ? link : url.replace(/\/[^/]*$/, "") + link) : url,
      images,
      areaSqm: null,
    });
    if (results.length >= limit) return;
  });
  return results;
}

export async function main(args: string[]): Promise<number> {
  if (existsSync(".env.local")) {
    process.loadEnvFile(".env.local");
  }
  const dryRun = !args.includes("--write");
  const write = args.includes("--write");
  const confirmRemoteWrite = args.includes("--confirm-remote-write");
  const limitIdx = args.indexOf("--limit");
  const limit = limitIdx >= 0 ? Number(args[limitIdx + 1]) || 5 : 5;

  const url = process.env.TURSO_DATABASE_URL ?? `file:${path.resolve(process.cwd(), "local.db")}`;
  const isRemote = url.startsWith("libsql://");
  const client = createClient({ url: process.env.TURSO_DATABASE_URL!, authToken: process.env.TURSO_AUTH_TOKEN ?? "" });

  if (write && isRemote && !confirmRemoteWrite) {
    console.error("[RECUSA] --write contra uma base remota. Usa --confirm-remote-write se for intencional.");
    return 1;
  }

  const listings: BankListing[] = [];
  for (const source of BANK_SOURCES) {
    for (const district of DISTRICTS) {
      const found = await scrapeBank(source.source, district, limit);
      for (const l of found) listings.push(l);
    }
  }

  console.log(`[banks-standalone] Fonte: ${listings.length} imoveis encontrados (limit=${limit})`);

  if (dryRun) {
    for (const l of listings) {
      console.log(`[DRY] ${l.source} | ${l.district} | ${l.price} | ${l.title}`);
    }
    return 0;
  }

  let inserted = 0;
  for (const l of listings) {
    const hash = 0;
    void hash;
    const id = `${l.source.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${l.district}-${l.price}`;
    const images = JSON.stringify(l.images);
    try {
      await client.execute({
        sql: `INSERT INTO properties (id, source, source_name, url, title, district, municipality, type, price, images, image_url, image_status, is_auction, is_active, data_origin, valuation_confidence) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, 'missing', 0, 1, 'scrape', 'low')`,
        args: [id, l.source === "Casa Sapo" ? "portal" : "banco", l.source, l.url, l.title, l.district, l.municipality, "T2", l.price, images],
      });
      inserted++;
    } catch (e) {
      console.error(`[ERRO] insert ${l.source}:`, e);
    }
  }
  console.log(`[banks-standalone] Inseridos: ${inserted} imoveis.`);
  return 0;
}

const invokedAsScript = process.argv[1] ? pathToFileURL(path.resolve(process.argv[1])).href : "";
if (invokedAsScript === import.meta.url) {
  main(process.argv.slice(2))
    .then((code) => {
      process.exitCode = code;
    })
    .catch((error: unknown) => {
      console.error(`[ERRO] ${error instanceof Error ? error.message : String(error)}`);
      process.exitCode = 1;
    });
}
