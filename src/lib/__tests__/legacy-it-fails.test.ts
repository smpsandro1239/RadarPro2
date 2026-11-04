import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

/** Limite de `it.fails` no repo: subir este numero exige revisao explicita. */
const MAX_IT_FAILS = 0;
/** Distancia maxima (em linhas) entre o `it.fails` e o TODO que o justifica. */
const TODO_WINDOW_LINES = 12;

function testFiles(dir: string): string[] {
  const entries = readdirSync(dir);
  const files: string[] = [];
  for (const entry of entries) {
    const absolute = path.join(dir, entry);
    if (statSync(absolute).isDirectory()) {
      files.push(...testFiles(absolute));
    } else if (entry.endsWith(".test.ts") || entry.endsWith(".test.tsx")) {
      files.push(absolute);
    }
  }
  return files;
}

function itFailsOccurrences(): { file: string; line: number; context: string[] }[] {
  const occurrences: { file: string; line: number; context: string[] }[] = [];
  const self = path.basename(__filename);
  for (const file of testFiles(path.resolve(process.cwd(), "src"))) {
    if (path.basename(file) === self) continue;
    const lines = readFileSync(file, "utf8").split(/\r?\n/);
    lines.forEach((line, index) => {
      if (!line.includes("it.fails(")) return;
      const start = Math.max(0, index - TODO_WINDOW_LINES);
      occurrences.push({ file, line: index + 1, context: lines.slice(start, index) });
    });
  }
  return occurrences;
}

describe("testes legados com it.fails", () => {
  it("nao ultrapassa o limite de it.fails", () => {
    const occurrences = itFailsOccurrences();
    expect(
      occurrences.length,
      `it.fails acima do limite (${MAX_IT_FAILS}): ${occurrences.map((o) => `${o.file}:${o.line}`).join(", ")}`,
    ).toBeLessThanOrEqual(MAX_IT_FAILS);
  });

  it("cada it.fails tem um TODO que o justifica", () => {
    const semTodo = itFailsOccurrences()
      .filter((occurrence) => !occurrence.context.some((line) => line.includes("TODO")))
      .map((occurrence) => `${occurrence.file}:${occurrence.line}`);
    expect(semTodo, `it.fails sem TODO perto: ${semTodo.join(", ")}`).toEqual([]);
  });
});
