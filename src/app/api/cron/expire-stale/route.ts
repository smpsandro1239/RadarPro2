import { NextResponse } from "next/server";
import { db } from "@/db";
import { properties } from "@/db/schema";
import { eq, and, lt } from "drizzle-orm";

export async function POST(request: Request) {
  try {
    const { maxAgeDays = 7 } = await request.json();

    const cutoffDate = new Date(Date.now() - maxAgeDays * 24 * 60 * 60 * 1000);

    // Find active properties that haven't been seen recently
    const expiredProperties = await db
      .select({
        id: properties.id,
        title: properties.title,
        source: properties.source,
        district: properties.district,
      })
      .from(properties)
      .where(
        and(
          eq(properties.isActive, true),
          lt(properties.lastChecked, cutoffDate)
        )
      );

    // Mark them as inactive
    await db
      .update(properties)
      .set({ isActive: false, checkStatus: "not_found" })
      .where(
        and(
          eq(properties.isActive, true),
          lt(properties.lastChecked, cutoffDate)
        )
      );

    return NextResponse.json({
      success: true,
      expired: expiredProperties.length,
      expiredProperties: expiredProperties.map((p) => ({ id: p.id, title: p.title, district: p.district })),
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
