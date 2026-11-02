import { NextResponse } from "next/server";
import { inngest } from "@/lib/inngest";
import { authorizeWrite } from "@/lib/api-auth";

const DISTRICTS = ["Lisboa", "Porto", "Braga", "Faro", "Setúbal", "Aveiro", "Coimbra"];

/** A Vercel chama os crons com GET (ver vercel.json). */
export async function GET(request: Request) {
  const denied = await authorizeWrite(request);
  if (denied) return denied;

  try {
    await inngest.send({ name: "scrape.source" });
    return NextResponse.json({ success: true, message: "Enviado para fila (Inngest)" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const denied = await authorizeWrite(request);
  if (denied) return denied;

  try {
    const { districts } = await request.json().catch(() => ({}));
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
