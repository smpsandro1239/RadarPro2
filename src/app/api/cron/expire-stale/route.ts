import { NextResponse } from "next/server";
import { db } from "@/db";
import { properties } from "@/db/schema";
import { eq } from "drizzle-orm";

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
      })
      .from(properties)
      .where(eq(properties.isActive, true))
      .and(
        new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) >
          (properties.lastChecked ?? new Date(0))
      );

    // Mark them as inactive
    await db
      .update(properties)
      .set({ isActive: false, checkStatus: "not_found" })
      .where(
        properties.isActive === true &&
          new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) > properties.lastChecked
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
