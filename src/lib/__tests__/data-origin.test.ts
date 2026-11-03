import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { SQLiteSyncDialect } from "drizzle-orm/sqlite-core";
import { inferDataOrigin, isDemoId, showSeedData } from "@/lib/data-origin";
import { demoDataCondition } from "@/lib/data-origin-sql";
import { collectEntries } from "../../../scripts/check-property-ids";

const repoRoot = path.resolve(__dirname, "../../..");
const backfillScript = path.join(repoRoot, "scripts/backfill-data-origin.ts");

const tempDirs: string[] = [];

afterEach(() => {
  vi.unstubAllEnvs();
  while (tempDirs.length > 0) {
    rmSync(tempDirs.pop()!, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
  }
});

async function tempDatabase(ids: string[]): Promise<string> {
  const dir = mkdtempSync(path.join(tmpdir(), "radarpro-origin-"));
  tempDirs.push(dir);
  const file = path.join(dir, "local.db");
  // A base e criada por um processo separado: o cliente libsql mantem o ficheiro
  // bloqueado no Windows e impediria a limpeza da pasta temporaria.
  execFileSync(
    process.execPath,
    [
      "-e",
      `const { createClient } = require("@libsql/client");
       (async () => {
         const client = createClient({ url: "file:" + process.argv[1] });
         await client.execute("CREATE TABLE properties (id text PRIMARY KEY, data_origin text)");
         for (const id of JSON.parse(process.argv[2])) {
           await client.execute({ sql: "INSERT INTO properties (id) VALUES (?)", args: [id] });
         }
       })();`,
      file,
      JSON.stringify(ids),
    ],
    { cwd: repoRoot, encoding: "utf8" },
  );
  return file;
}

function readRows(file: string, sql: string, params: unknown[] = []): { id: string; data_origin: string | null }[] {
  const output = execFileSync(
    process.execPath,
    [
      "-e",
      `const { createClient } = require("@libsql/client");
       (async () => {
         const client = createClient({ url: "file:" + process.argv[1] });
         const result = await client.execute({ sql: process.argv[2], args: JSON.parse(process.argv[3]) });
         console.log(JSON.stringify(result.rows));
       })();`,
      file,
      sql,
      JSON.stringify(params),
    ],
    { cwd: repoRoot, encoding: "utf8" },
  );
  return JSON.parse(output.trim().split(/\r?\n/).pop() ?? "[]") as { id: string; data_origin: string | null }[];
}

function runBackfill(args: string[], env: Record<string, string | undefined>): { status: number; output: string } {
  const childEnv = { ...process.env, ...env } as Record<string, string | undefined>;
  try {
    const output = execFileSync(process.execPath, [backfillScript, ...args], {
      cwd: repoRoot,
      encoding: "utf8",
      env: childEnv as NodeJS.ProcessEnv,
    });
    return { status: 0, output };
  } catch (error) {
    const failure = error as { status?: number; stdout?: string; stderr?: string };
    return { status: failure.status ?? 1, output: `${failure.stdout ?? ""}${failure.stderr ?? ""}` };
  }
}

describe("origem dos dados", () => {
  it("todos os ids dos scripts de seed sao classificados como demonstracao", () => {
    const ids = collectEntries(repoRoot)
      .filter((entry) => entry.kind === "insert")
      .map((entry) => entry.id)
      .filter((id) => !id.includes("${"));
    expect(ids.length).toBeGreaterThan(100);
    const notDemo = ids.filter((id) => !isDemoId(id));
    expect(notDemo, `ids de seed que nao sao demo: ${notDemo.join(", ")}`).toEqual([]);
  });

  it("os ids gerados pelos scrapers nao sao dados de demonstracao", () => {
    expect(isDemoId("cs-lisboa-165000-1a2b3c")).toBe(false);
    expect(isDemoId("im-porto-320000-9z8y")).toBe(false);
    expect(isDemoId("3f1c2b4a-1111-2222-3333-444455556666")).toBe(false);
  });

  it("inferDataOrigin distingue demo, scraped e desconhecido", () => {
    expect(inferDataOrigin("cs-lis-1")).toBe("demo");
    expect(inferDataOrigin("gen-lisboa-1")).toBe("demo");
    expect(inferDataOrigin("cs-lisboa-165000-1a2b3c")).toBe("scraped");
    expect(inferDataOrigin("3f1c2b4a-1111-2222-3333-444455556666")).toBe("scraped");
    expect(inferDataOrigin("id-estranho")).toBe("unknown");
    expect(inferDataOrigin("")).toBe("unknown");
  });

  it("SHOW_SEED_DATA e falso por omissao", () => {
    vi.stubEnv("SHOW_SEED_DATA", "");
    expect(showSeedData()).toBe(false);
    vi.stubEnv("SHOW_SEED_DATA", "true");
    expect(showSeedData()).toBe(true);
    vi.stubEnv("SHOW_SEED_DATA", "0");
    expect(showSeedData()).toBe(false);
  });

  it("a condicao SQL filtra exactamente os mesmos ids que a funcao TypeScript", async () => {
    const ids = [
      "cs-lis-1",
      "cs-bra-real-1",
      "bidizi-bra-1",
      "gen-lisboa-1",
      "cs-lisboa-165000-1a2b3c",
      "im-porto-320000-9z8y",
      "3f1c2b4a-1111-2222-3333-444455556666",
    ];
    const file = await tempDatabase(ids);
    const dialect = new SQLiteSyncDialect();
    const query = dialect.sqlToQuery(demoDataCondition());
    const kept = readRows(file, `SELECT id FROM properties WHERE ${query.sql} ORDER BY id`, query.params);

    const expected = ids.filter((id) => !isDemoId(id)).sort();
    expect(kept.map((row) => row.id)).toEqual(expected);
  });

  it("o backfill corre em dry-run por omissao", async () => {
    const file = await tempDatabase(["cs-lis-1", "cs-lisboa-165000-1a2b3c"]);
    const result = runBackfill([], { TURSO_DATABASE_URL: `file:${file}`, TURSO_AUTH_TOKEN: "local" });
    expect(result.status).toBe(0);
    expect(result.output).toContain("dry-run");
    expect(result.output).toContain('"demo":1');

    expect(readRows(file, "SELECT id, data_origin FROM properties").every((row) => row.data_origin === null)).toBe(true);
  });

  it("o backfill escreve a origem com --write", async () => {
    const file = await tempDatabase(["cs-lis-1", "cs-lisboa-165000-1a2b3c"]);
    const result = runBackfill(["--write"], { TURSO_DATABASE_URL: `file:${file}`, TURSO_AUTH_TOKEN: "local" });
    expect(result.status).toBe(0);

    const rows = readRows(file, "SELECT id, data_origin FROM properties ORDER BY id");
    expect(rows.map((row) => row.data_origin)).toEqual(["demo", "scraped"]);
  });

  it("o backfill recusa escrever na base remota", () => {
    const result = runBackfill(["--write"], { TURSO_DATABASE_URL: "libsql://exemplo.turso.io", TURSO_AUTH_TOKEN: "x" });
    expect(result.status).toBe(1);
    expect(result.output).toContain("RECUSA");
  });
});
