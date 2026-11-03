"use client";

import { useState } from "react";
import PageShell from "@/components/ds/PageShell";
import Button from "@/components/ds/Button";

const FIELD =
  "w-full min-h-11 rounded-rp border border-rp-line bg-rp-surface px-4 py-2 text-[15px] text-rp-ink focus:border-rp-cobalt focus:outline-none";

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
    <PageShell
      eyebrow="Valorização"
      title="Valorização de imóveis"
      description="Estime o valor de mercado de um imóvel em Portugal."
      backHref="/"
      backLabel="Voltar ao início"
    >
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <form
          className="space-y-4 border border-rp-line bg-rp-surface p-6"
          onSubmit={(e) => {
            e.preventDefault();
            calculate();
          }}
        >
          <div>
            <label htmlFor="valoracao-distrito" className="rp-eyebrow mb-1 block text-rp-muted">
              Distrito
            </label>
            <select
              id="valoracao-distrito"
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              className={FIELD}
            >
              <option value="">Selecione</option>
              <option value="Lisboa">Lisboa</option>
              <option value="Porto">Porto</option>
              <option value="Braga">Braga</option>
            </select>
          </div>

          <div>
            <label htmlFor="valoracao-tipo" className="rp-eyebrow mb-1 block text-rp-muted">
              Tipo
            </label>
            <select
              id="valoracao-tipo"
              value={type}
              onChange={(e) => setType(e.target.value)}
              className={FIELD}
            >
              <option value="">Selecione</option>
              <option value="Apartamento">Apartamento</option>
              <option value="Moradia">Moradia</option>
              <option value="Terreno">Terreno</option>
            </select>
          </div>

          <div>
            <label htmlFor="valoracao-area" className="rp-eyebrow mb-1 block text-rp-muted">
              Área (m²)
            </label>
            <input
              id="valoracao-area"
              type="number"
              value={sqm}
              onChange={(e) => setSqm(e.target.value)}
              className={FIELD}
              placeholder="Ex: 100"
            />
          </div>

          <Button type="submit" variant="primary" size="lg" className="w-full">
            Calcular valorização
          </Button>
        </form>

        <div>
          {result ? (
            <div className="border border-rp-line bg-rp-surface p-6 shadow-rp-1">
              <p className="rp-eyebrow text-rp-muted">Valor estimado de mercado</p>
              <p className="rp-num mt-3 text-[40px] leading-none text-rp-ink">{result.toLocaleString()}€</p>
              <p className="mt-4 max-w-[52ch] text-[13px] leading-relaxed text-rp-muted">
                * Estimativa baseada em preços médios por m². Não substitui avaliação profissional.
              </p>
            </div>
          ) : (
            <div className="border border-dashed border-rp-line bg-rp-surface px-6 py-14 text-center">
              <p className="rp-display text-[22px] leading-tight text-rp-ink">
                O valor estimado aparece aqui
              </p>
              <p className="mx-auto mt-2 max-w-[46ch] text-[15px] leading-relaxed text-rp-muted">
                Preenche o distrito, o tipo e a área para estimar o valor de mercado.
              </p>
            </div>
          )}
        </div>
      </div>
    </PageShell>
  );
}
