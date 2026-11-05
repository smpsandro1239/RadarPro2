import { describe, expect, it } from "vitest";
import { parseRadarQuery } from "../radar-parse";

describe("parseRadarQuery", () => {
  it("extrai distrito, preco maximo e tipo do exemplo canonico", () => {
    const q = parseRadarQuery("apartamento até 100k em lisboa");
    expect(q.district).toBe("Lisboa");
    expect(q.maxPrice).toBe(100000);
    expect(q.isAuction).toBe(false);
    expect(q.typeHint).toBe("apartamento");
  });

  it("aceita preco sem abreviatura (max 250000)", () => {
    const q = parseRadarQuery("casa max 250000 em porto");
    expect(q.district).toBe("Porto");
    expect(q.maxPrice).toBe(250000);
    expect(q.typeHint).toBe("moradia");
  });

  it("deteta leilao por palavras-chave", () => {
    const q = parseRadarQuery("terreno abaixo de 50k leilao em braga");
    expect(q.isAuction).toBe(true);
    expect(q.maxPrice).toBe(50000);
    expect(q.typeHint).toBe("terreno");
  });

  it("query sem restricoes devolve valores nulos", () => {
    const q = parseRadarQuery("oportunidades");
    expect(q.district).toBeNull();
    expect(q.maxPrice).toBeNull();
    expect(q.isAuction).toBe(false);
    expect(q.typeHint).toBeNull();
  });
});
