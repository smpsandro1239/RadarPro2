import { NextResponse } from "next/server";
import { inngest } from "@/lib/inngest";

const DISTRICTS = ["Lisboa", "Porto", "Braga", "Faro", "Setúbal", "Aveiro", "Coimbra"];

export async function POST(request: Request) {
  try {
    const { districts } = await request.json();
    const districtsList = districts || DISTRICTS;

    for (const district of districtsList) {
      await inngest.send({
        name: "scrape.source",
        data: { source: "leiloes", district },
      });
    }

    return NextResponse.json({
      success: true,
      message: `${districtsList.length} eventos de leilão enviados para fila (Inngest)`,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
