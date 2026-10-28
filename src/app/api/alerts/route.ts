import { NextResponse } from "next/server";
import { db } from "@/db";
import { searchAlerts, properties, users } from "@/db/schema";
import { eq, and, gte, lte, sql } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { sendAlertEmail, buildNewPropertyAlertEmail } from "@/lib/email";

// GET: List user's saved searches
export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  try {
    const alerts = await db
      .select()
      .from(searchAlerts)
      .where(eq(searchAlerts.userId, session.userId));

    return NextResponse.json({ alerts });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

// POST: Create a new saved search
export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  try {
    const { district, maxPrice, minScore, propertyType, email } = await request.json();

    const id = crypto.randomUUID();
    await db.insert(searchAlerts).values({
      id,
      userId: session.userId,
      district: district || null,
      maxPrice: maxPrice ? parseFloat(maxPrice) : null,
      minScore: minScore ? parseInt(minScore) : null,
      propertyType: propertyType || null,
      email: email || session.email,
      active: true,
    });

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

// DELETE: Remove a saved search
export async function DELETE(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  try {
    const { id } = await request.json();
    await db
      .delete(searchAlerts)
      .where(and(eq(searchAlerts.id, id), eq(searchAlerts.userId, session.userId)));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
