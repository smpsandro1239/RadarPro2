import { NextResponse } from "next/server";
import { db } from "@/db";
import { properties } from "@/db/schema";
import { eq, sql, count } from "drizzle-orm";
import { isTypesenseConfigured } from "@/lib/search-config";

export async function GET() {
  const start = Date.now();
  const checks: any = {
    status: "ok",
    timestamp: new Date().toISOString(),
    database: { reachable: false, latencyMs: null },
    properties: { total: 0, active: 0 },
    search: {
      mode: isTypesenseConfigured() ? "typesense" : "db-primary",
      typesenseConfigured: isTypesenseConfigured(),
      typesenseReachable: null,
    },
    sentry: { configured: !!process.env.SENTRY_DSN },
    ingest: {
      lastRun: null,
      sourcesOk: 0,
      sourcesFailed: 0,
    },
    cron: {
      lastLinkCheck: null as string | null,
      lastGeocode: null as string | null,
    },
  };

  try {
    // Check database connection
    const dbStart = Date.now();
    const result = await db.select({ count: count() }).from(properties);
    checks.database.reachable = true;
    checks.database.latencyMs = Date.now() - dbStart;

    const activeResult = await db
      .select({ count: count() })
      .from(properties)
      .where(eq(properties.isActive, true));

    checks.properties.total = Number(result[0]?.count || 0);
    checks.properties.active = Number(activeResult[0]?.count || 0);

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

    checks.status = "ok";
    return NextResponse.json(checks);
  } catch (error) {
    checks.status = "error";
    checks.database.reachable = false;
    checks.database.latencyMs = Date.now() - start;
    return NextResponse.json(checks, { status: 503 });
  }
}
