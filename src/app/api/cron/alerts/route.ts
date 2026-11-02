import { NextResponse } from "next/server";
import { inngest } from "@/lib/inngest";
import { authorizeWrite } from "@/lib/api-auth";

export async function GET(request: Request) {
  const denied = await authorizeWrite(request);
  if (denied) return denied;

  try {
    await inngest.send({ name: "alerts.send" });

    return NextResponse.json({
      success: true,
      message: "Alertas enviados para fila (Inngest)",
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro" }, { status: 500 });
  }
}
