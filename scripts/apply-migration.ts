import { createClient } from "@libsql/client";
import { readFileSync } from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);
const dryRun = !args.includes("--apply");
const file = args.find((a) => a.endsWith(".sql"));
if (!file) {
  console.error("Uso: tsx scripts/apply-migration.ts <ficheiro.sql> [--apply]");
  process.exit(1);
}

const url = process.env.TURSO_DATABASE_URL!;
const authToken = process.env.TURSO_AUTH_TOKEN ?? "";
const client = createClient({ url, authToken });

const sql = readFileSync(path.resolve(file), "utf8");
const statements = sql
  .split("--> statement-breakpoint")
  .flatMap((c) => c.split(";"))
  .map((s) => s.trim())
  .filter((s) => s.length > 0 && !s.startsWith("--"));

console.log(`Ficheiro: ${file}`);
console.log(`Statements: ${statements.length}`);
console.log(`Modo: ${dryRun ? "DRY-RUN (nao executa)" : "APPLY"}`);

if (dryRun) {
  statements.forEach((s, i) => console.log(`\n[${i + 1}] ${s}`));
  console.log("\nPara aplicar: adicione --apply");
  process.exit(0);
}

for (const stmt of statements) {
  try {
    await client.execute(stmt);
    console.log("OK:", stmt.slice(0, 60));
  } catch (e) {
    console.error("ERRO:", stmt.slice(0, 60), e);
    process.exit(1);
  }
}
console.log("Concluido.");