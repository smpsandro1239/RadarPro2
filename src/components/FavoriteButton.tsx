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

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`p-3 rounded-lg border transition ${
        isFavorite
          ? "bg-red-50 border-red-200 text-red-500"
          : "bg-white border-slate-200 text-secondary hover:text-red-500 hover:border-red-200"
      } disabled:opacity-50`}
      title={isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
    >
      <Heart size={20} fill={isFavorite ? "currentColor" : "none"} />
    </button>
  );
}
