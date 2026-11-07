import { NextResponse } from "next/server";
import { fetchImageSafely } from "@/lib/safe-url";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const raw = new URL(request.url).searchParams.get("u");
  if (!raw) return new NextResponse("Missing URL", { status: 400 });
  try {
    const image = await fetchImageSafely(raw);
    if (!image) return new NextResponse("Image not allowed or unavailable", { status: 404 });
    const body = Buffer.from(image.body);
    return new Response(body, { status: 200, headers: {
      "Content-Type": image.contentType,
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "public, max-age=86400",
      "Content-Length": String(body.byteLength)
    }});
  } catch { return new NextResponse("Image fetch failed", { status: 502 }); }
}
