"use client";

import { useState } from "react";
import { formatScoreOutOf100 } from "@/lib/format";

interface RadarResult {
  id: string;
  title: string;
  district: string;
  municipality: string;
  price: number;
  score: number | null;
  rentability: number | null;
  type: string;
  isAuction: boolean;
  marketValue: number | null;
}

export default function RadarSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<RadarResult[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const run = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/radar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: query.trim() }),
      });
      const data = await res.json();
      setResults(data.results ?? []);
      setTotal(data.total ?? 0);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form onSubmit={run} className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ex: apartamento até 100k em Lisboa"
          className="flex-1 px-5 py-4 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-primary text-white px-6 py-4 rounded-xl font-bold text-sm hover:opacity-90 transition disabled:opacity-50"
        >
          {loading ? "A procurar..." : "Radar"}
        </button>
      </form>

      {results.length > 0 && (
        <div className="mt-6 space-y-4">
          <p className="text-sm text-secondary">
            {total} imóvel(is) encontrados para "{query.trim()}".
          </p>
          {results.map((r) => (
            <a
              key={r.id}
              href={`/imovel/${r.id}`}
              className="block bg-white border border-slate-100 rounded-xl p-4 hover:border-primary transition"
            >
              <div className="flex justify-between gap-4">
                <div>
                  <h3 className="font-bold text-sm">{r.title}</h3>
                  <p className="text-xs text-secondary">
                    {r.municipality}, {r.district} · {r.type}
                  </p>
                </div>
                <div className="text-right">
                  <div className="font-bold">{r.price.toLocaleString("pt-PT")}€</div>
                  <div className="text-xs text-secondary">
                    Score: {formatScoreOutOf100(r.score)}
                  </div>
                </div>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
