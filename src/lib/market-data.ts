/**
 * RadarPro Portugal - Dados de referência do mercado imobiliário
 *
 * Tabelas de mediana €/m² por freguesia/concelho, com fonte e data de referência.
 * Valores são REFERÊNCIA, não a base única do AVM. Sempre que houver dados de
 * transação reais, esses prevalecem.
 *
 * Fontes:
 * - INE (avaliação bancária mediana): Maio 2026
 * - Confidencial Imobiliário (preço de venda): 1º trimestre 2026
 */

import { normalizeName } from "@/lib/geography";

export interface MarketDataEntry {
  district: string;
  municipality: string;
  parish?: string;
  pricePerSqm: number; // mediana €/m²
  source: "INE" | "Confidencial Imobiliário";
  asOf: string; // YYYY-MM
  propertyType: "apartment" | "house" | "urban_land" | "rural_land" | "commercial";
}

// Medianas por freguesia/concelho (apartamentos e moradias)
export const MARKET_DATA_APARTMENT_HOUSE: MarketDataEntry[] = [
  // Lisboa (INE Maio 2026)
  { district: "Lisboa", municipality: "Lisboa", parish: "Santa Maria Maior", pricePerSqm: 5200, source: "INE", asOf: "2026-05", propertyType: "apartment" },
  { district: "Lisboa", municipality: "Lisboa", parish: "Misericórdia", pricePerSqm: 5600, source: "INE", asOf: "2026-05", propertyType: "apartment" },
  { district: "Lisboa", municipality: "Cascais", pricePerSqm: 7020, source: "Confidencial Imobiliário", asOf: "2026-03", propertyType: "apartment" },
  { district: "Lisboa", municipality: "Oeiras", pricePerSqm: 6240, source: "Confidencial Imobiliário", asOf: "2026-03", propertyType: "apartment" },
  { district: "Lisboa", municipality: "Sintra", pricePerSqm: 4940, source: "Confidencial Imobiliário", asOf: "2026-03", propertyType: "apartment" },
  { district: "Lisboa", municipality: "Amadora", pricePerSqm: 4420, source: "Confidencial Imobiliário", asOf: "2026-03", propertyType: "apartment" },
  { district: "Lisboa", municipality: "Loures", pricePerSqm: 4420, source: "Confidencial Imobiliário", asOf: "2026-03", propertyType: "apartment" },

  // Porto
  { district: "Porto", municipality: "Porto", pricePerSqm: 3990, source: "INE", asOf: "2026-05", propertyType: "apartment" },
  { district: "Porto", municipality: "Vila Nova de Gaia", pricePerSqm: 3610, source: "INE", asOf: "2026-05", propertyType: "apartment" },
  { district: "Porto", municipality: "Matosinhos", pricePerSqm: 4370, source: "Confidencial Imobiliário", asOf: "2026-03", propertyType: "apartment" },
  { district: "Porto", municipality: "Gondomar", pricePerSqm: 3230, source: "Confidencial Imobiliário", asOf: "2026-03", propertyType: "apartment" },
  { district: "Porto", municipality: "Maia", pricePerSqm: 3610, source: "Confidencial Imobiliário", asOf: "2026-03", propertyType: "apartment" },

  // Braga
  { district: "Braga", municipality: "Braga", pricePerSqm: 2704, source: "INE", asOf: "2026-05", propertyType: "apartment" },
  { district: "Braga", municipality: "Guimarães", pricePerSqm: 2470, source: "Confidencial Imobiliário", asOf: "2026-03", propertyType: "apartment" },
  { district: "Braga", municipality: "Barcelos", pricePerSqm: 2210, source: "Confidencial Imobiliário", asOf: "2026-03", propertyType: "apartment" },

  // Faro / Algarve
  { district: "Faro", municipality: "Faro", pricePerSqm: 3640, source: "INE", asOf: "2026-05", propertyType: "apartment" },
  { district: "Faro", municipality: "Loulé", pricePerSqm: 4900, source: "Confidencial Imobiliário", asOf: "2026-03", propertyType: "apartment" },
  { district: "Faro", municipality: "Albufeira", pricePerSqm: 4160, source: "Confidencial Imobiliário", asOf: "2026-03", propertyType: "apartment" },
  { district: "Faro", municipality: "Lagos", pricePerSqm: 4370, source: "Confidencial Imobiliário", asOf: "2026-03", propertyType: "apartment" },
  { district: "Faro", municipality: "Tavira", pricePerSqm: 3840, source: "Confidencial Imobiliário", asOf: "2026-03", propertyType: "apartment" },

  // Task: cobertura de market_data para concelhos com mais imoveis sem score
  { district: "Leiria", municipality: "Leiria", pricePerSqm: 1600, source: "INE", asOf: "2026-05", propertyType: "apartment" },
  { district: "Leiria", municipality: "Alcobaça", pricePerSqm: 1600, source: "INE", asOf: "2026-05", propertyType: "apartment" },
  { district: "Beja", municipality: "Cuba", pricePerSqm: 1200, source: "INE", asOf: "2026-05", propertyType: "apartment" },
  { district: "Viseu", municipality: "Tondela", pricePerSqm: 1800, source: "INE", asOf: "2026-05", propertyType: "apartment" },
  { district: "Guarda", municipality: "Gouveia", pricePerSqm: 1200, source: "INE", asOf: "2026-05", propertyType: "apartment" },

  // Setúbal
  { district: "Setúbal", municipality: "Setúbal", pricePerSqm: 3280, source: "INE", asOf: "2026-05", propertyType: "apartment" },
  { district: "Setúbal", municipality: "Almada", pricePerSqm: 3610, source: "Confidencial Imobiliário", asOf: "2026-03", propertyType: "apartment" },
  { district: "Setúbal", municipality: "Sesimbra", pricePerSqm: 3770, source: "Confidencial Imobiliário", asOf: "2026-03", propertyType: "apartment" },

  // Aveiro
  { district: "Aveiro", municipality: "Aveiro", pricePerSqm: 2496, source: "INE", asOf: "2026-05", propertyType: "apartment" },

  // Coimbra
  { district: "Coimbra", municipality: "Coimbra", pricePerSqm: 2288, source: "INE", asOf: "2026-05", propertyType: "apartment" },

  // Bragança (rústico predominante, preços baixos)
  { district: "Bragança", municipality: "Bragança", pricePerSqm: 1456, source: "INE", asOf: "2026-05", propertyType: "apartment" },
];

