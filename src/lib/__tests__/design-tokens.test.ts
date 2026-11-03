import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Contraste do design system, calculado (nao estimado a olho).
 * Os tokens sao lidos de `src/app/globals.css` — fonte unica de verdade.
 */

type Rgb = { r: number; g: number; b: number };

const CSS_PATH = path.join(process.cwd(), "src", "app", "globals.css");

const COLOR_TOKENS = [
  "--rp-bg",
  "--rp-surface",
  "--rp-ceramic",
  "--rp-ink",
  "--rp-ink-2",
  "--rp-muted",
  "--rp-line",
  "--rp-cobalt",
  "--rp-orange",
  "--rp-accent",
  "--rp-anomaly",
  "--rp-amber",
  "--rp-glass",
] as const;

function readTokens(): Record<string, string> {
  const css = readFileSync(CSS_PATH, "utf8");
  const tokens: Record<string, string> = {};
  for (const match of css.matchAll(/(--rp-[a-z0-9-]+)\s*:\s*([^;]+);/g)) {
    tokens[match[1]] = match[2].trim();
  }
  return tokens;
}

function parseHex(hex: string): Rgb {
  const clean = hex.replace("#", "").trim();
  const full = clean.length === 3 ? clean.replace(/(.)/g, "$1$1") : clean;
  return {
    r: parseInt(full.slice(0, 2), 16),
    g: parseInt(full.slice(2, 4), 16),
    b: parseInt(full.slice(4, 6), 16),
  };
}

function parseColor(value: string): { rgb: Rgb; alpha: number } {
  const text = value.trim();
  if (text.startsWith("#")) return { rgb: parseHex(text), alpha: 1 };
  const rgba = /^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*(?:,\s*([\d.]+)\s*)?\)$/i.exec(text);
  if (!rgba) throw new Error(`Token de cor nao reconhecido: ${value}`);
  return {
    rgb: { r: Number(rgba[1]), g: Number(rgba[2]), b: Number(rgba[3]) },
    alpha: rgba[4] === undefined ? 1 : Number(rgba[4]),
  };
}

function composite(color: { rgb: Rgb; alpha: number }, background: Rgb): Rgb {
  const { rgb, alpha } = color;
  return {
    r: rgb.r * alpha + background.r * (1 - alpha),
    g: rgb.g * alpha + background.g * (1 - alpha),
    b: rgb.b * alpha + background.b * (1 - alpha),
  };
}

function luminance(rgb: Rgb): number {
  const channel = (value: number) => {
    const scaled = value / 255;
    return scaled <= 0.03928 ? scaled / 12.92 : ((scaled + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(rgb.r) + 0.7152 * channel(rgb.g) + 0.0722 * channel(rgb.b);
}

function contrast(foreground: { rgb: Rgb; alpha: number }, background: Rgb): number {
  const fg = luminance(composite(foreground, background));
  const bg = luminance(background);
  const lighter = Math.max(fg, bg);
  const darker = Math.min(fg, bg);
  return (lighter + 0.05) / (darker + 0.05);
}

const tokens = readTokens();

function ratio(foregroundToken: string, backgroundToken: string): number {
  const background = parseColor(tokens[backgroundToken]).rgb;
  return contrast(parseColor(tokens[foregroundToken]), background);
}

function report(): string[] {
  const rows: string[] = [];
  const pairs: [string, string, number, string][] = [
    ["--rp-ink", "--rp-bg", 4.5, "texto principal no fundo"],
    ["--rp-ink-2", "--rp-bg", 4.5, "texto secundario no fundo"],
    ["--rp-muted", "--rp-bg", 4.5, "etiquetas no fundo"],
    ["--rp-cobalt", "--rp-bg", 4.5, "ligacoes no fundo"],
    ["--rp-anomaly", "--rp-bg", 4.5, "alerta pequeno no fundo"],
    ["--rp-accent", "--rp-bg", 3, "destaque em texto grande"],
    ["--rp-ink", "--rp-surface", 4.5, "texto principal no cartao"],
    ["--rp-ink-2", "--rp-surface", 4.5, "texto secundario no cartao"],
    ["--rp-muted", "--rp-surface", 4.5, "etiquetas no cartao"],
    ["--rp-cobalt", "--rp-surface", 4.5, "ligacoes no cartao"],
    ["--rp-anomaly", "--rp-surface", 4.5, "alerta pequeno no cartao"],
    ["--rp-accent", "--rp-surface", 3, "destaque em texto grande no cartao"],
    ["--rp-surface", "--rp-ink", 4.5, "texto do botao primario"],
    ["--rp-ink-2", "--rp-ceramic", 4.5, "texto em superficie clara"],
    ["--rp-line", "--rp-surface", 1.3, "filete (decorativo, nao texto)"],
  ];
  for (const [fg, bg, required, use] of pairs) {
    const value = ratio(fg, bg);
    rows.push(`${fg} sobre ${bg} = ${value.toFixed(2)}:1 (min ${required}:1) — ${use}`);
  }
  return rows;
}

describe("design system: tokens e contraste", () => {
  it("declara todos os tokens de cor", () => {
    for (const token of COLOR_TOKENS) {
      expect(tokens[token], `token em falta: ${token}`).toBeTruthy();
    }
  });

  it("mantem as cores AA em texto normal", () => {
    const pairs: [string, string][] = [
      ["--rp-ink", "--rp-bg"],
      ["--rp-ink-2", "--rp-bg"],
      ["--rp-muted", "--rp-bg"],
      ["--rp-cobalt", "--rp-bg"],
      ["--rp-anomaly", "--rp-bg"],
      ["--rp-ink", "--rp-surface"],
      ["--rp-ink-2", "--rp-surface"],
      ["--rp-muted", "--rp-surface"],
      ["--rp-cobalt", "--rp-surface"],
      ["--rp-anomaly", "--rp-surface"],
      ["--rp-surface", "--rp-ink"],
      ["--rp-ink-2", "--rp-ceramic"],
    ];
    for (const [fg, bg] of pairs) {
      expect(ratio(fg, bg), `${fg} sobre ${bg}`).toBeGreaterThanOrEqual(4.5);
    }
  });

  it("mantem AA (3:1) no destaque de texto grande", () => {
    expect(ratio("--rp-accent", "--rp-bg")).toBeGreaterThanOrEqual(3);
    expect(ratio("--rp-accent", "--rp-surface")).toBeGreaterThanOrEqual(3);
  });

  it("imprime a tabela de contraste medida", () => {
    const rows = report();
    for (const row of rows) console.log(row);
    expect(rows.length).toBeGreaterThan(0);
  });
});
