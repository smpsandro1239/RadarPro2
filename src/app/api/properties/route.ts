import { NextResponse } from "next/server";
import { getAllActiveProperties } from "@/lib/queries";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const listingType = searchParams.get("listing_type") || undefined;
    const isAuction = searchParams.get("is_auction") || undefined;
    const properties = await getAllActiveProperties(listingType, isAuction);
    return NextResponse.json({ properties });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
