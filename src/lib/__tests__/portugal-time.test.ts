import { describe, expect, it } from "vitest";
import { lisbonOffsetMs, parsePortugalDateTime } from "@/lib/portugal-time";

describe(" datas de Portugal continental", () => {
  it("interpreta a hora local de inverno como UTC (WET, UTC+0)", () => {
    expect(parsePortugalDateTime("2026-11-03T08:59:59")).toBe(Date.UTC(2026, 10, 3, 8, 59, 59));
  });

  it("interpreta a hora local de verao como UTC-1 (WEST, UTC+1)", () => {
    expect(parsePortugalDateTime("2026-07-03T08:59:59")).toBe(Date.UTC(2026, 6, 3, 7, 59, 59));
  });

  it("aceita segundos opcionais", () => {
    expect(parsePortugalDateTime("2026-01-15T10:00")).toBe(Date.UTC(2026, 0, 15, 10, 0, 0));
  });

  it("respeita o fuso explicito quando existe", () => {
    expect(parsePortugalDateTime("2026-11-03T08:59:59Z")).toBe(Date.UTC(2026, 10, 3, 8, 59, 59));
    expect(parsePortugalDateTime("2026-11-03T08:59:59+01:00")).toBe(Date.UTC(2026, 10, 3, 7, 59, 59));
  });

  it("devolve null para valores que nao sao datas", () => {
    expect(parsePortugalDateTime(null)).toBeNull();
    expect(parsePortugalDateTime("")).toBeNull();
    expect(parsePortugalDateTime("amanha")).toBeNull();
  });

  it("o offset de Lisboa e 0 no inverno e +1h no verao", () => {
    expect(lisbonOffsetMs(new Date(Date.UTC(2026, 0, 15, 12, 0, 0)))).toBe(0);
    expect(lisbonOffsetMs(new Date(Date.UTC(2026, 6, 15, 12, 0, 0)))).toBe(60 * 60 * 1000);
  });
});
