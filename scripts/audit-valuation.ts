/**
 * RadarPro Portugal - Auditoria do motor de avaliação contra dados reais
 *
 * Executa evaluateProperty sobre todos os imóveis ativos da BD e reporta a
 * distribuição de asset_class, valuation_confidence, pdm_status e scores.
 *
 * Executa com: npx tsx --env-file=.env.local scripts/audit-valuation.ts
 */

import { db } from "../src/db/index";
import { properties } from "../src/db/schema";
import { eq, and } from "drizzle-orm";
import { evaluateProperty } from "../src/lib/valuation/index";
import { writeFileSync, mkdirSync, existsSync } from "fs";
import { join } from "path";

const DATE = new Date().toISOString().split("T")[0];
const BENCH_DIR = join(process.cwd(), "benchmarks");
const OUT_FILE = join(BENCH_DIR, `audit-${DATE}.json`);
const OUT_TXT = join(BENCH_DIR, `audit-${DATE}.txt`);

if (!existsSync(BENCH_DIR)) {
  mkdirSync(BENCH_DIR, { recursive: true });
}

interface AuditRow {
  id: string;
  title: string;
  district: string;
  municipality: string;
  sourceName: string;
  type: string;
  price: number;
  isAuction: boolean | null;
  auctionType: string | null;
  auctionHouse: string | null;
  currentBid: number | null;
  maxBid: number | null;
  vpt: number | null;
  assetClass: string | null;
  valuationEngine: string | null;
  valuationConfidence: string | null;
  pdmStatus: string | null;
  infrastructure: string | null;
  annualIncome: number | null;
  condominiumDebt: number | null;
  renovationEstimate: number | null;
  marketValue: number | null;
  discountPct: number | null;
  rentability: number | null;
  sqm: number | null;
  isActive: boolean | null;
  checkStatus: string | null;
  createdAt: string | null;
}

interface EngineResult {
  id: string;
  title: string;
  asset_class: string;
  valuation_engine: string;
  valuation_confidence: string;
  pdm_status: string | null;
  infrastructure: string | null;
  valuation: number | null;
  score: number | null;
  capped: boolean;
  badges: string[];
  maxScore: number;
}

function bucket(score: number | null): string {
  if (score === null) return "null";
  if (score >= 85) return "≥85";
  if (score >= 70) return "70–84";
  if (score >= 55) return "55–69";
  return "<55";
}

