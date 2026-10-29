import { NextResponse } from "next/server";
import { inngest } from "@/lib/inngest";

export async function POST(request: Request) {
  try {
    await inngest.send({ name: "scrape.all" });

    return NextResponse.json({
      success: true,
      message: "Pipeline de scraping completo enviado para fila (Inngest)",
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
