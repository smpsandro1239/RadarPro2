/**
 * Cria (ou recria) a base de dados local em ficheiro e aplica as migracoes.
 *
 * Nunca toca na base remota: o URL e sempre `file:...` local.
 *
 *   npm run db:local          -> cria/actualiza local.db e aplica migracoes
 *   npm run db:local:reset    -> apaga local.db e volta a criar
 *   npm run db:local:seed     -> aplica migracoes e corre o seed (dados de demonstracao)
 */
import { createClient } from "@libsql/client";
import type { Client } from "@libsql/client";
import { execFileSync } from "node:child_process";
import { existsSync, rmSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

export const MIGRATION_FILES = [
  "drizzle/0000_add_valuation_columns.sql",
  "drizzle/0001_amusing_captain_america.sql",
  "scripts/sql/0002_add_property_valuation_inputs.sql",
  "scripts/sql/0003_add_data_origin.sql",
  "scripts/sql/0004_add_opening_bid.sql",
];

export function splitStatements(sql: string): string[] {
  return sql
    .split("--> statement-breakpoint")
    .flatMap((chunk) => chunk.split(";"))
    .map((statement) =>
      statement
        .split("\n")
        .filter((line) => !line.trim().startsWith("--"))
        .join("\n")
        .trim(),
    )
    .filter(Boolean);
}

export async function applyMigrations(client: Client, repoRoot: string): Promise<string[]> {
  await client.execute(
    "CREATE TABLE IF NOT EXISTS _migrations (name text PRIMARY KEY, applied_at integer)",
  );
  const applied: string[] = [];
  for (const file of MIGRATION_FILES) {
    const absolute = path.join(repoRoot, file);
    if (!existsSync(absolute)) throw new Error(`Migracao em falta: ${file}`);
    const existing = await client.execute({
      sql: "SELECT name FROM _migrations WHERE name = ?",
      args: [file],
    });
    if (existing.rows.length > 0) {
      console.log(`[JA APLICADA] ${file}`);
      continue;
    }
    const { readFileSync } = await import("node:fs");
    for (const statement of splitStatements(readFileSync(absolute, "utf8"))) {
      await client.execute(statement);
    }
    await client.execute({
      sql: "INSERT INTO _migrations (name, applied_at) VALUES (?, ?)",
      args: [file, Date.now()],
    });
    applied.push(file);
    console.log(`[APLICADA] ${file}`);
  }
  return applied;
}

export async function main(repoRoot: string, args: string[]): Promise<number> {
  const localPath = path.join(repoRoot, "local.db");
  if (args.includes("--reset") && existsSync(localPath)) {
    rmSync(localPath, { force: true });
    console.log("[RESET] local.db apagado");
  }
  const client = createClient({ url: `file:${localPath}` });
  await applyMigrations(client, repoRoot);

  const counts = await client.execute("SELECT count(*) AS total FROM properties");
  console.log(`Base local: ${localPath}`);
  console.log(`Imoveis na base local: ${counts.rows[0]?.total ?? 0}`);

  if (args.includes("--seed")) {
    console.log("[SEED] a correr scripts/seed.mjs contra a base local");
    execFileSync(process.execPath, [path.join(repoRoot, "scripts/seed.mjs")], {
      cwd: repoRoot,
      stdio: "inherit",
      env: {
        ...process.env,
        TURSO_DATABASE_URL: `file:${localPath}`,
        TURSO_AUTH_TOKEN: "local",
      },
    });
  }
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
