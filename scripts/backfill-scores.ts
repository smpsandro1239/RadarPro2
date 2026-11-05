/**
 * Backfill de score via motor de avaliacao (AVM / max bid) nos imoveis scrape ativos.
 *   node scripts/backfill-scores.ts [--dry-run] [--write] [--confirm-remote-write]
 */
import { createClient } from "@libsql/client";
import { existsSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";
import { evaluateProperty } from "../src/lib/valuation/index";
import type { AssetClass, PropertyInput } from "../src/lib/valuation/types";

const num = (v: unknown): number | null => {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

const str = (v: unknown): string | null => (v === null || v === undefined || v === "" ? null : String(v));

async function main(args: string[]): Promise<number> {
  if (existsSync(".env.local")) {
    process.loadEnvFile(".env.local");
  }
  const dryRun = !args.includes("--write");
  const write = args.includes("--write");
  const confirmRemoteWrite = args.includes("--confirm-remote-write");
  const limitIdx = args.indexOf("--limit");
  const limit = limitIdx >= 0 ? Number(args[limitIdx + 1]) || 20 : 20;

  const url = process.env.TURSO_DATABASE_URL ?? `file:${path.resolve(process.cwd(), "local.db")}`;
  const isRemote = url.startsWith("libsql://");
  const client = createClient({ url: process.env.TURSO_DATABASE_URL!, authToken: process.env.TURSO_AUTH_TOKEN ?? "" });

  if (write && isRemote && !confirmRemoteWrite) {
    console.error("[RECUSA] --write contra uma base remota. Usa --confirm-remote-write se for intencional.");
    return 1;
  }

  const rows = await client.execute(
    "SELECT id, source, source_name, title, district, municipality, type, price, market_value, discount_pct, score, rentability, images, image_url, image_source, image_status, is_auction, auction_type, auction_house, current_bid, opening_bid, reserve_price, max_bid, area_sqm, auction_end_date, auction_start_date, vpt, condominium_debt, renovation_estimate, embargos, hipotecas, cargas_total, annual_income, max_bid_calculation, asset_class, valuation_engine, valuation_confidence, pdm_status, infrastructure, lat, lng, geo_quality, dedup_hash, data_origin, is_active, last_checked, check_status, created_at, updated_at FROM properties WHERE is_active = 1",
  );
  const targets = rows.rows.slice(0, limit);

  let updated = 0;
  let unchanged = 0;
  let skipped = 0;

  for (const row of targets) {
    try {
      const input: PropertyInput = {
        id: row.id ? String(row.id) : null,
        title: str(row.title),
        type: str(row.type),
        assetClass: (row.asset_class ? String(row.asset_class) : null) as AssetClass | null,
        district: str(row.district),
        municipality: str(row.municipality),
        parish: str(row.parish),
        price: num(row.price),
        sqm: num(row.area_sqm),
        floor: null,
        totalFloors: null,
        orientation: null,
        condition: null,
        energyCert: null,
        hasGarage: false,
        hasElevator: false,
        hasView: false,
        isAuction: row.is_auction === 1,
        auctionType: str(row.auction_type),
        currentBid: num(row.current_bid),
        marketValue: num(row.market_value),
        auctionHouse: str(row.auction_house),
        vpt: num(row.vpt),
        condominiumDebt: num(row.condominium_debt) ?? 0,
        renovationEstimate: num(row.renovation_estimate) ?? 0,
        embargos: num(row.embargos),
        hipotecas: num(row.hipotecas),
        cargasTotal: num(row.cargas_total),
        pdmStatus: str(row.pdm_status),
        infrastructure: str(row.infrastructure),
        topography: null,
        roadFrontageMeters: null,
        landUse: null,
        annualIncome: num(row.annual_income),
        capRate: null,
        annualRent: null,
        yieldPct: null,
        marketCapRate: null,
      };

      const result = row.is_auction ? evaluateProperty({ ...input, isAuction: true }) : evaluateProperty(input);
      const newScore = result.score;
      const newMarketValue = row.is_auction ? num(result.breakdown["marketValue"]) : result.valuation;

      if (newScore !== null && (newScore !== num(row.score) || newMarketValue !== num(row.market_value))) {
        if (dryRun) {
          updated++;
          continue;
        }
        await client.execute({
          sql: "UPDATE properties SET score = ?, market_value = ?, updated_at = ? WHERE id = ?",
          args: [newScore, newMarketValue, Date.now(), row.id],
        });
        updated++;
      } else {
        unchanged++;
      }
    } catch (err) {
      console.error(`Erro a processar ${row.id} (${row.title}):`, err);
      skipped++;
    }
  }

  console.log(`\nResultado do backfill:`);
  console.log(`  Total imóveis: ${targets.length}`);
  console.log(`  Scores atualizados: ${updated}`);
  console.log(`  Inalterados: ${unchanged}`);
  console.log(`  Erros: ${skipped}`);
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
