/**
 * Snapshot JSON das linhas `properties` relevantes para auditoria/rollback manual.
 * Uso antes de qualquer operacao destrutiva em massa (DELETE/UPDATE em massa).
 *   npx tsx scripts/db-snapshot.ts [--out path.json]
 */
import { createClient } from "@libsql/client";
import { existsSync } from "node:fs";
import path from "node:path";

async function main(): Promise<void> {
  const outIdx = process.argv.indexOf("--out");
  const out = outIdx >= 0 ? process.argv[outIdx + 1] : path.join(process.cwd(), "snapshots", `properties-${Date.now()}.json`);
  const fs = await import("node:fs");
  fs.mkdirSync(path.dirname(out), { recursive: true });

  if (existsSync(".env.local")) process.loadEnvFile(".env.local");
  const client = createClient({ url: process.env.TURSO_DATABASE_URL!, authToken: process.env.TURSO_AUTH_TOKEN ?? "" });
  const rows = await client.execute("SELECT id, data_origin, is_active, score, is_auction, auction_end_date FROM properties");
  fs.writeFileSync(out, JSON.stringify(rows.rows, null, 2));
  console.log(`SNAPSHOT_OK path=${out} rows=${rows.rows.length}`);
}

void main();
