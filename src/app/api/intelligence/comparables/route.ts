import { NextResponse } from "next/server";
import { analyzePropertyComparables } from "@/lib/intelligence/analyze-property-comparables";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const propertyId = searchParams.get("propertyId")?.trim();
    if (!propertyId) {
      return NextResponse.json({ error: "propertyId é obrigatório." }, { status: 400 });
    }

    const analysis = await analyzePropertyComparables(propertyId);
    if (!analysis) {
      return NextResponse.json({ error: "Imóvel não encontrado." }, { status: 404 });
    }

    return NextResponse.json({ analysis });
  } catch (error) {
    console.error("Comparable properties analysis failed:", error);
    return NextResponse.json({ error: "Não foi possível calcular a comparação." }, { status: 500 });
  }
}
