import { NextResponse } from "next/server";
import { db } from "@/db";
import { properties } from "@/db/schema";
import { eq, and, lt, gt, gte, lte, ilike, or, sql, count } from "drizzle-orm";
import { searchProperties } from "@/lib/typesense";
import { isTypesenseConfigured, getSearchModeLabel } from "@/lib/search-config";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const q = (searchParams.get("q") || "") as string;
    const district = (searchParams.get("district") || undefined) as string | undefined;
    const municipality = (searchParams.get("municipality") || undefined) as string | undefined;
    const type = (searchParams.get("type") || undefined) as string | undefined;
    const source = (searchParams.get("source") || undefined) as string | undefined;
    const minPrice = searchParams.get("min_price") || undefined;
    const maxPrice = searchParams.get("max_price") || undefined;
    const minScore = searchParams.get("min_score") || undefined;
    const minDiscount = searchParams.get("min_discount") || undefined;
    const isAuction = searchParams.get("is_auction") || undefined;
    const page = parseInt(searchParams.get("page") || "1");
    const perPage = parseInt(searchParams.get("per_page") || "20");
    const sortBy = searchParams.get("sort_by") || "score";

    const configured = isTypesenseConfigured();
    let searchSource: "typesense" | "db-fallback" | "db-primary" = configured ? "typesense" : "db-primary";

    // ---------- Tenta Typesense primeiro (se configurado) ----------
    if (configured) {
      try {
        const result = await searchProperties({
          q,
          district,
          type,
          source,
          minPrice: minPrice ? parseInt(minPrice) : undefined,
          maxPrice: maxPrice ? parseInt(maxPrice) : undefined,
          minScore: minScore ? parseInt(minScore) : undefined,
          isAuction: isAuction ? isAuction === "true" : undefined,
          page,
          perPage,
        });

        if (result) {
          return NextResponse.json({
            properties: result.hits.map((hit: any) => ({
              id: hit.id,
              title: hit.title,
              district: hit.district,
              municipality: hit.municipality,
              sourceName: hit.source_name,
              source: hit.source,
              price: hit.price,
              marketValue: hit.market_value ?? null,
              discountPct: hit.discount_pct ?? null,
              score: hit.score,
              rentability: hit.rentability ?? null,
              type: hit.type,
              images:
                typeof hit.images === "string" ? JSON.parse(hit.images || "[]") : (hit.images || []),
              isAuction: hit.is_auction,
              isActive: hit.is_active,
              currentBid: hit.current_bid ?? null,
              maxBid: hit.max_bid ?? null,
              createdAt: hit.created_at ? new Date(hit.created_at * 1000).toISOString() : null,
              updatedAt: hit.updated_at ? new Date(hit.updated_at * 1000).toISOString() : null,
            })),
            total: result.found,
            page: result.page,
            perPage: result.perPage,
            totalPages: Math.ceil(result.found / result.perPage),
            facets: {
              districts: (result.facets?.find((f: any) => fieldName(f) === "district")?.stats || []).map(
                (s: any) => ({ value: s.value, count: s.count })
              ) || [],
              types: (result.facets?.find((f: any) => fieldName(f) === "type")?.stats || []).map(
                (s: any) => ({ value: s.value, count: s.count })
              ) || [],
              sources: (result.facets?.find((f: any) => fieldName(f) === "source")?.stats || []).map(
                (s: any) => ({ value: s.value, count: s.count })
              ) || [],
            },
            meta: {
              searchSource,
              typesenseConfigured: true,
              mode: getSearchModeLabel("typesense"),
            },
          });
        }
      } catch (err) {
        console.error("Typesense search failed, falling back to DB:", err);
        searchSource = "db-fallback";
      }
    }

    // ---------- Fallback: busca na BD ----------
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
    if (municipality) conditions.push(eq(properties.municipality, municipality));
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
      meta: {
        searchSource,
        typesenseConfigured: configured,
        mode: getSearchModeLabel(searchSource === "typesense" ? "typesense" : "db-primary"),
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

function fieldName(facet: any): string | undefined {
  return facet?.field_name || facet?.field || undefined;
}
