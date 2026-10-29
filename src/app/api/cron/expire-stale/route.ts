import { NextResponse } from "next/server";
import { inngest } from "@/lib/inngest";

export async function POST(request: Request) {
  try {
    const { maxAgeDays = 7 } = await request.json();

    await inngest.send({
      name: "expire.stale",
      data: { maxAgeDays },
    });

    return NextResponse.json({
      success: true,
      message: "Expiração de imóveis enviados para fila (Inngest)",
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
