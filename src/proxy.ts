import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";
import * as Sentry from "@sentry/nextjs";

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || "radarpro-dev-secret-change-in-prod"
);

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV || "production",
  tracesSampleRate: 0.1,
});

export async function proxy(request: NextRequest) {
  const token = request.cookies.get("session")?.value;

  if (request.nextUrl.pathname.startsWith("/app")) {
    if (!token) {
      return NextResponse.redirect(new URL("/auth", request.url));
    }
    try {
      await jwtVerify(token, secret);
    } catch (error) {
      Sentry.captureException(error);
      return NextResponse.redirect(new URL("/auth", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/app/:path*"],
};
