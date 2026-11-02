/**
 * Autorização das rotas que escrevem na BD (cron + scraping manual).
 *
 * Duas formas aceites:
 * - sessão de admin (botao/formulario do painel /admin);
 * - `Authorization: Bearer <CRON_SECRET>` (é o que a Vercel envia nos crons
 *   declarados em vercel.json, desde que CRON_SECRET exista no projeto).
 *
 * Sem CRON_SECRET configurado o acesso por segredo é recusado: escrever na BD
 * fica dependente da sessão de admin, nunca aberta.
 */
import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { ADMIN_EMAIL, getSession } from "@/lib/auth";

export async function authorizeWrite(request: Request): Promise<NextResponse | null> {
  const session = await getSession();
  if (session?.email === ADMIN_EMAIL) return null;

  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: "CRON_SECRET nao configurado: define-o no ambiente ou usa a sessao de admin" },
      { status: 500 },
    );
  }

  const header = request.headers.get("authorization") ?? "";
  const token = header.startsWith("Bearer ")
    ? header.slice("Bearer ".length)
    : (request.headers.get("x-cron-secret") ?? "");

  if (!safeEqual(token, secret)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

function safeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}
