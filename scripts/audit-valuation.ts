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
  listingType: string | null;
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
  is_auction: boolean | null;
  district: string;
  price: number;
  asset_class: string;
  valuation_engine: string;
  valuation_confidence: string;
  pdm_status: string | null;
  infrastructure: string | null;
  current_bid: number | null;
  max_bid: number | null;
  valuation: number | null;
  score: number | null;
  capped: boolean;
  badges: string[];
  maxScore: number;
  scoreBreakdown: Record<string, number> | null;
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
      currentBid: row.currentBid ?? row.price, // schema híbrido: para leilões, price = current_bid
      maxBid: row.maxBid,
      vpt: row.vpt,
      condominiumDebt: row.condominiumDebt,
      renovationEstimate: row.renovationEstimate,
      asset_class: row.assetClass,
      valuation_engine: row.valuationEngine,
      valuation_confidence: row.valuationConfidence,
      pdm_status: row.pdmStatus,
      infrastructure: row.infrastructure,
      annualIncome: row.annualIncome, // agora existe na schema após migration
      is_auction: row.isAuction === true,
      createdAt: row.createdAt ? new Date(row.createdAt).toISOString() : null,
      isActive: row.isActive,
      checkStatus: row.checkStatus,
    };

    try {
      const result = evaluateProperty(property);
      audit.push({
        id: row.id,
        title: row.title,
        district: property.district,
        price: property.price,
        is_auction: property.isAuction ?? false,
        asset_class: property.asset_class ?? "apartment",
        valuation_engine: result.engine,
        valuation_confidence: result.confidence,
        pdm_status: row.pdmStatus,
        infrastructure: row.infrastructure,
        current_bid: property.isAuction && !property.currentBid ? property.price : property.currentBid ?? null,
        max_bid: property.maxBid ?? null,
        valuation: result.valuation ?? null,
        score: result.score,
        capped: result.breakdown?.scoreCapped ?? false,
        badges: result.breakdown?.scoreBadges ?? [],
        maxScore: result.breakdown?.scoreMax ?? 100,
        scoreBreakdown: result.breakdown?.scoreBreakdown ?? null,
      });
    } catch (err) {
      console.error(`Erro a avaliar ${row.id} (${row.title}):`, err);
      audit.push({
        id: row.id,
        title: row.title,
        district: property.district,
        price: property.price,
        is_auction: property.isAuction ?? false,
        asset_class: property.asset_class ?? "apartment",
        valuation_engine: "error",
        valuation_confidence: "low",
        pdm_status: row.pdmStatus,
        infrastructure: row.infrastructure,
        current_bid: property.isAuction && !property.currentBid ? property.price : property.currentBid ?? null,
        max_bid: property.maxBid ?? null,
        valuation: null,
        score: null,
        capped: false,
        badges: ["erro de avaliação"],
        maxScore: 0,
        scoreBreakdown: null,
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

  lines.push("--- Top 3 breakdown de score (porque o maximo e baixo) ---");
  const top3 = withScore.slice(0, 3);
  for (const a of top3) {
    const sb = a.scoreBreakdown ?? {};
    lines.push(
      `  1º ${a.score} | ${a.asset_class} | desconto=${sb.discount ?? 0} | preco_m2=${sb.pricePerSqm ?? 0} | yield=${sb.yield ?? 0} | liquidez=${sb.liquidity ?? 0} | confianca=${sb.confidence ?? 0} | ${a.title.slice(0, 50)}`,
    );
  }
  lines.push("");

  lines.push("--- Bottom 3 breakdown de score ---");
  const bottom3 = withScore.slice(-3).reverse();
  for (const a of bottom3) {
    const sb = a.scoreBreakdown ?? {};
    lines.push(
      `  ${a.score} | ${a.asset_class} | desconto=${sb.discount ?? 0} | preco_m2=${sb.pricePerSqm ?? 0} | yield=${sb.yield ?? 0} | liquidez=${sb.liquidity ?? 0} | confianca=${sb.confidence ?? 0} | ${a.title.slice(0, 50)}`,
    );
  }
  lines.push("");

  // Distribuição por tipo (fixed_price vs auction)
  const fixedPrice = audit.filter((a) => !a.is_auction);
  const auctions = audit.filter((a) => a.is_auction);

  const bucketDist = (arr: EngineResult[]): Record<string, number> => {
    const dist: Record<string, number> = { "≥85": 0, "70–84": 0, "55–69": 0, "<55": 0, null: 0 };
    for (const a of arr) {
      dist[bucket(a.score)] = (dist[bucket(a.score)] || 0) + 1;
    }
    return dist;
  };

  const fixedDist = bucketDist(fixedPrice);
  const auctionDist = bucketDist(auctions);
  const fixedMax = fixedPrice.reduce((m, a) => Math.max(m, a.score ?? 0), 0);
  const auctionMax = auctions.reduce((m, a) => Math.max(m, a.score ?? 0), 0);

  lines.push("=== Top 10 — Preço Fixo ===");
  // Dedupe por (title, district, price) antes de ordenar
  const seenFixed = new Map<string, string>();
  const fixedDeduped = fixedPrice.filter((a) => {
    const key = `${a.title}|${a.district}|${a.price}`;
    if (seenFixed.has(key)) return false;
    seenFixed.set(key, a.id);
    return true;
  });
  const fixedTop10 = fixedDeduped
    .filter((a) => a.score !== null)
    .sort((a, b) => b.score! - a.score!)
    .slice(0, 10);
  const fixedTotalDups = fixedPrice.length - fixedDeduped.length;
  for (const a of fixedTop10) {
    const sb = a.scoreBreakdown ?? {};
    lines.push(`  ${a.score} | ${a.asset_class} | yield=${sb.yield ?? 0} | conf=${sb.confidence ?? 0} | ${a.title.slice(0, 55)}`);
  }
  lines.push(`  (${fixedTotalDups} duplicados removidos no top preço fixo)`);

  lines.push("=== Top 10 — Leilões ===");
  const auctionTop10 = auctions
    .filter((a) => a.score !== null)
    .sort((a, b) => b.score! - a.score!)
    .slice(0, 10);
  for (const a of auctionTop10) {
    const sb = a.scoreBreakdown ?? {};
    const cbid = a.current_bid ?? null; // para leilões, current_bid pode estar null; usar price do property se disponível
    const margem = a.max_bid != null && cbid != null ? Math.round(a.max_bid - cbid) : null;
    lines.push(`  ${a.score} | ${a.asset_class} | cbid=${cbid ?? "n/d"} | mBid=${a.max_bid ?? "n/d"} | margem=${margem ?? "n/d"} | ${a.title.slice(0, 50)}`);
  }
  lines.push("");

  lines.push("=== Distribuição de scores por tipo ===");
  lines.push(`Preço Fixo (${fixedPrice.length}):`);
  lines.push(`  ≥85: ${fixedDist["≥85"]} | 70–84: ${fixedDist["70–84"]} | 55–69: ${fixedDist["55–69"]} | <55: ${fixedDist["<55"]} | máximo: ${fixedMax}`);
  lines.push(`Leilões (${auctions.length}):`);
  lines.push(`  ≥85: ${auctionDist["≥85"]} | 70–84: ${auctionDist["70–84"]} | 55–69: ${auctionDist["55–69"]} | <55: ${auctionDist["<55"]} | máximo: ${auctionMax}`);
  lines.push("");

  lines.push("=== Diagnóstico ===");
  const fixedGe70 = fixedDist["70–84"] + fixedDist["≥85"];
  const auctionGe70 = auctionDist["70–84"] + auctionDist["≥85"];
  if (fixedGe70 === 0) {
    lines.push("  ⚠️ ALERTA: Preço fixo com 0 imóveis ≥70 — produto só funciona para leilões");
  } else {
    lines.push(`  ✅ Preço fixo: ${fixedGe70} imóveis ≥70`);
  }
  if (auctionGe70 === 0) {
    lines.push("  ⚠️ ALERTA: Leilões com 0 imóveis ≥70");
  } else {
    lines.push(`  ✅ Leilões: ${auctionGe70} imóveis ≥70`);
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
