import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import { properties } from "@/db/schema";
import { desc, eq, and, sql } from "drizzle-orm";
import { showSeedData } from "@/lib/data-origin";
import { demoDataCondition } from "@/lib/data-origin-sql";

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

const db = drizzle(client);

/**
 * Condicoes das consultas publicas. Por omissao os dados de demonstracao
 * ficam de fora (SHOW_SEED_DATA=true mostra-os, com o banner de aviso).
 */
function publicConditions() {
  const conditions = [eq(properties.isActive, true)];
  if (!showSeedData()) conditions.push(demoDataCondition());
  return conditions;
}

export async function getLatestProperties() {
  return await db
    .select()
    .from(properties)
    .where(and(...publicConditions()))
    .orderBy(desc(properties.score))
    .limit(50);
}

export async function getPropertiesByDistrict(district: string) {
  return await db
    .select()
    .from(properties)
    .where(and(...publicConditions(), eq(properties.district, district)));
}

export async function getAllActiveProperties(listingType?: string, isAuction?: string) {
  const conditions = publicConditions();

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
    .where(and(...publicConditions()));

  return Number(result[0]?.count || 0);
}

export async function getDistinctSourceCount() {
  const result = await db
    .select({ sourceName: properties.sourceName })
    .from(properties)
    .where(and(...publicConditions()))
    .groupBy(properties.sourceName);

  return result.length;
}
