import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { properties } from "@/db/schema";
import { compareProperties, type ComparableProperty } from "@/lib/intelligence/comparable-properties";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const propertyId = searchParams.get("propertyId");
    if (!propertyId) {
      return NextResponse.json({ error: "propertyId é obrigatório" }, { status: 400 });
    }

    const [subjectRows, candidates] = await Promise.all([
      db.select().from(properties).where(eq(properties.id, propertyId)).limit(1),
      db.select().from(properties).where(eq(properties.isActive, true)),
    ]);
    const subject = subjectRows[0];
    if (!subject) {
      return NextResponse.json({ error: "Imóvel não encontrado" }, { status: 404 });
    }

    const analysis = compareProperties(
      ({ ...subject, title: subject.title } as ComparableProperty),
      candidates as ComparableProperty[],
    );
    return NextResponse.json({ analysis });
  } catch (error) {
    console.error("Comparable properties analysis failed:", error);
    return NextResponse.json({ error: "Não foi possível calcular a comparação" }, { status: 500 });
  }
}
