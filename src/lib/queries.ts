import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import { properties } from "@/db/schema";
import { desc, eq, and } from "drizzle-orm";

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

  if (listingType && listingType.startsWith("auction_")) {
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
