"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Button from "@/components/ds/Button";

export default function CookieBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie-consent");
    if (!consent) setShow(true);
  }, []);

  function accept() {
    localStorage.setItem("cookie-consent", "accepted");
    setShow(false);
  }

  function reject() {
    localStorage.setItem("cookie-consent", "rejected");
    setShow(false);
  }

  if (!show) return null;

  return (
    <div
      role="region"
      aria-label="Preferências de cookies"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-rp-line bg-rp-surface shadow-rp-3"
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p className="max-w-[70ch] text-[14px] leading-snug text-rp-ink-2">
          Utilizamos cookies essenciais para o funcionamento do site e cookies de analytics. Consulte a nossa{" "}
          <Link
            href="/privacidade"
            className="text-rp-cobalt underline decoration-[1px] underline-offset-4 transition-colors duration-[var(--rp-dur-2)] ease-[var(--rp-ease-1)] hover:text-rp-ink hover:decoration-2"
          >
            Política de Privacidade
          </Link>
          .
        </p>
        <div className="flex shrink-0 flex-wrap gap-3">
          <Button onClick={reject} variant="secondary" size="md">
            Rejeitar
          </Button>
          <Button onClick={accept} variant="primary" size="md">
            Aceitar
          </Button>
        </div>
      </div>
    </div>
  );
}
