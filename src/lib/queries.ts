import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import { properties } from "@/db/schema";
import { desc, eq, and, sql } from "drizzle-orm";

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

const db = drizzle(client);

export async function getLatestProperties() {
  return await db
    .select()
    .from(properties)
    .where(eq(properties.isActive, true))
    .orderBy(desc(properties.score))
    .limit(50);
}

export async function getPropertiesByDistrict(district: string) {
  return await db
    .select()
    .from(properties)
    .where(and(eq(properties.district, district), eq(properties.isActive, true)));
}

export async function getAllActiveProperties(listingType?: string, isAuction?: string) {
  const conditions = [eq(properties.isActive, true)];

  if (isAuction === "true") {
    conditions.push(eq(properties.isAuction, true));
  } else if (isAuction === "false") {
    conditions.push(eq(properties.isAuction, false));
  }

  if (listingType === "fixed_price") {
    conditions.push(eq(properties.isAuction, false));
  } else if (listingType && listingType.startsWith("auction_")) {
    conditions.push(eq(properties.isAuction, true));
    if (listingType !== "auction_\*") {
      conditions.push(eq(properties.auctionType, listingType.replace("auction_", "") as any));
    }
  }

  return await db
    .select()
    .from(properties)
    .where(and(...conditions))
    .orderBy(desc(properties.score));
}

export async function getTotalActiveProperties() {
  const result = await db
    .select({ count: sql`count(*)`.mapWith(Number) })
    .from(properties)
    .where(eq(properties.isActive, true));

  return Number(result[0]?.count || 0);
}

export async function getDistinctSourceCount() {
  const result = await db
    .select({ sourceName: properties.sourceName })
    .from(properties)
    .where(eq(properties.isActive, true))
    .groupBy(properties.sourceName);

  return result.length;
}
