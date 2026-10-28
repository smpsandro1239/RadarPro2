import { NextResponse } from "next/server";
import { calculateOpportunityScore, calculateAVM } from "@/lib/scoring";

export async function POST(request: Request) {
  try {
    const { price, marketValue, discountPct, rentability, sourceName, district, type, createdAt, isActive } = await request.json();

    const score = calculateOpportunityScore({
      price,
      marketValue,
      discountPct,
      rentability,
      sourceName,
      district,
      type,
      createdAt: createdAt ? new Date(createdAt) : null,
      isActive: isActive ?? true,
    });

    const avm = calculateAVM({ district, type, price, marketValue });

    return NextResponse.json({ score, avm });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