async function main() {
  console.log("A ler imóveis ativos da BD...");

  const rows = await db
    .select()
    .from(properties)
    .where(eq(properties.isActive, true));

  console.log(`Total de imóveis ativos: ${rows.length}\n`);

  const audit: EngineResult[] = [];

  for (const row of rows) {
    const property: any = {
      id: row.id,
      title: row.title,
      district: row.district,
      municipality: row.municipality,
      sourceName: row.sourceName,
      source: row.source,
      type: row.type,
      price: row.price,
      marketValue: row.marketValue,
      discountPct: row.discountPct,
      rentability: row.rentability,
      sqm: null, // campo de área não existe no schema — lacuna documentada (valor sempre null)
      isAuction: row.isAuction === true,
      auctionType: row.auctionType,
      auctionHouse: row.auctionHouse,
      currentBid: row.currentBid,
      maxBid: row.maxBid,
      vpt: row.vpt,
      condominiumDebt: row.condominiumDebt,
      renovationEstimate: row.renovationEstimate,
      asset_class: row.assetClass,
      valuation_engine: row.valuationEngine,
      valuation_confidence: row.valuationConfidence,
      pdm_status: row.pdmStatus,
      infrastructure: row.infrastructure,
      annualIncome: null, // campo de rendimento não existe no schema — lacuna documentada (valor sempre null)
      createdAt: row.createdAt ? new Date(row.createdAt).toISOString() : null,
      isActive: row.isActive,
      checkStatus: row.checkStatus,
    };

    try {
      const result = evaluateProperty(property);
      audit.push({
        id: row.id,
        title: row.title,
        asset_class: property.asset_class ?? "apartment",
        valuation_engine: result.engine,
        valuation_confidence: result.confidence,
        pdm_status: row.pdmStatus,
        infrastructure: row.infrastructure,
        valuation: result.valuation ?? null,
        score: result.score,
        capped: result.breakdown?.scoreCapped ?? false,
        badges: result.breakdown?.scoreBadges ?? [],
        maxScore: result.breakdown?.scoreMax ?? 100,
      });
    } catch (err) {
      console.error(`Erro a avaliar ${row.id} (${row.title}):`, err);
      audit.push({
        id: row.id,
        title: row.title,
        asset_class: property.asset_class ?? "apartment",
        valuation_engine: "error",
        valuation_confidence: "low",
        pdm_status: row.pdmStatus,
        infrastructure: row.infrastructure,
        valuation: null,
        score: null,
        capped: false,
        badges: ["erro de avaliação"],
        maxScore: 0,
      });
    }
  }

  // Estatísticas
  const total = audit.length;

  // Distribuição asset_class
  const assetClassDist: Record<string, number> = {};
  for (const a of audit) {
    assetClassDist[a.asset_class] = (assetClassDist[a.asset_class] || 0) + 1;
  }

  // Distribuição confidence
  const confDist: Record<string, number> = {};
  for (const a of audit) {
    confDist[a.valuation_confidence] = (confDist[a.valuation_confidence] || 0) + 1;
  }

  // Distribuição pdm_status (apenas urban_land)
  const urbanLand = audit.filter((a) => a.asset_class === "urban_land");
  const pdmDist: Record<string, number> = {};
  for (const a of urbanLand) {
    pdmDist[a.pdm_status ?? "null"] = (pdmDist[a.pdm_status ?? "null"] || 0) + 1;
  }

  // Distribuição scores
  const scoreDist: Record<string, number> = { "≥85": 0, "70–84": 0, "55–69": 0, "<55": 0, null: 0 };
  for (const a of audit) {
    scoreDist[bucket(a.score)] = (scoreDist[bucket(a.score)] || 0) + 1;
  }

  // Top 10 e bottom 10 por score
  const withScore = audit.filter((a) => a.score !== null).sort((a, b) => b.score! - a.score!);
  const top10 = withScore.slice(0, 10);
  const bottom10 = withScore.slice(-10).reverse();

  // Resumo textual
  const lines: string[] = [];
  lines.push("=== AUDITORIA DO MOTOR DE AVALIAÇÃO ===");
  lines.push(`Data: ${new Date().toISOString()}`);
  lines.push(`Total de imóveis ativos: ${total}`);
  lines.push("");

  lines.push("--- Distribuição de asset_class ---");
  for (const [k, v] of Object.entries(assetClassDist).sort((a, b) => b[1] - a[1])) {
    lines.push(`  ${k}: ${v} (${((v / total) * 100).toFixed(1)}%)`);
  }
  lines.push("");

  lines.push("--- Distribuição de valuation_confidence ---");
  for (const [k, v] of Object.entries(confDist).sort((a, b) => b[1] - a[1])) {
    lines.push(`  ${k}: ${v} (${((v / total) * 100).toFixed(1)}%)`);
  }
  lines.push("");

  lines.push("--- Distribuição de pdm_status (apenas urban_land: ${urbanLand.length}) ---");
  for (const [k, v] of Object.entries(pdmDist).sort((a, b) => b[1] - a[1])) {
    lines.push(`  ${k}: ${v} (${((v / urbanLand.length) * 100).toFixed(1)}%)`);
  }
  lines.push("");

  lines.push("--- Distribuição de scores ---");
  for (const [k, v] of Object.entries(scoreDist)) {
    const pct = total > 0 ? ((v / total) * 100).toFixed(1) : "0.0";
    lines.push(`  ${k}: ${v} (${pct}%)`);
  }
  lines.push("");

  lines.push("--- Top 10 scores mais altos ---");
  for (const a of top10) {
    lines.push(`  ${a.score} | ${a.asset_class} | ${a.valuation_confidence} | ${a.title.slice(0, 60)}`);
  }
  lines.push("");

  lines.push("--- Top 10 scores mais baixos ---");
  for (const a of bottom10) {
    lines.push(`  ${a.score} | ${a.asset_class} | ${a.valuation_confidence} | ${a.title.slice(0, 60)}`);
  }
  lines.push("");

  // Alertas
  lines.push("--- Alertas ---");
  const veryLowPct = total > 0 ? ((confDist["very_low"] || 0) / total) * 100 : 0;
  if (veryLowPct > 30) {
    lines.push(`  ⚠️ ${veryLowPct.toFixed(1)}% dos imóveis com confiança very_low (>30%) — rever classificação e PDM`);
  } else {
    lines.push(`  OK confiança very_low: ${veryLowPct.toFixed(1)}%`);
  }

  const pendingPct = total > 0 ? ((confDist["low"] || 0) / total) * 100 : 0;
  if (pendingPct > 20) {
    lines.push(`  ⚠️ ${pendingPct.toFixed(1)}% dos imóveis com confiança low (>20%) — inferência de asset_class insuficiente`);
  } else {
    lines.push(`  OK confiança low: ${pendingPct.toFixed(1)}%`);
  }

  const urbanLandPct = urbanLand.length > 0 ? ((pdmDist["unknown"] || 0) / urbanLand.length) * 100 : 0;
  if (urbanLand.length > 0 && urbanLandPct > 50) {
    lines.push(`  ⚠️ ${urbanLandPct.toFixed(1)}% dos terrenos urbanos sem PDM (>50%) — score cortado em 40`);
  } else if (urbanLand.length > 0) {
    lines.push(`  OK PDM unknown urban_land: ${urbanLandPct.toFixed(1)}%`);
  } else {
    lines.push(`  OK sem terrenos urbanos na BD`);
  }

  const nullOrLowPct = total > 0 ? ((scoreDist["null"] + scoreDist["<55"]) / total) * 100 : 0;
  if (nullOrLowPct > 40) {
    lines.push(`  ⚠️ ${nullOrLowPct.toFixed(1)}% dos imóveis com score null ou <55 (>40%) — ranking perde valor`);
  } else {
    lines.push(`  OK score útil: ${nullOrLowPct.toFixed(1)}% null ou <55`);
  }

  const score100 = withScore.filter((a) => a.score === 100).length;
  if (score100 > 10) {
    lines.push(`  ⚠️ ${score100} imóveis com score 100 (>10) — possível inflação por dados em falta`);
  } else {
    lines.push(`  OK score 100: ${score100} imóveis`);
  }

  const report = lines.join("\n");
  console.log(report);

  // Escrever JSON
  const jsonOut = {
    generatedAt: new Date().toISOString(),
    totalImoveis: total,
    assetClass: assetClassDist,
    valuationConfidence: confDist,
    pdmStatusUrbanLand: pdmDist,
    scoreDistribution: scoreDist,
    top10,
    bottom10,
    results: audit,
  };
  writeFileSync(OUT_FILE, JSON.stringify(jsonOut, null, 2));
  console.log(`\nJSON escrito em: ${OUT_FILE}`);

  // Escrever TXT
  writeFileSync(OUT_TXT, report);
  console.log(`TXT escrito em: ${OUT_TXT}`);
}

main().catch((err) => {
  console.error("Erro na auditoria:", err);
  process.exit(1);
});
