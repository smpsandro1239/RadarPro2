"use client";

import { useState, useEffect } from "react";
import { MapPin, TrendingDown, Star, X, Plus } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface Property {
  id: string;
  title: string;
  district: string;
  municipality: string;
  sourceName: string;
  price: number;
  marketValue: number | null;
  discountPct: number | null;
  score: number | null;
  rentability: number | null;
  type: string;
  images: string | null;
}

export default function ComparadorPage() {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/properties")
      .then((r) => r.json())
      .then((data) => {
        setProperties(data.properties || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const selected = properties.filter((p) => selectedIds.includes(p.id));
  const available = properties.filter(
    (p) => !selectedIds.includes(p.id) && p.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  function addProperty(id: string) {
    if (selectedIds.length < 4) {
      setSelectedIds([...selectedIds, id]);
    }
  }

  function removeProperty(id: string) {
    setSelectedIds(selectedIds.filter((sid) => sid !== id));
  }

  function formatPrice(value: number | null) {
    return value ? value.toLocaleString() + "€" : "—";
  }

  return (
    <main className="min-h-screen max-w-7xl mx-auto px-6 py-12">
      <a href="/" className="text-primary hover:underline mb-6 inline-block">
        ← Voltar
      </a>
      <h1 className="text-4xl font-extrabold mb-2">Comparador de Imóveis</h1>
      <p className="text-secondary mb-8">
        Compare até 4 imóveis lado a lado. Selecione imóveis para comparar.
      </p>

      {/* Selected properties */}
      {selected.length > 0 && (
        <div className="overflow-x-auto mb-8">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-50">
                <th className="p-3 text-left text-sm font-semibold text-secondary border">Característica</th>
                {selected.map((p) => {
                  const images = p.images ? JSON.parse(p.images) : [];
                  return (
                    <th key={p.id} className="p-3 text-center border min-w-[200px]">
                      <div className="relative">
                        <button
                          onClick={() => removeProperty(p.id)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <X size={12} />
                        </button>
                        {images[0] && (
                          <Image
                            src={images[0]}
                            alt={p.title}
                            width={200}
                            height={120}
                            className="rounded-lg object-cover mx-auto mb-2"
                          />
                        )}
                        <div className="font-bold text-sm">{p.title}</div>
                        <div className="text-xs text-secondary">{p.municipality}, {p.district}</div>
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="p-3 font-medium text-sm border bg-slate-50">Preço</td>
                {selected.map((p) => (
                  <td key={p.id} className="p-3 text-center border font-bold">
                    {formatPrice(p.price)}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-3 font-medium text-sm border bg-slate-50">Valorização</td>
                {selected.map((p) => (
                  <td key={p.id} className="p-3 text-center border text-success">
                    {formatPrice(p.marketValue)}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-3 font-medium text-sm border bg-slate-50">Desconto</td>
                {selected.map((p) => (
                  <td key={p.id} className="p-3 text-center border text-primary font-bold">
                    -{p.discountPct}%
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-3 font-medium text-sm border bg-slate-50">Score</td>
                {selected.map((p) => (
                  <td key={p.id} className="p-3 text-center border">
                    <span className="bg-primary text-white px-2 py-1 rounded text-xs font-bold">
                      {p.score}/100
                    </span>
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-3 font-medium text-sm border bg-slate-50">Rentabilidade</td>
                {selected.map((p) => (
                  <td key={p.id} className="p-3 text-center border">
                    {p.rentability}%
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-3 font-medium text-sm border bg-slate-50">Tipo</td>
                {selected.map((p) => (
                  <td key={p.id} className="p-3 text-center border">{p.type}</td>
                ))}
              </tr>
              <tr>
                <td className="p-3 font-medium text-sm border bg-slate-50">Fonte</td>
                {selected.map((p) => (
                  <td key={p.id} className="p-3 text-center border text-xs">{p.sourceName}</td>
                ))}
              </tr>
              <tr>
                <td className="p-3 font-medium text-sm border bg-slate-50">Link</td>
                {selected.map((p) => (
                  <td key={p.id} className="p-3 text-center border">
                    <Link href={`/imovel/${p.id}`} className="text-primary hover:underline text-sm">
                      Ver detalhes
                    </Link>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* Add property */}
      {selectedIds.length < 4 && (
        <div className="border rounded-xl p-6">
          <h3 className="font-bold mb-4">Adicionar imóvel para comparar</h3>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Pesquisar imóvel..."
            className="w-full px-4 py-2 border rounded-lg mb-4 focus:ring-2 focus:ring-primary focus:outline-none"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-60 overflow-y-auto">
            {available.slice(0, 12).map((p) => (
              <button
                key={p.id}
                onClick={() => addProperty(p.id)}
                className="flex items-center gap-3 p-3 border rounded-lg hover:bg-slate-50 transition text-left"
              >
                <Plus size={16} className="text-primary flex-shrink-0" />
                <div className="min-w-0">
                  <div className="font-medium text-sm truncate">{p.title}</div>
                  <div className="text-xs text-secondary">
                    {p.price.toLocaleString()}€ · {p.municipality}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {loading && <p className="text-secondary">A carregar imóveis...</p>}
    </main>
  );
}
