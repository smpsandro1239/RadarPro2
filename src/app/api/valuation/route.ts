import { NextResponse } from "next/server";
import { evaluateProperty } from "@/lib/valuation";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = evaluateProperty(body);
    return NextResponse.json({ valuation: result });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}