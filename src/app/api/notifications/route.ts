import { NextResponse } from "next/server";
import { db } from "@/db";
import { alerts, properties } from "@/db/schema";
import { eq, and, isNull, inArray } from "drizzle-orm";
import { getSession } from "@/lib/auth";

// GET: notificações não lidas do utilizador autenticado
export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  try {
    const notifications = await db
      .select({
        alertId: alerts.id,
        propertyId: alerts.propertyId,
        createdAt: alerts.createdAt,
        readAt: alerts.readAt,
        property: properties,
      })
      .from(alerts)
      .innerJoin(properties, eq(properties.id, alerts.propertyId))
      .where(and(eq(alerts.userId, session.userId), isNull(alerts.readAt)));

    return NextResponse.json({
      notifications: notifications.map((n) => ({
        id: n.alertId,
        propertyId: n.propertyId,
        createdAt: n.createdAt,
        readAt: n.readAt,
        property: n.property,
      })),
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

// POST: criar notificação de oportunidade para o utilizador
export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  try {
    const { propertyId } = await request.json();
    if (!propertyId) {
      return NextResponse.json({ error: "propertyId obrigatório" }, { status: 400 });
    }

    const id = crypto.randomUUID();
    await db.insert(alerts).values({
      id,
      userId: session.userId,
      propertyId,
      createdAt: new Date(),
    });

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

// PATCH: marcar notificações como lidas
export async function PATCH(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  try {
    const { ids } = await request.json();
    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ success: true });
    }

    await db
      .update(alerts)
      .set({ readAt: new Date() })
      .where(and(eq(alerts.userId, session.userId), inArray(alerts.id, ids)));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
