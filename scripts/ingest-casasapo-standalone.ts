/**
 * Ingest de imoveis da Casa Sapo via HTML publico - standalone (sem imports Next.js/Sentry).
 *   node scripts/ingest-casasapo-standalone.ts --limit 5 [--dry-run] [--write] [--confirm-remote-write]
 */
import { createClient } from "@libsql/client";
import { existsSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";
import { parseCasaSapoListings } from "../src/lib/portal-parsers.ts";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

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

const FETCH_TIMEOUT_MS = 20000;
const FETCH_RETRIES = 3;
const RETRY_DELAY_MS = 2000;
const RATE_LIMIT_MS = 5000;

async function fetchHtml(url: string): Promise<string> {
  for (let attempt = 1; attempt <= FETCH_RETRIES; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    try {
      const res = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "pt-PT,pt;q=0.9,en;q=0.8",
          "Referer": "https://www.google.com/",
          "DNT": "1",
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
  const cleaned = text.replace(/[^0-9]/g, "");
  const value = Number(cleaned);
  return Number.isFinite(value) ? value : 0;
}

async function scrapeCasaSapo(district: string, limit: number): Promise<Listing[]> {
  const url = `https://casa.sapo.pt/comprar-apartamentos/${district}/`;
  const html = await fetchHtml(url);
  const results: Listing[] = [];
  const listings = parseCasaSapoListings(html);
  for (const l of listings) {
    if (!l.title || !(l.price > 0)) continue;
    results.push({
      source: "Casa Sapo",
      district,
      municipality: district.charAt(0).toUpperCase() + district.slice(1),
      title: l.title,
      price: l.price,
      url: l.url,
      images: l.images,
      areaSqm: l.areaSqm,
    });
    if (results.length >= limit) return results;
  }
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
  const delayIdx = args.indexOf("--delay");
  const delayMs = delayIdx >= 0 ? Number(args[delayIdx + 1]) || 15000 : 15000;

  const url = process.env.TURSO_DATABASE_URL ?? `file:${path.resolve(process.cwd(), "local.db")}`;
  const isRemote = url.startsWith("libsql://");
  const client = createClient({ url: process.env.TURSO_DATABASE_URL!, authToken: process.env.TURSO_AUTH_TOKEN ?? "" });

  if (write && isRemote && !confirmRemoteWrite) {
    console.error("[RECUSA] --write contra uma base remota. Usa --confirm-remote-write se for intencional.");
    return 1;
  }

  const listings: Listing[] = [];
  for (const district of DISTRICTS) {
    await new Promise((r) => setTimeout(r, delayMs));
    const found = await scrapeCasaSapo(district, limit);
    for (const l of found) listings.push(l);
  }

  console.log(`[casasapo-standalone] Fonte: ${listings.length} imoveis encontrados (limit=${limit})`);

  if (dryRun) {
    for (const l of listings) {
      console.log(`[DRY] ${l.source} | ${l.district} | ${l.price} | ${l.title}`);
    }
    return 0;
  }

  let inserted = 0;
  for (const l of listings) {
    const id = `${l.source.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${l.district}-${l.price}`;
    const images = JSON.stringify(l.images);
    try {
      await client.execute({
        sql: `INSERT INTO properties (id, source, source_name, url, title, district, municipality, type, price, images, image_url, image_status, is_auction, is_active, data_origin, valuation_confidence) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, 'missing', 0, 1, 'scrape', 'low')`,
        args: [id, "portal", l.source, l.url, l.title, l.district, l.municipality, "T2", l.price, images],
      });
      inserted++;
    } catch (e) {
      console.error(`[ERRO] insert ${l.source}:`, e);
    }
  }
  console.log(`[casasapo-standalone] Inseridos: ${inserted} imoveis.`);
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
