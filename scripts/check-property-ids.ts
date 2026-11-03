/**
 * Identifica ids de imovel duplicados e ids de dados sinteticos (`gen-*`)
 * nos scripts de seed/importacao.
 *
 * Saida: exit 0 = sem ids duplicados; exit 1 = ids duplicados (bloqueio).
 */
import { readdirSync, readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

export type IdEntry = {
  file: string;
  id: string;
  synthetic: boolean;
  kind: "insert" | "update";
};

const ID_PATTERN = /\bid\s*:\s*(?:"([^"]+)"|'([^']+)'|`([^`]+)`)/g;
const SYNTHETIC_PATTERN = /^gen-/;
const UPDATE_SCRIPT_PATTERN = /^(fix_|migrate_|remove_|backfill-)/;

export function scriptKind(fileName: string): "insert" | "update" {
  return UPDATE_SCRIPT_PATTERN.test(fileName) ? "update" : "insert";
}

export function extractIds(content: string): { id: string; synthetic: boolean }[] {
  const entries: { id: string; synthetic: boolean }[] = [];
  for (const match of content.matchAll(ID_PATTERN)) {
    const id = match[1] ?? match[2] ?? match[3] ?? "";
    if (!id) continue;
    const synthetic = SYNTHETIC_PATTERN.test(id) || id.includes("gen-${");
    entries.push({ id, synthetic });
  }
  return entries;
}

export function findDuplicates(entries: IdEntry[]): Map<string, IdEntry[]> {
  const byId = new Map<string, IdEntry[]>();
  for (const entry of entries) {
    const list = byId.get(entry.id) ?? [];
    list.push(entry);
    byId.set(entry.id, list);
  }
  const duplicates = new Map<string, IdEntry[]>();
  for (const [id, list] of byId) {
    if (list.length > 1) duplicates.set(id, list);
  }
  return duplicates;
}

/** Duplicados que colidem entre scripts de insercao (bloqueio real). */
export function findInsertDuplicates(entries: IdEntry[]): Map<string, IdEntry[]> {
  const duplicates = new Map<string, IdEntry[]>();
  for (const [id, list] of findDuplicates(entries)) {
    const inserts = list.filter((entry) => entry.kind === "insert");
    if (inserts.length > 1) duplicates.set(id, inserts);
  }
  return duplicates;
}

export function collectEntries(repoRoot: string): IdEntry[] {
  const scriptsDir = path.join(repoRoot, "scripts");
  if (!existsSync(scriptsDir)) return [];
  const entries: IdEntry[] = [];
  for (const entry of readdirSync(scriptsDir)) {
    if (!/\.(mjs|js)$/.test(entry)) continue;
    if (/^(scrape|playwright)/.test(entry)) continue;
    const absolute = path.join(scriptsDir, entry);
    const content = readFileSync(absolute, "utf8");
    const kind = scriptKind(entry);
    for (const { id, synthetic } of extractIds(content)) {
      entries.push({ file: path.relative(repoRoot, absolute), id, synthetic, kind });
    }
  }
  return entries;
}

export function main(repoRoot: string): number {
  const entries = collectEntries(repoRoot);
  const blocking = findInsertDuplicates(entries);
  const repeated = findDuplicates(entries);
  const synthetic = entries.filter((entry) => entry.synthetic);

  for (const [id, list] of blocking) {
    console.log(`[DUPLICADO] id=${id} em ${list.map((entry) => entry.file).join(", ")}`);
  }
  for (const [id, list] of repeated) {
    if (blocking.has(id)) continue;
    console.log(`[REPETIDO] id=${id} em ${list.map((entry) => entry.file).join(", ")}`);
  }
  for (const entry of synthetic) {
    console.log(`[SINTETICO] id=${entry.id} em ${entry.file}`);
  }
  console.log(
    `ids analisados: ${entries.length} | duplicados entre scripts de insercao: ${blocking.size} | ids repetidos: ${repeated.size} | sinteticos: ${synthetic.length}`,
  );
  if (blocking.size > 0) {
    console.log("RESULTADO: FALHA (ids duplicados entre scripts de insercao)");
    return 1;
  }
  console.log("RESULTADO: OK (sem ids duplicados entre scripts de insercao)");
  return 0;
}

const invokedAsScript = process.argv[1] ? pathToFileURL(path.resolve(process.argv[1])).href : "";
if (invokedAsScript === import.meta.url) {
  const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
  process.exitCode = main(repoRoot);
}
