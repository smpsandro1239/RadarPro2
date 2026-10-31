/**
 * RadarPro Portugal - Backfill de estimativas de rendas
 *
 * Para cada imóvel ativo na BD:
 * 1. Busca a estimativa de renda mensal (district + municipality + type)
 * 2. Calcula annual_income = monthlyRent * 12
 * 3. Atualiza a BD apenas se annual_income for null
 *
 * Executa com: npx tsx --env-file=.env.local scripts/backfill-rental-estimates.ts
 */

import { db } from "../src/db/index";
import { properties } from "../src/db/schema";
import { eq } from "drizzle-orm";
import { findRentalEstimate } from "../src/lib/rental-estimates";
import { writeFileSync, mkdirSync, existsSync } from "fs";
import { join } from "path";

const DATE = new Date().toISOString().split("T")[0];
const BENCH_DIR = join(process.cwd(), "benchmarks");
const OUT_FILE = join(BENCH_DIR, `backfill-rental-${DATE}.json`);

if (!existsSync(BENCH_DIR)) {
  mkdirSync(BENCH_DIR, { recursive: true });
}

interface BackfillResult {
  id: string;
  title: string;
  district: string;
  municipality: string;
  type: string;
  price: number;
  oldAnnualIncome: number | null;
  newAnnualIncome: number | null;
  monthlyRent: number | null;
  source: string | null;
  changed: boolean;
}

async function main() {
  console.log("A ler imóveis ativos da BD...");

  const rows = await db
    .select()
    .from(properties)
    .where(eq(properties.isActive, true));

  console.log(`Total de imóveis ativos: ${rows.length}\n`);

  const results: BackfillResult[] = [];
  let updated = 0;
  let alreadyFilled = 0;
  let noEstimate = 0;

  for (const row of rows) {
    const oldAnnualIncome = row.annualIncome;

    // Já preenchido — não sobrescrever
    if (oldAnnualIncome !== null) {
      alreadyFilled++;
      continue;
    }

    const estimate = findRentalEstimate({
      district: row.district,
      municipality: row.municipality,
      type: row.type,
    });

    if (!estimate) {
      noEstimate++;
      results.push({
        id: row.id,
        title: row.title,
        district: row.district,
        municipality: row.municipality,
        type: row.type,
        price: row.price,
        oldAnnualIncome: null,
        newAnnualIncome: null,
        monthlyRent: null,
        source: null,
        changed: false,
      });
      continue;
    }

    const annualIncome = Math.round(estimate.monthlyRent * 12);

    await db
      .update(properties)
      .set({ annualIncome, updatedAt: new Date() })
      .where(eq(properties.id, row.id));

    updated++;
    results.push({
      id: row.id,
      title: row.title,
      district: row.district,
      municipality: row.municipality,
      type: row.type,
      price: row.price,
      oldAnnualIncome: null,
      newAnnualIncome: annualIncome,
      monthlyRent: estimate.monthlyRent,
      source: estimate.source,
      changed: true,
    });
  }

  // Resumo
  const total = rows.length;
  const lines: string[] = [];
  lines.push("=== BACKFILL DE ESTIMATIVAS DE RENDAS ===");
  lines.push(`Data: ${new Date().toISOString()}`);
  lines.push(`Total de imóveis ativos: ${total}`);
  lines.push(`Atualizados com rendas: ${updated}`);
  lines.push(`Já tinham annual_income: ${alreadyFilled}`);
  lines.push(`Sem estimativa de renda disponível: ${noEstimate}`);
  lines.push("");

  // Por distrito
  const byDistrict: Record<string, { total: number; filled: number }> = {};
  for (const r of results) {
    if (!byDistrict[r.district]) byDistrict[r.district] = { total: 0, filled: 0 };
    byDistrict[r.district].total++;
    if (r.changed) byDistrict[r.district].filled++;
  }
  lines.push("--- Por distrito ---");
  for (const [d, v] of Object.entries(byDistrict).sort((a, b) => b[1].filled - a[1].filled)) {
    lines.push(`  ${d}: ${v.filled}/${v.total} (${((v.filled / v.total) * 100).toFixed(1)}%)`);
  }
  lines.push("");

  // Tipos preenchidos
  const byType: Record<string, number> = {};
  for (const r of results) {
    if (r.changed) byType[r.type] = (byType[r.type] || 0) + 1;
  }
  lines.push("--- Tipos preenchidos ---");
  for (const [t, c] of Object.entries(byType).sort((a, b) => b[1] - a[1])) {
    lines.push(`  ${t}: ${c}`);
  }
  lines.push("");

  // Escrever JSON
  const jsonOut = {
    generatedAt: new Date().toISOString(),
    totalImoveis: total,
    updated,
    alreadyFilled,
    noEstimate,
    results,
  };
  writeFileSync(OUT_FILE, JSON.stringify(jsonOut, null, 2));
  console.log(lines.join("\n"));
  console.log(`\nJSON escrito em: ${OUT_FILE}`);
}

main().catch((err) => {
  console.error("Erro no backfill de rendas:", err);
  process.exit(1);
});
