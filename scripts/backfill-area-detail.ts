/**
 * Backfill de area_sqm via re-scrape da pagina de detalhe do anuncio.
 *   node scripts/backfill-area-detail.ts [--dry-run] [--write] [--confirm-remote-write] [--limit N] [--delay MS]
 */
import { createClient } from "@libsql/client";
import { existsSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";
import { loadHtml } from "../src/lib/html";

const FETCH_TIMEOUT_MS = 20000;
const FETCH_RETRIES = 2;
const RETRY_DELAY_MS = 2000;
const RATE_LIMIT_MS = 3000;
const BATCH_SIZE = 10;

interface Row {
  id: string;
  url: string;
  source_name: string;
}

const num = (v: unknown): number | null => {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

const str = (v: unknown): string | null => (v === null || v === undefined || v === "" ? null : String(v));

async function fetchText(url: string): Promise<string> {
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

function extractArea(html: string): number | null {
  const text = html.replace(/<[^>]*>/g, " ");
  const m = text.match(/(\d+([.,]\d+)?)\s*m[²2]/i);
  if (!m) return null;
  const value = Number(m[1].replace(/\./g, "").replace(",", "."));
  return Number.isFinite(value) && value > 0 ? value : null;
}

async function main(args: string[]): Promise<number> {
  if (existsSync(".env.local")) {
    process.loadEnvFile(".env.local");
  }
  const dryRun = !args.includes("--write");
  const write = args.includes("--write");
  const confirmRemoteWrite = args.includes("--confirm-remote-write");
  const limitIdx = args.indexOf("--limit");
  const limit = limitIdx >= 0 ? Number(args[limitIdx + 1]) || 20 : 20;
  const delayIdx = args.indexOf("--delay");
  const delayMs = delayIdx >= 0 ? Number(args[delayIdx + 1]) || 3000 : 3000;

  const url = process.env.TURSO_DATABASE_URL ?? `file:${path.resolve(process.cwd(), "local.db")}`;
  const isRemote = url.startsWith("libsql://");
  const client = createClient({ url: process.env.TURSO_DATABASE_URL!, authToken: process.env.TURSO_AUTH_TOKEN ?? "" });

  if (write && isRemote && !confirmRemoteWrite) {
    console.error("[RECUSA] --write contra uma base remota. Usa --confirm-remote-write se for intencional.");
    return 1;
  }

  const rows = await client.execute(
    "SELECT id, url, source_name FROM properties WHERE data_origin='scrape' AND is_active=1 AND area_sqm IS NULL AND url IS NOT NULL",
  );
  const targets = rows.rows
    .filter((r) => str(r.url))
    .slice(0, limit);

  let updated = 0;
  let notFound = 0;
  let noArea = 0;

  for (let i = 0; i < targets.length; i += BATCH_SIZE) {
    const batch = targets.slice(i, i + BATCH_SIZE);
    for (const row of batch) {
      if (delayMs > 0) {
        await new Promise((r) => setTimeout(r, delayMs));
      }
      const rowUrl = str(row.url)!;
      try {
        const html = await fetchText(rowUrl);
        const area = extractArea(html);
        if (area == null) {
          noArea++;
          console.log(`SEM_AREA ${row.id} (${str(row.source_name)}) -> ${rowUrl}`);
          continue;
        }
        if (dryRun) {
          updated++;
          console.log(`[DRY] ${row.id} (${str(row.source_name)}) area=${area}`);
          continue;
        }
        await client.execute({
          sql: "UPDATE properties SET area_sqm = ?, updated_at = ? WHERE id = ?",
          args: [area, Date.now(), row.id],
        });
        updated++;
        console.log(`OK ${row.id} (${str(row.source_name)}) area=${area}`);
      } catch (error) {
        notFound++;
        console.log(`FALHA ${row.id} (${str(row.source_name)}) -> ${String(error instanceof Error ? error.message : error).slice(0, 60)}`);
      }
    }
  }

  console.log(`\nResultado do backfill-area-detail:`);
  console.log(`  Alvos: ${targets.length}`);
  console.log(`  Atualizados: ${updated}`);
  console.log(`  Sem area no conteudo: ${noArea}`);
  console.log(`  Falhas (fetch/erro): ${notFound}`);
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
