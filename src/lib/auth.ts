import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

function getSessionSecret(): Uint8Array {
  const value = process.env.JWT_SECRET;
  if (!value || value.length < 32) throw new Error("JWT_SECRET tem de conter pelo menos 32 caracteres.");
  return new TextEncoder().encode(value);
}

export async function createSession(userId: string, email: string) {
  const token = await new SignJWT({ userId, email }).setProtectedHeader({ alg: "HS256" }).setExpirationTime("7d").sign(getSessionSecret());
  const cookieStore = await cookies();
  cookieStore.set("session", token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", maxAge: 604800, path: "/" });
}

export async function getSession() {
  const token = (await cookies()).get("session")?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSessionSecret());
    if (typeof payload.userId !== "string" || typeof payload.email !== "string") return null;
    return { userId: payload.userId, email: payload.email };
  } catch { return null; }
}

export async function destroySession() {
  (await cookies()).delete("session");
}
