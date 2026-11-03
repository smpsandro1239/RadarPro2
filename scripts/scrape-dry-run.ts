/**
 * Dry-run de recolha real, so contra canais autorizados (ver docs/PORTAIS.md):
 *   - Martelo.pt: API publica oficial (https://martelo.pt/public-api/events)
 *   - Estamo: feed RSS oficial (https://www.estamo.pt/imoveis/feed/)
 *
 * Nao ha recolha de HTML nem contorno de proteccoes. Limite pequeno, ritmo lento.
 * Por omissao nao escreve nada; `--write` grava apenas na base local (recusa BD remota).
 *
 *   node scripts/scrape-dry-run.ts --limit 100 --delay 1500 [--write]
 */
import { createClient } from "@libsql/client";
import { registerHooks } from "node:module";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { isRemoteDatabaseUrl } from "../src/lib/database-url.ts";
import type { MarteloEvent, ScrapedRow } from "../src/lib/martelo-parser.ts";
import type { MarketData } from "../src/lib/valuation/market.ts";
import type { ValuationResult } from "../src/lib/valuation/types.ts";

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

// Os modulos sao carregados depois de registar os hooks: os imports internos
// sem extensao ("./portugal-time") e os aliases ("@/lib/...") so resolvem aqui.
const { detectPlaceholder, extractRssItems, isPropertyEvent, mapMarteloEvent } = await import(
  "../src/lib/martelo-parser.ts"
);
const { evaluateProperty, normalizeProperty } = await import("../src/lib/valuation/index.ts");
const { lookupMarket } = await import("../src/lib/valuation/market.ts");

const USER_AGENT = "RadarProPortugal/0.1 (dry-run de recolha; ritmo educado; poucos pedidos por ciclo)";
const MARTELO_API = "https://martelo.pt/public-api/events";
const ESTAMO_RSS = "https://www.estamo.pt/imoveis/feed/";

export type { MarteloEvent, ScrapedRow } from "../src/lib/martelo-parser.ts";

type Evaluated = {
  row: ScrapedRow;
  result: ValuationResult;
  market: MarketData | null;
};

type Options = { limit: number; delayMs: number; write: boolean };

function parseArgs(args: string[]): Options {
  const positive = (name: string, fallback: number): number => {
    const index = args.indexOf(name);
    if (index < 0) return fallback;
    const value = Number(args[index + 1]);
    return Number.isFinite(value) && value > 0 ? value : fallback;
  };
  return {
    limit: positive("--limit", 20),
    delayMs: positive("--delay", 2000),
    write: args.includes("--write"),
  };
}

function percent(part: number, total: number): string {
  if (total === 0) return "0%";
  return `${Math.round((part / total) * 1000) / 10}%`;
}

async function fetchText(url: string): Promise<string> {
  const response = await fetch(url, { headers: { "user-agent": USER_AGENT, accept: "*/*" } });
  if (!response.ok) throw new Error(`${url} -> HTTP ${response.status}`);
  return response.text();
}

/** O mesmo `propertyType` que cada motor usa para procurar a mediana da zona. */
function marketTypeFor(assetClass: string): string {
  switch (assetClass) {
    case "urban_land":
      return "urban_land";
    case "rural_land":
      return "rural_land";
    case "commercial":
      return "commercial";
    case "garage":
      return "garage";
    default:
      return "apartment";
  }
}

function evaluateRow(row: ScrapedRow): Evaluated {
  const input = {
    id: row.id,
    title: row.title,
    type: row.type,
    district: row.district,
    municipality: row.municipality,
    parish: row.parish,
    price: row.price,
    sqm: row.areaSqm,
    floor: row.floor,
    isAuction: row.isAuction,
    auctionType: row.auctionType,
    currentBid: row.currentBid,
    reservePrice: row.reservePrice,
    auctionHouse: row.auctionHouse,
  };
  const result = evaluateProperty(input);
  const market = lookupMarket(normalizeProperty(input), marketTypeFor(result.assetClass));
  return { row, result, market };
}

type Anomaly = { label: string; detail: string };

