import { NextResponse } from "next/server";
import { db } from "@/db";
import { properties, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { sendAlertEmail, buildNewPropertyAlertEmail } from "@/lib/email";

export async function GET(request: Request) {
  // Verify cron secret
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Get recent properties (last 24h)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentProperties = await db
      .select()
      .from(properties)
      .where(eq(properties.district, "Lisboa")); // Simplified

    // Get all users with alerts
    const allUsers = await db.select().from(users);

    let sent = 0;
    for (const user of allUsers) {
      for (const prop of recentProperties.slice(0, 3)) {
        const html = buildNewPropertyAlertEmail(
          prop.title,
          prop.district,
          prop.price,
          prop.discountPct || 0,
          prop.score || 0
        );
        const ok = await sendAlertEmail(
          user.email,
          `Nova oportunidade em ${prop.district}!`,
          html
        );
        if (ok) sent++;
      }
    }

    return NextResponse.json({ sent, properties: recentProperties.length });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro" }, { status: 500 });
  }
}