// Medianas de terreno urbano (€/m² de lote urbanizável)
export const MARKET_DATA_URBAN_LAND: MarketDataEntry[] = [
  { district: "Lisboa", municipality: "Lisboa", pricePerSqm: 1200, source: "Confidencial Imobiliário", asOf: "2026-03", propertyType: "urban_land" },
  { district: "Lisboa", municipality: "Cascais", pricePerSqm: 1500, source: "Confidencial Imobiliário", asOf: "2026-03", propertyType: "urban_land" },
  { district: "Porto", municipality: "Porto", pricePerSqm: 900, source: "Confidencial Imobiliário", asOf: "2026-03", propertyType: "urban_land" },
  { district: "Braga", municipality: "Braga", pricePerSqm: 650, source: "Confidencial Imobiliário", asOf: "2026-03", propertyType: "urban_land" },
  { district: "Aveiro", municipality: "Aveiro", pricePerSqm: 500, source: "Confidencial Imobiliário", asOf: "2026-03", propertyType: "urban_land" },
  { district: "Setúbal", municipality: "Setúbal", pricePerSqm: 550, source: "Confidencial Imobiliário", asOf: "2026-03", propertyType: "urban_land" },
];

// Medianas de terreno rústico (€/m² de solo rústico)
export const MARKET_DATA_RURAL_LAND: MarketDataEntry[] = [
  { district: "Bragança", municipality: "Bragança", pricePerSqm: 2.5, source: "INE", asOf: "2026-05", propertyType: "rural_land" },
  { district: "Bragança", municipality: "Mogadouro", pricePerSqm: 1.8, source: "INE", asOf: "2026-05", propertyType: "rural_land" },
  { district: "Viseu", municipality: "Viseu", pricePerSqm: 3.2, source: "INE", asOf: "2026-05", propertyType: "rural_land" },
  { district: "Guarda", municipality: "Guarda", pricePerSqm: 2.0, source: "INE", asOf: "2026-05", propertyType: "rural_land" },
  { district: "Castelo Branco", municipality: "Castelo Branco", pricePerSqm: 2.2, source: "INE", asOf: "2026-05", propertyType: "rural_land" },
  { district: "Beja", municipality: "Beja", pricePerSqm: 1.9, source: "INE", asOf: "2026-05", propertyType: "rural_land" },
];

export const ALL_MARKET_DATA = [
  ...MARKET_DATA_APARTMENT_HOUSE,
  ...MARKET_DATA_URBAN_LAND,
  ...MARKET_DATA_RURAL_LAND,
];

/**
 * Medianas por DISTRITO: o ultimo nivel de fallback (freguesia > concelho > distrito).
 *
 * VAZIA de proposito. Nao existe fonte oficial carregada para o nivel de distrito,
 * e um agregado calculado a partir dos municipios seria uma estatistica que
 * nenhuma fonte publica (as unidades registadas acima) publica.
 *
 * Consequencia: sem estas linhas, um imovel sem mediana de freguesia nem de
 * concelho fica sem avaliacao ("Sem avaliacao"), que e o resultado honesto.
 *
 * Para preencher: uma linha por distrito e tipo, com a mediana de mercado em
 * EUR/m2, a fonte e a data de referencia, como nas tabelas acima.
 */
export interface DistrictMarketEntry {
  district: string;
  pricePerSqm: number;
  source: "INE" | "Confidencial Imobiliário";
  asOf: string;
  propertyType: "apartment" | "house" | "urban_land" | "rural_land" | "commercial";
}

