"use client";

import { useState, useEffect } from "react";

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
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4 z-50">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-sm text-secondary">
          Utilizamos cookies essenciais para o funcionamento do site e cookies de analytics.
          Consulte a nossa{" "}
          <a href="/privacidade" className="text-primary hover:underline">
            Política de Privacidade
          </a>
          .
        </p>
        <div className="flex gap-3">
          <button
            onClick={reject}
            className="px-4 py-2 text-sm border rounded-lg hover:bg-slate-50"
          >
            Rejeitar
          </button>
          <button
            onClick={accept}
            className="px-4 py-2 text-sm bg-primary text-white rounded-lg hover:opacity-90"
          >
            Aceitar
          </button>
        </div>
      </div>
    </div>
  );
}
