import { NextResponse } from "next/server";
import { isAuthorizedCronRequest } from "@/lib/cron-auth";
import { inngest } from "@/lib/inngest";

export async function GET(request: Request) {
  if (!isAuthorizedCronRequest(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

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
