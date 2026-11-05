/**
 * Scrape OLX Imoveis via HTML publico - standalone (sem imports Next.js/Sentry).
 *   node scripts/scrape-olx-standalone.ts --limit 5 [--dry-run] [--write] [--confirm-remote-write]
 */
import { createClient } from "@libsql/client";
import { existsSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";
import { loadHtml } from "../src/lib/html";

const FETCH_TIMEOUT_MS = 20000;
const FETCH_RETRIES = 3;
const RETRY_DELAY_MS = 2000;
const RATE_LIMIT_MS = 5000;
const OLX_BASE = "https://www.olx.pt";

interface Listing {
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

async function fetchHtml(url: string): Promise<string> {
  for (let attempt = 1; attempt <= FETCH_RETRIES; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    try {
      const res = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
          "Accept-Language": "pt-PT,pt;q=0.9,en;q=0.8",
          "Connection": "keep-alive",
        },
        signal: controller.signal,
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      clearTimeout(timeoutId);
      return await res.text();
    } catch (error) {
      clearTimeout(timeoutId);
      if (attempt === FETCH_RETRIES) throw error;
      await new Promise((r) => setTimeout(r, RETRY_DELAY_MS * attempt));
    }
  }
  return "";
}

function parsePrice(text: string): number {
  const match = text.match(/[\d.,]+/);
  if (!match) return 0;
  const clean = match[0].replace(/\./g, "").replace(/,/g, ".");
  const val = parseFloat(clean);
  return isNaN(val) ? 0 : val;
}

function parseAreaSqm(text: string): number | null {
  const m = text.match(/(\d[\d\s.,]*)\s*m[²2]/i);
  if (!m) return null;
  const value = Number(m[1].replace(/[\s.]/g, "").replace(",", "."));
  return Number.isFinite(value) && value > 0 ? value : null;
}

async function scrapeOlx(district: string, limit: number): Promise<Listing[]> {
  const url = `${OLX_BASE}/imoveis/apartamento-casa-a-venda/${district}/q-barato/`;
  const html = await fetchHtml(url);
  const $ = loadHtml(html);
  const cards = $("[data-cy='l-card'], .listing-item, .offer-item, article");
  const out: Listing[] = [];
  cards.each((_, element) => {
    const $el = $(element);
    const title = $el.find("h3").first().text().trim();
    const priceText = $el.find("[data-testid='ad-price'], [class*='price']").first().text().trim();
    const href = $el.find("a").first().attr("href");
    const images: string[] = [];
    const firstImg = $el.find("img").first();
    const imgSrc = firstImg.attr("src") ?? firstImg.attr("data-src");
    if (imgSrc && imgSrc.startsWith("http")) images.push(imgSrc);
    const price = parsePrice(priceText);
    if (!title || !(price > 0)) return;
    const area = parseAreaSqm($el.text());
    if (out.length >= limit) return;
    out.push({
      source: "OLX",
      district,
      municipality: district,
      title,
      price,
      url: href && href.startsWith("http") ? href : url,
      images,
      areaSqm: area,
    });
  });
  return out;
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

  const listings: Listing[] = [];
  for (const district of DISTRICTS) {
    await new Promise((r) => setTimeout(r, RATE_LIMIT_MS));
    const found = await scrapeOlx(district, limit);
    listings.push(...found);
  }

  console.log(`[olx-standalone] Fonte: ${listings.length} imoveis encontrados (limit=${limit})`);

  if (dryRun) {
    for (const l of listings) {
      console.log(`[DRY] ${l.source} | ${l.district} | ${l.price} | ${l.title}`);
    }
    return 0;
  }

  const { processScrapeResults } = await import("../src/lib/ingest.ts");
  const result = await processScrapeResults(
    listings.map((l) => ({
      id: `olx-${l.district}-${l.price}-${l.title.replace(/\s+/g, "-").toLowerCase().slice(0, 30)}`,
      title: l.title,
      price: l.price,
      location: l.municipality,
      district: l.district,
      url: l.url,
      source: l.source,
      images: l.images,
      areaSqm: l.areaSqm,
    })),
  );
  console.log(`[olx-standalone] Inseridos: ${result.inserted} | Atualizados: ${result.updated} | Skipped: ${result.skipped}`);
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
