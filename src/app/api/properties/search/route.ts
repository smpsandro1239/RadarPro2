import { NextResponse } from "next/server";
import { db } from "@/db";
import { properties } from "@/db/schema";
import { eq, and, lt, gt, gte, lte, ilike, or, sql, count } from "drizzle-orm";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const q = searchParams.get("q") || "";
    const district = searchParams.get("district");
    const type = searchParams.get("type");
    const source = searchParams.get("source");
    const minPrice = searchParams.get("min_price");
    const maxPrice = searchParams.get("max_price");
    const minScore = searchParams.get("min_score");
    const minDiscount = searchParams.get("min_discount");
    const isAuction = searchParams.get("is_auction");
    const page = parseInt(searchParams.get("page") || "1");
    const perPage = parseInt(searchParams.get("per_page") || "20");
    const sortBy = searchParams.get("sort_by") || "score";

    const offset = (page - 1) * perPage;

    const conditions: any[] = [eq(properties.isActive, true)];

    if (q) {
      conditions.push(
        or(
          ilike(properties.title, `%${q}%`),
          ilike(properties.district, `%${q}%`),
          ilike(properties.municipality, `%${q}%`),
          ilike(properties.type, `%${q}%`),
          ilike(properties.sourceName, `%${q}%`)
        )
      );
    }
    if (district) conditions.push(eq(properties.district, district));
    if (type) conditions.push(eq(properties.type, type));
    if (source) conditions.push(eq(properties.sourceName, source));
    if (minPrice) conditions.push(gte(properties.price, parseFloat(minPrice)));
    if (maxPrice) conditions.push(lte(properties.price, parseFloat(maxPrice)));
    if (minScore) conditions.push(gte(properties.score, parseInt(minScore)));
    if (minDiscount)
      conditions.push(gte(properties.discountPct, parseInt(minDiscount)));
    if (isAuction === "true") conditions.push(eq(properties.isAuction, true));
    if (isAuction === "false") conditions.push(eq(properties.isAuction, false));

    // Fetch properties
    const results = await db
      .select()
      .from(properties)
      .where(and(...conditions))
      .orderBy(
        sortBy === "price_asc"
          ? properties.price
          : sortBy === "price_desc"
            ? sql`${properties.price} DESC`
            : sortBy === "discount_desc"
              ? sql`${properties.discountPct} DESC`
              : sql`${properties.score} DESC`
      )
      .limit(perPage)
      .offset(offset);

    // Get total count for pagination
    const [{ count: totalCount }] = await db
      .select({ count: count() })
      .from(properties)
      .where(and(...conditions));

    // Get facets
    const [districtFacet, typeFacet, sourceFacet] = await Promise.all([
      db
        .select({
          district: properties.district,
          count: count(),
        })
        .from(properties)
        .where(and(eq(properties.isActive, true)))
        .groupBy(properties.district),
      db
        .select({
          type: properties.type,
          count: count(),
        })
        .from(properties)
        .where(and(eq(properties.isActive, true)))
        .groupBy(properties.type),
      db
        .select({
          source: properties.sourceName,
          count: count(),
        })
        .from(properties)
        .where(and(eq(properties.isActive, true)))
        .groupBy(properties.sourceName),
    ]);

    return NextResponse.json({
      properties: results,
      total: totalCount,
      page,
      perPage,
      totalPages: Math.ceil(totalCount / perPage),
      facets: {
        districts: districtFacet.map((d: any) => ({ value: d.district, count: Number(d.count) })),
        types: typeFacet.map((t: any) => ({ value: t.type, count: Number(t.count) })),
        sources: sourceFacet.map((s: any) => ({ value: s.source, count: Number(s.count) })),
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
