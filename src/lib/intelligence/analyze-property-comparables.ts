import { and, eq, ne } from "drizzle-orm";
import { db } from "@/db";
import { properties } from "@/db/schema";
import {
  compareProperties,
  type ComparableAnalysis,
  type ComparableProperty,
} from "@/lib/intelligence/comparable-properties";

function toComparable(row: typeof properties.$inferSelect): ComparableProperty {
  return {
    id: row.id,
    title: row.title,
    price: row.price,
    usableAreaSqm: row.usableAreaSqm,
    grossAreaSqm: row.grossAreaSqm,
    landAreaSqm: row.landAreaSqm,
    district: row.district,
    municipality: row.municipality,
    type: row.type,
    assetClass: row.assetClass,
    isAuction: row.isAuction,
    isActive: row.isActive,
    checkStatus: row.checkStatus,
  };
}

/** Analisa um imóvel com anúncios activos da mesma localização. */
export async function analyzePropertyComparables(
  propertyId: string,
): Promise<ComparableAnalysis | null> {
  const [subjectRow] = await db
    .select()
    .from(properties)
    .where(eq(properties.id, propertyId))
    .limit(1);

  if (!subjectRow) return null;

  const subject = toComparable(subjectRow);
  const locationColumn = subject.municipality
    ? properties.municipality
    : properties.district;
  const locationValue = subject.municipality || subject.district;

  if (!locationValue) return compareProperties(subject, []);

  const candidates = await db
    .select()
    .from(properties)
    .where(
      and(
        eq(properties.isActive, true),
        eq(locationColumn, locationValue),
        ne(properties.id, propertyId),
      ),
    );

  return compareProperties(subject, candidates.map(toComparable));
}
