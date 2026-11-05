/**
 * Backfill de asset_class (e valuation_engine/confidence derivados) nos imoveis scrape ativos com asset_class null.
 *   node scripts/backfill-asset-class.ts [--dry-run] [--write] [--confirm-remote-write]
 */
import { createClient } from "@libsql/client";
import { existsSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";
import { deriveAssetClass } from "../src/lib/valuation/classify";
import type { AssetClass, PropertyInput } from "../src/lib/valuation/types";

const num = (v: unknown): number | null => {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

const str = (v: unknown): string | null => (v === null || v === undefined || v === "" ? null : String(v));

function deriveValEngine(assetClass: AssetClass): string {
  switch (assetClass) {
    case "urban_land":
      return "urban_land";
    case "rural_land":
      return "rural_land";
    case "commercial":
      return "commercial";
    case "garage":
      return "garage";
    case "mixed":
      return "none";
    case "apartment":
    case "house":
    default:
      return "hedonic";
  }
}

function deriveValConf(assetClass: AssetClass, district: string | null): string {
  switch (assetClass) {
    case "commercial":
    case "mixed":
    case "urban_land":
    case "rural_land":
    case "garage":
      return "low";
    default:
      return district ? "medium" : "low";
  }
}

async function main(args: string[]): Promise<number> {
  if (existsSync(".env.local")) {
    process.loadEnvFile(".env.local");
  }
  const dryRun = !args.includes("--write");
  const write = args.includes("--write");
  const confirmRemoteWrite = args.includes("--confirm-remote-write");

  const url = process.env.TURSO_DATABASE_URL ?? `file:${path.resolve(process.cwd(), "local.db")}`;
  const isRemote = url.startsWith("libsql://");
  const client = createClient({ url: process.env.TURSO_DATABASE_URL!, authToken: process.env.TURSO_AUTH_TOKEN ?? "" });

  if (write && isRemote && !confirmRemoteWrite) {
    console.error("[RECUSA] --write contra uma base remota. Usa --confirm-remote-write se for intencional.");
    return 1;
  }

  const rows = await client.execute(
    "SELECT id, title, type, district, municipality, price, area_sqm, is_auction, asset_class FROM properties WHERE data_origin='scrape' AND is_active=1 AND asset_class IS NULL",
  );

  let updated = 0;
  let skipped = 0;
  const changes: Array<{ id: string; title: string; type: string; district: string; municipality: string; oldAssetClass: string | null; newAssetClass: string }> = [];

  for (const row of rows.rows) {
    const input: PropertyInput = {
      id: String(row.id),
      title: str(row.title),
      type: str(row.type),
      assetClass: null,
      district: str(row.district),
      municipality: str(row.municipality),
      parish: null,
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
      auctionType: null,
      currentBid: null,
      marketValue: null,
      auctionHouse: null,
      vpt: null,
      condominiumDebt: null,
      renovationEstimate: null,
      embargos: null,
      hipotecas: null,
      cargasTotal: null,
      pdmStatus: null,
      infrastructure: null,
      topography: null,
      roadFrontageMeters: null,
      landUse: null,
      annualIncome: null,
      capRate: null,
      annualRent: null,
      yieldPct: null,
      marketCapRate: null,
    };
    const result = deriveAssetClass(input);
    const assetClass = result.assetClass;
    if (assetClass === "mixed") {
      skipped++;
      continue;
    }
    if (!dryRun) {
      await client.execute({
        sql: "UPDATE properties SET asset_class = ?, valuation_engine = ?, valuation_confidence = ?, updated_at = ? WHERE id = ?",
        args: [assetClass, deriveValEngine(assetClass), deriveValConf(assetClass, str(row.district)), Date.now(), row.id],
      });
    }
    updated++;
    changes.push({
      id: String(row.id),
      title: str(row.title) ?? "",
      type: str(row.type) ?? "",
      district: str(row.district) ?? "",
      municipality: str(row.municipality) ?? "",
      oldAssetClass: null,
      newAssetClass: assetClass,
    });
  }

  console.log(`\nResultado do backfill-asset-class:`);
  console.log(`  Alvos (asset_class null, scrape, ativos): ${rows.rows.length}`);
  console.log(`  Atualizados: ${updated}`);
  console.log(`  Pulados (mixed): ${skipped}`);
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