function detectAnomalies(evaluated: Evaluated[], now: number): Anomaly[] {
  const anomalies: Anomaly[] = [];
  for (const { row, result, market } of evaluated) {
    if (!row.areaSqm) anomalies.push({ label: "sem area", detail: row.id });
    if (!row.parish) anomalies.push({ label: "sem freguesia", detail: `${row.id} (${row.municipality ?? "?"})` });
    if (!market) {
      anomalies.push({
        label: "sem dados de mercado",
        detail: `${row.id} (${row.district ?? "?"}/${row.municipality ?? "?"})`,
      });
    }
    if (result.valuation === null) {
      anomalies.push({ label: "sem avaliacao", detail: `${row.id} (engine=${result.engine})` });
    }
    if (row.price === null || row.price <= 0) anomalies.push({ label: "preco invalido", detail: row.id });
    if (row.currentBid === null) anomalies.push({ label: "sem lance ainda", detail: row.id });
    if (row.currentBid !== null && row.reservePrice !== null && row.currentBid > row.reservePrice) {
      anomalies.push({ label: "lance acima do valor base", detail: row.id });
    }
    if (row.auctionEndDate === null) anomalies.push({ label: "sem data de fim", detail: row.id });
    else if (row.auctionEndDate < now) anomalies.push({ label: "leilao ja terminado", detail: row.id });
    if (row.lat === null || row.lng === null) anomalies.push({ label: "sem coordenadas", detail: row.id });
  }
  return anomalies;
}

async function writeRows(url: string, evaluated: Evaluated[]): Promise<number> {
  // Devolve -1 quando a base nao tem as colunas necessarias.
  const client = createClient({ url, authToken: process.env.TURSO_AUTH_TOKEN ?? "local" });
  const columns = (await client.execute("PRAGMA table_info(properties)")).rows.map((row) => String(row.name));
  const required = ["parish", "area_sqm", "data_origin", "max_bid"];
  const missing = required.filter((column) => !columns.includes(column));
  if (missing.length > 0) {
    console.error(`[ERRO] a base nao tem as colunas ${missing.join(", ")}: aplica as migracoes (npm run db:local)`);
    return -1;
  }

  const now = Date.now();
  let written = 0;
  for (const { row, result } of evaluated) {
    const breakdown = result.breakdown;
    const marketValue = typeof breakdown["marketValue"] === "number" ? breakdown["marketValue"] : result.valuation;
    const maxBid = typeof breakdown["maxBid"] === "number" ? breakdown["maxBid"] : null;
    const isFinished = row.auctionEndDate !== null && row.auctionEndDate < now;

    await client.execute({
      sql: `INSERT INTO properties
        (id, source, source_name, url, title, district, municipality, parish, type, price,
         market_value, max_bid, score, rentability, images, is_active, check_status, created_at, updated_at,
         is_auction, auction_type, auction_house, current_bid, reserve_price, area_sqm, floor,
         lat, lng, geo_quality, asset_class, valuation_engine, valuation_confidence, data_origin)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, '[]', ?, 'ok', ?, ?,
                1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'scrape')
        ON CONFLICT(id) DO UPDATE SET
          title = excluded.title, district = excluded.district, municipality = excluded.municipality,
          parish = excluded.parish, type = excluded.type, price = excluded.price,
          market_value = excluded.market_value, max_bid = excluded.max_bid, score = excluded.score,
          area_sqm = excluded.area_sqm, floor = excluded.floor, lat = excluded.lat, lng = excluded.lng,
          geo_quality = excluded.geo_quality, is_active = excluded.is_active,
          auction_type = excluded.auction_type, auction_house = excluded.auction_house,
          current_bid = excluded.current_bid, reserve_price = excluded.reserve_price,
          asset_class = excluded.asset_class, valuation_engine = excluded.valuation_engine,
          valuation_confidence = excluded.valuation_confidence,
          data_origin = 'scrape', updated_at = excluded.updated_at`,
      args: [
        row.id,
        row.source,
        row.sourceName,
        row.url,
        row.title,
        row.district ?? "",
        row.municipality ?? "",
        row.parish,
        row.type ?? "",
        row.price ?? 0,
        marketValue,
        maxBid,
        result.score,
        isFinished ? 0 : 1,
        now,
        now,
        row.auctionType,
        row.auctionHouse,
        row.currentBid,
        row.reservePrice,
        row.areaSqm,
        row.floor,
        row.lat,
        row.lng,
        row.geoQuality,
        result.assetClass,
        result.engine,
        result.confidence,
      ],
    });
    written += 1;
  }
  return written;
}

