"use client";

import { useState } from "react";

export default function ValoracaoPage() {
  const [district, setDistrict] = useState("");
  const [type, setType] = useState("");
  const [sqm, setSqm] = useState("");
  const [result, setResult] = useState<number | null>(null);

  // Preços médios por m² por distrito (dados simplificados)
  const pricePerSqm: Record<string, number> = {
    Lisboa: 4500,
    Porto: 3200,
    Braga: 2100,
  };

  function calculate() {
    const sqmNum = parseFloat(sqm);
    if (!district || !sqmNum) return;
    const base = pricePerSqm[district] || 3000;
    const typeMultiplier = type === "Moradia" ? 1.15 : type === "Terreno" ? 0.6 : 1;
    setResult(Math.round(base * sqmNum * typeMultiplier));
  }

  return (
    <main className="min-h-screen max-w-2xl mx-auto px-6 py-12">
      <a href="/" className="text-primary hover:underline mb-6 inline-block">
        ← Voltar
      </a>
      <h1 className="text-4xl font-extrabold mb-4">Valorização de Imóveis</h1>
      <p className="text-secondary mb-8">
        Estime o valor de mercado de um imóvel em Portugal.
      </p>

      <div className="space-y-4 mb-8">
        <div>
          <label className="block text-sm font-medium mb-1">Distrito</label>
          <select
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
          >
            <option value="">Selecione</option>
            <option value="Lisboa">Lisboa</option>
            <option value="Porto">Porto</option>
            <option value="Braga">Braga</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Tipo</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
          >
            <option value="">Selecione</option>
            <option value="Apartamento">Apartamento</option>
            <option value="Moradia">Moradia</option>
            <option value="Terreno">Terreno</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Área (m²)</label>
          <input
            type="number"
            value={sqm}
            onChange={(e) => setSqm(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
            placeholder="Ex: 100"
          />
        </div>
        <button
          onClick={calculate}
          className="w-full bg-primary text-white py-3 rounded-lg font-bold hover:opacity-90 transition"
        >
          Calcular valorização
        </button>
      </div>

      {result && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center">
          <div className="text-sm text-secondary mb-1">Valor estimado de mercado</div>
          <div className="text-3xl font-extrabold text-success">
            {result.toLocaleString()}€
          </div>
          <div className="text-xs text-secondary mt-2">
            * Estimativa baseada em preços médios por m². Não substitui avaliação profissional.
          </div>
        </div>
      )}
    </main>
  );
}
