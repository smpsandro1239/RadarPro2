"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import Button from "@/components/ds/Button";

const NAV_LINKS = [
  { href: "/", label: "Início" },
  { href: "/oportunidades", label: "Oportunidades" },
  { href: "/mapa", label: "Mapa" },
  { href: "/comparador", label: "Comparador" },
  { href: "/como-funciona", label: "Como funciona" },
  { href: "/precos", label: "Preços" },
];

const MOBILE_MENU_ID = "rp-mobile-nav";

export default function SiteNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  function isActive(href: string): boolean {
    if (!pathname) return false;
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <nav className="sticky top-0 z-40 border-b border-rp-line bg-rp-surface">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link
          href="/"
          onClick={() => setOpen(false)}
          className="rp-display text-[22px] leading-none text-rp-ink"
        >
          RadarPro
        </Link>

        <ul className="hidden items-center lg:flex">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                aria-current={isActive(link.href) ? "page" : undefined}
                className={`inline-flex min-h-11 items-center px-3 text-[14px] transition-colors duration-[var(--rp-dur-1)] ${
                  isActive(link.href)
                    ? "text-rp-cobalt underline decoration-2 underline-offset-8"
                    : "text-rp-ink-2 hover:text-rp-cobalt"
                }`}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="hidden lg:block">
          <Button href="/auth" variant="primary" size="md">
            Aceder
          </Button>
        </div>

        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-controls={MOBILE_MENU_ID}
          aria-label={open ? "Fechar menu" : "Abrir menu"}
          className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-rp border border-rp-line bg-rp-surface text-rp-ink transition-colors duration-[var(--rp-dur-1)] hover:bg-rp-ceramic lg:hidden"
        >
          {open ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
        </button>
      </div>

      {open ? (
        <div id={MOBILE_MENU_ID} className="border-b border-rp-line bg-rp-surface lg:hidden">
          <ul className="mx-auto flex max-w-6xl flex-col px-4 sm:px-6">
            {NAV_LINKS.map((link) => (
              <li key={link.href} className="border-b border-rp-line last:border-b-0">
                <Link
                  href={link.href}
                  onClick={() => setOpen(false)}
                  aria-current={isActive(link.href) ? "page" : undefined}
                  className={`inline-flex min-h-11 items-center text-[15px] ${
                    isActive(link.href) ? "text-rp-cobalt" : "text-rp-ink-2"
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mx-auto max-w-6xl px-4 pb-4 pt-3 sm:px-6">
            <Button href="/auth" variant="primary" size="md" className="w-full" onClick={() => setOpen(false)}>
              Aceder
            </Button>
          </div>
        </div>
      ) : null}
    </nav>
  );
}
