import { timingSafeEqual } from "node:crypto";

export function isAuthorizedCronRequest(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret || secret.length < 32) return false;
  const supplied = Buffer.from(request.headers.get("authorization") ?? "");
  const expected = Buffer.from("Bearer " + secret);
  return supplied.length === expected.length && timingSafeEqual(supplied, expected);
}
