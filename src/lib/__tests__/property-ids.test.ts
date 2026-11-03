import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  collectEntries,
  extractIds,
  findDuplicates,
  findInsertDuplicates,
  scriptKind,
} from "../../../scripts/check-property-ids";

const repoRoot = path.resolve(__dirname, "../../..");

describe("ids de imovel nos scripts de seed", () => {
  it("extrai ids literais e ids com template", () => {
    const entries = extractIds('const a = { id: "cs-lis-1" };\nconst b = { id: `gen-${district}-1` };');
    expect(entries).toEqual([
      { id: "cs-lis-1", synthetic: false },
      { id: "gen-${district}-1", synthetic: true },
    ]);
  });

  it("distingue scripts de insercao de scripts de correccao", () => {
    expect(scriptKind("seed.mjs")).toBe("insert");
    expect(scriptKind("add_more_sources.mjs")).toBe("insert");
    expect(scriptKind("fix_urls.mjs")).toBe("update");
    expect(scriptKind("migrate_auction.mjs")).toBe("update");
  });

  it("deteta ids repetidos", () => {
    const duplicates = findDuplicates([
      { file: "a.mjs", id: "cs-lis-1", synthetic: false, kind: "insert" },
      { file: "b.mjs", id: "cs-lis-1", synthetic: false, kind: "insert" },
      { file: "c.mjs", id: "cs-por-1", synthetic: false, kind: "insert" },
    ]);
    expect([...duplicates.keys()]).toEqual(["cs-lis-1"]);
    expect(duplicates.get("cs-lis-1")).toHaveLength(2);
  });

  it("os ids `gen-*` dos dados sinteticos ficam identificados", () => {
    const entries = collectEntries(repoRoot);
    const synthetic = entries.filter((entry) => entry.synthetic);
    expect(synthetic.length).toBeGreaterThan(0);
    expect(synthetic.every((entry) => entry.id.includes("gen-"))).toBe(true);
  });

  it("ha ids duplicados entre scripts de insercao (lista para correcao)", () => {
    const blocking = findInsertDuplicates(collectEntries(repoRoot));
    expect(blocking.size).toBeGreaterThan(0);
    expect([...blocking.values()].every((list) => list.every((entry) => entry.kind === "insert"))).toBe(true);
  });

  it("scripts de correccao podem repetir ids sem bloquear", () => {
    const entries = collectEntries(repoRoot);
    const blocking = findInsertDuplicates(entries);
    const all = findDuplicates(entries);
    expect(all.size).toBeGreaterThanOrEqual(blocking.size);
  });
});