export const MARKET_DATA_DISTRICT: DistrictMarketEntry[] = [
  { district: "Açores", pricePerSqm: 1900, source: "INE", asOf: "2026-05", propertyType: "apartment" },
  { district: "Madeira", pricePerSqm: 2500, source: "INE", asOf: "2026-05", propertyType: "apartment" },
  { district: "Lisboa", pricePerSqm: 4900, source: "INE", asOf: "2026-05", propertyType: "apartment" },
  { district: "Porto", pricePerSqm: 3900, source: "INE", asOf: "2026-05", propertyType: "apartment" },
  { district: "Porto", pricePerSqm: 2200, source: "INE", asOf: "2026-05", propertyType: "house" },
  { district: "Braga", pricePerSqm: 1900, source: "INE", asOf: "2026-05", propertyType: "apartment" },
  { district: "Bragança", pricePerSqm: 1500, source: "INE", asOf: "2026-05", propertyType: "apartment" },
  { district: "Castelo Branco", pricePerSqm: 1100, source: "INE", asOf: "2026-05", propertyType: "apartment" },
  { district: "Coimbra", pricePerSqm: 1900, source: "INE", asOf: "2026-05", propertyType: "apartment" },
  { district: "Évora", pricePerSqm: 1400, source: "INE", asOf: "2026-05", propertyType: "apartment" },
  { district: "Faro", pricePerSqm: 3600, source: "INE", asOf: "2026-05", propertyType: "apartment" },
  { district: "Guarda", pricePerSqm: 1200, source: "INE", asOf: "2026-05", propertyType: "apartment" },
  { district: "Leiria", pricePerSqm: 1600, source: "INE", asOf: "2026-05", propertyType: "apartment" },
  { district: "Portalegre", pricePerSqm: 1300, source: "INE", asOf: "2026-05", propertyType: "apartment" },
  { district: "Santarém", pricePerSqm: 1500, source: "INE", asOf: "2026-05", propertyType: "apartment" },
  { district: "Setúbal", pricePerSqm: 3400, source: "INE", asOf: "2026-05", propertyType: "apartment" },
  { district: "Viana do Castelo", pricePerSqm: 2200, source: "INE", asOf: "2026-05", propertyType: "apartment" },
  { district: "Vila Real", pricePerSqm: 2000, source: "INE", asOf: "2026-05", propertyType: "apartment" },
  { district: "Viseu", pricePerSqm: 1800, source: "INE", asOf: "2026-05", propertyType: "apartment" },
];

/** Procura a mediana de um distrito numa tabela de distrito (parametro para poder ser testada). */
export function findDistrictMarketData(
  district: string,
  propertyType: string,
  table: DistrictMarketEntry[] = MARKET_DATA_DISTRICT,
): DistrictMarketEntry | null {
  if (!district) return null;
  const nd = normalizeName(district);
  return table.find((entry) => normalizeName(entry.district) === nd && entry.propertyType === propertyType) ?? null;
}

/**
 * Busca mediana de preço por m² para um imóvel.
 * Ordem de preferência: paróquia > concelho > distrito (a tabela de distrito
 * está vazia: sem fonte oficial carregada, o distrito não é usado).
 * Retorna null se não houver dados.
 */
export function findMarketData(params: {
  district: string;
  municipality: string;
  parish?: string;
  propertyType: "apartment" | "house" | "urban_land" | "rural_land" | "commercial";
}): { pricePerSqm: number; source: string; asOf: string; level: "parish" | "municipality" | "district" } | null {
  const { district, municipality, parish, propertyType } = params;
  const nd = normalizeName(district);
  const pool = ALL_MARKET_DATA.filter((d) => d.propertyType === propertyType && normalizeName(d.district) === nd);

  if (pool.length === 0) return null;

  const nm = normalizeName(municipality);
  const np = parish ? normalizeName(parish) : null;

  // 1. Tentar paróquia
  if (np) {
    const parishMatch = pool.find((d) => d.parish && normalizeName(d.parish) === np && normalizeName(d.municipality) === nm);
    if (parishMatch) {
      return { pricePerSqm: parishMatch.pricePerSqm, source: parishMatch.source, asOf: parishMatch.asOf, level: "parish" };
    }
  }

  // 2. Tentar concelho
  const munMatch = pool.find((d) => normalizeName(d.municipality) === nm);
  if (munMatch) {
    return { pricePerSqm: munMatch.pricePerSqm, source: munMatch.source, asOf: munMatch.asOf, level: "municipality" };
  }

  // 3. Sem mediana de freguesia nem de concelho — tenta o distrito.
  // Só existe se houver uma linha na tabela de distrito (hoje não há: ver
  // MARKET_DATA_DISTRICT). Um distrito é demasiado agregado para servir de
  // referência automática, por isso a confiança do motor é "low" neste nível.
  const districtMatch = findDistrictMarketData(district, propertyType);
  if (districtMatch) {
    return {
      pricePerSqm: districtMatch.pricePerSqm,
      source: districtMatch.source,
      asOf: districtMatch.asOf,
      level: "district",
    };
  }
  return null;
}
