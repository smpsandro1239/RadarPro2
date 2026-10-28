import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import { properties } from "@/db/schema";
import { desc, eq } from "drizzle-orm";

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

const db = drizzle(client);

export async function getLatestProperties() {
  return await db.select().from(properties).orderBy(desc(properties.createdAt)).limit(12);
}

export async function getPropertiesByDistrict(district: string) {
  return await db.select().from(properties).where(eq(properties.district, district));
}
