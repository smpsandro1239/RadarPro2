import { NextResponse } from "next/server";
import { inngest } from "@/lib/inngest";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await inngest.send({ name: "geocode.missing" });

    return NextResponse.json({
      success: true,
      message: "Geocodificação enviada para fila (Inngest)",
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro no geocoding" }, { status: 500 });
  }
}
