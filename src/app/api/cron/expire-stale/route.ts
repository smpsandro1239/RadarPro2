import { NextResponse } from "next/server";
import { inngest } from "@/lib/inngest";
import { authorizeWrite } from "@/lib/api-auth";

/** A Vercel chama os crons com GET (ver vercel.json). */
export async function GET(request: Request) {
  const denied = await authorizeWrite(request);
  if (denied) return denied;

  try {
    await inngest.send({ name: "expire.stale" });
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
    const { maxAgeDays = 7 } = await request.json().catch(() => ({}));

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
