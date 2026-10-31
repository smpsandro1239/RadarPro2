/**
 * RadarPro Portugal - Backfill de max_bid para leilões existentes
 *
 * Para cada imóvel ativo com isAuction=true e max_bid=null:
 * 1. Calcula max_bid usando calculateMaxBid do auction-calculator
 * 2. Atualiza a BD
 *
 * Executa com: npx tsx --env-file=.env.local scripts/backfill-maxbid.ts
 */

import { db } from "../src/db/index";
import { properties } from "../src/db/schema";
import { eq, and, isNull } from "drizzle-orm";
import { calculateMaxBid } from "../src/lib/auction-calculator";
import { writeFileSync, mkdirSync, existsSync } from "fs";
import { join } from "path";

const DATE = new Date().toISOString().split("T")[0];
const BENCH_DIR = join(process.cwd(), "benchmarks");
const OUT_FILE = join(BENCH_DIR, `backfill-maxbid-${DATE}.json`);

if (!existsSync(BENCH_DIR)) {
  mkdirSync(BENCH_DIR, { recursive: true });
}

interface BackfillResult {
  id: string;
  title: string;
  district: string;
  municipality: string;
  currentBid: number | null;
  maxBid: number | null;
  newMaxBid: number | null;
  auctionHouse: string | null;
  changed: boolean;
}

async function main() {
  console.log("A ler leilões activos da BD...");

  const rows = await db
    .select()
    .from(properties)
    .where(and(eq(properties.isActive, true), eq(properties.isAuction, true), isNull(properties.maxBid)));

  console.log(`Leilões activos sem max_bid: ${rows.length}\n`);

  const results: BackfillResult[] = [];
  let updated = 0;
  let skipped = 0;

  for (const row of rows) {
    // Para leilões, o campo 'price' armazena o lance atual (current_bid)
    const currentBid = row.currentBid ?? row.price;
    if (!currentBid || currentBid <= 0) {
      skipped++;
      results.push({
        id: row.id,
        title: row.title,
        district: row.district,
        municipality: row.municipality,
        currentBid: row.currentBid,
        maxBid: null,
        newMaxBid: null,
        auctionHouse: row.auctionHouse,
        changed: false,
      });
      continue;
    }

    // Calcular max_bid usando o auction-calculator
    const calcResult = calculateMaxBid({
      marketValue: row.marketValue ?? row.price * 1.2,
      currentBid,
      auctionHouse: row.auctionHouse ?? undefined,
      targetMargin: 15,
    });

    const newMaxBid = calcResult.maxBid;

    await db
      .update(properties)
      .set({ maxBid: newMaxBid, updatedAt: new Date() })
      .where(eq(properties.id, row.id));

    updated++;
    results.push({
      id: row.id,
      title: row.title,
      district: row.district,
      municipality: row.municipality,
      currentBid,
      maxBid: null,
      newMaxBid,
      auctionHouse: row.auctionHouse,
      changed: true,
    });

    console.log(`  ${row.title}: current_bid=€${row.currentBid} → max_bid=€${newMaxBid} (casa: ${row.auctionHouse ?? "?"})`);
  }

  // Resumo
  const total = rows.length;
  const lines: string[] = [];
  lines.push("=== BACKFILL DE MAX_BID PARA LEILÕES ===");
  lines.push(`Data: ${new Date().toISOString()}`);
  lines.push(`Leilões activos sem max_bid: ${total}`);
  lines.push(`Atualizados: ${updated}`);
  lines.push(`Saltos (sem current_bid): ${skipped}`);
  lines.push("");

  // Por casa leiloeira
  const byHouse: Record<string, { total: number; filled: number }> = {};
  for (const r of results) {
    const h = r.auctionHouse ?? "desconhecida";
    if (!byHouse[h]) byHouse[h] = { total: 0, filled: 0 };
    byHouse[h].total++;
    if (r.changed) byHouse[h].filled++;
  }
  lines.push("--- Por casa leiloeira ---");
  for (const [h, v] of Object.entries(byHouse).sort((a, b) => b[1].filled - a[1].filled)) {
    lines.push(`  ${h}: ${v.filled}/${v.total}`);
  }
  lines.push("");

  // Escrever JSON
  const jsonOut = {
    generatedAt: new Date().toISOString(),
    totalLeiloes: total,
    updated,
    skipped,
    results,
  };
  writeFileSync(OUT_FILE, JSON.stringify(jsonOut, null, 2));
  console.log(lines.join("\n"));
  console.log(`\nJSON escrito em: ${OUT_FILE}`);
}

main().catch((err) => {
  console.error("Erro no backfill de max_bid:", err);
  process.exit(1);
});
