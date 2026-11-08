"use client";

import { useState } from "react";
import { Menu, X, ChevronDown } from "lucide-react";

const navLinks = [
  { href: "/", label: "Início" },
  { href: "/mapa", label: "Mapa" },
  { href: "/oportunidades", label: "Oportunidades" },
  { href: "/favoritos", label: "Favoritos" },
  { href: "/comparador", label: "Comparar" },
  { href: "/alertas", label: "Alertas" },
  { href: "/estatisticas", label: "Estatísticas" },
  { href: "/credito", label: "Crédito" },
  { href: "/agencias", label: "Agências" },
  { href: "/como-funciona", label: "Como funciona" },
  { href: "/precos", label: "Preços" },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const primaryLinks = navLinks.slice(0, 6);
  const secondaryLinks = navLinks.slice(6);

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/90 text-slate-200 shadow-lg shadow-black/10 backdrop-blur-xl">
      <nav aria-label="Navegação principal" className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <a href="/" className="flex shrink-0 items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-blue-400/20 bg-blue-400/10 text-sm font-bold text-blue-300">R</span>
          <span className="text-lg font-semibold tracking-tight text-white">Radar<span className="text-blue-300">Pro</span><span className="ml-1 text-[10px] font-semibold tracking-[0.2em] text-slate-500">PT</span></span>
        </a>

        <div className="hidden items-center gap-1 lg:flex">
          {primaryLinks.map((link) => (
            <a key={link.href} href={link.href} className="whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium text-slate-400 transition-colors hover:bg-white/[0.06] hover:text-white">
              {link.label}
            </a>
          ))}
          <div className="relative">
            <button type="button" onClick={() => setMoreOpen(!moreOpen)} aria-expanded={moreOpen} className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-slate-400 transition-colors hover:bg-white/[0.06] hover:text-white">
              Mais <ChevronDown size={14} className={moreOpen ? "rotate-180 transition-transform" : "transition-transform"} />
            </button>
            {moreOpen && (
              <div className="absolute right-0 top-full mt-2 w-52 rounded-xl border border-white/10 bg-slate-900 p-2 shadow-2xl shadow-black/30">
                {secondaryLinks.map((link) => (
                  <a key={link.href} href={link.href} onClick={() => setMoreOpen(false)} className="block rounded-lg px-3 py-2.5 text-sm text-slate-300 transition-colors hover:bg-white/[0.06] hover:text-white">
                    {link.label}
                  </a>
                ))}
              </div>
            )}
          </div>
          <a href="/auth" className="ml-2 rounded-lg border border-blue-300/20 bg-blue-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-950/30 transition hover:bg-blue-400">
            Aceder
          </a>
        </div>

        <button type="button" onClick={() => setMobileOpen(!mobileOpen)} className="rounded-lg border border-white/10 p-2 text-slate-300 transition hover:bg-white/[0.06] hover:text-white lg:hidden" aria-label={mobileOpen ? "Fechar menu" : "Abrir menu"} aria-expanded={mobileOpen}>
          {mobileOpen ? <X size={21} /> : <Menu size={21} />}
        </button>
      </nav>

      {mobileOpen && (
        <div className="border-t border-white/10 bg-slate-950 px-4 pb-5 pt-3 lg:hidden">
          <div className="mx-auto grid max-w-7xl gap-1 sm:grid-cols-2">
            {navLinks.map((link) => (
              <a key={link.href} href={link.href} onClick={() => setMobileOpen(false)} className="rounded-lg px-4 py-3 text-sm font-medium text-slate-300 transition-colors hover:bg-white/[0.06] hover:text-white">
                {link.label}
              </a>
            ))}
          </div>
          <a href="/auth" onClick={() => setMobileOpen(false)} className="mx-auto mt-3 block max-w-7xl rounded-lg bg-blue-500 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-blue-400">
            Aceder
          </a>
        </div>
      )}
    </header>
  );
}
