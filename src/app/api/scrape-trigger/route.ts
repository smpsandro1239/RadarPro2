import { NextResponse } from "next/server";
import { inngest } from "@/lib/inngest";

const VALID_SOURCES = [
  "casasa",
  "imovirtual",
  "idealista",
  "olx",
  "custojusto",
  "leiloes",
  "imobancos",
  "millennium-bcp",
  "santander",
  "montepio",
  "caixa-imobiliario",
  "credito-agricola",
  "novobanco",
  "bpi",
];

const VALID_DISTRICTS = [
  "Lisboa",
  "Porto",
  "Braga",
  "Faro",
  "Setúbal",
  "Aveiro",
  "Coimbra",
];

export async function POST(request: Request) {
  try {
    const { source, district, allDistricts, allSources } = await request.json();

    if (allDistricts || allSources) {
      await inngest.send({ name: "scrape.all" });
      return NextResponse.json({
        message: "Pipeline de scraping completo iniciado (via Inngest)",
      });
    }

    if (!source || !district) {
      return NextResponse.json(
        { error: "source e district são obrigatórios" },
        { status: 400 }
      );
    }

    if (!VALID_SOURCES.includes(source)) {
      return NextResponse.json({ error: "source inválido" }, { status: 400 });
    }

    if (!VALID_DISTRICTS.includes(district)) {
      return NextResponse.json({ error: "district inválido" }, { status: 400 });
    }

    await inngest.send({
      name: "scrape.source",
      data: { source, district },
    });

    return NextResponse.json({
      message: `Scraping ${source} para ${district} enviado para fila (Inngest)`,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
