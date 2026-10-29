import { NextResponse } from "next/server";
import {
  scrapeCasaSapo,
  scrapeImovirtual,
  scrapeIdealista,
  scrapeOLX,
  scrapeCustoJusto,
  scrapeAllDistricts,
} from "@/lib/scrapers";

export async function POST(request: Request) {
  try {
    const { source, district, allDistricts } = await request.json();

    if (allDistricts) {
      const result = await scrapeAllDistricts();
      return NextResponse.json({
        message: "Scraping de todos os distritos iniciado",
        ...result,
      });
    }

    if (!source || !district) {
      return NextResponse.json({ error: "source e district são obrigatórios" }, { status: 400 });
    }

    const validSources = ["casasa", "imovirtual", "idealista", "olx", "custojusto"];
    if (!validSources.includes(source)) {
      return NextResponse.json({ error: "source inválido" }, { status: 400 });
    }

    const validDistricts = ["Lisboa", "Porto", "Braga", "Faro", "Setúbal", "Aveiro", "Coimbra"];
    if (!validDistricts.includes(district)) {
      return NextResponse.json({ error: "district inválido" }, { status: 400 });
    }

    const scrapers: Record<string, (district: string) => Promise<any>> = {
      casasa: scrapeCasaSapo,
      imovirtual: scrapeImovirtual,
      idealista: scrapeIdealista,
      olx: scrapeOLX,
      custojusto: scrapeCustoJusto,
    };

    const result = await scrapers[source](district);
    return NextResponse.json({ message: `Scraping ${source} para ${district} concluído`, ...result });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
