import { NextResponse } from "next/server";
import { db } from "@/db";
import { properties } from "@/db/schema";
import { eq, isNull, lt, or } from "drizzle-orm";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Get properties that haven't been checked in the last 24 hours or never checked
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const allProps = await db.select().from(properties);

    const toCheck = allProps.filter((p) => {
      if (!p.lastChecked) return true;
      return new Date(p.lastChecked) < oneDayAgo;
    });

    // Limit to 50 per run to avoid timeout
    const batch = toCheck.slice(0, 50);

    let checked = 0;
    let stillActive = 0;
    let notFound = 0;
    let errors = 0;

    for (const prop of batch) {
      try {
        const res = await fetch(prop.url, {
          method: "HEAD",
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          },
          redirect: "follow",
          signal: AbortSignal.timeout(10000),
        });

        const isActive = res.ok;
        await db
          .update(properties)
          .set({
            isActive,
            lastChecked: new Date(),
            checkStatus: isActive ? "ok" : "not_found",
            updatedAt: new Date(),
          })
          .where(eq(properties.id, prop.id));

        checked++;
        if (isActive) stillActive++;
        else notFound++;
      } catch (error) {
        await db
          .update(properties)
          .set({
            lastChecked: new Date(),
            checkStatus: "error",
            updatedAt: new Date(),
          })
          .where(eq(properties.id, prop.id));
        checked++;
        errors++;
      }
    }

    return NextResponse.json({
      checked,
      stillActive,
      notFound,
      errors,
      remaining: toCheck.length - batch.length,
      total: allProps.length,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro na verificação" }, { status: 500 });
  }
}
