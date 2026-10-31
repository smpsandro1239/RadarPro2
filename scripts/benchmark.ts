/**
 * RadarPro Portugal - Benchmark de performance de busca
 *
 * Mede p50/p95/p99 de busca nos modos db-primary, typesense e db-fallback.
 * Executa com: npx tsx --env-file=.env.local scripts/benchmark.ts
 * Resultados: benchmarks/YYYY-MM-DD.json
 */

import { db } from "@/db";
import { properties } from "@/db/schema";
import { eq, and, ilike, or, gte, lte, count } from "drizzle-orm";
import { isTypesenseConfigured } from "@/lib/search-config";
import { searchProperties } from "@/lib/typesense";
import { writeFileSync, mkdirSync, existsSync } from "fs";
import { join } from "path";

const DATE = new Date().toISOString().split("T")[0];
const BENCH_DIR = join(process.cwd(), "benchmarks");
const OUT_FILE = join(BENCH_DIR, `${DATE}.json`);

if (!existsSync(BENCH_DIR)) {
  mkdirSync(BENCH_DIR, { recursive: true });
}

interface BenchResult {
  mode: string;
  queryCount: number;
  p50Ms: number;
  p95Ms: number;
  p99Ms: number;
  avgMs: number;
  minMs: number;
  maxMs: number;
  errors: number;
}

interface BenchmarkReport {
  date: string;
  totalProperties: number;
  activeProperties: number;
  typesenseConfigured: boolean;
  search: BenchResult[];
  detail: BenchResult;
}

function percentile(sorted: number[], p: number): number {
  const idx = Math.ceil((p / 100) * sorted.length) - 1;
  return sorted[Math.max(0, Math.min(idx, sorted.length - 1))];
}

async function benchDbSearch(
  label: string,
  queries: Array<() => Promise<unknown>>
): Promise<BenchResult> {
  const latencies: number[] = [];
  let errors = 0;

  for (const fn of queries) {
    const start = process.hrtime.bigint();
    try {
      await fn();
    } catch {
      errors++;
    }
    const end = process.hrtime.bigint();
    latencies.push(Number(end - start) / 1_000_000);
  }

  latencies.sort((a, b) => a - b);

  return {
    mode: label,
    queryCount: latencies.length,
    p50Ms: Math.round(percentile(latencies, 50) * 100) / 100,
    p95Ms: Math.round(percentile(latencies, 95) * 100) / 100,
    p99Ms: Math.round(percentile(latencies, 99) * 100) / 100,
    avgMs: Math.round((latencies.reduce((a, b) => a + b, 0) / latencies.length) * 100) / 100,
    minMs: Math.round(latencies[0] * 100) / 100,
    maxMs: Math.round(latencies[latencies.length - 1] * 100) / 100,
    errors,
  };
}

async function benchDetail(propertyIds: string[]): Promise<BenchResult> {
  const latencies: number[] = [];
  let errors = 0;

  for (const id of propertyIds) {
    const start = process.hrtime.bigint();
    try {
      await db.select().from(properties).where(eq(properties.id, id)).limit(1);
    } catch {
      errors++;
    }
    const end = process.hrtime.bigint();
    latencies.push(Number(end - start) / 1_000_000);
  }

  latencies.sort((a, b) => a - b);

  return {
    mode: "detail",
    queryCount: latencies.length,
    p50Ms: Math.round(percentile(latencies, 50) * 100) / 100,
    p95Ms: Math.round(percentile(latencies, 95) * 100) / 100,
    p99Ms: Math.round(percentile(latencies, 99) * 100) / 100,
    avgMs: Math.round((latencies.reduce((a, b) => a + b, 0) / latencies.length) * 100) / 100,
    minMs: Math.round(latencies[0] * 100) / 100,
    maxMs: Math.round(latencies[latencies.length - 1] * 100) / 100,
    errors,
  };
}

async function main() {
  console.log("=== RadarPro Benchmark ===\n");

  const totalResult = await db.select({ count: count() }).from(properties);
  const activeResult = await db
    .select({ count: count() })
    .from(properties)
    .where(eq(properties.isActive, true));
  const totalProperties = Number(totalResult[0]?.count || 0);
  const activeProperties = Number(activeResult[0]?.count || 0);
  const typesenseConfigured = isTypesenseConfigured();

  console.log(`Total properties: ${totalProperties}`);
  console.log(`Active properties: ${activeProperties}`);
  console.log(`Typesense configured: ${typesenseConfigured}\n`);

  // 100 queries variadas
  const districts = ["Lisboa", "Porto", "Braga", "Faro", "Setúbal"];
  const types = ["Apartamento", "Moradia", "Terreno"];
  const queries: Array<() => Promise<{ count: number }[]>> = [];

  for (let i = 0; i < 100; i++) {
    const district = districts[i % districts.length];
    const type = types[i % types.length];
    const minPrice = i * 10000;
    const maxPrice = minPrice + 500000;

    queries.push(async () => {
      const conditions: any[] = [eq(properties.isActive, true)];
      if (district) conditions.push(eq(properties.district, district));
      if (type) conditions.push(eq(properties.type, type));
      conditions.push(gte(properties.price, minPrice));
      conditions.push(lte(properties.price, maxPrice));

      return await db.select({ count: count() }).from(properties).where(and(...conditions));
    });
  }

  console.log("A fazer benchmark db-primary...");
  const dbPrimary = await benchDbSearch("db-primary", queries);

  let typesenseResult: BenchResult | null = null;
  if (typesenseConfigured) {
    console.log("A fazer benchmark typesense...");
    const tsQueries: Array<() => Promise<{ count: number }>> = queries.map((_, i) => async () => {
      const district = districts[i % districts.length];
      const type = types[i % types.length];
      const minPrice = i * 10000;
      const maxPrice = minPrice + 500000;

      const result = await searchProperties({
        district, type, minPrice, maxPrice, page: 1, perPage: 20,
      });
      return { count: result?.found || 0 };
    });
    typesenseResult = await benchDbSearch("typesense", tsQueries);
  }

  console.log("A fazer benchmark db-fallback...");
  const dbFallback = await benchDbSearch("db-fallback", queries);

  const allProps = await db
    .select({ id: properties.id })
    .from(properties)
    .where(eq(properties.isActive, true))
    .limit(50);
  const propertyIds = allProps.map((p) => p.id);
  const detailBench = await benchDetail(propertyIds);

  const report: BenchmarkReport = {
    date: DATE,
    totalProperties,
    activeProperties,
    typesenseConfigured,
    search: [dbPrimary, typesenseResult, dbFallback].filter((r): r is BenchResult => r !== null),
    detail: detailBench,
  };

  writeFileSync(OUT_FILE, JSON.stringify(report, null, 2));
  console.log(`\nRelatório gravado em: ${OUT_FILE}`);
  console.log("\n=== Resumo ===");
  console.table(
    report.search.map((r) => ({
      Modo: r.mode,
      "p50 (ms)": r.p50Ms,
      "p95 (ms)": r.p95Ms,
      "p99 (ms)": r.p99Ms,
      "Avg (ms)": r.avgMs,
      Erros: r.errors,
    }))
  );
  console.table([
    {
      Tipo: "Detalhe (DB)",
      "p50 (ms)": detailBench.p50Ms,
      "p95 (ms)": detailBench.p95Ms,
      "p99 (ms)": detailBench.p99Ms,
      "Avg (ms)": detailBench.avgMs,
      Erros: detailBench.errors,
    },
  ]);
}

main().catch((err) => {
  console.error("Erro no benchmark:", err);
  process.exit(1);
});
