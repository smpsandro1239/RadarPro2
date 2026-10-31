/**
 * RadarPro Portugal - Backfill de classificação nos 212 imóveis existentes
 *
 * Corre a inferência de asset_class já escrita em src/lib/ingest.ts contra os
 * registos existentes, preenchendo asset_class, valuation_engine,
 * valuation_confidence, pdm_status e infrastructure.
 *
 * Nunca sobrescreve campos já preenchidos — só preenche null.
 *
 * Executa com: npx tsx --env-file=.env.local scripts/backfill-classification.ts
 */

import { db } from "../src/db/index";
import { properties } from "../src/db/schema";
import { eq, and } from "drizzle-orm";
import { inferAssetClass } from "../src/lib/ingest";
import { findMarketData } from "../src/lib/market-data";
import { writeFileSync, mkdirSync, existsSync } from "fs";
import { join } from "path";

const DATE = new Date().toISOString().split("T")[0];
const BENCH_DIR = join(process.cwd(), "benchmarks");
const OUT_FILE = join(BENCH_DIR, `backfill-${DATE}.json`);

if (!existsSync(BENCH_DIR)) {
  mkdirSync(BENCH_DIR, { recursive: true });
}

interface BackfillChange {
  id: string;
  title: string;
  type: string;
  district: string;
  municipality: string;
  oldAssetClass: string | null;
  newAssetClass: string;
  oldValEngine: string | null;
  newValEngine: string;
  oldValConf: string | null;
  newValConf: string;
  changed: string[]; // nomes dos campos que mudaram
}

interface AuctionReclassification {
  id: string;
  title: string;
  type: string;
  newAssetClass: string;
}

function deriveValEngine(assetClass: string): string {
  switch (assetClass) {
    case "apartment":
    case "house":
      return "hedonic";
    case "urban_land":
      return "land_urban";
    case "rural_land":
      return "land_rural";
    case "commercial":
    case "garage":
      return "income";
    case "mixed":
      return "pending_review";
    default:
      return "pending_review";
  }
}

function deriveValConf(
  assetClass: string,
  district: string,
  municipality: string,
): string {
  const marketData = findMarketData({
    district,
    municipality,
    propertyType: assetClass as
      | "apartment"
      | "house"
      | "urban_land"
      | "rural_land"
      | "commercial",
  });
  if (!marketData) return "very_low";
  switch (marketData.level) {
    case "parish":
      return "high";
    case "municipality":
      return "medium";
    case "district":
      return "low";
    default:
      return "very_low";
  }
}

async function main() {
  console.log("A ler imóveis ativos da BD...");

  const rows = await db
    .select()
    .from(properties)
    .where(eq(properties.isActive, true));

  console.log(`Total de imóveis ativos: ${rows.length}\n`);

  const changes: BackfillChange[] = [];
  const auctionReclassifications: AuctionReclassification[] = [];
  const assetClassAfter: Record<string, number> = {};
  let pendingReview = 0;

  for (const row of rows) {
    const oldAssetClass = row.assetClass;
    const oldValEngine = row.valuationEngine;
    const oldValConf = row.valuationConfidence;

    // Só preencher se asset_class for null
    if (oldAssetClass !== null) {
      // Já preenchido — não sobrescrever
      assetClassAfter[oldAssetClass] = (assetClassAfter[oldAssetClass] || 0) + 1;
      continue;
    }

    const inferred = inferAssetClass(row.type, row.title);
    const newAssetClass = inferred.assetClass;
    const newValEngine = deriveValEngine(newAssetClass);
    const newValConf = deriveValConf(
      newAssetClass,
      row.district,
      row.municipality,
    );

    const changed: string[] = [];
    if (oldAssetClass !== newAssetClass) changed.push("asset_class");
    if (oldValEngine !== newValEngine) changed.push("valuation_engine");
    if (oldValConf !== newValConf) changed.push("valuation_confidence");

    // pdm_status e infrastructure para urban_land
    if (newAssetClass === "urban_land") {
      if (row.pdmStatus === null) {
        changed.push("pdm_status");
      }
      if (row.infrastructure === null) {
        changed.push("infrastructure");
      }
    }

    if (newAssetClass === "mixed") {
      pendingReview++;
    }

    // Detectar leilões reclassificados de apartment para outra coisa
    if (row.isAuction === true && newAssetClass !== "apartment") {
      auctionReclassifications.push({
        id: row.id,
        title: row.title,
        type: row.type,
        newAssetClass,
      });
    }

    // Atualizar na BD
    await db
      .update(properties)
      .set({
        assetClass: newAssetClass,
        valuationEngine: newValEngine,
        valuationConfidence: newValConf,
        pdmStatus:
          newAssetClass === "urban_land" && row.pdmStatus === null
            ? "unknown"
            : row.pdmStatus,
        infrastructure:
          newAssetClass === "urban_land" && row.infrastructure === null
            ? "unknown"
            : row.infrastructure,
        updatedAt: new Date(),
      })
      .where(eq(properties.id, row.id));

    changes.push({
      id: row.id,
      title: row.title,
      type: row.type,
      district: row.district,
      municipality: row.municipality,
      oldAssetClass,
      newAssetClass,
      oldValEngine,
      newValEngine,
      oldValConf,
      newValConf,
      changed,
    });

    assetClassAfter[newAssetClass] = (assetClassAfter[newAssetClass] || 0) + 1;
  }

  // Contar os que já tinham asset_class (para o total depois)
  // assetClassAfter já inclui tanto os já preenchidos como os novos

  const total = rows.length;
  const newlyClassified = changes.length;

  // Resumo
  const lines: string[] = [];
  lines.push("=== BACKFILL DE CLASSIFICAÇÃO ===");
  lines.push(`Data: ${new Date().toISOString()}`);
  lines.push(`Total de imóveis ativos: ${total}`);
  lines.push(`Novamente classificados (eram null): ${newlyClassified}`);
  lines.push(
    `Já tinham asset_class preenchido: ${total - newlyClassified}`,
  );
  lines.push("");

  lines.push("--- Distribuição de asset_class APÓS backfill ---");
  for (const [k, v] of Object.entries(assetClassAfter).sort(
    (a, b) => b[1] - a[1],
  )) {
    lines.push(`  ${k}: ${v} (${((v / total) * 100).toFixed(1)}%)`);
  }
  lines.push("");

  lines.push(`--- pending_review (mixed): ${pendingReview} ---`);
  lines.push("");

  lines.push("--- Leilões reclassificados (eram apartment, agora outro tipo) ---");
  for (const a of auctionReclassifications.slice(0, 5)) {
    lines.push(
      `  ${a.newAssetClass} | ${a.type} | ${a.title.slice(0, 60)}`,
    );
  }
  if (auctionReclassifications.length > 5) {
    lines.push(`  ... e mais ${auctionReclassifications.length - 5}`);
  }
  lines.push("");

  // Escrever JSON
  const jsonOut = {
    generatedAt: new Date().toISOString(),
    totalImoveis: total,
    newlyClassified,
    alreadyClassified: total - newlyClassified,
    assetClassAfter,
    pendingReviewCount: pendingReview,
    auctionReclassifications,
    changes,
  };
  writeFileSync(OUT_FILE, JSON.stringify(jsonOut, null, 2));
  console.log(lines.join("\n"));
  console.log(`\nJSON escrito em: ${OUT_FILE}`);
}

main().catch((err) => {
  console.error("Erro no backfill:", err);
  process.exit(1);
});
