/**
 * Check de alteracoes de preco/lance para imoveis scrape ativos.
 *   node scripts/check-price-changes-standalone.ts [--limit N] [--delay MS] [--dry-run] [--write] [--confirm-remote-write]
 *
 * Fase 3: verifica leiloes com fim previsto < 24h; para cada um, faz fetch do
 * anuncio, extrai lance atual e regista alteracao em price_history se mudou.
 */
import { createClient } from "@libsql/client";
import { existsSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";

const FETCH_TIMEOUT_MS = 20000;
const FETCH_RETRIES = 2;
const RETRY_DELAY_MS = 2000;

async function fetchHtml(url: string): Promise<string> {
  for (let attempt = 1; attempt <= FETCH_RETRIES; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    try {
      const res = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          Accept: "text/html,application/xhtml+xml,*/*;q=0.8",
          "Accept-Language": "pt-PT,pt;q=0.9,en;q=0.8",
          Referer: "https://www.google.com/",
        },
        signal: controller.signal,
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const text = await res.text();
      clearTimeout(timeoutId);
      return text;
    } catch (error) {
      clearTimeout(timeoutId);
      if (attempt === FETCH_RETRIES) throw error;
      await new Promise((r) => setTimeout(r, RETRY_DELAY_MS * attempt));
    }
  }
  return "";
}

function extractPrice(html: string): number | null {
  const matches = html.match(/([\d.,]{4,}\d*)\s*(?:€|EUR|eur|euro)/i);
  if (!matches) return null;
  const value = Number(matches[1].replace(/[.\s]/g, "").replace(",", "."));
  return Number.isFinite(value) && value > 0 ? value : null;
}

async function main(): Promise<number> {
  if (existsSync(".env.local")) process.loadEnvFile(".env.local");
  const write = process.argv.includes("--write") && process.argv.includes("--confirm-remote-write");
  const confirmRemoteWrite = process.argv.includes("--confirm-remote-write");
  const limitIdx = process.argv.indexOf("--limit");
  const limit = limitIdx >= 0 ? Number(process.argv[limitIdx + 1]) || 20 : 20;
  const delayIdx = process.argv.indexOf("--delay");
  const delayMs = delayIdx >= 0 ? Number(process.argv[delayIdx + 1]) || 5000 : 5000;

  const url = process.env.TURSO_DATABASE_URL ?? `file:${path.resolve(process.cwd(), "local.db")}`;
  const isRemote = url.startsWith("libsql://");
  const client = createClient({ url: process.env.TURSO_DATABASE_URL!, authToken: process.env.TURSO_AUTH_TOKEN ?? "" });

  if (write && isRemote && !confirmRemoteWrite) {
    console.error("[RECUSA] --write contra uma base remota. Usa --confirm-remote-write se for intencional.");
    return 1;
  }

  const now = Date.now();
  const rows = await client.execute({
    sql: "SELECT id, url, source_name, price, current_bid, auction_end_date FROM properties WHERE data_origin='scrape' AND is_active=1 AND is_auction=1 AND auction_end_date IS NOT NULL AND auction_end_date > ? AND auction_end_date < ?",
    args: [now, now + 24 * 3600 * 1000],
  });

  let checked = 0;
  let changed = 0;
  const results: Array<{ id: string; found: boolean; price: number | null }> = [];

  for (const r of rows.rows) {
    if (results.length >= limit) break;
    checked++;
    const id = String(r.id);
    const propUrl = String(r.url);
    let lance: number | null = null;
    try {
      const html = await fetchHtml(propUrl);
      lance = extractPrice(html);
    } catch (e) {
      results.push({ id, found: false, price: null });
      if (write) {
        await client.execute({
          sql: "INSERT INTO price_history (id, property_id, price, market_value, recorded_at) VALUES (?, ?, ?, NULL, ?)",
          args: [crypto.randomUUID(), id, Number(r.current_bid ?? r.price ?? 0), Math.floor(Date.now() / 1000)],
        });
      }
      continue;
    }
    results.push({ id, found: true, price: lance });
    const oldBid = Number(r.current_bid ?? 0);
    const newBid = lance ?? oldBid;
    if (newBid > 0 && newBid !== oldBid) {
      changed++;
      if (write) {
        await client.execute({
          sql: "INSERT INTO price_history (id, property_id, price, market_value, recorded_at) VALUES (?, ?, ?, NULL, ?)",
          args: [crypto.randomUUID(), id, newBid, Math.floor(Date.now() / 1000)],
        });
      }
    }
    await new Promise((r2) => setTimeout(r2, delayMs));
  }

  console.log(`[check-price-changes] Leiloes <24h: ${rows.rows.length} | checked: ${checked} | mudancas: ${changed}`);
  for (const r of results) {
    console.log(`[CHECK] ${r.id} found=${r.found} lance=${r.price}`);
  }
  return 0;
}

const invokedAsScript = process.argv[1] ? pathToFileURL(path.resolve(process.argv[1])).href : "";
if (invokedAsScript === import.meta.url) {
  main()
    .then((code) => {
      process.exitCode = code;
    })
    .catch((error: unknown) => {
      console.error(`[ERRO] ${error instanceof Error ? error.message : String(error)}`);
      process.exitCode = 1;
    });
}
