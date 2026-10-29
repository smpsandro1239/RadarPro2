import { NextResponse } from "next/server";
import { calculateAdvancedAVM } from "@/lib/avm";
import { calculateOpportunityScore } from "@/lib/scoring";

export async function POST(request: Request) {
  try {
    const { district, municipality, type, price, marketValue, source, sourceName, rentability, createdAt, isActive } = await request.json();

    const avm = calculateAdvancedAVM({
      district,
      municipality: municipality || district,
      type,
      price,
      marketValue,
      source: source || "portal",
      sqm: 0,
    });

    const score = calculateOpportunityScore({
      price,
      marketValue,
      discountPct: marketValue ? Math.round(((marketValue - price) / marketValue) * 100) : null,
      rentability,
      sourceName: sourceName || source || "portal",
      district,
      type,
      createdAt: createdAt ? new Date(createdAt) : null,
      isActive: isActive ?? true,
    });

    return NextResponse.json({ avm, score });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
