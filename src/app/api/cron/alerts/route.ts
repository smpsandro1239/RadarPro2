import { NextResponse } from "next/server";
import { db } from "@/db";
import { properties, users, searchAlerts } from "@/db/schema";
import { eq, and, gte, lte, sql } from "drizzle-orm";
import { sendAlertEmail, buildNewPropertyAlertEmail } from "@/lib/email";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Get active alerts
    const activeAlerts = await db
      .select()
      .from(searchAlerts)
      .where(eq(searchAlerts.active, true));

    // Get properties created in the last 24 hours
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const newProperties = await db
      .select()
      .from(properties)
      .where(gte(properties.createdAt, oneDayAgo));

    let sent = 0;

    for (const alert of activeAlerts) {
      for (const prop of newProperties) {
        // Check if property matches alert criteria
        if (alert.district && prop.district !== alert.district) continue;
        if (alert.maxPrice && prop.price > alert.maxPrice) continue;
        if (alert.minScore && (prop.score || 0) < alert.minScore) continue;
        if (alert.propertyType && prop.type !== alert.propertyType) continue;

        const html = buildNewPropertyAlertEmail(
          prop.title,
          prop.district,
          prop.price,
          prop.discountPct || 0,
          prop.score || 0
        );
        const ok = await sendAlertEmail(
          alert.email,
          `Nova oportunidade em ${prop.district}!`,
          html
        );
        if (ok) sent++;
      }
    }

    return NextResponse.json({
      sent,
      alerts: activeAlerts.length,
      newProperties: newProperties.length,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro" }, { status: 500 });
  }
}
