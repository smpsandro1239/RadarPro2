"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ds/Button";
import PageShell from "@/components/ds/PageShell";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Erro");
      return;
    }

    router.push("/app/oportunidades");
    router.refresh();
  }

  return (
    <PageShell
      eyebrow="Conta"
      title="Entrar ou criar conta"
      backHref="/"
      backLabel="Voltar ao início"
    >
      <div className="mx-auto max-w-[440px]">
        <div className="rounded-rp border border-rp-line bg-rp-surface p-6 shadow-rp-2 sm:p-8">
          <p className="rp-display text-[24px] leading-none text-rp-ink">
            RadarPro <span className="text-rp-cobalt">Portugal</span>
          </p>
          <p className="mt-3 text-[16px] leading-snug text-rp-ink-2">
            {isLogin ? "Entre na sua conta" : "Crie a sua conta gratuita"}
          </p>

          <form id="formulario-conta" onSubmit={handleSubmit} className="mt-7 flex flex-col gap-5">
            <div>
              <label htmlFor="email" className="block text-[14px] font-medium text-rp-ink">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-2 min-h-11 w-full rounded-rp border border-rp-line bg-rp-ceramic px-3 text-[15px] text-rp-ink transition-colors duration-[var(--rp-dur-2)] ease-[var(--rp-ease-1)] focus:border-rp-cobalt"
                required
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-[14px] font-medium text-rp-ink">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete={isLogin ? "current-password" : "new-password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-2 min-h-11 w-full rounded-rp border border-rp-line bg-rp-ceramic px-3 text-[15px] text-rp-ink transition-colors duration-[var(--rp-dur-2)] ease-[var(--rp-ease-1)] focus:border-rp-cobalt"
                required
                minLength={6}
              />
            </div>

            {error ? (
              <div
                id="erro-conta"
                role="alert"
                className="rounded-rp border border-rp-anomaly bg-rp-surface px-3 py-2"
              >
                <p className="rp-eyebrow text-rp-anomaly">Erro</p>
                <p className="mt-1 text-[14px] leading-snug text-rp-ink">{error}</p>
              </div>
            ) : null}

            <Button type="submit" disabled={loading} variant="primary" size="lg" className="w-full">
              {loading ? "A processar..." : isLogin ? "Entrar" : "Criar conta"}
            </Button>
          </form>

          <p className="mt-6 text-[14px] text-rp-muted">
            {isLogin ? "Não tem conta?" : "Já tem conta?"}{" "}
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              aria-controls="formulario-conta"
              className="inline-flex min-h-11 items-center font-medium text-rp-cobalt underline decoration-[1px] underline-offset-4 transition-colors duration-[var(--rp-dur-2)] ease-[var(--rp-ease-1)] hover:text-rp-ink hover:decoration-2"
            >
              {isLogin ? "Registar-se" : "Entrar"}
            </button>
          </p>
        </div>
      </div>
    </PageShell>
  );
}
