/**
 * Backfill da coluna `data_origin` (migracao 0003).
 *
 * Por omissao e dry-run: mostra a distribuicao sem escrever nada.
 * `--write` escreve contra a base configurada no ambiente (live ou local).
 * Recusa escrever numa base remota.
 */
import { createClient } from "@libsql/client";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { existsSync } from "node:fs";
import { inferDataOrigin } from "../src/lib/data-origin.ts";
import { isRemoteDatabaseUrl } from "../src/lib/database-url.ts";

export function databaseUrl(repoRoot: string): string {
  const fromEnv = process.env.TURSO_DATABASE_URL;
  if (fromEnv) return fromEnv;
  // Sem URL no ambiente: usa sempre a base local em ficheiro (nunca a live).
  return `file:${path.join(repoRoot, "local.db")}`;
}

export async function main(repoRoot: string, args: string[]): Promise<number> {
  // Carrega .env.local apenas quando executado como script (nao em testes de unidade)
  if (existsSync(".env.local")) {
    process.loadEnvFile(".env.local");
  }

  const write = args.includes("--write");
  const url = databaseUrl(repoRoot);

  if (write && isRemoteDatabaseUrl(url)) {
    console.error("RECUSA: --write contra uma base remota. A base live exige aprovacao do dono.");
    return 1;
  }

  const client = createClient({ url, authToken: process.env.TURSO_AUTH_TOKEN ?? "local" });
  const rows = await client.execute("SELECT id FROM properties");
  const distribution: Record<string, number> = {};
  const updates: { id: string; origin: string }[] = [];
  for (const row of rows.rows) {
    const id = String(row.id);
    const origin = inferDataOrigin(id);
    distribution[origin] = (distribution[origin] ?? 0) + 1;
    updates.push({ id, origin });
  }

  console.log(`Base: ${write ? "escrita habilitada" : "dry-run"} em ${url}`);
  console.log(`Imoveis: ${rows.rows.length}`);
  console.log(`Distribuicao: ${JSON.stringify(distribution)}`);

  if (!write) {
    console.log("RESULTADO: dry-run (nada foi escrito; usa --write para gravar)");
    return 0;
  }

  const hasColumn = await client.execute("PRAGMA table_info(properties)");
  const columns = hasColumn.rows.map((row) => String(row.name));
  if (!columns.includes("data_origin")) {
    console.error("[ERRO] a coluna data_origin nao existe: aplica a migracao 0003 (npm run db:local)");
    return 1;
  }

  for (const { id, origin } of updates) {
    await client.execute({
      sql: "UPDATE properties SET data_origin = ? WHERE id = ? AND (data_origin IS NULL OR data_origin != ?)",
      args: [origin, id, origin],
    });
  }
  console.log(`RESULTADO: ${updates.length} imoveis actualizados`);
  return 0;
}

const invokedAsScript = process.argv[1] ? pathToFileURL(path.resolve(process.argv[1])).href : "";
if (invokedAsScript === import.meta.url) {
  const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
  main(repoRoot, process.argv.slice(2))
    .then((code) => {
      process.exitCode = code;
    })
    .catch((error: unknown) => {
      console.error(`[ERRO] ${error instanceof Error ? error.message : String(error)}`);
      process.exitCode = 1;
    });
}