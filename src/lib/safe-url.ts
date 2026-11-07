import { lookup } from "node:dns/promises";
import { isIP } from "node:net";

const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"]);
const MAX_BYTES = 5 * 1024 * 1024;

export function isAllowedImageHost(hostname: string, allowlist: string[]): boolean {
  const host = hostname.toLowerCase().replace(/\.$/, "");
  return allowlist.some((item) => {
    const allowed = item.trim().toLowerCase().replace(/^\*\./, "").replace(/\.$/, "");
    return !!allowed && (host === allowed || host.endsWith("." + allowed));
  });
}

export function isPublicIpAddress(address: string): boolean {
  if (isIP(address) === 4) {
    const p = address.split(".").map(Number), a = p[0], b = p[1];
    if (a === 0 || a === 10 || a === 127 || a >= 224) return false;
    if (a === 100 && b >= 64 && b <= 127) return false;
    if (a === 169 && b === 254) return false;
    if (a === 172 && b >= 16 && b <= 31) return false;
    if (a === 192 && (b === 0 || b === 168)) return false;
    if (a === 198 && (b === 18 || b === 19 || (b === 51 && p[2] === 100))) return false;
    if (a === 203 && b === 0 && p[2] === 113) return false;
    return true;
  }
  if (isIP(address) === 6) {
    const ip = address.toLowerCase();
    return (ip.startsWith("2") || ip.startsWith("3")) && !ip.startsWith("2001:db8:") && !ip.startsWith("::ffff:");
  }
  return false;
}

export async function isPublicHttpUrl(raw: string): Promise<boolean> {
  try {
    const url = new URL(raw);
    if (!["http:", "https:"].includes(url.protocol) || url.username || url.password) return false;
    const records = await lookup(url.hostname, { all: true, verbatim: true });
    return records.length > 0 && records.every((record) => isPublicIpAddress(record.address));
  } catch { return false; }
}

export async function fetchImageSafely(raw: string): Promise<{ body: Uint8Array; contentType: string } | null> {
  const allowlist = (process.env.IMAGE_PROXY_ALLOWED_HOSTS ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  if (!allowlist.length) return null;
  let url: URL;
  try { url = new URL(raw); } catch { return null; }

  for (let hop = 0; hop <= 3; hop++) {
    if (!["http:", "https:"].includes(url.protocol) || url.username || url.password || !isAllowedImageHost(url.hostname, allowlist)) return null;
    if (!(await isPublicHttpUrl(url.toString()))) return null;
    const response = await fetch(url, { redirect: "manual", signal: AbortSignal.timeout(8000), headers: { Accept: [...IMAGE_TYPES].join(", "), "User-Agent": "RadarPro2-ImageProxy/1.0" } });
    if ([301, 302, 303, 307, 308].includes(response.status)) {
      const location = response.headers.get("location");
      if (!location || hop === 3) return null;
      url = new URL(location, url);
      continue;
    }
    if (!response.ok || !response.body) return null;
    const type = (response.headers.get("content-type") ?? "").split(";")[0].trim().toLowerCase();
    if (!IMAGE_TYPES.has(type) || Number(response.headers.get("content-length") ?? 0) > MAX_BYTES) return null;
    const reader = response.body.getReader(), chunks: Uint8Array[] = [];
    let size = 0;
    while (true) {
      const part = await reader.read();
      if (part.done) break;
      size += part.value.byteLength;
      if (size > MAX_BYTES) { await reader.cancel(); return null; }
      chunks.push(part.value);
    }
    const body = new Uint8Array(size);
    let offset = 0;
    for (const chunk of chunks) { body.set(chunk, offset); offset += chunk.byteLength; }
    return { body, contentType: type };
  }
  return null;
}
