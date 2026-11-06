/**
 * Ingest de imoveis via CasaNest MCP (catalogo publico Portugal) - standalone (sem imports Next.js/Sentry).
 *   node scripts/ingest-casanest-mcp.ts --source casanest --district lisboa --limit 5 [--dry-run] [--write] [--confirm-remote-write]
 */
import { createClient } from "@libsql/client";
import { existsSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
void repoRoot;

const MCP_URL = "https://casanest.eu/mcp";
const MCP_HEADERS = { "Content-Type": "application/json", Accept: "application/json, text/event-stream" };

interface CasaNestListing {
  id: string;
  url: string;
  title: string;
  property_type?: string;
  typology?: string;
  price?: { amount: number; currency?: string; on_request?: boolean };
  areas_m2?: { net?: number | null; gross?: number | null };
  bedrooms?: number;
  location?: { district?: { name?: string; slug?: string }; municipality?: { name?: string; slug?: string }; parish?: { name?: string } };
  images?: string[];
}

async function mcpCall(toolName: string, args: Record<string, unknown>): Promise<unknown> {
  const res = await fetch(MCP_URL, {
    method: "POST",
    headers: MCP_HEADERS,
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "tools/call", params: { name: toolName, arguments: args } }),
  });
  const text = await res.text();
  const contentType = res.headers.get("content-type") ?? "";
  let parsed: { result?: { content?: Array<{ type: string; text?: string }> } } | null = null;
  const msg = contentType.includes("application/json") ? JSON.parse(text) : null;
  if (msg?.result) parsed = msg;
  if (!parsed) {
    for (const block of text.split("\n\n")) {
      let event = "";
      let data = "";
      for (const line of block.split("\n")) {
        if (line.startsWith("event:")) event = line.slice(6).trim();
        else if (line.startsWith("data:")) data += line.slice(5).trim();
      }
      if (!data) continue;
      try {
        const m = JSON.parse(data);
        if (m?.result) parsed = m;
      } catch {
        // ignore keep-alive/comment events
      }
    }
  }
  if (!parsed?.result) throw new Error(`MCP call ${toolName} failed: no result in response`);
  const content = parsed.result.content ?? [];
  const textBlock = content.find((c) => c.type === "text");
  if (!textBlock?.text) throw new Error(`MCP call ${toolName} returned no text content`);
  return JSON.parse(textBlock.text);
}

async function searchCasaNest(district: string, limit: number): Promise<CasaNestListing[]> {
  const out: CasaNestListing[] = [];
  let cursor: string | undefined = undefined;
  let pages = 0;
  do {
    const result = (await mcpCall("search_properties", { purpose: "sale", district, municipality: district, property_type: "apartment", limit, ...(cursor ? { cursor } : {}) })) as {
      properties?: CasaNestListing[];
      total?: number;
      next_cursor?: string | null;
    };
    out.push(...(result.properties ?? []));
    cursor = result.next_cursor ?? undefined;
    pages++;
  } while (cursor && pages < 20);
  console.log(`[casanest-mcp] Paginação: ${pages} página(s) para district=${district} (limit=${limit}).`);
  return out;
}

export async function main(args: string[]): Promise<number> {
  if (existsSync(".env.local")) {
    process.loadEnvFile(".env.local");
  }
  const dryRun = !args.includes("--write");
  const write = args.includes("--write");
  const confirmRemoteWrite = args.includes("--confirm-remote-write");
  const limitIdx = args.indexOf("--limit");
  const limit = limitIdx >= 0 ? Number(args[limitIdx + 1]) || 5 : 5;
  const sourceIdx = args.indexOf("--source");
  const sourceFilter = sourceIdx >= 0 ? args[sourceIdx + 1] : "casanest";
  const districtIdx = args.indexOf("--district");
  const district = districtIdx >= 0 ? args[districtIdx + 1] : "lisboa";

  const url = process.env.TURSO_DATABASE_URL ?? `file:${path.resolve(process.cwd(), "local.db")}`;
  const isRemote = url.startsWith("libsql://");
  const client = createClient({ url: process.env.TURSO_DATABASE_URL!, authToken: process.env.TURSO_AUTH_TOKEN ?? "" });

  if (write && isRemote && !confirmRemoteWrite) {
    console.error("[RECUSA] --write contra uma base remota. Usa --confirm-remote-write se for intencional.");
    return 1;
  }

  const listings = await searchCasaNest(district, limit);
  console.log(`[casanest-mcp] Fonte: ${listings.length} imoveis encontrados (limit=${limit}, district=${district})`);

  if (dryRun) {
    for (const l of listings) {
      console.log(`[DRY] ${l.location?.municipality?.name ?? district} | ${l.price?.amount ?? 0} | ${l.title}`);
    }
    return 0;
  }

  let inserted = 0;
  for (const l of listings) {
    const price = l.price?.amount ?? null;
    const areaSqm = l.areas_m2?.net ?? null;
    const id = `casanest-${l.location?.municipality?.slug ?? district}-${l.id}`;
    try {
      const res = await client.execute({
        sql: `INSERT INTO properties (id, source, source_name, url, title, district, municipality, parish, type, price, area_sqm, images, is_auction, is_active, data_origin, valuation_confidence) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET title = excluded.title, price = excluded.price, area_sqm = excluded.area_sqm, images = excluded.images, updated_at = excluded.updated_at`,
        args: [id, "casanest", "CasaNest", l.url, l.title, l.location?.district?.name ?? district, l.location?.municipality?.name ?? district, l.location?.parish?.name ?? null, l.property_type ?? "apartment", price, areaSqm, JSON.stringify(l.images ?? []), 0, 1, "scrape", "low"],
      });
      inserted++;
    } catch (e) {
      console.error(`[ERRO] insert casanest ${l.id}:`, e);
    }
  }
  console.log(`[casanest-mcp] Inseridos: ${inserted} imoveis.`);
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