export async function main(args: string[]): Promise<number> {
  const options = parseArgs(args);
  const url = process.env.TURSO_DATABASE_URL ?? `file:${path.join(repoRoot, "local.db")}`;
  if (options.write && isRemoteDatabaseUrl(url)) {
    console.error("[RECUSA] --write contra uma base remota.");
    return 1;
  }

  console.log(`[ dry-run ] limite=${options.limit} intervalo=${options.delayMs}ms base=${url}`);

  const payload = JSON.parse(await fetchText(MARTELO_API)) as { events?: MarteloEvent[]; total?: number };
  const events = payload.events ?? [];
  const properties = events.filter(isPropertyEvent);
  const rows = properties.slice(0, options.limit).map(mapMarteloEvent);
  console.log(
    `[Martelo.pt API] ${events.length} eventos recebidos (${payload.total ?? "?"} anunciados); ` +
      `${properties.length} sao imoveis; ${rows.length} processados`,
  );

  await new Promise((resolve) => setTimeout(resolve, options.delayMs));
  const rssItems = extractRssItems(await fetchText(ESTAMO_RSS));
  const placeholders = rssItems.filter((item) => detectPlaceholder(`${item.title} ${item.description}`));
  console.log(
    `[Estamo RSS] ${rssItems.length} itens, ${placeholders.length} com conteudo de exemplo (lorem ipsum) -> nao usados como dados`,
  );

  const evaluated = rows.map(evaluateRow);
  const total = evaluated.length;
  const withArea = evaluated.filter(({ row }) => row.areaSqm !== null && row.areaSqm > 0).length;
  const withParish = evaluated.filter(({ row }) => row.parish !== null).length;
  const withPrice = evaluated.filter(({ row }) => row.price !== null && row.price > 0).length;
  const withMarket = evaluated.filter(({ market }) => market !== null).length;
  const withValuation = evaluated.filter(({ result }) => result.valuation !== null).length;
  const withScore = evaluated.filter(({ result }) => result.score !== null).length;
  const withGeo = evaluated.filter(({ row }) => row.lat !== null && row.lng !== null).length;

  const scoreBuckets: Record<string, number> = {};
  const assetClasses: Record<string, number> = {};
  const marketLevels: Record<string, number> = {};
  const types: Record<string, number> = {};
  for (const { row, result, market } of evaluated) {
    if (result.score !== null) {
      const bucket =
        result.score >= 80 ? "80-100" : result.score >= 60 ? "60-79" : result.score >= 40 ? "40-59" : "1-39";
      scoreBuckets[bucket] = (scoreBuckets[bucket] ?? 0) + 1;
    }
    assetClasses[result.assetClass] = (assetClasses[result.assetClass] ?? 0) + 1;
    const type = row.type ?? "?";
    types[type] = (types[type] ?? 0) + 1;
    if (market) marketLevels[market.level] = (marketLevels[market.level] ?? 0) + 1;
  }

  const anomalies = detectAnomalies(evaluated, Date.now());
  const anomalyCounts: Record<string, number> = {};
  for (const anomaly of anomalies) anomalyCounts[anomaly.label] = (anomalyCounts[anomaly.label] ?? 0) + 1;

  console.log(`\nColetados: ${total}`);
  console.log(`Com area: ${withArea} (${percent(withArea, total)})`);
  console.log(`Com freguesia: ${withParish} (${percent(withParish, total)})`);
  console.log(`Com preco: ${withPrice} (${percent(withPrice, total)})`);
  console.log(`Com coordenadas: ${withGeo} (${percent(withGeo, total)})`);
  console.log(`Com dados de mercado: ${withMarket} (${percent(withMarket, total)})`);
  console.log(`Com avaliacao: ${withValuation} (${percent(withValuation, total)})`);
  console.log(`Com score: ${withScore} (${percent(withScore, total)})`);
  console.log(`Distribuicao de scores: ${JSON.stringify(scoreBuckets)}`);
  console.log(`Classes de ativo: ${JSON.stringify(assetClasses)}`);
  console.log(`Tipos: ${JSON.stringify(types)}`);
  console.log(`Niveis de dados de mercado: ${JSON.stringify(marketLevels)}`);
  console.log(`Anomalias (${anomalies.length}): ${JSON.stringify(anomalyCounts)}`);
  for (const anomaly of anomalies.slice(0, 10)) console.log(`  - ${anomaly.label}: ${anomaly.detail}`);
  if (anomalies.length > 10) console.log(`  ... e mais ${anomalies.length - 10}`);

  if (!options.write) {
    console.log("\nRESULTADO: dry-run (nada escrito; usa --write para gravar na base local)");
    return 0;
  }

  const written = await writeRows(url, evaluated);
  if (written < 0) return 1;
  console.log(`\nRESULTADO: ${written} registos gravados na base local (data_origin='scrape')`);
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
