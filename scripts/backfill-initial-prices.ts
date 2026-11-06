/**
 * Backfill de preco inicial em price_history para imoveis scrape ativos
 * que ainda nao tem entrada no historico.
 *   node scripts/backfill-initial-prices.ts [--write] [--confirm-remote-write]
 */
import { createClient } from "@libsql/client";
import { existsSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";

async function main(): Promise<number> {
  if (existsSync(".env.local")) {
    process.loadEnvFile(".env.local");
  }
  const write = process.argv.includes("--write");
  const confirmRemoteWrite = process.argv.includes("--confirm-remote-write");

  const url = process.env.TURSO_DATABASE_URL ?? `file:${path.resolve(process.cwd(), "local.db")}`;
  const isRemote = url.startsWith("libsql://");
  const client = createClient({ url: process.env.TURSO_DATABASE_URL!, authToken: process.env.TURSO_AUTH_TOKEN ?? "" });

  if (write && isRemote && !confirmRemoteWrite) {
    console.error("[RECUSA] --write contra uma base remota. Usa --confirm-remote-write se for intencional.");
    return 1;
  }

  const props = await client.execute("SELECT id, price FROM properties WHERE data_origin='scrape' AND is_active=1");
  let wouldInsert = 0;
  let inserted = 0;
  let skipped = 0;

  for (const p of props.rows) {
    const pid = String(p.id);
    const price = Number(p.price);
    const countRes = await client.execute({ sql: "SELECT COUNT(*) as c FROM price_history WHERE property_id = ?", args: [pid] });
    const c = Number((countRes.rows[0] as { c?: number }).c ?? 0);
    if (c > 0) {
      skipped++;
      continue;
    }
    if (!price || price <= 0) {
      skipped++;
      continue;
    }
    if (write) {
      await client.execute({
        sql: "INSERT INTO price_history (id, property_id, price, market_value, recorded_at) VALUES (?, ?, ?, NULL, ?)",
        args: [crypto.randomUUID(), pid, price, Math.floor(Date.now() / 1000)],
      });
      inserted++;
    }
    wouldInsert++;
  }

  console.log(`[backfill-initial-prices] Imoveis scrape ativos: ${props.rows.length}`);
  console.log(`[backfill-initial-prices] Ja com historico: ${skipped}`);
  console.log(`[backfill-initial-prices] a inserir: ${wouldInsert}${write ? "" : " (dry-run)"}`);
  if (write) console.log(`[backfill-initial-prices] Inseridos: ${inserted}`);
  return 0;
}

const invokedAsScript = process.argv[1] ? pathToFileURL(path.resolve(process.argv[1])).href : "";
if (invokedAsScript === import.meta.url) {
  main()
    .then((code) => {
      process.exitCode = code;
    })
    .catch((error: unknown) => {
      console.error(`[ERRO] ${error instanceof Error ? error.message : String(error)}`);
      process.exitCode = 1;
    });
}
