"use client";

import { useState, useEffect } from "react";
import { Heart } from "lucide-react";

export default function FavoriteButton({ propertyId }: { propertyId: string }) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/favoritos")
      .then((r) => r.json())
      .then((data) => {
        const ids = (data.properties || []).map((p: { id: string }) => p.id);
        setIsFavorite(ids.includes(propertyId));
      })
      .catch(() => {});
  }, [propertyId]);

  async function toggle() {
    setLoading(true);
    if (isFavorite) {
      await fetch("/api/favoritos", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ propertyId }),
      });
      setIsFavorite(false);
    } else {
      await fetch("/api/favoritos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ propertyId }),
      });
      setIsFavorite(true);
    }
    setLoading(false);
  }

  const label = isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos";

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={loading}
      aria-label={label}
      aria-pressed={isFavorite}
      title={label}
      className={`inline-flex min-h-11 min-w-11 items-center justify-center rounded-rp border px-3 transition-[transform,box-shadow,color,background-color,border-color] duration-[var(--rp-dur-2)] ease-[var(--rp-ease-1)] disabled:opacity-55 ${
        isFavorite
          ? "border-rp-orange bg-[rgba(242,107,58,.14)] text-rp-anomaly shadow-rp-1"
          : "border-rp-line bg-rp-surface text-rp-ink-2 hover:-translate-y-px hover:text-rp-cobalt hover:shadow-[5px_5px_0_rgba(18,24,33,.18)]"
      }`}
    >
      <Heart size={20} fill={isFavorite ? "currentColor" : "none"} aria-hidden="true" />
    </button>
  );
}
