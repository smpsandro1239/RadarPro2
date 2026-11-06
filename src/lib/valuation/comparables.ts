import { db } from "@/db";
import { properties } from "@/db/schema";
import { eq, ne, and } from "drizzle-orm";

export interface Comparable {
  id: string;
  title: string | null;
  price: number | null;
  sqm: number | null;
  pricePerSqm: number | null;
  score: number | null;
}

/** Janela de area entre o alvo e um comparavel (fator). */
const SQMS_TOLERANCE = 0.2;

function deviationSqms(sqm: number | null, candidateSqm: number | null): number | null {
  if (sqm === null || candidateSqm === null || candidateSqm <= 0) return null;
  return Math.abs(candidateSqm - sqm) / sqm;
}

/**
 * Comparaveis do mesmo distrito/municipio para um imovel alvo.
 * Filtra por janela de area (+-20%) quando ambas as areas sao conhecidas,
 * ordena por proximidade de area e depois por score.
 */
export async function findComparables(
  propertyId: string,
  district: string,
  municipality: string,
  type: string,
  sqm: number | null,
  limit = 3,
): Promise<Comparable[]> {
  const rows = await db
    .select({
      id: properties.id,
      title: properties.title,
      price: properties.price,
      areaSqm: properties.areaSqm,
      score: properties.score,
    })
    .from(properties)
    .where(
      and(
        ne(properties.id, propertyId),
        eq(properties.district, district),
        eq(properties.municipality, municipality),
        eq(properties.isActive, true),
      ),
    );

  const scored: Array<Comparable & { deviation: number | null }> = [];
  for (const row of rows) {
    const candidateSqm = row.areaSqm ?? null;
    const deviation = deviationSqms(sqm, candidateSqm);
    if (deviation !== null && deviation > SQMS_TOLERANCE) continue;
    scored.push({
      id: row.id,
      title: row.title ?? null,
      price: row.price ?? null,
      sqm: candidateSqm,
      pricePerSqm: candidateSqm && candidateSqm > 0 ? Number(row.price) / Number(candidateSqm) : null,
      score: row.score ?? null,
      deviation,
    });
  }

  scored.sort((a, b) => (a.deviation ?? Number.MAX_SAFE_INTEGER) - (b.deviation ?? Number.MAX_SAFE_INTEGER) || ((b.score ?? 0) - (a.score ?? 0)));
  return scored.slice(0, limit).map(({ deviation: _deviation, ...comparable }) => comparable);
}
