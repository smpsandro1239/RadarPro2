import { NextResponse } from "next/server";
import { calculateValuation } from "@/lib/valuation";

export async function POST(request: Request) {
  try {
    const { district, type, price, sqm, rentability } = await request.json();

    if (!district || !type || !price) {
      return NextResponse.json(
        { error: "Distrito, tipo e preço são obrigatórios" },
        { status: 400 }
      );
    }

    const valuation = calculateValuation(district, type, price, sqm, rentability);
    return NextResponse.json(valuation);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
