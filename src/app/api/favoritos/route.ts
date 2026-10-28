import { NextResponse } from "next/server";
import { db } from "@/db";
import { savedProperties, properties } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  try {
    const saved = await db
      .select()
      .from(savedProperties)
      .where(eq(savedProperties.userId, session.userId));

    const propertyIds = saved.map((s) => s.propertyId);
    const props = [];
    for (const id of propertyIds) {
      const result = await db
        .select()
        .from(properties)
        .where(eq(properties.id, id))
        .limit(1);
      if (result.length > 0) props.push(result[0]);
    }

    return NextResponse.json({ properties: props });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  try {
    const { propertyId } = await request.json();
    const id = crypto.randomUUID();

    await db.insert(savedProperties).values({
      id,
      userId: session.userId,
      propertyId,
      createdAt: new Date(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    // Already saved
    return NextResponse.json({ success: true });
  }
}

export async function DELETE(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  try {
    const { propertyId } = await request.json();
    await db
      .delete(savedProperties)
      .where(
        and(
          eq(savedProperties.userId, session.userId),
          eq(savedProperties.propertyId, propertyId)
        )
      );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
