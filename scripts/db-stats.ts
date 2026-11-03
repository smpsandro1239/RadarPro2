/**
 * Estatisticas da base local (ou da URL em TURSO_DATABASE_URL).
 * Serve o bloco "Numeros" dos relatorios: nunca escreve nada.
 */
import { createClient } from "@libsql/client";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { isRemoteDatabaseUrl } from "../src/lib/database-url.ts";

export function resolveUrl(repoRoot: string): string {
  return process.env.TURSO_DATABASE_URL ?? `file:${path.join(repoRoot, "local.db")}`;
}

export async function main(repoRoot: string): Promise<number> {
  const url = resolveUrl(repoRoot);
  const client = createClient({ url, authToken: process.env.TURSO_AUTH_TOKEN ?? "local" });

  const total = await client.execute("SELECT count(*) AS n FROM properties");
  const count = Number(total.rows[0]?.n ?? 0);
  console.log(`Base: ${url}${isRemoteDatabaseUrl(url) ? " (REMOTA - apenas leitura)" : " (local)"}`);
  console.log(`Imoveis: ${count}`);

  const columns = (await client.execute("PRAGMA table_info(properties)")).rows.map((row) => String(row.name));
  const has = (column: string) => columns.includes(column);

  const ratio = async (where: string) => {
    const result = await client.execute(`SELECT count(*) AS n FROM properties WHERE ${where}`);
    const n = Number(result.rows[0]?.n ?? 0);
    const percent = count === 0 ? 0 : Math.round((n / count) * 1000) / 10;
    console.log(`${where}: ${n} (${percent}%)`);
  };

  if (has("area_sqm")) await ratio("area_sqm IS NOT NULL");
  if (has("parish")) await ratio("parish IS NOT NULL");
  if (has("market_value")) await ratio("market_value IS NOT NULL");
  if (has("score")) await ratio("score IS NOT NULL");
  if (has("rentability")) await ratio("rentability IS NOT NULL AND rentability > 0");
  if (has("data_origin")) await ratio("data_origin = 'demo'");

  const scoreBuckets = await client.execute(
    `SELECT CASE
        WHEN score IS NULL THEN 'sem score'
        WHEN score >= 80 THEN '80-100'
        WHEN score >= 60 THEN '60-79'
        WHEN score >= 40 THEN '40-59'
        WHEN score > 0 THEN '1-39'
        ELSE '0' END AS bucket, count(*) AS n
      FROM properties GROUP BY bucket ORDER BY bucket`,
  );
  console.log(`Distribuicao de scores: ${JSON.stringify(scoreBuckets.rows.map((row) => [row.bucket, row.n]))}`);

  const origins = await client.execute(
    "SELECT source_name, count(*) AS n FROM properties GROUP BY source_name ORDER BY n DESC",
  );
  console.log(`Por fonte: ${JSON.stringify(origins.rows.map((row) => [row.source_name, row.n]))}`);

  const districts = await client.execute(
    "SELECT district, count(*) AS n FROM properties GROUP BY district ORDER BY n DESC",
  );
  console.log(`Por distrito: ${JSON.stringify(districts.rows.map((row) => [row.district, row.n]))}`);

  const anomalies: { label: string; where: string }[] = [
    { label: "preco <= 0", where: "price <= 0" },
    { label: "sem score e sem market_value", where: "score IS NULL AND market_value IS NULL" },
    { label: "score sem preco", where: "score IS NOT NULL AND price IS NULL" },
    { label: "market_value abaixo do preco", where: "market_value IS NOT NULL AND market_value < price" },
    { label: "rendimento > 20%", where: "rentability IS NOT NULL AND rentability > 20" },
  ];
  if (has("area_sqm")) anomalies.push({ label: "area <= 0", where: "area_sqm IS NOT NULL AND area_sqm <= 0" });
  for (const anomaly of anomalies) {
    const result = await client.execute(`SELECT count(*) AS n FROM properties WHERE ${anomaly.where}`);
    console.log(`Anomalia "${anomaly.label}": ${Number(result.rows[0]?.n ?? 0)}`);
  }

  const duplicateUrls = await client.execute(
    "SELECT count(*) AS n FROM (SELECT url FROM properties GROUP BY url HAVING count(*) > 1)",
  );
  console.log(`URLs duplicadas: ${Number(duplicateUrls.rows[0]?.n ?? 0)}`);

  return 0;
}

const invokedAsScript = process.argv[1] ? pathToFileURL(path.resolve(process.argv[1])).href : "";
if (invokedAsScript === import.meta.url) {
  const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
  main(repoRoot)
    .then((code) => {
      process.exitCode = code;
    })
    .catch((error: unknown) => {
      console.error(`[ERRO] ${error instanceof Error ? error.message : String(error)}`);
      process.exitCode = 1;
    });
}
