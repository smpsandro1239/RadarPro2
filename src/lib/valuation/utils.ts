import type { ConfidenceLevel, EngineName, EngineResult } from "./types";

/** Converte para número finito ou null. Não interpreta formatos "1.234,56". */
export function toNum(v: unknown): number | null {
  if (v === null || v === undefined || v === "") return null;
  const n =
    typeof v === "number"
      ? v
      : typeof v === "string"
        ? Number(v.trim().replace(",", "."))
        : Number.NaN;
  return Number.isFinite(n) ? n : null;
}

export function toStr(v: unknown): string | null {
  if (typeof v !== "string") return null;
  const s = v.trim();
  return s === "" ? null : s;
}

export function toBool(v: unknown): boolean {
  return v === true || v === 1 || v === "1" || v === "true";
}

/** minúsculas, sem acentos. "Évora" -> "evora". */
export function fold(s: string | null | undefined): string {
  return (s ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

/** Chave estável para tabelas: "A recuperar" -> "A_RECUPERAR", "Évora" -> "EVORA". */
export function normalizeKey(s: string | null | undefined): string {
  return fold(s).toUpperCase().replace(/[\s-]+/g, "_");
}

const ORDER: ConfidenceLevel[] = ["very_low", "low", "medium", "high"];

export function downgrade(c: ConfidenceLevel): ConfidenceLevel {
  return ORDER[Math.max(0, ORDER.indexOf(c) - 1)];
}

export function minConfidence(a: ConfidenceLevel, b: ConfidenceLevel): ConfidenceLevel {
  return ORDER.indexOf(a) <= ORDER.indexOf(b) ? a : b;
}

export function monthsSince(asOf: string | null | undefined, now: Date = new Date()): number | null {
  if (!asOf) return null;
  const t = Date.parse(asOf);
  if (!Number.isFinite(t)) return null;
  return (now.getTime() - t) / (1000 * 60 * 60 * 24 * 30.44);
}

export function clamp(v: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, v));
}

export function dedupe<T>(arr: T[]): T[] {
  return Array.from(new Set(arr));
}

/** Resultado "não foi possível avaliar" - nunca devolve 0 como se fosse um valor. */
export function noValuation(
  engine: EngineName,
  reason: string,
  confidence: ConfidenceLevel = "very_low",
  breakdown: Record<string, unknown> = {},
  extraWarnings: string[] = [],
): EngineResult {
  return {
    valuation: null,
    engine,
    confidence,
    breakdown: { reason, ...breakdown },
    warnings: dedupe([reason, ...extraWarnings]),
    assumptions: [],
  };
}
