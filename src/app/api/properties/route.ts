import { NextResponse } from "next/server";
import { getAllActiveProperties } from "@/lib/queries";

export async function GET() {
  try {
    const properties = await getAllActiveProperties();
    return NextResponse.json({ properties });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
