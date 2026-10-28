import { NextResponse } from "next/server";
import { db } from "@/db";
import { properties } from "@/db/schema";
import { eq } from "drizzle-orm";

// Geocoding using Nominatim (OpenStreetMap) - free, no API key needed
async function geocode(address: string, municipality: string, district: string): Promise<{ lat: number; lng: number; quality: string } | null> {
  try {
    const query = encodeURIComponent(`${municipality}, ${district}, Portugal`);
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1&countrycodes=pt`,
      {
        headers: {
          "User-Agent": "RadarPro-Portugal/1.0 (radarpro.pt)",
        },
        signal: AbortSignal.timeout(5000),
      }
    );

    if (!res.ok) return null;
    const data = await res.json();
    if (!data || data.length === 0) return null;

    return {
      lat: parseFloat(data[0].lat),
      lng: parseFloat(data[0].lon),
      quality: data[0].type === "city" || data[0].type === "town" ? "parish" : "street",
    };
  } catch {
    return null;
  }
}

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const allProps = await db.select().from(properties);
    const toGeocode = allProps.filter((p) => !p.lat);

    const batch = toGeocode.slice(0, 30); // Nominatim rate limit: 1 req/sec
    let geocoded = 0;
    let failed = 0;

    for (const prop of batch) {
      const result = await geocode("", prop.municipality, prop.district);
      if (result) {
        await db
          .update(properties)
          .set({
            lat: result.lat,
            lng: result.lng,
            geoQuality: result.quality as "exact" | "street" | "parish" | "district" | "NA",
            updatedAt: new Date(),
          })
          .where(eq(properties.id, prop.id));
        geocoded++;
      } else {
        failed++;
      }
      // Rate limit: 1 request per second for Nominatim
      await new Promise((resolve) => setTimeout(resolve, 1100));
    }

    return NextResponse.json({
      geocoded,
      failed,
      remaining: toGeocode.length - batch.length,
      total: allProps.length,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro no geocoding" }, { status: 500 });
  }
}
