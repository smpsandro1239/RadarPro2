"use client";

import { useState, useEffect } from "react";
import { MapPin, Cloud, Wind, Home, AlertTriangle } from "lucide-react";

interface NeighborhoodRadarProps {
  district: string;
  municipality: string;
}

interface NeighborhoodData {
  noise: "baixo" | "medio" | "alto";
  airQuality: "boa" | "moderada" | "pouca";
  floodRisk: "baixo" | "medio" | "alto";
  emfRisk: "baixo" | "medio" | "alto";
  description: string;
}

// Mock data based on real districts - in production this would come from official APIs
const neighborhoodData: Record<string, NeighborhoodData> = {
  Lisboa: {
    noise: "alto",
    airQuality: "moderada",
    floodRisk: "medio",
    emfRisk: "medio",
    description: "Zona urbana com tráfego intenso. Recomenda-se verificar ruído específico da rua.",
  },
  Porto: {
    noise: "medio",
    airQuality: "moderada",
    floodRisk: "medio",
    emfRisk: "baixo",
    description: "Zona urbana com boa qualidade do ar geral.",
  },
  Braga: {
    noise: "baixo",
    airQuality: "boa",
    floodRisk: "baixo",
    emfRisk: "baixo",
    description: "Zona tranquila com boa qualidade ambiental.",
  },
  Faro: {
    noise: "medio",
    airQuality: "boa",
    floodRisk: "alto",
    emfRisk: "baixo",
    description: "Zona costeira com risco de inundações em áreas próximas à costa.",
  },
  Setúbal: {
    noise: "medio",
    airQuality: "moderada",
    floodRisk: "medio",
    emfRisk: "baixo",
    description: "Zona urbana e industrial, verificar zona específica.",
  },
  Aveiro: {
    noise: "baixo",
    airQuality: "boa",
    floodRisk: "medio",
    emfRisk: "baixo",
    description: "Zona costeira com boa qualidade do ar.",
  },
  Coimbra: {
    noise: "medio",
    airQuality: "boa",
    floodRisk: "baixo",
    emfRisk: "baixo",
    description: "Zona universitária com movimento estudantil.",
  },
};

const fallbackData: NeighborhoodData = {
  noise: "medio",
  airQuality: "moderada",
  floodRisk: "baixo",
  emfRisk: "baixo",
  description: "Dados limitados para esta zona. Recomenda-se verificação presencial.",
};

const getLabel = (val: string) => {
  const labels: Record<string, string> = {
    baixo: "Baixo",
    medio: "Médio",
    alto: "Alto",
    boa: "Boa",
    moderada: "Moderada",
    pouca: "Pouca",
  };
  return labels[val] || val;
};

/**
 * Tomes do design system. A cor nunca é o único sinal: o rotulo textual
 * ("Baixo", "Médio", "Alto") acompanha sempre a barra.
 */
const getTone = (val: string) => {
  if (val === "baixo" || val === "boa") {
    return { text: "text-rp-cobalt", bar: "bg-rp-cobalt" };
  }
  if (val === "medio" || val === "moderada") {
    return { text: "text-rp-ink-2", bar: "bg-rp-amber" };
  }
  return { text: "text-rp-anomaly", bar: "bg-rp-orange" };
};

export default function NeighborhoodRadar({ district, municipality }: NeighborhoodRadarProps) {
  const [data, setData] = useState<NeighborhoodData>(fallbackData);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading data from open data APIs
    setTimeout(() => {
      const d = neighborhoodData[district] || neighborhoodData[municipality] || fallbackData;
      setData(d);
      setLoading(false);
    }, 500);
  }, [district, municipality]);

  const meters = [
    { id: "noise", label: "Ruído urbano", value: data.noise, width: data.noise === "baixo" ? "30%" : data.noise === "medio" ? "60%" : "90%" },
    { id: "airQuality", label: "Qualidade do ar", value: data.airQuality, width: data.airQuality === "boa" ? "80%" : data.airQuality === "moderada" ? "60%" : "40%" },
    { id: "floodRisk", label: "Risco de inundações", value: data.floodRisk, width: data.floodRisk === "baixo" ? "20%" : data.floodRisk === "medio" ? "50%" : "80%" },
    { id: "emfRisk", label: "Radiação eletromagnética", value: data.emfRisk, width: data.emfRisk === "baixo" ? "20%" : data.emfRisk === "medio" ? "40%" : "60%" },
  ];

  return (
    <section
      className="border border-rp-line bg-rp-surface p-5 shadow-rp-1"
      aria-busy={loading}
      aria-label={`Radar da vizinhança: ${municipality}, ${district}`}
    >
      <h2 className="rp-display flex items-center gap-2 text-[24px] leading-tight text-rp-ink">
        <Home size={20} className="text-rp-cobalt" aria-hidden="true" />
        Radar da Vizinhança
      </h2>
      <p className="mt-2 text-[13px] text-rp-muted">
        Informações sobre o ambiente da zona de {municipality}, {district}.
      </p>

      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {meters.map((meter) => {
          const tone = getTone(meter.value);
          return (
            <div key={meter.id} className="border border-rp-line bg-rp-ceramic p-4">
              <div className="flex items-center justify-between gap-3">
                <span className="text-[13px] font-medium text-rp-ink-2">{meter.label}</span>
                <span className={`rp-eyebrow ${tone.text}`}>{getLabel(meter.value)}</span>
              </div>
              <div className="mt-3 h-2 w-full overflow-hidden rounded-rp border border-rp-line bg-rp-surface">
                <div className={`h-full ${tone.bar}`} style={{ width: meter.width }} />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex items-start gap-2 border-l-2 border-rp-cobalt bg-rp-ceramic p-3 text-[13px] leading-relaxed text-rp-ink-2">
        <Wind size={14} className="mt-0.5 shrink-0 text-rp-cobalt" aria-hidden="true" />
        <span>{data.description}</span>
      </div>
    </section>
  );
}
