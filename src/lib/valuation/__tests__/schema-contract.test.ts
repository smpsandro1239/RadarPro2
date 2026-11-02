/**
 * RadarPro Portugal - Contrato de dados entre o motor de avaliação e o schema.
 *
 * O motor v2 lê um conjunto fixo de colunas (ver src/lib/valuation/normalize.ts).
 * Este teste garante que:
 *   1. a lista de campos consumidos pelo normalize.ts é extraída do próprio código
 *      (nada de lista mantida à mão que possa divergir);
 *   2. cada campo consumido existe como coluna em `properties` OU está declarado
 *      em NOT_YET_IN_DB com uma justificação;
 *   3. NOT_YET_IN_DB não tem entradas obsoletas (uma lacuna já resolvida tem de
 *      ser removida da lista);
 *   4. NOT_YET_IN_DB está VAZIA -> enquanto houver lacunas, o teste falha.
 *
 * É o teste que bloqueia o "score = null em 93% dos imóveis": cada lacuna aqui
 * listada é um dado que o motor pede e a base de dados não tem.
 */
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { getTableColumns } from "drizzle-orm";
import { properties } from "@/db/schema";

/**
 * Colunas consumidas pelo motor que ainda não existem em `properties`.
 * Chave = nome SQL da coluna; valor = justificação (o que falta e porque).
 *
 * NOT_YET_IN_DB tem de estar VAZIA para o teste passar. Ao aprovar a migração,
 * remove-se a entrada depois de a coluna existir no schema E na base de dados.
 */
const NOT_YET_IN_DB: Record<string, string> = {
  area_sqm: "CRÍTICA: área útil em m². Sem ela nenhum motor €/m² avalia (apartados, casas, garagens, terreno urbano). Extraível do detalhe do anúncio (Casa Sapo, Imovirtual).",
  parish: "Freguesia. Só com ela o motor atinge confiança 'high' (findMarketData só faz match por município/distrito). Extraível do texto da localização e do detalhe do anúncio.",
  floor: "Andar do imóvel. Ajuste hedónico (andar alto = mais valor). Extraível do detalhe do anúncio.",
  total_floors: "Número total de pisos do edifício. Ajuste hedónico (andar alto sem elevador = penalizado). Extraível do detalhe do anúncio.",
  orientation: "Orientação solar (N/NE/E/SE/S/SO/O/NO). Ajuste hedónico. Extraível do detalhe do anúncio.",
  condition: "Estado de conservação. Ajuste hedónico. Extraível do detalhe do anúncio.",
  energy_cert: "Certificação energética (A+..D). Ajuste hedónico. Extraível do detalhe do anúncio.",
  has_garage: "Existe lugar de garagem. Ajuste hedónico. Extraível do detalhe do anúncio.",
  has_elevator: "Edifício com elevador. Ajuste hedónico. Extraível do detalhe do anúncio.",
  has_view: "Imóvel com vista. Ajuste hedónico. Extraível do detalhe do anúncio.",
  topography: "Topografia do terreno (plano/suave/íngreme). Ajuste do motor de terreno urbano. Extraível do detalhe do anúncio.",
  road_frontage_meters: "Metros de frente de estrada. Ajuste do motor de terreno urbano. Extraível do detalhe do anúncio.",
  land_use: "Uso do solo (floresta/agricultura/olival/vinha/pastagem/misto). Define o rendimento €/ha do motor de terreno rústico. Extraível do detalhe do anúncio.",
  cap_rate: "Taxa de capitalização do imóvel. Afeta a avaliação de terreno rústico e comercial.",
  annual_rent: "Renda anual em euros. Só com o valor de renda explícito é que a avaliação comercial/rústica é fiável.",
  yield_pct: "Rentabilidade bruta do anúncio em %. Dimensão do score quando known (hoje deriva-se de annual_income/preço).",
  market_cap_rate: "Taxa de capitalização de mercado por zona. Hoje o motor comercial usa o defeito de 6%.",
};

/** Nomes alternativos aceites pelo normalize.ts que não são colunas próprias. */
const ALIASES: Record<string, string> = {
  area: "area_sqm",
};

function consumedColumns(): string[] {
  const src = readFileSync(resolve(process.cwd(), "src/lib/valuation/normalize.ts"), "utf8");
  const re = /g\(\s*"([A-Za-z0-9_]+)"\s*,\s*"([A-Za-z0-9_]+)"\s*\)/g;
  const found = new Set<string>();
  for (const m of src.matchAll(re)) {
    const camel = m[1];
    const snake = m[2];
    if (camel === snake) {
      found.add(snake);
      continue;
    }
    // Só o nome snake_case é uma coluna da BD; o camelCase é a chave do PropertyInput.
    if (snake.includes("_") || snake === ALIASES[snake]) found.add(ALIASES[snake] ?? snake);
  }
  return [...found].sort();
}

function dbColumns(): Set<string> {
  return new Set(Object.values(getTableColumns(properties)).map((c) => c.name));
}

describe("contrato de dados: normalize.ts <-> schema de properties", () => {
  const consumed = consumedColumns();
  const columns = dbColumns();

  it("a extracao dos campos consumidos pelo normalize.ts funciona", () => {
    expect(consumed.length).toBeGreaterThan(30);
    expect(consumed).toContain("area_sqm");
    expect(consumed).toContain("pdm_status");
  });

  it("nenhum campo consumido pelo motor fica sem coluna e sem justificação", () => {
    const undocumented = consumed.filter(
      (f) => !columns.has(f) && !(f in NOT_YET_IN_DB),
    );
    expect(undocumented).toEqual([]);
  });

  it("todas as lacunas declaradas têm justificação e continuam em falta", () => {
    for (const [field, reason] of Object.entries(NOT_YET_IN_DB)) {
      expect(reason.trim().length, `lacuna '${field}' sem justificação`).toBeGreaterThan(20);
      expect(columns.has(field), `lacuna '${field}' já resolvida - remove-a da lista`).toBe(false);
    }
  });

  it("não há lacunas por resolver: o motor lê apenas colunas existentes", () => {
    expect(
      Object.keys(NOT_YET_IN_DB),
      "colunas em falta (a resolver na migração): " +
        Object.keys(NOT_YET_IN_DB).join(", "),
    ).toEqual([]);
  });

  it("a migração proposta cobre exactamente as lacunas declaradas", () => {
    const sql = readFileSync(
      resolve(process.cwd(), "scripts/sql/0002_add_property_valuation_inputs.sql"),
      "utf8",
    );
    const proposed = [...sql.matchAll(/ADD COLUMN `([A-Za-z0-9_]+)`/g)].map((m) => m[1]);
    expect(proposed.sort()).toEqual(Object.keys(NOT_YET_IN_DB).sort());
  });
});
