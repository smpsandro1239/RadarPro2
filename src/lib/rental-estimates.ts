/**
 * RadarPro Portugal - Estimativas de renda mensal por distrito e tipologia
 *
 * Valores de referência para cálculo de yield. Fontes: Idealista, INE,
 * Confidencial Imobiliário (1º trimestre 2026).
 *
 * Estratégia de preenchimento para imóveis existentes:
 * - Se o tipo do imóvel estiver nesta tabela → usar o valor daí
 * - Caso contrário → null (não inventar)
 */

export interface RentalEstimate {
  district: string;
  municipality: string;
  type: string; // T0, T1, T2, T3, T4, V2, V3, V4, V5, Loja, Armazém, Garagem
  monthlyRent: number; // EUR/mês
  source: "Idealista" | "INE" | "Confidencial Imobiliário";
  asOf: string; // YYYY-MM
}

export const RENTAL_ESTIMATES: RentalEstimate[] = [
  // Lisboa (Idealista Q1 2026)
  { district: "Lisboa", municipality: "Lisboa", type: "T0", monthlyRent: 750, source: "Idealista", asOf: "2026-03" },
  { district: "Lisboa", municipality: "Lisboa", type: "T1", monthlyRent: 950, source: "Idealista", asOf: "2026-03" },
  { district: "Lisboa", municipality: "Lisboa", type: "T2", monthlyRent: 1400, source: "Idealista", asOf: "2026-03" },
  { district: "Lisboa", municipality: "Lisboa", type: "T3", monthlyRent: 1900, source: "Idealista", asOf: "2026-03" },
  { district: "Lisboa", municipality: "Lisboa", type: "T4", monthlyRent: 2600, source: "Idealista", asOf: "2026-03" },

  // Porto (Idealista Q1 2026)
  { district: "Porto", municipality: "Porto", type: "T0", monthlyRent: 550, source: "Idealista", asOf: "2026-03" },
  { district: "Porto", municipality: "Porto", type: "T1", monthlyRent: 700, source: "Idealista", asOf: "2026-03" },
  { district: "Porto", municipality: "Porto", type: "T2", monthlyRent: 1000, source: "Idealista", asOf: "2026-03" },
  { district: "Porto", municipality: "Porto", type: "T3", monthlyRent: 1400, source: "Idealista", asOf: "2026-03" },
  { district: "Porto", municipality: "Porto", type: "T4", monthlyRent: 1900, source: "Idealista", asOf: "2026-03" },

  // Braga (Idealista Q1 2026)
  { district: "Braga", municipality: "Braga", type: "T0", monthlyRent: 450, source: "Idealista", asOf: "2026-03" },
  { district: "Braga", municipality: "Braga", type: "T1", monthlyRent: 600, source: "Idealista", asOf: "2026-03" },
  { district: "Braga", municipality: "Braga", type: "T2", monthlyRent: 850, source: "Idealista", asOf: "2026-03" },
  { district: "Braga", municipality: "Braga", type: "T3", monthlyRent: 1200, source: "Idealista", asOf: "2026-03" },
  { district: "Braga", municipality: "Braga", type: "T4", monthlyRent: 1600, source: "Idealista", asOf: "2026-03" },

  // Faro (Idealista Q1 2026)
  { district: "Faro", municipality: "Faro", type: "T0", monthlyRent: 500, source: "Idealista", asOf: "2026-03" },
  { district: "Faro", municipality: "Faro", type: "T1", monthlyRent: 700, source: "Idealista", asOf: "2026-03" },
  { district: "Faro", municipality: "Faro", type: "T2", monthlyRent: 1100, source: "Idealista", asOf: "2026-03" },
  { district: "Faro", municipality: "Faro", type: "T3", monthlyRent: 1500, source: "Idealista", asOf: "2026-03" },
  { district: "Faro", municipality: "Faro", type: "T4", monthlyRent: 2000, source: "Idealista", asOf: "2026-03" },

  // Setúbal (Idealista Q1 2026)
  { district: "Setúbal", municipality: "Setúbal", type: "T0", monthlyRent: 480, source: "Idealista", asOf: "2026-03" },
  { district: "Setúbal", municipality: "Setúbal", type: "T1", monthlyRent: 650, source: "Idealista", asOf: "2026-03" },
  { district: "Setúbal", municipality: "Setúbal", type: "T2", monthlyRent: 950, source: "Idealista", asOf: "2026-03" },
  { district: "Setúbal", municipality: "Setúbal", type: "T3", monthlyRent: 1300, source: "Idealista", asOf: "2026-03" },
  { district: "Setúbal", municipality: "Setúbal", type: "T4", monthlyRent: 1800, source: "Idealista", asOf: "2026-03" },

  // Aveiro (Idealista Q1 2026)
  { district: "Aveiro", municipality: "Aveiro", type: "T0", monthlyRent: 450, source: "Idealista", asOf: "2026-03" },
  { district: "Aveiro", municipality: "Aveiro", type: "T1", monthlyRent: 620, source: "Idealista", asOf: "2026-03" },
  { district: "Aveiro", municipality: "Aveiro", type: "T2", monthlyRent: 900, source: "Idealista", asOf: "2026-03" },
  { district: "Aveiro", municipality: "Aveiro", type: "T3", monthlyRent: 1250, source: "Idealista", asOf: "2026-03" },
  { district: "Aveiro", municipality: "Aveiro", type: "T4", monthlyRent: 1700, source: "Idealista", asOf: "2026-03" },

  // Coimbra (Idealista Q1 2026)
  { district: "Coimbra", municipality: "Coimbra", type: "T0", monthlyRent: 420, source: "Idealista", asOf: "2026-03" },
  { district: "Coimbra", municipality: "Coimbra", type: "T1", monthlyRent: 580, source: "Idealista", asOf: "2026-03" },
  { district: "Coimbra", municipality: "Coimbra", type: "T2", monthlyRent: 800, source: "Idealista", asOf: "2026-03" },
  { district: "Coimbra", municipality: "Coimbra", type: "T3", monthlyRent: 1100, source: "Idealista", asOf: "2026-03" },
  { district: "Coimbra", municipality: "Coimbra", type: "T4", monthlyRent: 1500, source: "Idealista", asOf: "2026-03" },

  // Lojas e armazéns (Confidencial Imobiliário Q1 2026)
  { district: "Lisboa", municipality: "Lisboa", type: "Loja", monthlyRent: 1200, source: "Confidencial Imobiliário", asOf: "2026-03" },
  { district: "Porto", municipality: "Porto", type: "Loja", monthlyRent: 800, source: "Confidencial Imobiliário", asOf: "2026-03" },
  { district: "Lisboa", municipality: "Lisboa", type: "Armazém", monthlyRent: 600, source: "Confidencial Imobiliário", asOf: "2026-03" },
  { district: "Porto", municipality: "Porto", type: "Armazém", monthlyRent: 400, source: "Confidencial Imobiliário", asOf: "2026-03" },
  { district: "Lisboa", municipality: "Lisboa", type: "Garagem", monthlyRent: 80, source: "Confidencial Imobiliário", asOf: "2026-03" },
  { district: "Porto", municipality: "Porto", type: "Garagem", monthlyRent: 60, source: "Confidencial Imobiliário", asOf: "2026-03" },
];

/**
 * Busca a estimativa de renda mensal para um imóvel.
 * Ordem: tipo exato → distrito + município → distrito → null
 */
export function findRentalEstimate(params: {
  district: string;
  municipality: string;
  type: string;
}): { monthlyRent: number; source: string; asOf: string } | null {
  const { district, municipality, type } = params;

  // 1. Tentar tipo exato + município
  const exact = RENTAL_ESTIMATES.find(
    (e) => e.district === district && e.municipality === municipality && e.type === type,
  );
  if (exact) return { monthlyRent: exact.monthlyRent, source: exact.source, asOf: exact.asOf };

  // 2. Tentar tipo exato + distrito (qualquer município)
  const districtMatch = RENTAL_ESTIMATES.find(
    (e) => e.district === district && e.type === type,
  );
  if (districtMatch)
    return { monthlyRent: districtMatch.monthlyRent, source: districtMatch.source, asOf: districtMatch.asOf };

  return null;
}
