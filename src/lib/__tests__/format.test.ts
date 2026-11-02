import { describe, it, expect } from "vitest";
import { formatScore, formatScoreOutOf100, formatOptional, formatEuros } from "../format";

describe("formatScoreOutOf100", () => {
  it('devolve "Sem avaliação" sem o "/100" quando não há avaliação', () => {
    expect(formatScoreOutOf100(null)).toBe("Sem avaliação");
    expect(formatScoreOutOf100(undefined)).toBe("Sem avaliação");
    expect(formatScoreOutOf100(NaN)).toBe("Sem avaliação");
  });

  it("acrescenta /100 ao score", () => {
    expect(formatScoreOutOf100(82)).toBe("82/100");
    expect(formatScoreOutOf100(0)).toBe("0/100");
  });
});

describe("formatScore", () => {
  it('devolve "Sem avaliação" quando não há avaliação', () => {
    expect(formatScore(null)).toBe("Sem avaliação");
    expect(formatScore(undefined)).toBe("Sem avaliação");
    expect(formatScore(NaN)).toBe("Sem avaliação");
  });

  it("devolve o número como string", () => {
    expect(formatScore(82)).toBe("82");
    expect(formatScore(7.5)).toBe("7.5");
  });

  it("mostra zero em vez de o tratar como ausente", () => {
    expect(formatScore(0)).toBe("0");
  });
});

describe("formatOptional", () => {
  it('devolve "—" quando não há valor', () => {
    expect(formatOptional(null)).toBe("—");
    expect(formatOptional(undefined)).toBe("—");
    expect(formatOptional(NaN)).toBe("—");
  });

  it("mostra zero em vez de o tratar como ausente", () => {
    expect(formatOptional(0)).toBe("0");
    expect(formatOptional(0, "%")).toBe("0%");
  });

  it("aplica o sufixo quando indicado", () => {
    expect(formatOptional(12.5, "%")).toBe("12.5%");
    expect(formatOptional(140000, "€")).toBe("140000€");
  });

  it("não aplica sufixo por omissão", () => {
    expect(formatOptional(42)).toBe("42");
  });
});

describe("formatEuros", () => {
  it('devolve "—" quando não há valor', () => {
    expect(formatEuros(null)).toBe("—");
    expect(formatEuros(undefined)).toBe("—");
    expect(formatEuros(NaN)).toBe("—");
  });

  it("formata o valor em euros sem converter moeda", () => {
    expect(formatEuros(140000)).toMatch(/^140\s000\s€$/);
    expect(formatEuros(1234.5)).toMatch(/^1[\s\u00a0]?234,5\s€$/);
  });

  it("mostra zero em vez de o tratar como ausente", () => {
    expect(formatEuros(0)).toBe("0 €");
  });
});
