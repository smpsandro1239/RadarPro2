"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";

const navLinks = [
  { href: "/", label: "Início" },
  { href: "/mapa", label: "Mapa" },
  { href: "/oportunidades", label: "Oportunidades" },
  { href: "/favoritos", label: "Favoritos" },
  { href: "/comparador", label: "Comparar" },
  { href: "/alertas", label: "Alertas" },
  { href: "/estatisticas", label: "Estatísticas" },
  { href: "/credito", label: "Crédito" },
  { href: "/como-funciona", label: "Como funciona" },
  { href: "/precos", label: "Preços" },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="border-b bg-white sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex justify-between items-center h-16">
        {/* Logo */}
        <a href="/" className="text-xl sm:text-2xl font-bold tracking-tight text-primary flex-shrink-0">
          RadarPro <span className="text-foreground">PT</span>
        </a>

        {/* Desktop nav */}
        <div className="hidden lg:flex items-center gap-1">
          {navLinks.slice(0, 6).map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="px-3 py-2 text-sm font-medium hover:text-primary transition rounded-lg hover:bg-slate-50"
            >
              {link.label}
            </a>
          ))}
          <a
            href="/auth"
            className="ml-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition"
          >
            Aceder
          </a>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="lg:hidden p-2 rounded-lg hover:bg-slate-100 transition"
          aria-label="Menu"
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden border-t bg-white">
          <div className="px-4 py-4 space-y-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="block px-4 py-3 text-sm font-medium hover:text-primary hover:bg-slate-50 rounded-lg transition"
              >
                {link.label}
              </a>
            ))}
            <a
              href="/auth"
              onClick={() => setMobileOpen(false)}
              className="block mt-2 bg-primary text-white px-4 py-3 rounded-lg text-sm font-medium text-center hover:opacity-90 transition"
            >
              Aceder
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}
