import { NextResponse } from "next/server";
import { db } from "@/db";
import { properties } from "@/db/schema";
import { eq, and, lte, ilike, sql } from "drizzle-orm";
import { parseRadarQuery } from "@/lib/radar-parse";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const query = typeof body?.query === "string" ? body.query.trim() : "";
    const parsed = parseRadarQuery(query);

    const conditions: any[] = [eq(properties.isActive, true)];
    if (parsed.district) conditions.push(eq(properties.district, parsed.district));
    if (parsed.maxPrice) conditions.push(lte(properties.price, parsed.maxPrice));
    if (parsed.isAuction) conditions.push(eq(properties.isAuction, true));
    if (parsed.typeHint) conditions.push(ilike(properties.type, `%${parsed.typeHint}%`));

    const results = await db
      .select()
      .from(properties)
      .where(and(...conditions))
      .orderBy(sql`${properties.score} DESC`)
      .limit(50);

    return NextResponse.json({
      query,
      parsed,
      results,
      total: results.length,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
