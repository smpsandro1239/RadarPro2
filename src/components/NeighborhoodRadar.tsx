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

const getColor = (type: string, val: string) => {
  if (type === "noise") {
    return val === "baixo" ? "text-success" : val === "medio" ? "text-yellow-600" : "text-red-500";
  }
  if (type === "airQuality") {
    return val === "boa" ? "text-success" : val === "moderada" ? "text-yellow-600" : "text-red-500";
  }
  if (type === "floodRisk" || type === "emfRisk") {
    return val === "baixo" ? "text-success" : val === "medio" ? "text-yellow-600" : "text-red-500";
  }
  return "text-secondary";
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

  return (
    <div className="border rounded-2xl p-6">
      <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
        <Home size={20} className="text-primary" />
        Radar da Vizinhança
      </h3>
      <p className="text-xs text-secondary mb-4">
        Informações sobre o ambiente da zona de {municipality}, {district}.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div className="bg-white border rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-secondary">Ruído urbano</span>
            <span className={`text-xs font-bold ${getColor("noise", data.noise)}`}>
              {getLabel(data.noise)}
            </span>
          </div>
          <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
            <div
              className={`h-full ${getColor("noise", data.noise)}`}
              style={{ width: data.noise === "baixo" ? "30%" : data.noise === "medio" ? "60%" : "90%" }}
            />
          </div>
        </div>
        <div className="bg-white border rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-secondary">Qualidade do ar</span>
            <span className={`text-xs font-bold ${getColor("airQuality", data.airQuality)}`}>
              {getLabel(data.airQuality)}
            </span>
          </div>
          <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
            <div
              className={`h-full ${getColor("airQuality", data.airQuality)}`}
              style={{ width: data.airQuality === "boa" ? "80%" : data.airQuality === "moderada" ? "60%" : "40%" }}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white border rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-secondary">Risco de inundações</span>
            <span className={`text-xs font-bold ${getColor("floodRisk", data.floodRisk)}`}>
              {getLabel(data.floodRisk)}
            </span>
          </div>
          <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
            <div
              className={`h-full ${getColor("floodRisk", data.floodRisk)}`}
              style={{ width: data.floodRisk === "baixo" ? "20%" : data.floodRisk === "medio" ? "50%" : "80%" }}
            />
          </div>
        </div>
        <div className="bg-white border rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-secondary">Radiação eletromagnética</span>
            <span className={`text-xs font-bold ${getColor("emfRisk", data.emfRisk)}`}>
              {getLabel(data.emfRisk)}
            </span>
          </div>
          <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
            <div
              className={`h-full ${getColor("emfRisk", data.emfRisk)}`}
              style={{ width: data.emfRisk === "baixo" ? "20%" : data.emfRisk === "medio" ? "40%" : "60%" }}
            />
          </div>
        </div>
      </div>

      <div className="mt-4 p-3 bg-slate-50 rounded-lg text-sm text-secondary">
        <Wind size={14} className="mr-2" />
        {data.description}
      </div>
    </div>
  );
}
