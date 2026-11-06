import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import { properties } from "@/db/schema";
import { and, eq, sql } from "drizzle-orm";

export interface RankedProperty {
  id: string;
  title: string;
  district: string;
  municipality: string;
  price: number;
  score: number | null;
  rentability: number | null;
  discountPct: number | null;
  type: string;
  images?: string | null;
  assetClass?: string | null;
}

let cachedClient: ReturnType<typeof createClient> | null = null;

function getClient() {
  if (!cachedClient) {
    cachedClient = createClient({
      url: process.env.TURSO_DATABASE_URL ?? "file:./local.db",
      authToken: process.env.TURSO_AUTH_TOKEN ?? "",
    });
  }
  return cachedClient;
}

let cachedDb: ReturnType<typeof drizzle> | null = null;

function getDb() {
  if (!cachedDb) {
    cachedDb = drizzle(getClient(), { schema: { properties } });
  }
  return cachedDb;
}

/** Top imóveis reais (data_origin='scrape', is_active) ordenados por score. */
export async function getTopScrapeProperties(limit = 50): Promise<RankedProperty[]> {
  const rows = await getDb()
    .select({
      id: properties.id,
      title: properties.title,
      district: properties.district,
      municipality: properties.municipality,
      price: properties.price,
      score: properties.score,
      rentability: properties.rentability,
      discountPct: properties.discountPct,
      type: properties.type,
      images: properties.images,
      assetClass: properties.assetClass,
    })
    .from(properties)
    .where(and(eq(properties.dataOrigin, "scrape"), eq(properties.isActive, true)))
    .orderBy(sql`${properties.score} DESC`)
    .limit(limit);
  return rows;
}

/** Agrupa por distrito, mantendo apenas os melhores N por distrito. */
export function groupTopByDistrict<T extends { district: string }>(
  items: T[],
  limitPerDistrict = 3,
  keyOf: (item: T) => string = (item) => item.district,
): Map<string, T[]> {
  const grouped = new Map<string, T[]>();
  for (const item of items) {
    const key = keyOf(item);
    const bucket = grouped.get(key) ?? [];
    bucket.push(item);
    grouped.set(key, bucket);
  }
  const result = new Map<string, T[]>();
  for (const [key, bucket] of grouped) {
    result.set(key, bucket.slice(0, limitPerDistrict));
  }
  return result;
}
