/**
 * Ingest de leiloes via scrapers existentes (HTML publico).
 *   node scripts/ingest-auctions.ts --limit 5 [--dry-run] [--write] [--confirm-remote-write]
 */
import { createClient } from "@libsql/client";
import { registerHooks } from "node:module";
import path from "node:path";
import { existsSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import { isRemoteDatabaseUrl } from "../src/lib/database-url.ts";
import type { ScrapedProperty } from "../src/lib/scrapers.ts";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier.startsWith("@/")) {
      const target = path.join(repoRoot, "src", `${specifier.slice(2)}.ts`);
      return nextResolve(pathToFileURL(target).href, context);
    }
    if (specifier.startsWith(".") && !/\.[cm]?[jt]s$/.test(specifier) && context.parentURL) {
      const target = path.resolve(path.dirname(fileURLToPath(context.parentURL)), `${specifier}.ts`);
      return nextResolve(pathToFileURL(target).href, context);
    }
    return nextResolve(specifier, context);
  },
});

export async function main(args: string[]): Promise<number> {
  if (existsSync(".env.local")) {
    process.loadEnvFile(".env.local");
  }
  const dryRun = args.includes("--dry-run");
  const write = args.includes("--write");
  const confirmRemoteWrite = args.includes("--confirm-remote-write");
  const limitIdx = args.indexOf("--limit");
  const limit = limitIdx >= 0 ? Number(args[limitIdx + 1]) || 20 : 20;

  const url = process.env.TURSO_DATABASE_URL ?? `file:${path.join(repoRoot, "local.db")}`;
  if (write && isRemoteDatabaseUrl(url) && !confirmRemoteWrite) {
    console.error("[RECUSA] --write contra uma base remota. Usa --confirm-remote-write se for intencional.");
    return 1;
  }

  const { scrapeELeiloes } = await import("../src/lib/scrapers.ts");
  const { processScrapeResults } = await import("../src/lib/ingest.ts");

  const districts = ["lisboa", "porto", "braga"];
  const results: ScrapedProperty[] = [];
  for (const district of districts) {
    const scraped = await scrapeELeiloes(district);
    results.push(...scraped);
    console.log(`[leiloes] e-Leiloes (${district}): ${scraped.length} imoveis`);
    await new Promise((resolve) => setTimeout(resolve, 3000));
  }
  const limited = results.slice(0, limit);

  console.log(`[leiloes] ${results.length} imoveis recolhidos; ${limited.length} a processar (limite=${limit})`);

  if (dryRun) {
    console.log("[leiloes] RESULTADO: dry-run (nada escrito; usa --write para gravar)");
    return 0;
  }

  const { inserted, updated, skipped } = await processScrapeResults(limited);
  console.log(`[leiloes] inserted=${inserted} updated=${updated} skipped=${skipped}`);

  const client = createClient({ url, authToken: process.env.TURSO_AUTH_TOKEN ?? "local" });
  for (const prop of limited) {
    await client.execute({
      sql: "UPDATE properties SET data_origin = 'scrape' WHERE id = ? AND (data_origin IS NULL OR data_origin != 'scrape')",
      args: [prop.id],
    });
  }

  console.log(`[leiloes] RESULTADO: ${inserted} novos + ${updated} atualizados gravados na base ${url} (data_origin='scrape')`);
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
