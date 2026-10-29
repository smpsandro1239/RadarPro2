import { NextResponse } from "next/server";
import { db } from "@/db";
import { properties } from "@/db/schema";
import { eq, sql, count } from "drizzle-orm";

export async function GET() {
  const checks = {
    status: "ok",
    timestamp: new Date().toISOString(),
    database: "unknown",
    properties: { total: 0, active: 0 },
    cron: {
      lastLinkCheck: null as string | null,
      lastGeocode: null as string | null,
    },
  };

  try {
    // Check database connection
    const result = await db.select({ count: count() }).from(properties);
    checks.database = "connected";

    const activeResult = await db
      .select({ count: count() })
      .from(properties)
      .where(eq(properties.isActive, true));

    checks.properties.total = result[0]?.count || 0;
    checks.properties.active = activeResult[0]?.count || 0;

    // Check last link verification
    const lastChecked = await db
      .select({ lastChecked: properties.lastChecked })
      .from(properties)
      .where(eq(properties.isActive, true))
      .orderBy(properties.lastChecked)
      .limit(1);

    if (lastChecked.length > 0 && lastChecked[0].lastChecked) {
      checks.cron.lastLinkCheck = new Date(lastChecked[0].lastChecked).toISOString();
    }

    // Check if there are properties that need geocoding
    const needsGeocoding = await db
      .select({ count: count() })
      .from(properties)
      .where(sql`${properties.lat} IS NULL`);

    if (needsGeocoding[0]?.count > 0) {
      checks.status = "warning";
    }

    return NextResponse.json(checks);
  } catch (error) {
    checks.status = "error";
    checks.database = "disconnected";
    return NextResponse.json(checks, { status: 503 });
  }
}
