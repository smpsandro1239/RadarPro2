/**
 * Backfill de image_url via fetch da pagina do anuncio (og:image).
 *   node scripts/backfill-images.ts [--dry-run] [--write] [--confirm-remote-write] [--limit N] [--source NAME]
 */
import { createClient } from "@libsql/client";
import { existsSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";
import { load } from "cheerio";

const num = (v: unknown): number | null => {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

const str = (v: unknown): string | null => (v === null || v === undefined || v === "" ? null : String(v));

const SELECT_COLUMNS = "id, source, source_name, url, title, district, municipality, type, price, market_value, discount_pct, score, rentability, images, image_url, image_source, image_status, is_auction, auction_type, auction_house, current_bid, opening_bid, reserve_price, max_bid, area_sqm, auction_end_date, auction_start_date, vpt, condominium_debt, renovation_estimate, embargos, hipotecas, cargas_total, annual_income, max_bid_calculation, asset_class, valuation_engine, valuation_confidence, pdm_status, infrastructure, lat, lng, geo_quality, dedup_hash, data_origin, is_active, last_checked, check_status, created_at, updated_at";

async function main(args: string[]): Promise<number> {
  if (existsSync(".env.local")) {
    process.loadEnvFile(".env.local");
  }
  const dryRun = !args.includes("--write");
  const write = args.includes("--write");
  const confirmRemoteWrite = args.includes("--confirm-remote-write");
  const limitIdx = args.indexOf("--limit");
  const limit = limitIdx >= 0 ? Number(args[limitIdx + 1]) || 20 : 20;
  const sourceIdx = args.indexOf("--source");
  const sourceFilter = sourceIdx >= 0 ? args[sourceIdx + 1] : null;

  const url = process.env.TURSO_DATABASE_URL ?? `file:${path.resolve(process.cwd(), "local.db")}`;
  const isRemote = url.startsWith("libsql://");
  const client = createClient({ url: process.env.TURSO_DATABASE_URL!, authToken: process.env.TURSO_AUTH_TOKEN ?? "" });

  if (write && isRemote && !confirmRemoteWrite) {
    console.error("[RECUSA] --write contra uma base remota. Usa --confirm-remote-write se for intencional.");
    return 1;
  }

  const rows = await client.execute(
    `SELECT ${SELECT_COLUMNS} FROM properties WHERE is_active = 1`,
  );
  const withoutImg = rows.rows.filter((r) => !str(r.image_url) || String(r.image_url).length < 10);
  const targets = sourceFilter
    ? withoutImg.filter((r) => str(r.source_name) === sourceFilter)
    : withoutImg;

  let updated = 0;
  let skipped = 0;
  let failed = 0;

  const prioritySources = ["Casa Sapo", "Imovirtual", "Bidizi", "Idealista", "OLX", "Martelo.pt", "RE/MAX", "Century 21", "KW Portugal", "e-Leilões", "SuperCasa", "BPI Expresso"];

  for (const source of prioritySources) {
    const rowsOfSource = targets.filter((r) => str(r.source_name) === source).slice(0, limit);
    if (rowsOfSource.length === 0) continue;

    console.log(`\nProcessando ${rowsOfSource.length} imóveis de ${source}...`);

    for (const row of rowsOfSource) {
      const rowUrl = str(row.url);
      if (!rowUrl || !rowUrl.startsWith("http")) {
        skipped++;
        continue;
      }

      try {
        const res = await fetch(rowUrl, {
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
            "Accept-Language": "pt-PT,pt;q=0.9",
            "Referer": "https://www.google.com/",
          },
        });

        if (!res.ok) {
          skipped++;
          continue;
        }

        const html = await res.text();
        const $ = load(html);
        let image_url: string | null = null;

        const ogImage = $("meta[property=\"og:image\"]").attr("content");
        if (ogImage) {
          image_url = ogImage.startsWith("http") ? ogImage : new URL(ogImage, rowUrl).href;
        }

        if (!image_url) {
          $("img").each((_: any, img: any) => {
            if (!image_url) {
              const src = $(img).attr("src") || $(img).attr("data-src");
              if (src && src.startsWith("http") && !src.includes("placeholder")) {
                image_url = src.startsWith("http") ? src : new URL(src, rowUrl).href;
              }
            }
          });
        }

        if (image_url) {
          if (!dryRun) {
            await client.execute({
              sql: "UPDATE properties SET image_url = ?, updated_at = ? WHERE id = ?",
              args: [image_url, Date.now(), row.id],
            });
          }
          updated++;
          console.log(`✓ ${str(row.title)}: ${image_url.substring(0, 80)}...`);
        } else {
          skipped++;
        }
      } catch (err) {
        failed++;
        console.error(`Erro ${rowUrl}:`, err instanceof Error ? err.message : String(err));
      }
    }
  }

  console.log(`\nResultado:`);
  console.log(`  Total sem imagem: ${withoutImg.length}`);
  console.log(`  Processados para atualizar: ${updated}`);
  console.log(`  Sem imagem encontrada: ${skipped}`);
  console.log(`  Erros: ${failed}`);
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
