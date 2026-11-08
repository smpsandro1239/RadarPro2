import { NextResponse } from "next/server";
import { analyzePropertyComparables } from "@/lib/intelligence/analyze-property-comparables";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    if (!id?.trim()) {
      return NextResponse.json({ error: "Identificador de imóvel inválido." }, { status: 400 });
    }

    const analysis = await analyzePropertyComparables(id);
    if (!analysis) {
      return NextResponse.json({ error: "Imóvel não encontrado." }, { status: 404 });
    }

    return NextResponse.json({ analysis });
  } catch (error) {
    console.error("Erro ao comparar imóvel:", error);
    return NextResponse.json({ error: "Não foi possível analisar os imóveis comparáveis." }, { status: 500 });
  }
}
