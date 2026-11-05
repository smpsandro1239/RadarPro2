/**
 * Reclassificacao de imoveis `mixed` via deriveAssetClass (pipeline; sem escrita).
 *   node scripts/reclassify-mixed.ts
 */
import { createClient } from "@libsql/client";
import path from "node:path";
import { existsSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import { isRemoteDatabaseUrl } from "../src/lib/database-url.ts";
import { deriveAssetClass } from "../src/lib/valuation/classify.ts";
import type { AssetClass, PropertyInput } from "../src/lib/valuation/types.ts";

export async function main(args: string[]): Promise<number> {
  if (existsSync(".env.local")) {
    process.loadEnvFile(".env.local");
  }
  const write = args.includes("--write");
  const confirmRemoteWrite = args.includes("--confirm-remote-write");
  const url = process.env.TURSO_DATABASE_URL ?? `file:${path.resolve(process.cwd(), "local.db")}`;
  if (write && isRemoteDatabaseUrl(url) && !confirmRemoteWrite) {
    console.error("[RECUSA] --write contra uma base remota. Usa --confirm-remote-write se for intencional.");
    return 1;
  }
  if (isRemoteDatabaseUrl(url)) {
    console.log("[reclassify] base remota detetada (somente leitura)");
  }
  const client = createClient({ url, authToken: process.env.TURSO_AUTH_TOKEN ?? "local" });
  const rows = await client.execute({
    sql: "SELECT id, title, type, asset_class FROM properties WHERE asset_class = 'mixed'",
  });

  const changes: { id: string; from: AssetClass; to: AssetClass; reason: string | null }[] = [];
  const targetCounts: Record<string, number> = {};

  for (const row of rows.rows) {
    const input: PropertyInput = {
      id: row.id ? String(row.id) : null,
      title: row.title ? String(row.title) : null,
      type: row.type ? String(row.type) : null,
      assetClass: null,
      district: null,
      municipality: null,
      parish: null,
      price: null,
      sqm: null,
      floor: null,
      totalFloors: null,
      orientation: null,
      condition: null,
      energyCert: null,
      hasGarage: false,
      hasElevator: false,
      hasView: false,
      isAuction: false,
      auctionType: null,
      currentBid: null,
      marketValue: null,
      auctionHouse: null,
      vpt: null,
      condominiumDebt: null,
      renovationEstimate: null,
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
    const storedClass = (String(row.asset_class ?? "mixed")) as AssetClass;
    const result = deriveAssetClass(input);
    changes.push({ id: String(row.id), from: storedClass, to: result.assetClass, reason: result.reason });
    targetCounts[result.assetClass] = (targetCounts[result.assetClass] ?? 0) + 1;
  }

  const changed = changes.filter((c) => c.from !== c.to);

  if (write) {
    for (const change of changed) {
      await client.execute({
        sql: "UPDATE properties SET asset_class = ? WHERE id = ? AND asset_class = ?",
        args: [change.to, change.id, change.from],
      });
    }
    console.log(`[reclassify] APLICADO: ${changed.length} imoveis reclassificados (asset_class) na base ${url}`);
  }

  const report = [
    "# Relatório — Reclassificação de imóveis `mixed` (pipeline)",
    "",
    `- Query: \`SELECT id, title, type, asset_class FROM properties WHERE asset_class = 'mixed'\``,
    `- Imóveis analisados: ${changes.length}`,
    `- Mudaram de classe: ${changed.length}`,
    ...Object.entries(targetCounts).map(([k, v]) => `- Destino ${k}: ${v}`),
    `- Mantiveram mixed: ${changes.length - changed.length}`,
    "",
    "## Detalhes",
    "",
    "| id | de | para | motivo |",
    "|---|---|---|---|",
    ...changed.map(
      (c) => `| ${c.id} | ${c.from} | ${c.to} | ${c.reason ?? "-"} |`,
    ),
    "",
  ].join("\n");

  console.log(report);
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
