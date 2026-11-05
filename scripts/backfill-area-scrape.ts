/**
 * Backfill de area_sqm via regex no titulo (imoveis scrape sem area).
 *   node scripts/backfill-area-scrape.ts [--dry-run] [--write] [--confirm-remote-write]
 */
import { createClient } from "@libsql/client";
import { existsSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

export async function main(args: string[]): Promise<number> {
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

  const rows = await client.execute("SELECT id, title FROM properties WHERE data_origin='scrape' AND is_active=1");
  const targets = rows.rows.filter((r) => r.area_sqm == null).slice(0, limit);

  let updated = 0;
  for (const row of targets) {
    const title = String(row.title ?? "");
    const m = title.match(/(\d[\d\s.,]*)\s*m[²2]/i);
    if (!m) continue;
    const value = Number(m[1].replace(/\./g, "").replace(/,/g, "."));
    if (!Number.isFinite(value) || value <= 0) continue;
    if (dryRun) {
      console.log(`[DRY] ${row.id} area=${value}`);
      updated++;
      continue;
    }
    await client.execute({
      sql: "UPDATE properties SET area_sqm = ?, updated_at = ? WHERE id = ?",
      args: [value, Date.now(), row.id],
    });
    updated++;
  }

  console.log(`[backfill-area-scrape] Imoveis sem area: ${targets.length}; atualizados: ${updated}`);
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
